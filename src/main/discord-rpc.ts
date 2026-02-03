/**
 * Discord Rich Presence Manager
 * Handles Discord RPC connection and presence updates
 */

import { Client } from 'discord-rpc';

const CLIENT_ID = '1200000000000000000'; // Replace with your actual Discord App ID

export class DiscordRPCManager {
  private client: Client | null = null;
  private connected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.client = new Client({ transport: 'ipc' });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('ready', () => {
      console.log('Discord RPC connected');
      this.connected = true;
      
      // Set initial presence
      this.updatePresence({
        details: 'In Launcher',
        state: 'Idle',
        largeImageKey: 'tqthbaxpdenae-sbtv_logo',
        largeImageText: 'TQTHBAXPDENAE-SBTV Launcher',
        startTimestamp: Date.now(),
      });
    });

    this.client.on('disconnected', () => {
      console.log('Discord RPC disconnected');
      this.connected = false;
      this.scheduleReconnect();
    });

    this.client.on('error', (error) => {
      console.error('Discord RPC error:', error);
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (this.connected || !this.client) return;

    try {
      await this.client.login({ clientId: CLIENT_ID });
    } catch (error) {
      console.error('Failed to connect to Discord RPC:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.client && this.connected) {
      this.client.clearActivity();
      this.client.destroy();
      this.connected = false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;

    this.reconnectInterval = setInterval(() => {
      if (!this.connected) {
        console.log('Attempting to reconnect to Discord...');
        this.connect();
      } else {
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      }
    }, 30000); // Try to reconnect every 30 seconds
  }

  updatePresence(presence: {
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
    buttons?: Array<{ label: string; url: string }>;
  }): void {
    if (!this.client || !this.connected) return;

    try {
      this.client.setActivity({
        details: presence.details,
        state: presence.state,
        startTimestamp: presence.startTimestamp,
        endTimestamp: presence.endTimestamp,
        largeImageKey: presence.largeImageKey || 'tqthbaxpdenae-sbtv_logo',
        largeImageText: presence.largeImageText || 'TQTHBAXPDENAE-SBTV',
        smallImageKey: presence.smallImageKey,
        smallImageText: presence.smallImageText,
        partySize: presence.partySize,
        partyMax: presence.partyMax,
        buttons: presence.buttons,
        instance: false,
      });
    } catch (error) {
      console.error('Failed to update Discord presence:', error);
    }
  }

  clearPresence(): void {
    if (!this.client || !this.connected) return;

    try {
      this.client.clearActivity();
    } catch (error) {
      console.error('Failed to clear Discord presence:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
