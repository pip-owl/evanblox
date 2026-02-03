/**
 * Roblox Manager
 * Handles Roblox process spawning, management, and multi-instance support
 */

import { spawn, ChildProcess } from 'child_process';
import { platform } from 'os';
import path from 'path';
import { AppSettings, RobloxInstance, RobloxStatus } from '../shared/types.js';

export class RobloxManager {
  private instances: Map<string, RobloxInstance> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  constructor() {
    // Start monitoring processes
    this.startMonitoring();
  }

  private getRobloxExecutable(settings: AppSettings): string {
    // Use custom path if set, otherwise use default
    if (settings.roblox.executablePath) {
      return settings.roblox.executablePath;
    }

    // Default paths by platform
    const platform_name = platform();
    
    if (platform_name === 'win32') {
      // Windows default path
      const programFiles = process.env.LOCALAPPDATA || 'C:\\Users\\%USERNAME%\\AppData\\Local';
      return path.join(programFiles, 'Roblox', 'Versions', 'version-xxxxxxxxxxxxxxxx', 'RobloxPlayerBeta.exe');
    } else if (platform_name === 'darwin') {
      // macOS default path
      return '/Applications/Roblox.app/Contents/MacOS/Roblox';
    } else {
      // Linux (using Wine or native if available)
      return 'roblox';
    }
  }

  private buildLaunchArgs(flags?: Record<string, unknown>, settings?: AppSettings): string[] {
    const args: string[] = [...(settings?.roblox.launchArgs || [])];
    
    // Add fast flags as environment variables or command line args
    if (flags) {
      for (const [key, value] of Object.entries(flags)) {
        if (typeof value === 'boolean') {
          if (value) {
            args.push(`--${key}`);
          }
        } else {
          args.push(`--${key}=${value}`);
        }
      }
    }

    return args;
  }

  async launch(
    settings: AppSettings, 
    flags?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; instanceId?: string }> {
    // Check if multi-instance is allowed
    const currentInstances = this.instances.size;
    if (currentInstances >= settings.roblox.maxInstances && !settings.roblox.enableMultiInstance) {
      if (currentInstances > 0) {
        return { 
          success: false, 
          error: 'Roblox is already running. Enable multi-instance in settings to launch multiple windows.' 
        };
      }
    }

    if (currentInstances >= settings.roblox.maxInstances) {
      return { 
        success: false, 
        error: `Maximum number of instances (${settings.roblox.maxInstances}) reached.` 
      };
    }

    const executable = this.getRobloxExecutable(settings);
    const args = this.buildLaunchArgs(flags, settings);

    try {
      // Set up environment variables for fast flags
      const env = { ...process.env };
      if (flags) {
        for (const [key, value] of Object.entries(flags)) {
          env[`FFLAG_${key}`] = String(value);
        }
      }

      const process_instance = spawn(executable, args, {
        detached: true,
        stdio: 'ignore',
        env,
      });

      const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const instance: RobloxInstance = {
        id: instanceId,
        pid: process_instance.pid || 0,
        startTime: new Date(),
        flags: flags || {},
      };

      this.instances.set(instanceId, instance);
      this.processes.set(instanceId, process_instance);

      // Handle process exit
      process_instance.on('exit', (code) => {
        console.log(`Roblox instance ${instanceId} exited with code ${code}`);
        this.instances.delete(instanceId);
        this.processes.delete(instanceId);
      });

      process_instance.on('error', (error) => {
        console.error(`Roblox instance ${instanceId} error:`, error);
        this.instances.delete(instanceId);
        this.processes.delete(instanceId);
      });

      // Unref so the process can run independently
      process_instance.unref();

      return { success: true, instanceId };
    } catch (error) {
      console.error('Failed to launch Roblox:', error);
      return { success: false, error: String(error) };
    }
  }

  async killAll(): Promise<void> {
    for (const [instanceId, process] of this.processes.entries()) {
      try {
        if (!process.killed) {
          process.kill('SIGTERM');
          
          // Force kill after 5 seconds if still running
          setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
          }, 5000);
        }
      } catch (error) {
        console.error(`Failed to kill instance ${instanceId}:`, error);
      }
    }

    this.instances.clear();
    this.processes.clear();
  }

  killInstance(instanceId: string): boolean {
    const process = this.processes.get(instanceId);
    if (process && !process.killed) {
      process.kill('SIGTERM');
      this.instances.delete(instanceId);
      this.processes.delete(instanceId);
      return true;
    }
    return false;
  }

  getStatus(): RobloxStatus {
    // Clean up dead processes
    for (const [instanceId, process] of this.processes.entries()) {
      if (process.killed || process.exitCode !== null) {
        this.instances.delete(instanceId);
        this.processes.delete(instanceId);
      }
    }

    return {
      isRunning: this.instances.size > 0,
      instances: Array.from(this.instances.values()),
      canLaunch: true,
    };
  }

  getInstances(): RobloxInstance[] {
    return Array.from(this.instances.values());
  }

  private startMonitoring(): void {
    // Check process status every 5 seconds
    setInterval(() => {
      for (const [instanceId, process] of this.processes.entries()) {
        if (process.killed || process.exitCode !== null) {
          this.instances.delete(instanceId);
          this.processes.delete(instanceId);
        }
      }
    }, 5000);
  }
}
