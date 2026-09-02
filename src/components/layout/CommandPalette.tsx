import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  FileCode,
  Sparkles,
  Bot,
  Save,
  SunMedium,
  Layers,
  Code2,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePets } from '../../context/PetsContext';

interface CommandItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    openFile,
    saveActiveFile,
    setSidebarView,
    toggleSplitEditor,
    workspacePath,
    setWorkspacePath,
    openPetCodingTab,
    showToast,
  } = useWorkspace();
  const { setProvider, generateSpec, activeProvider } = useAgent();
  const { cycleSolarMode, toggleLigatures } = useTheme();
  const { toggleEditorCompanion, throwBall, clearAllPets, pets, setTheme } = usePets();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'cmd-open-folder',
      icon: <FolderOpen className="w-4 h-4 text-sky-400" />,
      title: 'File: Open Workspace Directory...',
      category: 'File',
      shortcut: '⌘O',
      action: () => {
        const input = window.prompt('Enter workspace directory path:', workspacePath);
        if (input && input.trim()) {
          setWorkspacePath(input.trim());
          showToast(`Opened workspace: ${input.trim()}`);
        }
      },
    },
    {
      id: 'cmd-resync-acp',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      title: `ACP: Reconnect ${activeProvider.toUpperCase()} to Active Workspace`,
      category: 'Agent Protocol',
      action: () => {
        setProvider(activeProvider);
        showToast(`Re-synchronized ACP with workspace: ${workspacePath}`);
      },
    },
    {
      id: 'cmd-theme-solar',
      icon: <SunMedium className="w-4 h-4 text-amber-400" />,
      title: 'Toggle Sunset Theming (Solar Sync)',
      category: 'Appearance',
      shortcut: '⌘T',
      action: () => cycleSolarMode(),
    },
    {
      id: 'cmd-ligatures',
      icon: <Code2 className="w-4 h-4 text-sky-400" />,
      title: 'Toggle Font Ligatures (!=> === !==)',
      category: 'Typography',
      action: () => toggleLigatures(),
    },
    {
      id: 'cmd-acp-claude',
      icon: <Bot className="w-4 h-4 text-indigo-400" />,
      title: 'ACP: Switch to Claude Code (3.7 Sonnet)',
      category: 'Agent Protocol',
      action: () => setProvider('claude'),
    },
    {
      id: 'cmd-acp-antigrav',
      icon: <Bot className="w-4 h-4 text-cyan-400" />,
      title: 'ACP: Switch to Google Antigravity (agy)',
      category: 'Agent Protocol',
      action: () => setProvider('antigravity'),
    },
    {
      id: 'cmd-acp-codex',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      title: 'ACP: Switch to OpenAI Codex',
      category: 'Agent Protocol',
      action: () => setProvider('codex'),
    },
    {
      id: 'cmd-acp-grok',
      icon: <Bot className="w-4 h-4 text-amber-400" />,
      title: 'ACP: Switch to xAI Grok 3',
      category: 'Agent Protocol',
      action: () => setProvider('grok'),
    },
    {
      id: 'cmd-krypton-spec',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      title: 'Krypton: Create New Architecture Spec',
      category: 'Krypton Spec',
      shortcut: '⌘K',
      action: () => {
        setSidebarView('krypton');
        generateSpec('Dynamic Solar Theming SPEC-004');
      },
    },
    {
      id: 'cmd-split-editor',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      title: 'View: Split Editor Buffer Side-by-Side',
      category: 'View',
      shortcut: '⌘\\',
      action: () => toggleSplitEditor(),
    },
    {
      id: 'cmd-save-file',
      icon: <Save className="w-4 h-4 text-emerald-400" />,
      title: 'File: Save Active Buffer (:w)',
      category: 'File',
      shortcut: '⌘S',
      action: () => saveActiveFile(),
    },
    {
      id: 'vscode-pets-start',
      icon: <span className="text-base leading-none">🐾</span>,
      title: 'vscode-pets: Start Pet Coding (vscode-pets.start)',
      category: 'vscode-pets Compatibility',
      action: () => openPetCodingTab(),
    },
    {
      id: 'vscode-pets-spawn',
      icon: <span className="text-base leading-none">✨</span>,
      title: 'vscode-pets: Spawn Pet (vscode-pets.spawn-pet)',
      category: 'vscode-pets Compatibility',
      action: () => setSidebarView('pets'),
    },
    {
      id: 'vscode-pets-throw-ball',
      icon: <span className="text-base leading-none">🎾</span>,
      title: 'vscode-pets: Throw Ball (vscode-pets.throw-ball)',
      category: 'vscode-pets Compatibility',
      action: () => throwBall(15, 30, 5, -5),
    },
    {
      id: 'vscode-pets-throw-mouse',
      icon: <span className="text-base leading-none">🖱️</span>,
      title: 'vscode-pets: Throw With Mouse (vscode-pets.throw-with-mouse)',
      category: 'vscode-pets Compatibility',
      action: () => toggleEditorCompanion(),
    },
    {
      id: 'vscode-pets-remove-all',
      icon: <span className="text-base leading-none">🧹</span>,
      title: 'vscode-pets: Remove All Pets (vscode-pets.remove-all-pets)',
      category: 'vscode-pets Compatibility',
      action: () => {
        clearAllPets();
        showToast('vscode-pets: All pets removed');
      },
    },
    {
      id: 'vscode-pets-roll-call',
      icon: <span className="text-base leading-none">📢</span>,
      title: 'vscode-pets: Roll Call (vscode-pets.roll-call)',
      category: 'vscode-pets Compatibility',
      action: () => {
        const names = pets.map((p) => `${p.name} the ${p.color} ${p.type}`).join(', ');
        showToast(names ? `Pets present: ${names}` : 'No pets currently present');
      },
    },
    {
      id: 'vscode-pets-theme-castle',
      icon: <span className="text-base leading-none">🏰</span>,
      title: 'vscode-pets: Change Theme to Castle (vscode-pets.change-theme)',
      category: 'vscode-pets Compatibility',
      action: () => {
        setTheme('castle');
        showToast('vscode-pets: Theme set to Castle');
      },
    },
    {
      id: 'vscode-pets-theme-forest',
      icon: <span className="text-base leading-none">🌲</span>,
      title: 'vscode-pets: Change Theme to Forest (vscode-pets.change-theme)',
      category: 'vscode-pets Compatibility',
      action: () => {
        setTheme('forest');
        showToast('vscode-pets: Theme set to Forest');
      },
    },
    {
      id: 'vscode-pets-theme-cyberpunk',
      icon: <span className="text-base leading-none">🌆</span>,
      title: 'vscode-pets: Change Theme to Cyberpunk (vscode-pets.change-theme)',
      category: 'vscode-pets Compatibility',
      action: () => {
        setTheme('cyberpunk');
        showToast('vscode-pets: Theme set to Cyberpunk');
      },
    },
    {
      id: 'file-acp-bridge',
      icon: <FileCode className="w-4 h-4 text-orange-400" />,
      title: 'src/acp_bridge.rs',
      category: 'File',
      action: () => openFile('src/acp_bridge.rs'),
    },
    {
      id: 'file-spec-solar',
      icon: <FileCode className="w-4 h-4 text-purple-400" />,
      title: 'krypton/SPEC_SOLAR_THEME.md',
      category: 'File',
      action: () => openFile('krypton/SPEC_SOLAR_THEME.md'),
    },
    {
      id: 'file-design-tokens',
      icon: <FileCode className="w-4 h-4 text-yellow-400" />,
      title: 'krypton/design_tokens.json',
      category: 'File',
      action: () => openFile('krypton/design_tokens.json'),
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 z-50 p-4 select-none"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#0f121a] border border-[#262c3e] rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#1f2433] bg-[#0a0c12]">
          <Search className="w-4 h-4 text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search files (e.g. solar, acp, spec)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No matching commands or files found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 text-white border border-indigo-500/40'
                      : 'text-slate-300 hover:bg-[#161a26]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {cmd.icon}
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200">{cmd.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {cmd.category}
                      </div>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
