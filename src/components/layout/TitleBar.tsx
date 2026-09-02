import React from 'react';
import {
  SunMedium,
  Moon,
  Sun,
  Search,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';

interface TitleBarProps {
  onOpenSettings: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenSettings }) => {
  const { mode, cycleSolarMode, solarLabel, ligatures, toggleLigatures } = useTheme();
  const { activeTab, fileTree, setCommandPaletteOpen } = useWorkspace();

  const workspaceName = fileTree?.name || 'Workspace';
  const activeFilePath = activeTab ? activeTab.path : 'No Open File';

  return (
    <header className="h-10 bg-[#0d1017] border-b border-[#1f2433] flex items-center justify-between px-3 text-xs text-slate-300 select-none z-30 font-sans">
      {/* Brand */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="font-display font-bold text-sm tracking-wide bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-1.5">
          <span>⧉</span> Twominal
        </span>
      </div>

      {/* Center Command Search / Palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true, false)}
        className="flex items-center gap-2 px-4 py-1 rounded-md bg-[#161a26] border border-[#262c3e] hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 text-xs transition-all w-80 max-w-sm justify-between shadow-inner cursor-pointer"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">
            {workspaceName} <span className="text-slate-600">/</span>{' '}
            <span className="text-slate-300 font-mono">{activeFilePath}</span>
          </span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#0d1017] border border-slate-700 rounded text-slate-400 shrink-0">
          ⌘P / Ctrl+P
        </kbd>
      </button>

      {/* Top Right Controls */}
      <div className="flex items-center gap-2 font-mono">
        {/* Solar Sunset/Sunrise Dynamic Toggle */}
        <button
          onClick={cycleSolarMode}
          id="solar-mode-btn"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161a26] border border-[#262c3e] hover:bg-slate-800 text-[11px] font-mono text-amber-300 transition-all cursor-pointer"
          title="Solar Theming Mode"
        >
          {mode === 'solar' ? (
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
          ) : mode === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{solarLabel}</span>
        </button>

        {/* Ligatures Toggle */}
        <button
          onClick={toggleLigatures}
          id="ligature-btn"
          className={`flex items-center gap-1 px-2 py-1 rounded-md bg-[#161a26] border border-[#262c3e] text-[11px] font-mono hover:bg-slate-800 cursor-pointer ${
            ligatures ? 'text-sky-400' : 'text-slate-500'
          }`}
          title="Toggle Font Ligatures (=> !== === ->)"
        >
          <span className="font-bold">!=&gt;</span>
          <span className="text-[10px] text-slate-400">LIGA</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
