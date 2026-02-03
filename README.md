# EvanBlox

A modern, feature-rich Roblox launcher built with Electron + Vite + React + TypeScript. Inspired by AppleBlox, EvanBlox provides an enhanced Roblox experience with Discord Rich Presence, Fast Flags editor, multi-instance support, and performance presets.

![EvanBlox Screenshot](./assets/screenshot.png)

## Features

- **Discord Rich Presence**: Show "Playing Roblox" status with game details and elapsed time
- **Fast Flags Editor**: Visual JSON editor for Roblox startup flags with validation and sample presets
- **Multi-instance Support**: Launch multiple Roblox windows simultaneously with configurable limits
- **Performance Presets**: One-click optimization presets (Low/Medium/High/Competitive)
- **Modern Dark UI**: Sleek, AppleBlox-inspired interface with smooth animations
- **System Tray Integration**: Minimize to tray and keep running in background
- **TypeScript**: Fully type-safe codebase for reliability

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron 28 with context isolation
- **Build Tool**: Vite with electron-vite plugin
- **State**: electron-store for persistent settings
- **RPC**: discord-rpc for Discord integration

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/iamevanyt/evanblox.git
cd evanblox

# Install dependencies
npm install

# Start development server
npm run dev
```

## Building

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Project Structure

```
evanblox/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── discord-rpc.ts # Discord RPC manager
│   │   ├── roblox-manager.ts    # Roblox process management
│   │   ├── settings-manager.ts  # Settings persistence
│   │   └── fastflags-manager.ts # Fast flags management
│   ├── preload/           # Preload scripts
│   │   └── index.ts       # Secure IPC bridge
│   ├── renderer/          # React frontend
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/    # Shared components
│   │   └── pages/         # Page components
│   └── shared/            # Shared types
│       └── types.ts
├── assets/                # Icons and images
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Fast Flags

Fast flags are Roblox startup configuration options that can modify game behavior. EvanBlox includes:

- **Sample Flags**: Pre-configured flags for FPS, graphics, and performance
- **JSON Editor**: Direct JSON editing for custom flags
- **Import/Export**: Share flag configurations with others
- **Validation**: Real-time JSON validation

### Sample Fast Flags Included

| Flag | Description | Default |
|------|-------------|---------|
| `DFIntTaskSchedulerTargetFps` | FPS cap (0 = unlimited) | 144 |
| `DFIntQualityLevel` | Graphics quality (1-21) | 7 |
| `FFlagGraphicsEnableD3D11` | Enable DirectX 11 | true |
| `FFlagPreloadAllFonts` | Preload fonts on startup | true |

## Discord Rich Presence

EvanBlox integrates with Discord to show:

- Current status ("Playing Roblox", "In Launcher")
- Elapsed session time
- Custom status text
- Large/small images

To enable:
1. Open Settings → Discord Integration
2. Toggle "Enable Rich Presence"
3. Configure custom status text (optional)

## Multi-Instance

Launch multiple Roblox windows:

1. Enable "Multi-Instance" in Settings → Roblox
2. Set maximum instances limit (1-10)
3. Click "Launch Roblox" multiple times
4. Manage instances from the Dashboard

## Performance Presets

Choose from four optimization profiles:

| Preset | Best For | Key Features |
|--------|----------|--------------|
| **Low** | Weak hardware | Max FPS, lowest quality |
| **Medium** | Balanced | Good quality/performance balance |
| **High** | High-end PCs | Best visuals, uncapped FPS |
| **Competitive** | PvP games | Max FPS, reduced effects |

## Configuration

Settings are stored in:

- **Windows**: `%APPDATA%/evanblox/`
- **macOS**: `~/Library/Application Support/evanblox/`
- **Linux**: `~/.config/evanblox/`

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Preview production build
npm run preview
```

## Troubleshooting

### Roblox not launching
- Verify Roblox installation path in Settings
- Check that the executable path points to `RobloxPlayerBeta.exe`

### Discord RPC not working
- Ensure Discord is running
- Check "Enable Rich Presence" in settings
- Verify Discord Game Activity is enabled

### Fast flags not applying
- Save changes with the "Save" button
- Restart Roblox for changes to take effect
- Check JSON validity in the editor

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Inspired by [AppleBlox](https://github.com/AppleBlox)
- Built with [Electron](https://electronjs.org)
- UI powered by [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
