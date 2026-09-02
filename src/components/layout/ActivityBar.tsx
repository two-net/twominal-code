import React from 'react';
import {
  Files,
  Compass,
  Blocks,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { SidebarView, useWorkspace } from '../../context/WorkspaceContext';
import { useVim } from '../../context/VimContext';

interface ActivityBarProps {
  onOpenSettings: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = () => {
  const { sidebarView, setSidebarView, toggleAiPanel, isAiPanelOpen, gitFiles } = useWorkspace();
  const { vimEnabled, toggleVimEnabled } = useVim();

  const items: { view: SidebarView; icon: React.ReactNode; tooltip: string; activeColor: string }[] = [
    {
      view: 'explorer',
      icon: <Files className="w-4 h-4" />,
      tooltip: 'Explorer (Cmd+Shift+E)',
      activeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30',
    },
    {
      view: 'krypton',
      icon: <Compass className="w-4 h-4" />,
      tooltip: 'Krypton Spec Engine',
      activeColor: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
    },
    {
      view: 'extensions',
      icon: <Blocks className="w-4 h-4" />,
      tooltip: 'Extensions (Open-VSX)',
      activeColor: 'text-sky-400 bg-sky-950/40 border-sky-500/30',
    },
    {
      view: 'git',
      icon: <GitBranch className="w-4 h-4" />,
      tooltip: `Source Control (${gitFiles.length} changes)`,
      activeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
    {
      view: 'pets',
      icon: <span className="text-base leading-none select-none">🐾</span>,
      tooltip: 'VS Code Pets (vscode-pets)',
      activeColor: 'text-pink-400 bg-pink-950/40 border-pink-500/30',
    },
  ];

  return (
    <aside className="w-12 bg-[#0a0c12] border-r border-[#1f2433] flex flex-col items-center py-2 justify-between z-20 select-none">
      {/* Top Sidebar Switchers */}
      <div className="flex flex-col items-center gap-2">
        {items.map((item) => {
          const isActive = sidebarView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setSidebarView(item.view)}
              className={`p-2.5 rounded-lg transition-all relative group cursor-pointer border ${
                isActive
                  ? item.activeColor
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#161a26]'
              }`}
              title={item.tooltip}
            >
              {item.icon}
              <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.tooltip}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Vim Status & AI Panel Toggle */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={toggleVimEnabled}
          id="vim-status-toggle"
          className={`px-1.5 py-1 rounded font-mono text-[10px] font-bold cursor-pointer transition-all ${
            vimEnabled
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border border-slate-700 text-slate-500'
          }`}
          title={vimEnabled ? 'Vim Mode Active (Click to disable)' : 'Vim Mode Inactive (Click to enable)'}
        >
          VIM
        </button>

        <button
          onClick={toggleAiPanel}
          id="ai-panel-toggle-btn"
          className={`p-2.5 rounded-lg transition-all cursor-pointer ${
            isAiPanelOpen
              ? 'text-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/50'
              : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800'
          }`}
          title="Toggle ACP AI Co-pilot"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
