/**
 * Title Bar with window controls
 */

import React from 'react';
import { Minus, Square, X, Gamepad2 } from 'lucide-react';

interface TitleBarProps {
  version: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ version }) => {
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className="h-10 bg-[#141414] border-b border-[#2d2d2d] flex items-center justify-between select-none drag"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 px-4"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00d26a] to-[#00b894] flex items-center justify-center">
          <Gamepad2 size={14} className="text-black"></Gamepad2>
        </div>
        <span className="font-semibold text-sm">EvanBlox</span>
        <span className="text-xs text-gray-500">v{version}</span>
      </div>

      <div className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="h-full px-4 hover:bg-gray-800 transition-colors flex items-center justify-center"
          title="Minimize"
        >
          <Minus size={14} className="text-gray-400"></Minus>
        </button>
        
        <button
          onClick={handleMaximize}
          className="h-full px-4 hover:bg-gray-800 transition-colors flex items-center justify-center"
          title="Maximize"
        >
          <Square size={12} className="text-gray-400"></Square>
        </button>
        
        <button
          onClick={handleClose}
          className="h-full px-4 hover:bg-red-600 transition-colors flex items-center justify-center group"
          title="Close"
        >
          <X size={14} className="text-gray-400 group-hover:text-white"></X>
        </button>
      </div>
    </div>
  );
};
