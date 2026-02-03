/**
 * Settings Manager
 * Handles loading, saving, and managing app settings using electron-store
 */

import Store from 'electron-store';
import { AppSettings, DEFAULT_SETTINGS } from '../shared/types.js';

interface SettingsSchema {
  settings: AppSettings;
}

export class SettingsManager {
  private store: Store<SettingsSchema>;
  private settings: AppSettings;

  constructor() {
    this.store = new Store<SettingsSchema>({
      name: 'tqthbaxpdenae-sbtv-settings',
      defaults: {
        settings: DEFAULT_SETTINGS,
      },
    });

    this.settings = this.store.get('settings') as AppSettings;
    this.migrateSettings();
  }

  private migrateSettings(): void {
    // Ensure all required fields exist (for updates)
    const merged: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...this.settings,
      general: {
        ...DEFAULT_SETTINGS.general,
        ...this.settings.general,
      },
      roblox: {
        ...DEFAULT_SETTINGS.roblox,
        ...this.settings.roblox,
      },
      discord: {
        ...DEFAULT_SETTINGS.discord,
        ...this.settings.discord,
      },
      performance: {
        ...DEFAULT_SETTINGS.performance,
        ...this.settings.performance,
      },
    };

    this.settings = merged;
    this.save();
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  setSettings(newSettings: AppSettings): void {
    this.settings = { ...newSettings };
    this.save();
  }

  updateSettings(updates: Partial<AppSettings>): void {
    this.settings = {
      ...this.settings,
      ...updates,
    };
    this.save();
  }

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings[key] = value;
    this.save();
  }

  private save(): void {
    this.store.set('settings', this.settings);
  }

  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }
}
