/**
 * Dashboard page - Main landing page with launch button and status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Square, 
  Users, 
  Clock, 
  Zap, 
  ExternalLink,
  Gamepad2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import type { RobloxStatus } from '../../shared/types';

export const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<RobloxStatus | null>(null);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchTime, setLaunchTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [robloxResult, discordResult] = await Promise.all([
          window.electronAPI.getRobloxStatus(),
          window.electronAPI.getDiscordStatus(),
        ]);

        if (robloxResult.success && robloxResult.data) {
          setStatus(robloxResult.data);
          if (robloxResult.data.isRunning && robloxResult.data.instances.length > 0) {
            setLaunchTime(new Date(robloxResult.data.instances[0].startTime));
          }
        }

        if (discordResult.success) {
          setDiscordConnected(discordResult.data || false);
        }
      } catch (error) {
        console.error('Failed to load status:', error);
      }
    };

    loadStatus();

    // Listen for status changes
    const unsubscribe = window.electronAPI.onRobloxStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus.isRunning && newStatus.instances.length > 0 && !launchTime) {
        setLaunchTime(new Date(newStatus.instances[0].startTime));
      }
      if (!newStatus.isRunning) {
        setLaunchTime(null);
        setElapsedTime(0);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update elapsed time
  useEffect(() => {
    if (!launchTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - launchTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [launchTime]);

  const handleLaunch = useCallback(async () => {
    setIsLaunching(true);
    try {
      const result = await window.electronAPI.launchRoblox();
      if (result.success) {
        setLaunchTime(new Date());
      } else {
        console.error('Launch failed:', result.error);
      }
    } finally {
      setIsLaunching(false);
    }
  }, []);

  const handleKill = useCallback(async () => {
    await window.electronAPI.killRoblox();
    setLaunchTime(null);
    setElapsedTime(0);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const isRunning = status?.isRunning ?? false;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d26a] to-[#00b894] mb-4 shadow-lg shadow-[#00d26a]/20">
            <Gamepad2 size={40} className="text-black"></Gamepad2>
          </div>
          <h1 className="text-3xl font-bold">Welcome to <span className="gradient-text">EvanBlox</span></h1>
          <p className="text-gray-400">Your advanced Roblox launcher with enhanced features</p>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center">
          <button
            onClick={isRunning ? handleKill : handleLaunch}
            disabled={isLaunching}
            className={`
              group relative flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300
              ${isRunning 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-gradient-to-r from-[#00d26a] to-[#00b894] hover:from-[#00e676] hover:to-[#00d26a] text-black shadow-lg shadow-[#00d26a]/30 hover:shadow-[#00d26a]/50'
              }
              ${isLaunching ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            {isLaunching ? (
              <>
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Launching...</span>
              </>
            ) : isRunning ? (
              <>
                <Square size={24} fill="currentColor"></Square>
                <span>Stop Roblox</span>
              </>
            ) : (
              <>
                <Play size={28} fill="currentColor"></Play>
                <span>Launch Roblox</span>
              </>
            )}
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Roblox Status */}
          <div className="card card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Gamepad2 size={18}></Gamepad2>
                <span className="text-sm font-medium">Roblox Status</span>
              </div>
              {isRunning ? (
                <CheckCircle2 size={18} className="text-[#00d26a]"></CheckCircle2>
              ) : (
                <XCircle size={18} className="text-gray-500"></XCircle>
              )}
            </div>
            <div className="space-y-1">
              <p className={`text-lg font-semibold ${isRunning ? 'text-[#00d26a]' : 'text-gray-400'}`}>
                {isRunning ? 'Running' : 'Not Running'}
              </p>
              {isRunning && status && status.instances && status.instances.length > 1 && (
                <p className="text-sm text-gray-500">{status.instances.length} instances</p>
              )}
            </div>
          </div>

          {/* Discord Status */}
          <div className="card card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={18}></Users>
                <span className="text-sm font-medium">Discord RPC</span>
              </div>
              {discordConnected ? (
                <CheckCircle2 size={18} className="text-[#5865F2]"></CheckCircle2>
              ) : (
                <XCircle size={18} className="text-gray-500"></XCircle>
              )}
            </div>
            <div className="space-y-1">
              <p className={`text-lg font-semibold ${discordConnected ? 'text-[#5865F2]' : 'text-gray-400'}`}>
                {discordConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-sm text-gray-500">{discordConnected ? 'Rich Presence active' : 'Enable in settings'}</p>
            </div>
          </div>

          {/* Session Time */}
          <div className="card card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={18}></Clock>
                <span className="text-sm font-medium">Session Time</span>
              </div>
              <Zap size={18} className="text-yellow-500"></Zap>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {isRunning ? formatTime(elapsedTime) : '--:--'}
              </p>
              <p className="text-sm text-gray-500">{isRunning ? 'Current session' : 'No active session'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => window.electronAPI.openExternal('https://www.roblox.com')}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#2d2d2d] hover:border-[#3d3d3d] transition-all"
            >
              <ExternalLink size={16}></ExternalLink>
              <span className="text-sm">Open Roblox</span>
            </button>
            
            <button
              onClick={() => window.electronAPI.openExternal('https://create.roblox.com')}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#2d2d2d] hover:border-[#3d3d3d] transition-all"
            >
              <ExternalLink size={16}></ExternalLink>
              <span className="text-sm">Create</span>
            </button>
            
            <button
              onClick={() => window.location.hash = 'fastflags'}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#2d2d2d] hover:border-[#3d3d3d] transition-all"
            >
              <Zap size={16}></Zap>
              <span className="text-sm">Fast Flags</span>
            </button>
            
            <button
              onClick={() => window.location.hash = 'settings'}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-[#2d2d2d] hover:border-[#3d3d3d] transition-all"
            >
              <ExternalLink size={16}></ExternalLink>
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>

        {/* Active Instances */}
        {status?.instances && status.instances.length > 0 && (
          <div className="card p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Active Instances</h2>
            <div className="space-y-2">
              {status.instances.map((instance, index) => (
                <div key={instance.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#141414] border border-[#2d2d2d]">
                  <div className="w-8 h-8 rounded-lg bg-[#00d26a]/20 flex items-center justify-center text-[#00d26a] font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Instance {index + 1}</p>
                    <p className="text-xs text-gray-500">PID: {instance.pid}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Started {new Date(instance.startTime).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
