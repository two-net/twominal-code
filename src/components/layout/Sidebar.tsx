import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  FileCode,
  FileJson,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  Download,
  Star,
  GitBranch,
  RotateCcw,
  GitCommit,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import { useAgent } from '../../context/AgentContext';
import { ExtensionService } from '../../services/extensionService';
import { FileEntry } from '../../types/workspace';
import { ExtensionItem } from '../../types/extensions';
import { VsCodePetsPanel } from '../pets/VsCodePetsPanel';

export const Sidebar: React.FC = () => {
  const {
    sidebarView,
    setSidebarView,
    isSidebarOpen,
    toggleSidebar,
    fileTree,
    activeTab,
    gitBranch,
    openFile,
    createFile,
    deleteFile,
    refreshTree,
    refreshGit,
    gitFiles,
    commitChanges,
    openDiff,
    activeDiff,
    stageFile,
    unstageFile,
    discardFile,
    showToast,
    workspacePath,
    setWorkspacePath,
  } = useWorkspace();
  const { setPreset } = useTheme();
  const { generateSpec, specs, activeSpec, selectSpec, activeProvider } = useAgent();

  const [extensionSearch, setExtensionSearch] = useState('');
  const [installedExtensions, setInstalledExtensions] = useState<ExtensionItem[]>([]);
  const [marketplaceExtensions, setMarketplaceExtensions] = useState<ExtensionItem[]>([]);
  const [installedLoading, setInstalledLoading] = useState(false);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [installedOpen, setInstalledOpen] = useState(true);
  const [marketplaceOpen, setMarketplaceOpen] = useState(true);
  const [installingIds, setInstallingIds] = useState<Set<string>>(new Set());
  const [newFileInput, setNewFileInput] = useState<{ parentPath: string; isDir: boolean } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [commitMessage, setCommitMessage] = useState('');
  const [isPetsSplitOpen, setIsPetsSplitOpen] = useState(true);

  const stagedFiles = gitFiles.filter((gf) => !!gf.is_staged);
  const unstagedFiles = gitFiles.filter((gf) => !gf.is_staged);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const loadInstalledExtensions = async () => {
    setInstalledLoading(true);
    try {
      const items = await ExtensionService.getInstalled();
      setInstalledExtensions(items);
    } catch (err) {
      console.error('Failed to load installed extensions', err);
    } finally {
      setInstalledLoading(false);
    }
  };

  const loadMarketplaceExtensions = async (query = '') => {
    setMarketplaceLoading(true);
    try {
      const items = await ExtensionService.search(query);
      setMarketplaceExtensions(items);
    } catch (err) {
      console.error('Failed to load marketplace extensions', err);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  // Load real installed extensions and query marketplace
  useEffect(() => {
    if (sidebarView === 'extensions') {
      loadInstalledExtensions();
      loadMarketplaceExtensions(extensionSearch);
    }
  }, [sidebarView, extensionSearch]);

  const handleInstallExtension = async (ext: ExtensionItem) => {
    setInstallingIds((prev) => new Set(prev).add(ext.id));
    try {
      showToast(`Downloading & installing ${ext.display_name || ext.name}...`);
      const installed = await ExtensionService.install(ext.id, ext.download_url);
      setInstalledExtensions((prev) => [installed, ...prev.filter((i) => i.id.toLowerCase() !== installed.id.toLowerCase())]);
      showToast(`Installed ${installed.display_name || installed.name}`);
      if (ext.name.includes('one-dark')) setPreset('one-dark-pro');
      if (ext.name.includes('tokyo-night')) setPreset('tokyo-night');
      if (ext.name.includes('catppuccin')) setPreset('catppuccin-mocha');
    } catch (err) {
      console.error('Failed to install extension', err);
      showToast(`Failed to install ${ext.display_name || ext.name}: ${err}`);
    } finally {
      setInstallingIds((prev) => {
        const next = new Set(prev);
        next.delete(ext.id);
        return next;
      });
    }
  };

  const handleUninstallExtension = async (ext: ExtensionItem) => {
    try {
      await ExtensionService.uninstall(ext.id);
      setInstalledExtensions((prev) => prev.filter((i) => i.id.toLowerCase() !== ext.id.toLowerCase()));
      showToast(`Uninstalled ${ext.display_name || ext.name}`);
    } catch (err) {
      console.error('Failed to uninstall extension', err);
      showToast(`Failed to uninstall: ${err}`);
    }
  };

  if (!isSidebarOpen) {
    return <aside id="sidebar" className="w-0 overflow-hidden bg-[#0d1017] border-r border-[#1f2433] transition-all duration-200" />;
  }

  const titles = {
    explorer: `Explorer: ${fileTree?.name || 'Workspace'}`,
    krypton: 'Krypton Spec Studio',
    extensions: 'Extensions',
    pets: 'VS Code Pets',
    git: 'Source Control & Diffs',
    search: 'Search Workspace',
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileInput || !newFileName.trim()) return;
    const fullPath = `${newFileInput.parentPath}/${newFileName.trim()}`;
    await createFile(fullPath, newFileInput.isDir);
    setNewFileInput(null);
    setNewFileName('');
  };

  const handleCreateNewSpec = async () => {
    const specPrompt = window.prompt('Enter spec objective (e.g. Dynamic Solar Theming):');
    if (specPrompt && specPrompt.trim()) {
      showToast(`Generating Krypton spec: ${specPrompt.trim()}...`);
      await generateSpec(specPrompt.trim());
    }
  };


  const renderFileTree = (entry: FileEntry, depth = 0) => {
    const isActive = activeTab?.path === entry.path || activeTab?.title === entry.name;

    if (entry.is_dir) {
      const isExpanded = expandedFolders.has(entry.path);
      const FolderIcon = isExpanded ? FolderOpen : Folder;

      return (
        <div key={entry.path} className="pl-1">
          <div
            onClick={() => toggleFolder(entry.path)}
            className="flex items-center gap-1.5 py-1 px-1.5 text-slate-300 hover:bg-slate-800/40 rounded cursor-pointer group text-xs font-mono select-none"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <FolderIcon className={`w-3.5 h-3.5 shrink-0 ${entry.name === 'krypton' ? 'text-purple-400' : 'text-sky-400'}`} />
            <span className="truncate">{entry.name}/</span>
            {entry.name === 'krypton' && (
              <span className="ml-1 text-[9px] px-1 bg-purple-950 text-purple-400 rounded">SPEC</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedFolders((prev) => new Set(prev).add(entry.path));
                setNewFileInput({ parentPath: entry.path, isDir: false });
              }}
              className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-cyan-400"
              title="New File"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {isExpanded && (
            <div className="pl-3 space-y-0.5 mt-0.5">
              {newFileInput && newFileInput.parentPath === entry.path && (
                <form onSubmit={handleCreateSubmit} className="py-1 px-2">
                  <input
                    autoFocus
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={() => setNewFileInput(null)}
                    placeholder="new file..."
                    className="w-full bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-indigo-300 focus:outline-none"
                  />
                </form>
              )}
              {entry.children?.map((child) => renderFileTree(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSpec = entry.name.endsWith('.md');
    const isJson = entry.name.endsWith('.json') || entry.name.endsWith('.toml');

    return (
      <div
        key={entry.path}
        onClick={() => openFile(entry.path)}
        className={`w-full flex items-center gap-1.5 py-1 px-1.5 rounded text-left text-xs font-mono cursor-pointer transition-all group ${
          isActive
            ? 'bg-indigo-950/40 text-indigo-300 border-l-2 border-indigo-500'
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a26]'
        }`}
      >
        <span className="w-3.5 shrink-0" />
        {isSpec ? (
          <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        ) : isJson ? (
          <FileJson className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        ) : (
          <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        )}
        <span className="truncate">{entry.name}</span>
        {isActive && <span className="ml-auto text-[10px] text-amber-400">●</span>}

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteFile(entry.path);
          }}
          className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <aside
      id="sidebar"
      className="w-64 bg-[#0d1017] border-r border-[#1f2433] flex flex-col text-xs transition-all duration-200 select-none z-10 shrink-0"
    >
      {/* Panel Header */}
      <div className="h-9 px-3 border-b border-[#1f2433] flex items-center justify-between text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
        <span id="sidebar-title">{titles[sidebarView]}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshTree}
            className="p-1 hover:text-slate-200 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:text-slate-200 cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab View 1: Explorer View with VS Code Pets Split Pane */}
      {sidebarView === 'explorer' && (
        <div id="view-explorer" className="flex-1 flex flex-col overflow-hidden">
          {/* Top Pane: Workspace Files */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs min-h-[100px]">
            <div className="text-slate-500 text-[10px] font-bold px-2 py-1 tracking-wider uppercase flex items-center justify-between">
              <div className="flex items-center gap-1 truncate">
                <Folder className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">WORKSPACE ({fileTree?.name || 'TWOMINAL'})</span>
              </div>
              <button
                onClick={() => {
                  const input = window.prompt('Enter workspace directory path:', workspacePath);
                  if (input && input.trim()) {
                    setWorkspacePath(input.trim());
                    showToast(`Opened workspace: ${input.trim()}`);
                  }
                }}
                className="p-0.5 hover:text-sky-400 text-slate-500 rounded cursor-pointer"
                title="Open / Change Workspace Directory"
              >
                <FolderOpen className="w-3 h-3" />
              </button>
            </div>

            {fileTree ? (
              fileTree.children && fileTree.children.length > 0 ? (
                <div className="space-y-0.5">
                  {fileTree.children.map((entry) => renderFileTree(entry))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">No files in workspace</div>
              )
            ) : (
              <div className="p-4 text-center text-slate-500 text-xs">Loading tree...</div>
            )}
          </div>

          {/* Bottom Split Pane: VS CODE PETS (vscode-pets) */}
          <div
            className={`border-t border-[#1f2433] flex flex-col shrink-0 transition-all duration-150 ${
              isPetsSplitOpen ? 'h-64' : 'h-7'
            }`}
          >
            <VsCodePetsPanel
              isCollapsible={true}
              isCollapsed={!isPetsSplitOpen}
              onToggleCollapse={() => setIsPetsSplitOpen(!isPetsSplitOpen)}
            />
          </div>
        </div>
      )}

      {/* Tab View 2: Krypton Spec Studio */}
      {sidebarView === 'krypton' && (
        <div id="view-krypton" className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
          <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-purple-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Krypton Design-First Skill</span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Enforces architectural blueprint & test spec generation prior to agent code execution.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Specifications ({specs.length})
            </span>

            {specs.length === 0 ? (
              <div className="p-3 text-center text-slate-500 text-xs bg-[#161a26]/40 rounded-lg border border-slate-800">
                No active specifications. Click &quot;Create New Spec&quot; below to generate one.
              </div>
            ) : (
              specs.map((spec) => (
                <div
                  key={spec.id}
                  className={`p-2.5 rounded-lg bg-[#161a26] border space-y-1.5 cursor-pointer transition-all ${
                    activeSpec?.id === spec.id
                      ? 'border-purple-500 shadow-md shadow-purple-950/30'
                      : 'border-slate-800 hover:border-purple-500/40'
                  }`}
                  onClick={() => selectSpec(spec.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate pr-2">
                      {spec.title}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        spec.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : spec.status === 'running'
                          ? 'bg-sky-500/20 text-sky-400'
                          : spec.status === 'paused_for_approval'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {spec.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {spec.description}
                  </p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleCreateNewSpec}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/30 cursor-pointer transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Spec</span>
          </button>
        </div>
      )}

      {/* Tab View 3: In-App Extensions View (Installed vs Marketplace) */}
      {sidebarView === 'extensions' && (
        <div id="view-extensions" className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={extensionSearch}
                onChange={(e) => setExtensionSearch(e.target.value)}
                placeholder="Search extensions (or @installed)..."
                className="w-full bg-[#161a26] border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <button
              onClick={() => {
                loadInstalledExtensions();
                loadMarketplaceExtensions(extensionSearch);
              }}
              title="Refresh extensions"
              className="p-1.5 bg-[#161a26] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${installedLoading || marketplaceLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Section 1: INSTALLED EXTENSIONS */}
          <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-[#10141f]">
            <button
              onClick={() => setInstalledOpen(!installedOpen)}
              className="w-full flex items-center justify-between p-2 bg-[#141824] hover:bg-[#181e2e] transition-colors text-left text-slate-300 font-semibold cursor-pointer border-b border-slate-800/60"
            >
              <div className="flex items-center gap-1.5">
                {installedOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className="tracking-wide text-[11px] font-mono text-emerald-400 uppercase">Installed</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                {installedExtensions.filter((ext) => {
                  if (!extensionSearch.trim()) return true;
                  const q = extensionSearch.toLowerCase().replace(/^@installed\s*/, '').trim();
                  if (!q) return true;
                  return (
                    ext.name.toLowerCase().includes(q) ||
                    ext.display_name.toLowerCase().includes(q) ||
                    ext.description.toLowerCase().includes(q) ||
                    ext.namespace.toLowerCase().includes(q) ||
                    ext.id.toLowerCase().includes(q)
                  );
                }).length}
              </span>
            </button>

            {installedOpen && (
              <div className="p-2 space-y-2">
                {installedLoading ? (
                  <div className="p-3 text-center text-slate-500 text-xs font-mono">Loading installed extensions...</div>
                ) : (
                  (() => {
                    const filtered = installedExtensions.filter((ext) => {
                      if (!extensionSearch.trim()) return true;
                      const q = extensionSearch.toLowerCase().replace(/^@installed\s*/, '').trim();
                      if (!q) return true;
                      return (
                        ext.name.toLowerCase().includes(q) ||
                        ext.display_name.toLowerCase().includes(q) ||
                        ext.description.toLowerCase().includes(q) ||
                        ext.namespace.toLowerCase().includes(q) ||
                        ext.id.toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return <div className="p-3 text-center text-slate-500 text-xs font-mono">No installed extensions</div>;
                    }

                    return filtered.map((ext) => (
                      <div
                        key={ext.id}
                        className="p-2 rounded-md bg-[#161a26] border border-slate-800/90 space-y-1 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate flex-1">
                            <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                              <span>{ext.display_name || ext.name}</span>
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1 py-0.2 rounded">v{ext.version}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {ext.namespace}.{ext.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {ext.name.toLowerCase().includes('pet') || ext.id.toLowerCase().includes('pet') ? (
                              <button
                                onClick={() => setSidebarView('pets')}
                                className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-pink-950 text-pink-300 border border-pink-500/40 hover:bg-pink-900 cursor-pointer flex items-center gap-0.5"
                              >
                                <span>🐾</span>
                                <span>Open Pets</span>
                              </button>
                            ) : null}
                            {ext.categories?.includes('Themes') || ext.name.toLowerCase().includes('theme') ? (
                              <button
                                onClick={() => {
                                  if (ext.name.includes('one-dark')) setPreset('one-dark-pro');
                                  else if (ext.name.includes('tokyo-night')) setPreset('tokyo-night');
                                  else if (ext.name.includes('catppuccin')) setPreset('catppuccin-mocha');
                                  else showToast(`Theme ${ext.display_name} activated`);
                                }}
                                className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900 cursor-pointer"
                              >
                                Theme
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleUninstallExtension(ext)}
                              title="Uninstall extension"
                              className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 cursor-pointer transition-colors"
                            >
                              Uninstall
                            </button>
                          </div>
                        </div>
                        {ext.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                            {ext.description}
                          </p>
                        )}
                      </div>
                    ));
                  })()
                )}
              </div>
            )}
          </div>

          {/* Section 2: MARKETPLACE */}
          <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-[#10141f]">
            <button
              onClick={() => setMarketplaceOpen(!marketplaceOpen)}
              className="w-full flex items-center justify-between p-2 bg-[#141824] hover:bg-[#181e2e] transition-colors text-left text-slate-300 font-semibold cursor-pointer border-b border-slate-800/60"
            >
              <div className="flex items-center gap-1.5">
                {marketplaceOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className="tracking-wide text-[11px] font-mono text-sky-400 uppercase">
                  {extensionSearch.trim() ? 'Marketplace Results' : 'Marketplace'}
                </span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-500/30 text-sky-300 font-mono text-[10px]">
                {marketplaceExtensions.length}
              </span>
            </button>

            {marketplaceOpen && (
              <div className="p-2 space-y-2">
                {marketplaceLoading ? (
                  <div className="p-3 text-center text-slate-500 text-xs font-mono">Querying Marketplace...</div>
                ) : marketplaceExtensions.length === 0 ? (
                  <div className="p-3 text-center text-slate-500 text-xs font-mono">No marketplace extensions found</div>
                ) : (
                  marketplaceExtensions.map((ext) => {
                    const isInstalled = installedExtensions.some((i) => i.id.toLowerCase() === ext.id.toLowerCase());
                    const isCurrentlyInstalling = installingIds.has(ext.id);

                    return (
                      <div
                        key={ext.id}
                        className="p-2.5 rounded-lg bg-[#161a26] border border-slate-800 space-y-1.5 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate flex-1">
                            <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                              <span>{ext.display_name || ext.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate font-mono">
                              {ext.namespace}.{ext.name}
                            </div>
                          </div>
                          {ext.name.toLowerCase().includes('pet') || ext.id.toLowerCase().includes('pet') ? (
                            <button
                              onClick={() => setSidebarView('pets')}
                              className="px-2 py-0.5 text-[9px] font-medium rounded bg-pink-950 text-pink-300 border border-pink-500/40 hover:bg-pink-900 cursor-pointer flex items-center gap-0.5"
                            >
                              <span>🐾</span>
                              <span>Open Pets</span>
                            </button>
                          ) : null}
                          {isInstalled ? (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                Installed
                              </span>
                              <button
                                onClick={() => handleUninstallExtension(ext)}
                                className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInstallExtension(ext)}
                              disabled={isCurrentlyInstalling}
                              className="px-2.5 py-0.5 text-[10px] font-medium rounded shrink-0 transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-1"
                            >
                              {isCurrentlyInstalling ? (
                                <>
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  <span>Installing...</span>
                                </>
                              ) : (
                                <span>Install</span>
                              )}
                            </button>
                          )}
                        </div>
                        {ext.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                            {ext.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50 font-mono">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {ext.rating ? ext.rating.toFixed(1) : '5.0'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-2.5 h-2.5" />
                            {ext.download_count > 1000000
                              ? `${(ext.download_count / 1000000).toFixed(1)}M`
                              : ext.download_count > 1000
                              ? `${(ext.download_count / 1000).toFixed(0)}k`
                              : ext.download_count}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab View 4: VS Code Pets */}
      {sidebarView === 'pets' && (
        <div id="view-pets" className="flex-1 overflow-hidden flex flex-col">
          <VsCodePetsPanel />
        </div>
      )}

      {/* Tab View 5: Source Control / Diffs */}
      {sidebarView === 'git' && (
        <div id="view-git" className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
          {/* Header & Branch Info */}
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold truncate max-w-[120px]">{gitBranch}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => refreshGit()}
                className="p-1 hover:text-slate-200 text-slate-400 rounded cursor-pointer transition-colors"
                title="Refresh Git Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161a26] text-emerald-400 font-bold">
                {gitFiles.length} change{gitFiles.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Commit Message Box */}
          <div className="space-y-1.5 bg-[#12151f] p-2.5 rounded-lg border border-slate-800">
            <textarea
              rows={2}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (gitFiles.length > 0) {
                    commitChanges(commitMessage);
                    setCommitMessage('');
                  }
                }
              }}
              placeholder="Commit message (⌘Enter to commit)..."
              className="w-full bg-[#090b10] border border-slate-800 rounded p-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  commitChanges(commitMessage);
                  setCommitMessage('');
                }}
                disabled={gitFiles.length === 0}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded font-medium text-xs flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed transition-all shadow-md"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Commit Changes</span>
              </button>
              <button
                onClick={() => stageFile()}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                title="Stage All Changes"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Staged Changes Section */}
          {stagedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Staged Changes ({stagedFiles.length})</span>
                </span>
                <button
                  onClick={() => unstageFile()}
                  className="p-1 hover:text-slate-200 text-slate-500 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Unstage All Changes"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1 font-mono text-xs">
                {stagedFiles.map((gf) => {
                  const isSelected = activeDiff?.file_path === gf.path;
                  const isAdded = gf.status === 'A';
                  const isDeleted = gf.status === 'D';
                  const statusBadge = isAdded ? 'A' : isDeleted ? 'D' : 'M';
                  const statusColor = isAdded
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                    : isDeleted
                    ? 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                    : 'text-amber-400 bg-amber-950/60 border-amber-500/30';

                  const fileName = gf.path.split('/').pop() || gf.path;
                  const dirPath = gf.path.includes('/')
                    ? gf.path.substring(0, gf.path.lastIndexOf('/'))
                    : '';

                  return (
                    <div
                      key={`staged-${gf.path}`}
                      onClick={() => openDiff(gf.path)}
                      className={`p-2 rounded border flex items-center justify-between cursor-pointer group transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                          : 'bg-[#161a26] hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      }`}
                      title={`Click to view diff for ${gf.path}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <span
                          className={`text-[10px] font-bold px-1 py-0.2 rounded border font-mono shrink-0 ${statusColor}`}
                        >
                          {statusBadge}
                        </span>
                        <div className="truncate flex items-baseline gap-1">
                          <span className="font-semibold text-slate-200 truncate">
                            {fileName}
                          </span>
                          {dirPath && (
                            <span className="text-[10px] text-slate-500 truncate">
                              {dirPath}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono shrink-0">
                          {gf.insertions > 0 && (
                            <span className="text-emerald-400 font-bold">+{gf.insertions} </span>
                          )}
                          {gf.deletions > 0 && (
                            <span className="text-rose-400 font-bold">-{gf.deletions}</span>
                          )}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              unstageFile(gf.path);
                            }}
                            className="p-1 hover:text-amber-400 text-slate-500 rounded cursor-pointer"
                            title="Unstage File"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unstaged Changes Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <span>Changes ({unstagedFiles.length})</span>
              {unstagedFiles.length > 0 && (
                <button
                  onClick={() => stageFile()}
                  className="p-1 hover:text-slate-200 text-slate-500 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Stage All Changes"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {gitFiles.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs bg-[#161a26]/40 rounded-lg border border-slate-800">
                Working tree clean. No changes detected.
              </div>
            ) : unstagedFiles.length === 0 ? (
              <div className="p-3 text-center text-emerald-400/80 text-[11px] bg-emerald-950/20 rounded border border-emerald-500/20">
                All changes staged for commit.
              </div>
            ) : (
              <div className="space-y-1 font-mono text-xs">
                {unstagedFiles.map((gf) => {
                  const isSelected = activeDiff?.file_path === gf.path;
                  const isUntracked = gf.status === '??' || gf.status === '?' || gf.is_untracked;
                  const isAdded = gf.status === 'A';
                  const isDeleted = gf.status === 'D';

                  const statusBadge = isUntracked ? 'U' : isAdded ? 'A' : isDeleted ? 'D' : 'M';
                  const statusColor = isUntracked || isAdded
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                    : isDeleted
                    ? 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                    : 'text-amber-400 bg-amber-950/60 border-amber-500/30';

                  const fileName = gf.path.split('/').pop() || gf.path;
                  const dirPath = gf.path.includes('/')
                    ? gf.path.substring(0, gf.path.lastIndexOf('/'))
                    : '';

                  return (
                    <div
                      key={`unstaged-${gf.path}`}
                      onClick={() => openDiff(gf.path)}
                      className={`p-2 rounded border flex items-center justify-between cursor-pointer group transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                          : 'bg-[#161a26] hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      }`}
                      title={`Click to view diff for ${gf.path}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <span
                          className={`text-[10px] font-bold px-1 py-0.2 rounded border font-mono shrink-0 ${statusColor}`}
                        >
                          {statusBadge}
                        </span>
                        <div className="truncate flex items-baseline gap-1">
                          <span className="font-semibold text-slate-200 truncate">
                            {fileName}
                          </span>
                          {dirPath && (
                            <span className="text-[10px] text-slate-500 truncate">
                              {dirPath}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono shrink-0">
                          {gf.insertions > 0 && (
                            <span className="text-emerald-400 font-bold">+{gf.insertions} </span>
                          )}
                          {gf.deletions > 0 && (
                            <span className="text-rose-400 font-bold">-{gf.deletions}</span>
                          )}
                        </span>

                        {/* Action buttons on hover */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              stageFile(gf.path);
                            }}
                            className="p-1 hover:text-emerald-400 text-slate-500 rounded cursor-pointer"
                            title="Stage File"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Discard all changes in ${gf.path}?`)) {
                                discardFile(gf.path);
                              }
                            }}
                            className="p-1 hover:text-rose-400 text-slate-500 rounded cursor-pointer"
                            title="Discard Changes"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Footer: Session Info */}
      <div className="p-2.5 bg-[#090b10] border-t border-[#1f2433] text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span className="truncate max-w-[140px] text-slate-400">Branch: {gitBranch}</span>
        <span className="text-emerald-400 shrink-0">● {activeProvider.toUpperCase()}</span>
      </div>
    </aside>
  );
};
