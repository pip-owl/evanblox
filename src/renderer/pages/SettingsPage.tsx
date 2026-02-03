/**
 * Settings page - App configuration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  FolderOpen, 
  Users, 
  Palette, 
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import type { AppSettings } from '../../shared/types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await window.electronAPI.getSettings();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback((section: keyof AppSettings, updates: Partial<AppSettings[typeof section]>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        ...updates,
      },
    });
    setHasChanges(true);
    setSaved(false);
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      const result = await window.electronAPI.setSettings(settings);
      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset all settings to default?')) {
      try {
        // Reset would be implemented in main process
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  };

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d26a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-400 flex items-center justify-center">
              <Settings size={24} className="text-white"></Settings>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-gray-400">Configure TQTHBAXPDENAE-SBTV to your preferences</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <div className="flex items-center gap-1 text-[#00d26a]">
                <CheckCircle2 size={16}></CheckCircle2>
                <span className="text-sm">Saved!</span>
              </div>
            )}
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw size={16}></RotateCcw>
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-[#00d26a] text-black rounded-lg font-medium hover:bg-[#00e676] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16}></Save>
              Save Changes
            </button>
          </div>
        </div>

        {/* General Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={20} className="text-[#00d26a]"></Palette>
            <h2 className="text-lg font-semibold">General</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Minimize to Tray</p>
                <p className="text-sm text-gray-500">Minimize window to system tray instead of taskbar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.minimizeToTray}
                  onChange={(e) => updateSettings('general', { minimizeToTray: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00d26a]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d26a]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Close to Tray</p>
                <p className="text-sm text-gray-500">Keep running in system tray when closing window</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.closeToTray}
                  onChange={(e) => updateSettings('general', { closeToTray: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00d26a]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d26a]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
              <select
                value={settings.general.theme}
                onChange={(e) => updateSettings('general', { theme: e.target.value as 'dark' | 'light' | 'system' })}
                className="px-4 py-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg text-sm focus:outline-none focus:border-[#00d26a]"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Roblox Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <FolderOpen size={20} className="text-blue-500"></FolderOpen>
            <h2 className="text-lg font-semibold">Roblox</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#141414] rounded-xl space-y-3">
              <label className="font-medium">Executable Path</label>
              <p className="text-sm text-gray-500">Path to RobloxPlayerBeta.exe (leave empty for auto-detect)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.roblox.executablePath}
                  onChange={(e) => updateSettings('roblox', { executablePath: e.target.value })}
                  placeholder="C:\\Users\\...\\RobloxPlayerBeta.exe"
                  className="flex-1 px-4 py-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg text-sm focus:outline-none focus:border-[#00d26a]"
                />
                <button className="px-4 py-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                  Browse
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Enable Multi-Instance</p>
                <p className="text-sm text-gray-500">Allow launching multiple Roblox windows</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.roblox.enableMultiInstance}
                  onChange={(e) => updateSettings('roblox', { enableMultiInstance: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00d26a]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d26a]"></div>
              </label>
            </div>

            <div className="p-4 bg-[#141414] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium">Maximum Instances</label>
                <span className="text-[#00d26a] font-bold">{settings.roblox.maxInstances}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.roblox.maxInstances}
                onChange={(e) => updateSettings('roblox', { maxInstances: parseInt(e.target.value) })}
                className="w-full accent-[#00d26a]"
              />
              <p className="text-xs text-gray-500">Maximum number of concurrent Roblox instances allowed</p>
            </div>
          </div>
        </div>

        {/* Discord Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} className="text-[#5865F2]"></Users>
            <h2 className="text-lg font-semibold">Discord Integration</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Enable Rich Presence</p>
                <p className="text-sm text-gray-500">Show "Playing Roblox" status in Discord</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.discord.enabled}
                  onChange={(e) => updateSettings('discord', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00d26a]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d26a]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Show Elapsed Time</p>
                <p className="text-sm text-gray-500">Display how long you've been playing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.discord.showElapsedTime}
                  onChange={(e) => updateSettings('discord', { showElapsedTime: e.target.checked })}
                  disabled={!settings.discord.enabled}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00d26a]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d26a] ${!settings.discord.enabled ? 'opacity-50' : ''}`}></div>
              </label>
            </div>

            <div className="p-4 bg-[#141414] rounded-xl space-y-3">
              <label className="font-medium">Custom Status Text</label>
              <p className="text-sm text-gray-500">Custom text shown in your Discord status</p>
              <input
                type="text"
                value={settings.discord.customStatus}
                onChange={(e) => updateSettings('discord', { customStatus: e.target.value })}
                placeholder="Playing Roblox"
                disabled={!settings.discord.enabled}
                className="w-full px-4 py-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg text-sm focus:outline-none focus:border-[#00d26a] disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-yellow-500"></Bell>
            <h2 className="text-lg font-semibold">About</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl">
              <div>
                <p className="font-medium">Version</p>
                <p className="text-sm text-gray-500">TQTHBAXPDENAE-SBTV v1.0.0</p>
              </div>
              <button 
                onClick={() => window.electronAPI.openExternal('https://github.com/iamevanyt/tqthbaxpdenae-sbtv')}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                <ExternalLink size={16}></ExternalLink>
                GitHub
              </button>
            </div>

            <div className="p-4 bg-[#141414] rounded-xl">
              <p className="text-sm text-gray-400">
                TQTHBAXPDENAE-SBTV is an open-source Roblox launcher with advanced features including Discord Rich Presence, Fast Flags editor, multi-instance support, and performance presets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
