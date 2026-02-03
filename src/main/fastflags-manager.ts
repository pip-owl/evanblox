/**
 * Fast Flags Manager
 * Handles fast flags configuration, validation, and presets
 */

import Store from 'electron-store';
import { 
  FastFlagsConfig, 
  DEFAULT_FAST_FLAGS, 
  PerformancePreset,
  FastFlag 
} from '../shared/types.js';

interface FastFlagsSchema {
  config: FastFlagsConfig;
}

export class FastFlagsManager {
  private store: Store<FastFlagsSchema>;
  private config: FastFlagsConfig;

  constructor() {
    this.store = new Store<FastFlagsSchema>({
      name: 'tqthbaxpdenae-sbtv-fastflags',
      defaults: {
        config: {
          flags: DEFAULT_FAST_FLAGS,
          enabled: Object.keys(DEFAULT_FAST_FLAGS),
          customFlags: {},
        },
      },
    });

    this.config = this.store.get('config') as FastFlagsConfig;
    this.migrateConfig();
  }

  private migrateConfig(): void {
    // Ensure all default flags exist
    const mergedFlags: Record<string, FastFlag> = {
      ...DEFAULT_FAST_FLAGS,
      ...this.config.flags,
    };

    // Add any missing default flags to enabled list
    const enabled = new Set(this.config.enabled);
    for (const key of Object.keys(DEFAULT_FAST_FLAGS)) {
      if (!this.config.flags[key]) {
        enabled.add(key);
      }
    }

    this.config = {
      flags: mergedFlags,
      enabled: Array.from(enabled),
      customFlags: this.config.customFlags || {},
    };

    this.save();
  }

  getConfig(): FastFlagsConfig {
    return {
      flags: { ...this.config.flags },
      enabled: [...this.config.enabled],
      customFlags: { ...this.config.customFlags },
    };
  }

  setConfig(config: FastFlagsConfig): void {
    this.config = {
      flags: { ...config.flags },
      enabled: [...config.enabled],
      customFlags: { ...config.customFlags },
    };
  }

  getEnabledFlags(): Record<string, unknown> {
    const enabled: Record<string, unknown> = {};
    
    // Add enabled default flags
    for (const key of this.config.enabled) {
      if (this.config.flags[key]) {
        enabled[key] = this.config.flags[key].value;
      }
    }

    // Add custom flags
    for (const [key, value] of Object.entries(this.config.customFlags)) {
      enabled[key] = value;
    }

    return enabled;
  }

  setFlagValue(name: string, value: string | number | boolean): void {
    if (this.config.flags[name]) {
      this.config.flags[name].value = value;
    } else {
      this.config.customFlags[name] = value;
    }
  }

  enableFlag(name: string): void {
    if (!this.config.enabled.includes(name)) {
      this.config.enabled.push(name);
    }
  }

  disableFlag(name: string): void {
    this.config.enabled = this.config.enabled.filter(f => f !== name);
  }

  addCustomFlag(name: string, value: unknown, description?: string): void {
    this.config.customFlags[name] = value;
    
    if (description) {
      this.config.flags[name] = {
        name,
        value: value as string | number | boolean,
        description,
        category: 'experimental',
        defaultValue: value as string | number | boolean,
      };
    }
  }

  removeCustomFlag(name: string): void {
    delete this.config.customFlags[name];
    this.config.enabled = this.config.enabled.filter(f => f !== name);
  }

  applyPreset(preset: PerformancePreset): void {
    // Apply preset flags
    for (const [key, value] of Object.entries(preset.flags)) {
      if (this.config.flags[key]) {
        this.config.flags[key].value = value as string | number | boolean;
        if (!this.config.enabled.includes(key)) {
          this.config.enabled.push(key);
        }
      } else {
        this.config.customFlags[key] = value;
      }
    }

    this.save();
  }

  reset(): void {
    this.config = {
      flags: { ...DEFAULT_FAST_FLAGS },
      enabled: Object.keys(DEFAULT_FAST_FLAGS),
      customFlags: {},
    };
    this.save();
  }

  save(): void {
    this.store.set('config', this.config);
  }

  exportToJSON(): string {
    const enabled = this.getEnabledFlags();
    return JSON.stringify(enabled, null, 2);
  }

  importFromJSON(json: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json);
      
      // Validate that it's a valid object
      if (typeof parsed !== 'object' || parsed === null) {
        return { success: false, error: 'Invalid JSON: must be an object' };
      }

      // Import as custom flags
      this.config.customFlags = parsed;
      this.save();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: `Invalid JSON: ${error}` };
    }
  }
}
