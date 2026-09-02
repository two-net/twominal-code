import React, { useEffect, useState } from 'react';
import { Search, Download, Star, Blocks, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ExtensionService } from '../../services/extensionService';
import { ExtensionItem } from '../../types/extensions';

export const ExtensionHub: React.FC = () => {
  const { setSidebarView } = useWorkspace();
  const [installedExtensions, setInstalledExtensions] = useState<ExtensionItem[]>([]);
  const [marketplaceExtensions, setMarketplaceExtensions] = useState<ExtensionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingInstalled, setLoadingInstalled] = useState(false);
  const [loadingMarketplace, setLoadingMarketplace] = useState(false);
  const [installedOpen, setInstalledOpen] = useState(true);
  const [marketplaceOpen, setMarketplaceOpen] = useState(true);
  const [installingIds, setInstallingIds] = useState<Set<string>>(new Set());
  const { setPreset } = useTheme();

  const loadInstalled = async () => {
    setLoadingInstalled(true);
    try {
      const items = await ExtensionService.getInstalled();
      setInstalledExtensions(items);
    } catch (e) {
      console.error('Failed to load installed extensions', e);
    } finally {
      setLoadingInstalled(false);
    }
  };

  const loadMarketplace = async (query = '') => {
    setLoadingMarketplace(true);
    try {
      const items = await ExtensionService.search(query);
      setMarketplaceExtensions(items);
    } catch (e) {
      console.error('Failed to load marketplace extensions', e);
    } finally {
      setLoadingMarketplace(false);
    }
  };

  const refreshAll = () => {
    loadInstalled();
    loadMarketplace(searchQuery);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMarketplace(searchQuery);
  };

  const handleApplyTheme = (ext: ExtensionItem) => {
    if (ext.name.includes('one-dark')) {
      setPreset('one-dark-pro');
    } else if (ext.name.includes('tokyo-night')) {
      setPreset('tokyo-night');
    } else if (ext.name.includes('catppuccin')) {
      setPreset('catppuccin-mocha');
    }
  };

  const handleInstallExtension = async (ext: ExtensionItem) => {
    setInstallingIds((prev) => new Set(prev).add(ext.id));
    try {
      const installed = await ExtensionService.install(ext.id, ext.download_url);
      setInstalledExtensions((prev) => [installed, ...prev.filter((i) => i.id.toLowerCase() !== installed.id.toLowerCase())]);
      if (ext.name.includes('one-dark')) setPreset('one-dark-pro');
      if (ext.name.includes('tokyo-night')) setPreset('tokyo-night');
      if (ext.name.includes('catppuccin')) setPreset('catppuccin-mocha');
    } catch (err) {
      console.error('Failed to install extension', err);
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
    } catch (err) {
      console.error('Failed to uninstall extension', err);
    }
  };

  const filteredInstalled = installedExtensions.filter((ext) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().replace(/^@installed\s*/, '').trim();
    if (!q) return true;
    return (
      ext.name.toLowerCase().includes(q) ||
      ext.display_name.toLowerCase().includes(q) ||
      ext.description.toLowerCase().includes(q) ||
      ext.namespace.toLowerCase().includes(q) ||
      ext.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#080b12] font-mono text-xs overflow-hidden">
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-800 bg-[#0a0e17]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-purple-400 font-bold uppercase tracking-wider">
            <Blocks className="w-3.5 h-3.5" />
            <span>Extensions Store</span>
          </div>
          <button
            onClick={refreshAll}
            title="Refresh Extensions"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loadingInstalled || loadingMarketplace ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions (or filter @installed)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
          />
        </form>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Section 1: INSTALLED */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
          <button
            onClick={() => setInstalledOpen(!installedOpen)}
            className="w-full flex items-center justify-between p-2 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 font-semibold cursor-pointer border-b border-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {installedOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wide">Installed</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
              {filteredInstalled.length}
            </span>
          </button>

          {installedOpen && (
            <div className="p-2 space-y-2">
              {loadingInstalled ? (
                <div className="p-3 text-center text-slate-500 text-[11px]">Loading installed extensions...</div>
              ) : filteredInstalled.length === 0 ? (
                <div className="p-3 text-center text-slate-500 text-[11px]">No installed extensions</div>
              ) : (
                filteredInstalled.map((ext) => (
                  <div
                    key={ext.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate flex-1">
                        <div className="font-bold text-slate-200 text-xs truncate flex items-center gap-1.5">
                          <span>{ext.display_name}</span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">v{ext.version}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">
                          {ext.namespace}.{ext.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {ext.name.toLowerCase().includes('pet') || ext.id.toLowerCase().includes('pet') ? (
                          <button
                            onClick={() => setSidebarView('pets')}
                            className="px-1.5 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/40 hover:bg-pink-900 text-[10px] cursor-pointer flex items-center gap-0.5"
                          >
                            <span>🐾</span>
                            <span>Open Pets</span>
                          </button>
                        ) : null}
                        {ext.categories?.includes('Themes') || ext.name.toLowerCase().includes('theme') ? (
                          <button
                            onClick={() => handleApplyTheme(ext)}
                            className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900 text-[10px] cursor-pointer"
                          >
                            Theme
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleUninstallExtension(ext)}
                          className="px-2 py-0.5 rounded font-semibold text-[10px] bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                        >
                          Uninstall
                        </button>
                      </div>
                    </div>
                    {ext.description && (
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                        {ext.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Section 2: MARKETPLACE */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
          <button
            onClick={() => setMarketplaceOpen(!marketplaceOpen)}
            className="w-full flex items-center justify-between p-2 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 font-semibold cursor-pointer border-b border-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {marketplaceOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wide">
                {searchQuery.trim() ? 'Marketplace Results' : 'Marketplace'}
              </span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-500/30 text-sky-300 font-mono text-[10px]">
              {marketplaceExtensions.length}
            </span>
          </button>

          {marketplaceOpen && (
            <div className="p-2 space-y-2">
              {loadingMarketplace ? (
                <div className="p-3 text-center text-slate-500 text-[11px]">Querying Marketplace...</div>
              ) : marketplaceExtensions.length === 0 ? (
                <div className="p-3 text-center text-slate-500 text-[11px]">No marketplace extensions found</div>
              ) : (
                marketplaceExtensions.map((ext) => {
                  const isInstalled = installedExtensions.some((i) => i.id.toLowerCase() === ext.id.toLowerCase());
                  const isCurrentlyInstalling = installingIds.has(ext.id);

                  return (
                    <div
                      key={ext.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate flex-1">
                          <div className="font-bold text-slate-200 text-xs truncate">
                            {ext.display_name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">
                            {ext.namespace} • v{ext.version}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400 text-[10px] shrink-0">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{ext.rating ? ext.rating.toFixed(1) : '5.0'}</span>
                        </div>
                      </div>

                      {ext.description && (
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                          {ext.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Download className="w-2.5 h-2.5" />
                          <span>
                            {ext.download_count > 1000000
                              ? `${(ext.download_count / 1000000).toFixed(1)}M`
                              : ext.download_count > 1000
                              ? `${(ext.download_count / 1000).toFixed(0)}k`
                              : ext.download_count}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {ext.name.toLowerCase().includes('pet') || ext.id.toLowerCase().includes('pet') ? (
                            <button
                              onClick={() => setSidebarView('pets')}
                              className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/40 hover:bg-pink-900 text-[10px] cursor-pointer flex items-center gap-0.5"
                            >
                              <span>🐾</span>
                              <span>Open Pets</span>
                            </button>
                          ) : null}
                          {ext.categories?.includes('Themes') && (
                            <button
                              onClick={() => handleApplyTheme(ext)}
                              className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900 text-[10px] cursor-pointer"
                            >
                              Apply Theme
                            </button>
                          )}
                          {isInstalled ? (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                                Installed
                              </span>
                              <button
                                onClick={() => handleUninstallExtension(ext)}
                                className="px-2 py-0.5 rounded font-semibold text-[10px] bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInstallExtension(ext)}
                              disabled={isCurrentlyInstalling}
                              className="px-2.5 py-0.5 rounded font-semibold text-[10px] cursor-pointer bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-1"
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
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

