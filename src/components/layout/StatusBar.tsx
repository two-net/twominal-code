import React from 'react';
import {
  GitBranch,
  Sparkles,
  SunMedium,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useTheme } from '../../context/ThemeContext';
import { useVim } from '../../context/VimContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePets } from '../../context/PetsContext';

export const StatusBar: React.FC = () => {
  const { state: vimState } = useVim();
  const { activeTab, gitBranch, setSidebarView } = useWorkspace();
  const { pets, showEditorCompanion, toggleEditorCompanion } = usePets();
  const { activeProvider } = useAgent();
  const { ligatures } = useTheme();

  const getVimBadgeStyle = () => {
    switch (vimState.mode) {
      case 'NORMAL':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'INSERT':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      case 'VISUAL':
      case 'VISUAL_LINE':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'COMMAND':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getProviderLabel = () => {
    switch (activeProvider) {
      case 'claude':
        return 'Claude 3.7 Sonnet (JSON-RPC)';
      case 'antigravity':
        return 'Antigravity 2.0 (DeepMind)';
      case 'codex':
        return 'OpenAI Codex (ACP)';
      case 'grok':
        return 'xAI Grok 3 (ACP)';
    }
  };

  return (
    <footer className="h-6 bg-[#0a0c12] border-t border-[#1f2433] px-3 flex items-center justify-between text-[11px] font-mono select-none z-30 font-mono text-slate-400">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <span
          id="status-vim-badge"
          className={`px-1.5 py-0.2 rounded font-bold ${getVimBadgeStyle()}`}
        >
          {vimState.mode}
        </span>

        <span className="flex items-center gap-1 text-slate-400">
          <GitBranch className="w-3 h-3 text-emerald-400" />
          <span>{gitBranch}</span>
        </span>

        <span className="flex items-center gap-1 text-indigo-400">
          <Sparkles className="w-3 h-3" />
          <span id="status-acp-provider">ACP: {getProviderLabel()}</span>
        </span>

        {pets.length > 0 && (
          <button
            onClick={() => setSidebarView('pets')}
            className="flex items-center gap-1 text-pink-400 hover:text-pink-300 cursor-pointer font-mono text-[10px] bg-pink-950/40 border border-pink-500/20 px-1.5 py-0.2 rounded transition-colors"
            title="Open Pets Studio"
          >
            <span>🐾</span>
            <span>{pets[0].name} ({pets.length})</span>
          </button>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleEditorCompanion}
          className={`cursor-pointer hover:text-slate-200 transition-colors ${
            showEditorCompanion ? 'text-pink-400 font-bold' : 'text-slate-500'
          }`}
          title="Toggle Roaming Pets in Editor"
        >
          Pets Bar: {showEditorCompanion ? 'ON' : 'OFF'}
        </button>
        <span className="text-amber-300 flex items-center gap-1">
          <SunMedium className="w-3 h-3 text-amber-400" />
          <span>Sunset Sync (18:42)</span>
        </span>

        <span className={ligatures ? 'text-sky-400' : 'text-slate-500'}>
          Ligatures: {ligatures ? 'ON' : 'OFF'}
        </span>

        <span>Ln {activeTab?.cursorLine || 14}, Col {activeTab?.cursorColumn || 28}</span>
        <span>UTF-8</span>
      </div>
    </footer>
  );
};
