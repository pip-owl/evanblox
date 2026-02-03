/**
 * Main entry point for TQTHBAXPDENAE-SBTV
 * Handles window management, Discord RPC, Roblox spawning, and IPC
 */

import { 
  app, 
  BrowserWindow, 
  ipcMain, 
  shell, 
  nativeImage,
  Tray,
  Menu
} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { DiscordRPCManager } from './discord-rpc.js';
import { RobloxManager } from './roblox-manager.js';
import { SettingsManager } from './settings-manager.js';
import { FastFlagsManager } from './fastflags-manager.js';
import { IPC_CHANNELS, PERFORMANCE_PRESETS } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== App State ====================
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let discordRPC: DiscordRPCManager;
let robloxManager: RobloxManager;
let settingsManager: SettingsManager;
let fastFlagsManager: FastFlagsManager;

// ==================== Window Management ====================
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    backgroundColor: '#0f0f0f',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    const settings = settingsManager.getSettings();
    if (settings.general.closeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ==================== macOS Menu ====================
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'TQTHBAXPDENAE-SBTV: The Omniscient Quantum-Tunneling Hyper-Blox Accelerator XTREME Pro Deluxe Edition (Not An Exploit) - Sponsored by The Void Corporation - A Division of Not An Exploit LLC - Makers of Fine Roblox Enhancement Software Since 2026',
      submenu: [
        {
          label: 'About TQTHBAXPDENAE-SBTV: The Omniscient Quantum-Tunneling Hyper-Blox Accelerator XTREME Pro Deluxe Edition (Not An Exploit) - Sponsored by The Void Corporation - A Division of Not An Exploit LLC',
          click: () => {
            mainWindow?.webContents.send('navigate', 'settings');
          },
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('navigate', 'settings');
          },
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Launch Roblox',
          accelerator: 'CmdOrCtrl+L',
          click: () => handleLaunchRoblox(),
        },
        {
          label: 'Kill Roblox',
          accelerator: 'CmdOrCtrl+K',
          click: async () => {
            await robloxManager.killAll();
            discordRPC.clearPresence();
          },
        },
        { type: 'separator' },
        {
          label: 'Fast Flags',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow?.webContents.send('navigate', 'fastflags');
          },
        },
        {
          label: 'Performance',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow?.webContents.send('navigate', 'performance');
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front',
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: () => {
            shell.openExternal('https://github.com/pip-owl/tqthbaxpdenae-sbtv');
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/pip-owl/tqthbaxpdenae-sbtv/issues');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ==================== macOS Dock Menu ====================
function createDockMenu(): void {
  if (process.platform !== 'darwin') return;

  const dockMenu = Menu.buildFromTemplate([
    {
      label: '🚀 Launch Roblox via TQTHBAXPDENAE-SBTV (The Omniscient Quantum-Tunneling Hyper-Blox Accelerator)',
      click: () => handleLaunchRoblox(),
    },
    {
      label: '⚡ Open Fast Flags Editor (Modify Roblox Startup Configuration)',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate', 'fastflags');
      },
    },
    {
      label: '🔥 Performance Presets (Optimize Your Blox Experience)',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate', 'performance');
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate', 'settings');
      },
    },
  ]);

  app.dock.setMenu(dockMenu);
}

function createTray(): void {
  // Create a simple 16x16 tray icon (will be replaced with actual icon)
  const trayIcon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABcSURBVHgB7cwxDQAgDEDRcQL3X8EV3MEBXEELRXOJQCXtS77EJH2Z+bAfyA/kB/ID+YH8QH4gP5AfyA/kB/ID+YH8QH4gP5AfyA/kB/ID+YH8QH4gP5AfyA/kB/ID+QH/A2T1/ws8W/BJAAAAAElFTkSuQmCC'
  );
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show TQTHBAXPDENAE-SBTV',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Launch Roblox',
      click: () => {
        handleLaunchRoblox();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  
  tray.setToolTip('TQTHBAXPDENAE-SBTV: The Omniscient Quantum-Tunneling Hyper-Blox Accelerator XTREME Pro Deluxe Edition (Not An Exploit)');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// ==================== IPC Handlers ====================
async function handleLaunchRoblox(flags?: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = settingsManager.getSettings();
    const result = await robloxManager.launch(settings, flags);
    
    if (result.success) {
      // Update Discord presence
      if (settings.discord.enabled) {
        discordRPC.updatePresence({
          details: 'Playing Roblox',
          state: settings.discord.customStatus || 'In Game',
          startTimestamp: Date.now(),
          largeImageKey: 'roblox_logo',
          largeImageText: 'Roblox',
          smallImageKey: 'tqthbaxpdenae-sbtv_logo',
          smallImageText: 'TQTHBAXPDENAE-SBTV Launcher',
        });
      }
      
      // Notify renderer of status change
      mainWindow?.webContents.send('roblox:status-changed', robloxManager.getStatus());
    }
    
    return result;
  } catch (error) {
    console.error('Failed to launch Roblox:', error);
    return { success: false, error: String(error) };
  }
}

function setupIPCHandlers(): void {
  // Window controls
  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
    mainWindow?.minimize();
  });
  
  ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  
  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
    const settings = settingsManager.getSettings();
    if (settings.general.closeToTray) {
      mainWindow?.hide();
    } else {
      mainWindow?.close();
    }
  });
  
  // Roblox
  ipcMain.handle(IPC_CHANNELS.LAUNCH_ROBLOX, (_, flags) => handleLaunchRoblox(flags));
  
  ipcMain.handle(IPC_CHANNELS.KILL_ROBLOX, async () => {
    await robloxManager.killAll();
    discordRPC.clearPresence();
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.GET_ROBLOX_STATUS, () => {
    return { success: true, data: robloxManager.getStatus() };
  });
  
  // Discord RPC
  ipcMain.handle(IPC_CHANNELS.UPDATE_DISCORD_PRESENCE, (_, presence) => {
    discordRPC.updatePresence(presence);
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.CLEAR_DISCORD_PRESENCE, () => {
    discordRPC.clearPresence();
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.GET_DISCORD_STATUS, () => {
    return { success: true, data: discordRPC.isConnected() };
  });
  
  // Fast Flags
  ipcMain.handle(IPC_CHANNELS.GET_FAST_FLAGS, () => {
    return { success: true, data: fastFlagsManager.getConfig() };
  });
  
  ipcMain.handle(IPC_CHANNELS.SET_FAST_FLAGS, (_, config) => {
    fastFlagsManager.setConfig(config);
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.SAVE_FAST_FLAGS, () => {
    fastFlagsManager.save();
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.RESET_FAST_FLAGS, () => {
    fastFlagsManager.reset();
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.VALIDATE_FAST_FLAGS, (_, json) => {
    try {
      JSON.parse(json);
      return { success: true, data: true };
    } catch {
      return { success: true, data: false };
    }
  });
  
  // Settings
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return { success: true, data: settingsManager.getSettings() };
  });
  
  ipcMain.handle(IPC_CHANNELS.SET_SETTINGS, (_, settings) => {
    settingsManager.setSettings(settings);
    return { success: true };
  });
  
  // Performance Presets
  ipcMain.handle(IPC_CHANNELS.APPLY_PRESET, async (_, presetId) => {
    const preset = PERFORMANCE_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      return { success: false, error: 'Preset not found' };
    }
    
    fastFlagsManager.applyPreset(preset);
    
    // Update settings
    const settings = settingsManager.getSettings();
    settings.performance.currentPreset = presetId;
    settingsManager.setSettings(settings);
    
    return { success: true };
  });
  
  ipcMain.handle(IPC_CHANNELS.GET_PRESETS, () => {
    return { success: true, data: PERFORMANCE_PRESETS };
  });
  
  // App
  ipcMain.handle(IPC_CHANNELS.GET_VERSION, () => {
    return app.getVersion();
  });
  
  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, (_, url) => {
    shell.openExternal(url);
  });
  
  // Navigation (for macOS menu shortcuts)
  ipcMain.on('navigate', (_, page: string) => {
    mainWindow?.webContents.send('navigate-to', page);
  });
}

// ==================== App Lifecycle ====================
app.whenReady().then(() => {
  // Initialize managers
  settingsManager = new SettingsManager();
  fastFlagsManager = new FastFlagsManager();
  discordRPC = new DiscordRPCManager();
  robloxManager = new RobloxManager();
  
  // Connect Discord RPC
  const settings = settingsManager.getSettings();
  if (settings.discord.enabled) {
    discordRPC.connect();
  }
  
  // Setup IPC handlers
  setupIPCHandlers();
  
  // Create macOS menu
  createMenu();
  
  // Create window and tray
  createWindow();
  createTray();
  
  // Create dock menu (macOS only)
  createDockMenu();
  
  // Check Roblox status periodically
  setInterval(() => {
    const status = robloxManager.getStatus();
    mainWindow?.webContents.send('roblox:status-changed', status);
    
    // Update Discord if Roblox closed
    if (!status.isRunning && discordRPC.isConnected()) {
      discordRPC.updatePresence({
        details: 'In Launcher',
        state: 'Idle',
        largeImageKey: 'tqthbaxpdenae-sbtv_logo',
        largeImageText: 'TQTHBAXPDENAE-SBTV',
      });
    }
  }, 5000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Cleanup
  discordRPC.disconnect();
  robloxManager.killAll();
});
