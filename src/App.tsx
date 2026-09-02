import { useEffect, useState } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { ActivityBar } from './components/layout/ActivityBar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandPalette } from './components/layout/CommandPalette';
import { TabBar } from './components/editor/TabBar';
import { MonacoEditor } from './components/editor/MonacoEditor';
import { VimCommandLine } from './components/editor/VimCommandLine';
import { EditorPetCompanion } from './components/pets/EditorPetCompanion';
import { AgentPanel } from './components/agent/AgentPanel';
import { SplashScreen } from './components/splash/SplashScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToastNotification } from './components/ui/ToastNotification';
import { useWorkspace } from './context/WorkspaceContext';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    setCommandPaletteOpen,
    saveActiveFile,
    activeTab,
    closeTab,
    setSidebarView,
    toggleAiPanel,
    toggleSidebar,
  } = useWorkspace();

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true, !e.shiftKey);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveActiveFile();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTab) closeTab(activeTab.id);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleAiPanel();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSidebarView('krypton');
      } else if (e.key === 'Escape' && showSplash) {
        setShowSplash(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, showSplash]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090d] text-slate-100 overflow-hidden font-sans relative">
      {/* Animated Splash Screen */}
      {showSplash && <SplashScreen onEnterEditor={() => setShowSplash(false)} />}

      {/* Title Bar */}
      <TitleBar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Workspace Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Activity Bar */}
        <ActivityBar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Collapsible Left Sidebar */}
        <Sidebar />

        {/* Center Monaco Editor Viewport */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0f121a] relative overflow-hidden">
          <TabBar />
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <MonacoEditor />
            <VimCommandLine />
          </div>
          <EditorPetCompanion />
        </main>

        {/* Right Docked ACP AI Co-pilot Hub */}
        <AgentPanel />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Command Palette Modal */}
      <CommandPalette />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Floating Toast Notification */}
      <ToastNotification />
    </div>
  );
}

export default App;

