import React from 'react';
import { X, Code2, FileText, Columns, GitCompare } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TabBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    openFile,
    closeTab,
    toggleSplitEditor,
    toggleDiffOverlay,
    activeDiff,
    closeDiff,
  } = useWorkspace();

  return (
    <div className="h-9 bg-[#0b0d13] border-b border-[#1f2433] flex items-center justify-between px-2 overflow-x-auto text-xs font-mono select-none z-10">
      <div className="flex items-center gap-1" id="editor-tabs-container">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId && !activeDiff;
          const isDoc = tab.title.endsWith('.md') || tab.path.endsWith('.md');
          return (
            <div
              key={tab.id}
              onClick={() => openFile(tab.path)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#0f121a] text-slate-100 border-t-2 border-indigo-500 border-r border-[#1f2433]'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-[#161a26] border-r border-transparent'
              }`}
            >
              {isDoc ? (
                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : (
                <Code2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              )}
              <span className="truncate max-w-[140px]">{tab.title}</span>

              {tab.isDirty && <span className="text-[10px] text-amber-400">●</span>}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="p-0.5 hover:text-red-400 ml-1 rounded cursor-pointer"
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {activeDiff && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer transition-all bg-[#0f121a] text-indigo-300 border-t-2 border-emerald-500 border-r border-[#1f2433]"
            title={`Diff: ${activeDiff.file_path}`}
          >
            <GitCompare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[180px] font-semibold">
              Diff: {activeDiff.file_path.split('/').pop() || activeDiff.file_path}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeDiff();
              }}
              className="p-0.5 hover:text-red-400 ml-1 rounded cursor-pointer"
              title="Close Diff View"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-400 text-xs shrink-0">
        {/* Split editor */}
        <button
          onClick={toggleSplitEditor}
          className="p-1 hover:text-white cursor-pointer transition-colors"
          title="Split Editor (Cmd+\)"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>
        {/* Diff Toggle */}
        <button
          onClick={toggleDiffOverlay}
          className={`p-1 cursor-pointer transition-colors ${
            activeDiff ? 'text-emerald-400 bg-emerald-950/40 rounded' : 'hover:text-emerald-400'
          }`}
          title="Toggle Git Diff"
        >
          <GitCompare className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
