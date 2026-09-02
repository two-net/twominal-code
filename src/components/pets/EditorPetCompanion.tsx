import React, { useRef } from 'react';
import { usePets } from '../../context/PetsContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { VsCodePetsWebview, VsCodePetsRef } from './VsCodePetsWebview';
import { X, SlidersHorizontal, ExternalLink } from 'lucide-react';

export const EditorPetCompanion: React.FC = () => {
  const {
    showEditorCompanion,
    toggleEditorCompanion,
    throwBall,
    pets,
    theme,
  } = usePets();
  const { setSidebarView, openPetCodingTab } = useWorkspace();
  const webviewRef = useRef<VsCodePetsRef>(null);

  if (!showEditorCompanion || pets.length === 0) {
    return null;
  }

  const handleThrow = () => {
    webviewRef.current?.throwBall();
    throwBall(15, 20, 4, -4);
  };

  const activeTheme =
    theme === 'matrix' ||
    theme === 'cyberpunk' ||
    theme === 'sunset' ||
    theme === 'space'
      ? 'castle'
      : theme;

  return (
    <div className="relative w-full bg-[#08090f] border-t border-b border-[#1f2433] z-20 flex flex-col select-none">
      {/* Mini Controls Bar Header */}
      <div className="h-5 px-2 bg-[#0c0e17] flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-900/60">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🐾</span>
          <span className="font-bold text-slate-300">vscode-pets Companion</span>
          <span className="text-slate-500">
            ({pets.map((p) => p.name).join(', ')})
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleThrow}
            className="hover:text-pink-400 flex items-center gap-0.5 cursor-pointer text-[10px]"
            title="Throw Ball"
          >
            <span>🎾</span>
            <span className="hidden sm:inline">Ball</span>
          </button>

          <button
            onClick={openPetCodingTab}
            className="hover:text-amber-400 flex items-center gap-1 cursor-pointer text-[10px]"
            title="Open Full Viewport in Editor Tab"
          >
            <ExternalLink className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">Full Tab</span>
          </button>

          <button
            onClick={() => setSidebarView('pets')}
            className="hover:text-indigo-400 flex items-center gap-0.5 cursor-pointer text-[10px]"
            title="Configure Pets in Sidebar"
          >
            <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <button
            onClick={toggleEditorCompanion}
            className="hover:text-rose-400 cursor-pointer p-0.5"
            title="Hide Companion Bar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Roaming Webview Engine Viewport */}
      <div className="w-full h-16 relative overflow-hidden bg-[#06080e]">
        <VsCodePetsWebview
          ref={webviewRef}
          theme={activeTheme}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
