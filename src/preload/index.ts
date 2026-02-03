/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes safe APIs to the renderer via contextBridge
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { 
  FastFlagsConfig, 
  AppSettings, 
  PerformancePreset, 
  DiscordPresence,
  RobloxStatus,
  ApiResponse 
} from '../shared/types';

// API exposed to the renderer process
export interface ElectronAPI {
  // Roblox
  launchRoblox: (flags?: Record<string, unknown>) => Promise<ApiResponse>;
  killRoblox: () => Promise<ApiResponse>;
  getRobloxStatus: () => Promise<ApiResponse<RobloxStatus>>;
  
  // Discord RPC
  updateDiscordPresence: (presence: DiscordPresence) => Promise<ApiResponse>;
  clearDiscordPresence: () => Promise<ApiResponse>;
  getDiscordStatus: () => Promise<ApiResponse<boolean>>;
  
  // Fast Flags
  getFastFlags: () => Promise<ApiResponse<FastFlagsConfig>>;
  setFastFlags: (flags: FastFlagsConfig) => Promise<ApiResponse>;
  saveFastFlags: () => Promise<ApiResponse>;
  resetFastFlags: () => Promise<ApiResponse>;
  validateFastFlags: (json: string) => Promise<ApiResponse<boolean>>;
  
  // Settings
  getSettings: () => Promise<ApiResponse<AppSettings>>;
  setSettings: (settings: AppSettings) => Promise<ApiResponse>;
  
  // Performance Presets
  applyPreset: (presetId: string) => Promise<ApiResponse>;
  getPresets: () => Promise<ApiResponse<PerformancePreset[]>>;
  
  // Window Controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  
  // App
  getVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  
  // Event Listeners
  onRobloxStatusChange: (callback: (status: RobloxStatus) => void) => () => void;
  onDiscordStatusChange: (callback: (status: boolean) => void) => () => void;
  
  // Navigation (for macOS menu)
  onNavigate: (callback: (page: string) => void) => () => void;
  offNavigate: (callback: (page: string) => void) => void;
}

const api: ElectronAPI = {
  // Roblox
  launchRoblox: (flags) => ipcRenderer.invoke('roblox:launch', flags),
  killRoblox: () => ipcRenderer.invoke('roblox:kill'),
  getRobloxStatus: () => ipcRenderer.invoke('roblox:status'),
  
  // Discord RPC
  updateDiscordPresence: (presence) => ipcRenderer.invoke('discord:update-presence', presence),
  clearDiscordPresence: () => ipcRenderer.invoke('discord:clear-presence'),
  getDiscordStatus: () => ipcRenderer.invoke('discord:status'),
  
  // Fast Flags
  getFastFlags: () => ipcRenderer.invoke('flags:get'),
  setFastFlags: (flags) => ipcRenderer.invoke('flags:set', flags),
  saveFastFlags: () => ipcRenderer.invoke('flags:save'),
  resetFastFlags: () => ipcRenderer.invoke('flags:reset'),
  validateFastFlags: (json) => ipcRenderer.invoke('flags:validate', json),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),
  
  // Performance Presets
  applyPreset: (presetId) => ipcRenderer.invoke('preset:apply', presetId),
  getPresets: () => ipcRenderer.invoke('preset:list'),
  
  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // App
  getVersion: () => ipcRenderer.invoke('app:version'),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
  
  // Event Listeners
  onRobloxStatusChange: (callback) => {
    const handler = (_: IpcRendererEvent, status: RobloxStatus) => callback(status);
    ipcRenderer.on('roblox:status-changed', handler);
    return () => ipcRenderer.off('roblox:status-changed', handler);
  },
  onDiscordStatusChange: (callback) => {
    const handler = (_: IpcRendererEvent, status: boolean) => callback(status);
    ipcRenderer.on('discord:status-changed', handler);
    return () => ipcRenderer.off('discord:status-changed', handler);
  },
  
  // Navigation (for macOS menu)
  onNavigate: (callback) => {
    const handler = (_: IpcRendererEvent, page: string) => callback(page);
    ipcRenderer.on('navigate-to', handler);
    return () => ipcRenderer.off('navigate-to', handler);
  },
  offNavigate: () => {
    ipcRenderer.removeAllListeners('navigate-to');
  },
};

// Expose the API to the renderer
contextBridge.exposeInMainWorld('electronAPI', api);

// TypeScript support for window.electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
