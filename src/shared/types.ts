/**
 * Shared types and constants for EvanBlox
 * Used by both main and renderer processes
 */

// ==================== IPC Channels ====================
export const IPC_CHANNELS = {
  // Roblox
  LAUNCH_ROBLOX: 'roblox:launch',
  KILL_ROBLOX: 'roblox:kill',
  GET_ROBLOX_STATUS: 'roblox:status',
  
  // Discord RPC
  UPDATE_DISCORD_PRESENCE: 'discord:update-presence',
  CLEAR_DISCORD_PRESENCE: 'discord:clear-presence',
  GET_DISCORD_STATUS: 'discord:status',
  
  // Fast Flags
  GET_FAST_FLAGS: 'flags:get',
  SET_FAST_FLAGS: 'flags:set',
  SAVE_FAST_FLAGS: 'flags:save',
  RESET_FAST_FLAGS: 'flags:reset',
  VALIDATE_FAST_FLAGS: 'flags:validate',
  
  // Settings
  GET_SETTINGS: 'settings:get',
  SET_SETTINGS: 'settings:set',
  
  // Performance Presets
  APPLY_PRESET: 'preset:apply',
  GET_PRESETS: 'preset:list',
  
  // App
  GET_VERSION: 'app:version',
  MINIMIZE_WINDOW: 'window:minimize',
  MAXIMIZE_WINDOW: 'window:maximize',
  CLOSE_WINDOW: 'window:close',
  OPEN_EXTERNAL: 'app:open-external',
} as const;

// ==================== Fast Flags Types ====================
export interface FastFlag {
  name: string;
  value: string | number | boolean;
  description: string;
  category: 'performance' | 'graphics' | 'network' | 'experimental';
  defaultValue: string | number | boolean;
}

export interface FastFlagsConfig {
  flags: Record<string, FastFlag>;
  enabled: string[];
  customFlags: Record<string, unknown>;
}

// Sample fast flags for Roblox
export const DEFAULT_FAST_FLAGS: Record<string, FastFlag> = {
  'FFlagDebugGraphicsDisableMetal': {
    name: 'FFlagDebugGraphicsDisableMetal',
    value: false,
    description: 'Disable Metal graphics API (macOS)',
    category: 'graphics',
    defaultValue: false,
  },
  'DFIntTaskSchedulerTargetFps': {
    name: 'DFIntTaskSchedulerTargetFps',
    value: 144,
    description: 'Target FPS cap (0 = unlimited)',
    category: 'performance',
    defaultValue: 60,
  },
  'FFlagGraphicsEnableD3D11': {
    name: 'FFlagGraphicsEnableD3D11',
    value: true,
    description: 'Enable DirectX 11 rendering',
    category: 'graphics',
    defaultValue: true,
  },
  'FFlagGraphicsEnableD3D10': {
    name: 'FFlagGraphicsEnableD3D10',
    value: false,
    description: 'Enable DirectX 10 rendering',
    category: 'graphics',
    defaultValue: false,
  },
  'FFlagGraphicsPreferD3D11': {
    name: 'FFlagGraphicsPreferD3D11',
    value: true,
    description: 'Prefer DirectX 11 over OpenGL',
    category: 'graphics',
    defaultValue: true,
  },
  'DFIntQualityLevel': {
    name: 'DFIntQualityLevel',
    value: 10,
    description: 'Graphics quality level (1-21)',
    category: 'graphics',
    defaultValue: 7,
  },
  'FFlagDebugGraphicsPreferVulkan': {
    name: 'FFlagDebugGraphicsPreferVulkan',
    value: false,
    description: 'Prefer Vulkan rendering API',
    category: 'experimental',
    defaultValue: false,
  },
  'FFlagHandleAltEnterFullscreenManually': {
    name: 'FFlagHandleAltEnterFullscreenManually',
    value: true,
    description: 'Handle Alt+Enter for fullscreen manually',
    category: 'graphics',
    defaultValue: false,
  },
  'DFIntCanHideGuiGroupId': {
    name: 'DFIntCanHideGuiGroupId',
    value: 1,
    description: 'Hide GUI group ID',
    category: 'graphics',
    defaultValue: 0,
  },
  'FFlagFixGraphicsQuality': {
    name: 'FFlagFixGraphicsQuality',
    value: true,
    description: 'Fix graphics quality settings',
    category: 'graphics',
    defaultValue: true,
  },
  'FFlagPreloadAllFonts': {
    name: 'FFlagPreloadAllFonts',
    value: true,
    description: 'Preload all fonts on startup',
    category: 'performance',
    defaultValue: false,
  },
  'FFlagBatchAssetApi': {
    name: 'FFlagBatchAssetApi',
    value: true,
    description: 'Batch asset API requests',
    category: 'network',
    defaultValue: true,
  },
  'DFIntRccPropCache': {
    name: 'DFIntRccPropCache',
    value: 1,
    description: 'RCC property cache size',
    category: 'performance',
    defaultValue: 0,
  },
  'FFlagNewLightAttenuation': {
    name: 'FFlagNewLightAttenuation',
    value: true,
    description: 'Use new light attenuation model',
    category: 'graphics',
    defaultValue: true,
  },
  'DFIntMeshContentProviderTimeout': {
    name: 'DFIntMeshContentProviderTimeout',
    value: 10000,
    description: 'Mesh content provider timeout (ms)',
    category: 'network',
    defaultValue: 60000,
  },
  'FFlagEnableHardwareTelemetry': {
    name: 'FFlagEnableHardwareTelemetry',
    value: false,
    description: 'Enable hardware telemetry collection',
    category: 'experimental',
    defaultValue: true,
  },
};

// ==================== Settings Types ====================
export interface AppSettings {
  general: {
    autoLaunch: boolean;
    minimizeToTray: boolean;
    closeToTray: boolean;
    checkUpdates: boolean;
    theme: 'dark' | 'light' | 'system';
  };
  roblox: {
    executablePath: string;
    launchArgs: string[];
    enableMultiInstance: boolean;
    maxInstances: number;
  };
  discord: {
    enabled: boolean;
    showGameDetails: boolean;
    showElapsedTime: boolean;
    customStatus: string;
  };
  performance: {
    currentPreset: string | null;
    customFlags: Record<string, unknown>;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    autoLaunch: false,
    minimizeToTray: true,
    closeToTray: false,
    checkUpdates: true,
    theme: 'dark',
  },
  roblox: {
    executablePath: '',
    launchArgs: [],
    enableMultiInstance: false,
    maxInstances: 3,
  },
  discord: {
    enabled: true,
    showGameDetails: true,
    showElapsedTime: true,
    customStatus: '',
  },
  performance: {
    currentPreset: null,
    customFlags: {},
  },
};

// ==================== Performance Presets ====================
export interface PerformancePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  flags: Record<string, unknown>;
}

export const PERFORMANCE_PRESETS: PerformancePreset[] = [
  {
    id: 'low',
    name: 'Low Performance',
    description: 'Maximum FPS, lowest quality settings for weak hardware',
    icon: 'Zap',
    flags: {
      'DFIntTaskSchedulerTargetFps': 0,
      'DFIntQualityLevel': 1,
      'FFlagGraphicsEnableD3D11': false,
      'FFlagGraphicsEnableD3D10': true,
      'FFlagFixGraphicsQuality': false,
      'FFlagNewLightAttenuation': false,
      'FFlagPreloadAllFonts': false,
    },
  },
  {
    id: 'medium',
    name: 'Balanced',
    description: 'Good balance between quality and performance',
    icon: 'Scale',
    flags: {
      'DFIntTaskSchedulerTargetFps': 120,
      'DFIntQualityLevel': 7,
      'FFlagGraphicsEnableD3D11': true,
      'FFlagGraphicsEnableD3D10': false,
      'FFlagFixGraphicsQuality': true,
      'FFlagNewLightAttenuation': true,
      'FFlagPreloadAllFonts': false,
    },
  },
  {
    id: 'high',
    name: 'High Quality',
    description: 'Best visual quality with uncapped FPS',
    icon: 'Sparkles',
    flags: {
      'DFIntTaskSchedulerTargetFps': 0,
      'DFIntQualityLevel': 21,
      'FFlagGraphicsEnableD3D11': true,
      'FFlagGraphicsEnableD3D10': false,
      'FFlagFixGraphicsQuality': true,
      'FFlagNewLightAttenuation': true,
      'FFlagPreloadAllFonts': true,
      'FFlagHandleAltEnterFullscreenManually': true,
    },
  },
  {
    id: 'competitive',
    name: 'Competitive',
    description: 'Optimized for competitive play - max FPS, reduced effects',
    icon: 'Trophy',
    flags: {
      'DFIntTaskSchedulerTargetFps': 0,
      'DFIntQualityLevel': 3,
      'FFlagGraphicsEnableD3D11': true,
      'FFlagGraphicsEnableD3D10': false,
      'FFlagFixGraphicsQuality': false,
      'FFlagNewLightAttenuation': false,
      'FFlagPreloadAllFonts': true,
      'FFlagHandleAltEnterFullscreenManually': true,
      'DFIntMeshContentProviderTimeout': 5000,
    },
  },
];

// ==================== Discord RPC Types ====================
export interface DiscordPresence {
  details?: string;
  state?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  partySize?: number;
  partyMax?: number;
  matchSecret?: string;
  joinSecret?: string;
  spectateSecret?: string;
  instance?: boolean;
  buttons?: Array<{ label: string; url: string }>;
}

// ==================== Roblox Types ====================
export interface RobloxInstance {
  id: string;
  pid: number;
  startTime: Date;
  flags: Record<string, unknown>;
}

export interface RobloxStatus {
  isRunning: boolean;
  instances: RobloxInstance[];
  canLaunch: boolean;
}

// ==================== API Response Types ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
