/**
 * Performance page - Performance presets and optimization settings
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Scale, 
  Sparkles, 
  Trophy,
  Check,
  Activity,
  Cpu,
  Monitor
} from 'lucide-react';
import type { PerformancePreset } from '../../shared/types';

const iconMap = {
  Zap,
  Scale,
  Sparkles,
  Trophy,
};

export const PerformancePage: React.FC = () => {
  const [presets, setPresets] = useState<PerformancePreset[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const result = await window.electronAPI.getPresets();
        if (result.success && result.data) {
          setPresets(result.data);
        }

        // Load current preset from settings
        const settingsResult = await window.electronAPI.getSettings();
        if (settingsResult.success && settingsResult.data) {
          setActivePreset(settingsResult.data.performance.currentPreset);
        }
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };

    loadPresets();
  }, []);

  const handleApplyPreset = async (preset: PerformancePreset) => {
    setApplying(preset.id);
    try {
      const result = await window.electronAPI.applyPreset(preset.id);
      if (result.success) {
        setActivePreset(preset.id);
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
    } finally {
      setApplying(null);
    }
  };

  const getPresetIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Zap;
    return Icon;
  };

  const getPresetGradient = (id: string) => {
    const gradients: Record<string, string> = {
      low: 'from-gray-600 to-gray-400',
      medium: 'from-blue-600 to-blue-400',
      high: 'from-purple-600 to-pink-400',
      competitive: 'from-orange-600 to-red-500',
    };
    return gradients[id] || 'from-gray-600 to-gray-400';
  };

  const getPresetColor = (id: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-400',
      medium: 'text-blue-400',
      high: 'text-purple-400',
      competitive: 'text-orange-400',
    };
    return colors[id] || 'text-gray-400';
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 mb-4">
            <Zap size={32} className="text-white"></Zap>
          </div>
          <h1 className="text-3xl font-bold">Performance Presets</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Choose a preset to instantly optimize your Roblox experience. Each preset configures fast flags for different use cases.
          </p>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((preset) => {
            const Icon = getPresetIcon(preset.icon);
            const isActive = activePreset === preset.id;
            const isApplying = applying === preset.id;

            return (
              <div
                key={preset.id}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-[#00d26a]/5 border-[#00d26a]' 
                    : 'bg-[#1f1f1f] border-[#2d2d2d] hover:border-[#3d3d3d]'
                  }
                `}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-[#00d26a] text-black text-xs font-bold rounded-full">
                    <Check size={12}></Check>
                    Active
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`
                    w-14 h-14 rounded-xl bg-gradient-to-br ${getPresetGradient(preset.id)}
                    flex items-center justify-center flex-shrink-0
                  `}>
                    <Icon size={28} className="text-white"></Icon>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold ${getPresetColor(preset.id)}`}>
                      {preset.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 mb-4">{preset.description}</p>

                    {/* Flag Preview */}
                    <div className="bg-[#141414] rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-2">Key settings:</p>
                      <div className="space-y-1">
                        {Object.entries(preset.flags).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <code className="text-gray-400 truncate max-w-[200px]">{key}</code>
                            <span className="text-[#00d26a] font-mono">{String(value)}</span>
                          </div>
                        ))}
                        {Object.keys(preset.flags).length > 3 && (
                          <p className="text-xs text-gray-600">+{Object.keys(preset.flags).length - 3} more</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyPreset(preset)}
                      disabled={isApplying || isActive}
                      className={`
                        w-full py-2.5 rounded-lg font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-[#00d26a]/20 text-[#00d26a] cursor-default' 
                          : 'bg-[#00d26a] text-black hover:bg-[#00e676]'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isApplying ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Applying...
                        </div>
                      ) : isActive ? (
                        'Applied'
                      ) : (
                        'Apply Preset'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Overview */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">What These Presets Change</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#141414] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#00d26a]/20 flex items-center justify-center flex-shrink-0">
                <Cpu size={20} className="text-[#00d26a]"></Cpu>
              </div>
              <div>
                <h3 className="font-medium mb-1">FPS & Performance</h3>
                <p className="text-sm text-gray-400">Adjusts frame rate limits and task scheduling for smoother gameplay</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#141414] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Monitor size={20} className="text-blue-500"></Monitor>
              </div>
              <div>
                <h3 className="font-medium mb-1">Graphics Quality</h3>
                <p className="text-sm text-gray-400">Configures rendering API and quality settings for your hardware</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#141414] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Activity size={20} className="text-purple-500"></Activity>
              </div>
              <div>
                <h3 className="font-medium mb-1">Network & Loading</h3>
                <p className="text-sm text-gray-400">Optimizes asset loading and network request batching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
