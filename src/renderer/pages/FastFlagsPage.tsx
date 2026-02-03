/**
 * Fast Flags page - JSON editor for Roblox startup flags
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2,
  Flag,
  Search
} from 'lucide-react';
import type { FastFlagsConfig } from '../../shared/types';

export const FastFlagsPage: React.FC = () => {
  const [config, setConfig] = useState<FastFlagsConfig | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    { id: 'all', label: 'All Flags', color: 'bg-gray-600' },
    { id: 'performance', label: 'Performance', color: 'bg-green-600' },
    { id: 'graphics', label: 'Graphics', color: 'bg-blue-600' },
    { id: 'network', label: 'Network', color: 'bg-purple-600' },
    { id: 'experimental', label: 'Experimental', color: 'bg-orange-600' },
  ];

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await window.electronAPI.getFastFlags();
        if (result.success && result.data) {
          setConfig(result.data);
          setJsonText(JSON.stringify(result.data.customFlags, null, 2));
        }
      } catch (error) {
        console.error('Failed to load fast flags:', error);
      }
    };

    loadConfig();
  }, []);

  // Validate JSON on change
  const handleJsonChange = useCallback((value: string) => {
    setJsonText(value);
    setHasChanges(true);

    window.electronAPI.validateFastFlags(value).then((result) => {
      setIsValid(result.data || false);
    });
  }, []);

  const handleSave = async () => {
    if (!isValid) return;

    try {
      await window.electronAPI.saveFastFlags();
      setHasChanges(false);
      // Show success toast
    } catch (error) {
      console.error('Failed to save fast flags:', error);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all fast flags to default?')) {
      try {
        await window.electronAPI.resetFastFlags();
        const result = await window.electronAPI.getFastFlags();
        if (result.success && result.data) {
          setConfig(result.data);
          setJsonText(JSON.stringify(result.data.customFlags, null, 2));
          setHasChanges(false);
        }
      } catch (error) {
        console.error('Failed to reset fast flags:', error);
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(config?.customFlags || {}, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'evanblox-fastflags.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        JSON.parse(content); // Validate
        setJsonText(content);
        setHasChanges(true);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const toggleFlag = (flagName: string) => {
    if (!config) return;

    const isEnabled = config.enabled.includes(flagName);
    const newEnabled = isEnabled
      ? config.enabled.filter(f => f !== flagName)
      : [...config.enabled, flagName];

    setConfig({ ...config, enabled: newEnabled });
    setHasChanges(true);
  };

  const updateFlagValue = (flagName: string, value: string | number | boolean) => {
    if (!config) return;

    const newFlags = {
      ...config.flags,
      [flagName]: {
        ...config.flags[flagName],
        value,
      },
    };

    setConfig({ ...config, flags: newFlags });
    setHasChanges(true);
  };

  const filteredFlags = React.useMemo(() => {
    if (!config) return [];

    return Object.values(config.flags).filter((flag) => {
      const matchesCategory = activeCategory === 'all' || flag.category === activeCategory;
      const matchesSearch = 
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [config, activeCategory, searchQuery]);

  if (!config) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d26a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Flag List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-[#2d2d2d]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                <Flag size={20} className="text-white"></Flag>
              </div>
              <div>
                <h1 className="text-xl font-bold">Fast Flags</h1>
                <p className="text-sm text-gray-400">Configure Roblox startup flags</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-sm text-yellow-500">Unsaved changes</span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || !isValid}
                className="flex items-center gap-2 px-4 py-2 bg-[#00d26a] text-black rounded-lg font-medium hover:bg-[#00e676] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16}></Save>
                Save
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors"
              >
                <RotateCcw size={16}></RotateCcw>
                Reset
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></Search>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flags..."
                className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg text-sm focus:outline-none focus:border-[#00d26a]"
              />
            </div>

            <div className="flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${activeCategory === cat.id 
                      ? 'bg-[#2d2d2d] text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f]'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flags List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredFlags.map((flag) => {
              const isEnabled = config.enabled.includes(flag.name);
              const category = categories.find(c => c.id === flag.category);

              return (
                <div
                  key={flag.name}
                  className={`
                    p-4 rounded-xl border transition-all duration-200
                    ${isEnabled 
                      ? 'bg-[#00d26a]/5 border-[#00d26a]/30' 
                      : 'bg-[#1f1f1f] border-[#2d2d2d]'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleFlag(flag.name)}
                        className="sr-only peer"
                      />
                      <div className={`
                        w-11 h-6 rounded-full transition-colors
                        ${isEnabled ? 'bg-[#00d26a]' : 'bg-gray-700'}
                        peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00d26a]/50
                      `}></div>
                      <div className={`
                        absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform
                        ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                      `}></div>
                    </label>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-[#00d26a]">{flag.name}</code>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${category?.color}`}>
                          {flag.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{flag.description}</p>

                      <div className="flex items-center gap-2">
                        {typeof flag.value === 'boolean' ? (
                          <select
                            value={flag.value ? 'true' : 'false'}
                            onChange={(e) => updateFlagValue(flag.name, e.target.value === 'true')}
                            disabled={!isEnabled}
                            className="px-3 py-1 bg-[#141414] border border-[#2d2d2d] rounded text-sm disabled:opacity-50"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : typeof flag.value === 'number' ? (
                          <input
                            type="number"
                            value={flag.value}
                            onChange={(e) => updateFlagValue(flag.name, parseInt(e.target.value))}
                            disabled={!isEnabled}
                            className="px-3 py-1 w-24 bg-[#141414] border border-[#2d2d2d] rounded text-sm disabled:opacity-50"
                          />
                        ) : (
                          <input
                            type="text"
                            value={flag.value}
                            onChange={(e) => updateFlagValue(flag.name, e.target.value)}
                            disabled={!isEnabled}
                            className="px-3 py-1 flex-1 max-w-xs bg-[#141414] border border-[#2d2d2d] rounded text-sm disabled:opacity-50"
                          />
                        )}
                        <span className="text-xs text-gray-500">Default: {String(flag.defaultValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - JSON Editor */}
      <div className="w-96 border-l border-[#2d2d2d] flex flex-col bg-[#0f0f0f]">
        <div className="p-4 border-b border-[#2d2d2d]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Custom Flags (JSON)</h2>
            <div className="flex items-center gap-1">
              {isValid ? (
                <CheckCircle2 size={16} className="text-[#00d26a]"></CheckCircle2>
              ) : (
                <AlertCircle size={16} className="text-red-500"></AlertCircle>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500">Add custom flags as JSON. These will be merged with enabled flags.</p>
        </div>

        <div className="flex-1 p-4">
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            className={`
              w-full h-full p-4 bg-[#141414] border rounded-lg font-mono text-sm resize-none focus:outline-none
              ${isValid ? 'border-[#2d2d2d] focus:border-[#00d26a]' : 'border-red-500 focus:border-red-500'}
            `}
            placeholder='{"FFlagCustomFlag": true}'
            spellCheck={false}
          />
        </div>

        <div className="p-4 border-t border-[#2d2d2d] space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2d2d2d] rounded-lg transition-colors"
          >
            <Download size={16}></Download>
            Export to File
          </button>
          
          <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2d2d2d] rounded-lg transition-colors cursor-pointer"
          >
            <Upload size={16}></Upload>
            Import from File
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
