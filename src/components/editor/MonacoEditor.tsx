import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import {
  Columns,
  Rows,
  Check,
  X,
  RotateCcw,
  Plus,
  Minus,
  FileCode,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useVim } from '../../context/VimContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAgent } from '../../context/AgentContext';
import { VimMode } from '../../types/workspace';
import { VsCodePetsWebview } from '../pets/VsCodePetsWebview';
import { usePets } from '../../context/PetsContext';

function detectLanguage(filePath: string): string {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'typescript';
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'javascript';
  if (filePath.endsWith('.rs')) return 'rust';
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.css')) return 'css';
  if (filePath.endsWith('.html')) return 'html';
  if (filePath.endsWith('.md')) return 'markdown';
  if (filePath.endsWith('.toml')) return 'ini';
  return 'plaintext';
}

export const MonacoEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const diffContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const splitEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  const {
    activeTab,
    updateActiveContent,
    saveActiveFile,
    closeTab,
    isSplitEditor,
    activeDiff: workspaceDiff,
    closeDiff,
    diffViewMode,
    setDiffViewMode,
    gitFiles,
    stageFile,
    unstageFile,
    discardFile,
    openFile,
    openPetCodingTab,
    showToast,
  } = useWorkspace();
  const { theme, throwBall } = usePets();
  const { isEffectiveDark, ligatures, fontSize, fontFamily } = useTheme();
  const {
    activeProvider,
    activeDiff: agentDiff,
    setActiveDiff: setAgentDiff,
    approveCheckpoint,
    rejectCheckpoint,
  } = useAgent();
  const {
    state: vimState,
    vimEnabled,
    setMode: setVimMode,
    setCommandBuffer,
    registerSaveHandler,
    registerCloseTabHandler,
    registerSubstituteHandler,
    registerSearchHandler,
    registerFocusEditorHandler,
  } = useVim();

  const vimModeRef = useRef<VimMode>(vimState.mode);
  vimModeRef.current = vimState.mode;
  const vimEnabledRef = useRef<boolean>(vimEnabled);
  vimEnabledRef.current = vimEnabled;
  const pendingKeyRef = useRef<{ key: string; time: number } | null>(null);
  const clipboardLineRef = useRef<string>('');

  const currentDiff = workspaceDiff
    ? {
        file_path: workspaceDiff.file_path,
        old_content: workspaceDiff.old_content,
        new_content: workspaceDiff.new_content,
        status: workspaceDiff.status,
        diff_patch: workspaceDiff.diff_patch,
        isAgent: false,
      }
    : agentDiff
    ? {
        file_path: agentDiff.file_path,
        old_content: agentDiff.old_content,
        new_content: agentDiff.new_content,
        status: 'M',
        diff_patch: agentDiff.patch || '',
        isAgent: true,
      }
    : null;

  // Register Vim save, close tab, substitute, and search handlers
  useEffect(() => {
    registerSaveHandler(() => saveActiveFile());
    if (activeTab) {
      registerCloseTabHandler(() => closeTab(activeTab.id));
    }
    registerSubstituteHandler((findStr, replaceStr, flags) => {
      if (!editorRef.current) return 0;
      const model = editorRef.current.getModel();
      if (!model || !findStr) return 0;
      const text = model.getValue();
      try {
        const regex = new RegExp(findStr, flags || 'g');
        const matches = text.match(regex);
        const count = matches ? matches.length : 0;
        if (count > 0) {
          const newText = text.replace(regex, replaceStr);
          editorRef.current.setValue(newText);
          updateActiveContent(newText);
        }
        return count;
      } catch (e) {
        console.error('Regex error', e);
        return 0;
      }
    });

    registerSearchHandler((query, reverse) => {
      if (!editorRef.current) return;
      const model = editorRef.current.getModel();
      if (!model || !query) return;
      const matches = model.findMatches(query, false, false, false, null, true);
      if (matches && matches.length > 0) {
        const pos = editorRef.current.getPosition() || new monaco.Position(1, 1);
        const targetMatch = reverse
          ? [...matches].reverse().find(
              (m) =>
                m.range.startLineNumber < pos.lineNumber ||
                (m.range.startLineNumber === pos.lineNumber && m.range.startColumn < pos.column)
            ) || matches[matches.length - 1]
          : matches.find(
              (m) =>
                m.range.startLineNumber > pos.lineNumber ||
                (m.range.startLineNumber === pos.lineNumber && m.range.startColumn > pos.column)
            ) || matches[0];

        if (targetMatch) {
          editorRef.current.setSelection(targetMatch.range);
          editorRef.current.revealRangeInCenter(targetMatch.range);
        }
      }
    });

    registerFocusEditorHandler(() => {
      editorRef.current?.focus();
    });
  }, [activeTab]);

  // Update cursor style according to Vim mode
  useEffect(() => {
    if (editorRef.current && vimEnabled) {
      editorRef.current.updateOptions({
        cursorStyle: vimState.mode === 'INSERT' ? 'line' : 'block',
      });
    }
  }, [vimState.mode, vimEnabled]);

  // Define Themes
  useEffect(() => {
    monaco.editor.defineTheme('twominal-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '717b99', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'e2e8f0' },
        { token: 'string', foreground: '6ee7b7' },
        { token: 'number', foreground: 'fde047' },
        { token: 'type', foreground: '7dd3fc' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'delimiter', foreground: '94a3b8' },
      ],
      colors: {
        'editor.background': '#0f121a',
        'editor.foreground': '#e2e8f0',
        'editorCursor.foreground': '#fbbf24',
        'editor.lineHighlightBackground': '#161a26',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818cf8',
        'editor.selectionBackground': '#6366f133',
        'editor.inactiveSelectionBackground': '#6366f11a',
        'editorGutter.background': '#0c0e15',
        'diffEditor.insertedLineBackground': '#10b98125',
        'diffEditor.insertedTextBackground': '#10b98155',
        'diffEditor.removedLineBackground': '#ef444425',
        'diffEditor.removedTextBackground': '#ef444455',
        'diffEditorGutter.insertedLineGutterBackground': '#10b98140',
        'diffEditorGutter.removedLineGutterBackground': '#ef444440',
        'diffEditorOverview.insertedForeground': '#10b981',
        'diffEditorOverview.removedForeground': '#ef4444',
        'diffEditor.diagonalFill': '#1e293b66',
        'diffEditor.border': '#334155',
      },
    });

    monaco.editor.defineTheme('twominal-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: '6366f1', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'd97706' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editorCursor.foreground': '#6366f1',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#94a3b8',
        'editorGutter.background': '#f1f5f9',
        'diffEditor.insertedLineBackground': '#10b98120',
        'diffEditor.insertedTextBackground': '#10b98140',
        'diffEditor.removedLineBackground': '#ef444420',
        'diffEditor.removedTextBackground': '#ef444440',
        'diffEditorGutter.insertedLineGutterBackground': '#10b98130',
        'diffEditorGutter.removedLineGutterBackground': '#ef444430',
        'diffEditorOverview.insertedForeground': '#10b981',
        'diffEditorOverview.removedForeground': '#ef4444',
        'diffEditor.diagonalFill': '#cbd5e166',
      },
    });
  }, []);

  // Initialize Primary Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: activeTab?.content || '// Twominal Code Ready.\n// Press i for Insert mode, : for Vim commands.',
      language: activeTab?.language || 'rust',
      theme: isEffectiveDark ? 'twominal-dark' : 'twominal-light',
      fontSize,
      fontFamily,
      fontLigatures: ligatures,
      cursorStyle: vimState.mode === 'INSERT' ? 'line' : 'block',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      minimap: { enabled: true, renderCharacters: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      tabSize: 2,
    });

    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const val = editor.getValue();
      updateActiveContent(val);
    });

    editor.onMouseDown(() => {
      if (vimModeRef.current === 'COMMAND') {
        setCommandBuffer('');
        setVimMode('NORMAL');
      }
    });

    // Vim Keybindings Router
    editor.onKeyDown((e) => {
      if (!vimEnabledRef.current) return;
      const mode = vimModeRef.current;
      const key = e.browserEvent.key;
      const now = Date.now();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (mode === 'NORMAL') {
        if (isCtrlOrCmd) {
          if (key === 'r') {
            e.preventDefault();
            e.stopPropagation();
            editor.trigger('vim', 'redo', null);
          }
          return;
        }

        const prev = pendingKeyRef.current;
        pendingKeyRef.current = null;

        if (prev && now - prev.time < 800) {
          if (prev.key === 'g' && key === 'g') {
            e.preventDefault();
            e.stopPropagation();
            editor.setPosition({ lineNumber: 1, column: 1 });
            editor.revealPositionInCenter({ lineNumber: 1, column: 1 });
            return;
          }
          if (prev.key === 'd' && key === 'd') {
            e.preventDefault();
            e.stopPropagation();
            editor.trigger('vim', 'editor.action.deleteLines', null);
            return;
          }
          if (prev.key === 'y' && key === 'y') {
            e.preventDefault();
            e.stopPropagation();
            const pos = editor.getPosition();
            if (pos) {
              const line = editor.getModel()?.getLineContent(pos.lineNumber) || '';
              clipboardLineRef.current = line;
              navigator.clipboard?.writeText(line).catch(() => {});
            }
            return;
          }
        }

        if (key === 'g' || key === 'd' || key === 'y') {
          e.preventDefault();
          e.stopPropagation();
          pendingKeyRef.current = { key, time: now };
          return;
        }

        if (key === 'h' || key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorLeft', null);
        } else if (key === 'j' || key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorDown', null);
        } else if (key === 'k' || key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorUp', null);
        } else if (key === 'l' || key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorRight', null);
        } else if (key === 'w') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorWordStartRight', null);
        } else if (key === 'b') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorWordStartLeft', null);
        } else if (key === '0') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorLineStart', null);
        } else if (key === '$') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorLineEnd', null);
        } else if (key === 'G') {
          e.preventDefault();
          e.stopPropagation();
          const count = editor.getModel()?.getLineCount() || 1;
          editor.setPosition({ lineNumber: count, column: 1 });
          editor.revealPositionInCenter({ lineNumber: count, column: 1 });
        } else if (key === 'x') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'deleteRight', null);
        } else if (key === 'p') {
          e.preventDefault();
          e.stopPropagation();
          const pos = editor.getPosition();
          if (pos && clipboardLineRef.current) {
            editor.executeEdits('vim-paste', [
              {
                range: new monaco.Range(pos.lineNumber + 1, 1, pos.lineNumber + 1, 1),
                text: clipboardLineRef.current + '\n',
              },
            ]);
          }
        } else if (key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'undo', null);
        } else if (key === 'i') {
          e.preventDefault();
          e.stopPropagation();
          setVimMode('INSERT');
        } else if (key === 'I') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorLineStart', null);
          setVimMode('INSERT');
        } else if (key === 'a') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorRight', null);
          setVimMode('INSERT');
        } else if (key === 'A') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'cursorLineEnd', null);
          setVimMode('INSERT');
        } else if (key === 'o') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'editor.action.insertLineAfter', null);
          setVimMode('INSERT');
        } else if (key === 'O') {
          e.preventDefault();
          e.stopPropagation();
          editor.trigger('vim', 'editor.action.insertLineBefore', null);
          setVimMode('INSERT');
        } else if (key === ':') {
          e.preventDefault();
          e.stopPropagation();
          setVimMode('COMMAND');
          setCommandBuffer(':');
          const input = document.querySelector<HTMLInputElement>('#vim-command-bar input');
          input?.focus();
        } else if (key === '/') {
          e.preventDefault();
          e.stopPropagation();
          setVimMode('COMMAND');
          setCommandBuffer('/');
          const input = document.querySelector<HTMLInputElement>('#vim-command-bar input');
          input?.focus();
        } else if (key === 'v') {
          e.preventDefault();
          e.stopPropagation();
          setVimMode('VISUAL');
        } else if (key.length === 1 && !key.startsWith('F')) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else if (mode === 'INSERT' || mode === 'VISUAL' || mode === 'VISUAL_LINE') {
        if (key === 'Escape' || key === 'Esc') {
          e.preventDefault();
          e.stopPropagation();
          setVimMode('NORMAL');
        }
      } else if (mode === 'COMMAND') {
        if (key === 'Escape' || key === 'Esc') {
          e.preventDefault();
          e.stopPropagation();
          setCommandBuffer('');
          setVimMode('NORMAL');
        } else if (!isCtrlOrCmd) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });

    return () => {
      editor.dispose();
    };
  }, []);

  // Initialize and Update Monaco Diff Editor when a real diff is active
  useEffect(() => {
    if (!currentDiff || !diffContainerRef.current) {
      if (diffEditorRef.current) {
        diffEditorRef.current.dispose();
        diffEditorRef.current = null;
      }
      return;
    }

    if (!diffEditorRef.current) {
      const diffEditor = monaco.editor.createDiffEditor(diffContainerRef.current, {
        fontSize,
        fontFamily,
        fontLigatures: ligatures,
        automaticLayout: true,
        renderSideBySide: diffViewMode === 'side-by-side',
        enableSplitViewResizing: true,
        scrollBeyondLastLine: false,
        readOnly: false,
        originalEditable: false,
        renderIndicators: true,
        diffAlgorithm: 'advanced',
        ignoreTrimWhitespace: false,
        useInlineViewWhenSpaceIsLimited: false,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        smoothScrolling: true,
      });
      diffEditorRef.current = diffEditor;
    }

    const lang = detectLanguage(currentDiff.file_path);
    const origUri = monaco.Uri.parse(`twominal-diff://original/${currentDiff.file_path}`);
    const modUri = monaco.Uri.parse(`twominal-diff://modified/${currentDiff.file_path}`);

    const existingOrig = monaco.editor.getModel(origUri);
    if (existingOrig) existingOrig.dispose();
    const existingMod = monaco.editor.getModel(modUri);
    if (existingMod) existingMod.dispose();

    const origModel = monaco.editor.createModel(currentDiff.old_content || '', lang, origUri);
    const modModel = monaco.editor.createModel(currentDiff.new_content || '', lang, modUri);

    diffEditorRef.current.setModel({
      original: origModel,
      modified: modModel,
    });

    const timer = setTimeout(() => {
      diffEditorRef.current?.layout();
    }, 50);

    const sub = modModel.onDidChangeContent(() => {
      const val = modModel.getValue();
      updateActiveContent(val);
    });

    return () => {
      clearTimeout(timer);
      sub.dispose();
      if (diffEditorRef.current) {
        diffEditorRef.current.setModel(null);
      }
      origModel.dispose();
      modModel.dispose();
    };
  }, [currentDiff?.file_path, currentDiff?.old_content, currentDiff?.new_content]);

  // Update Diff View Mode options
  useEffect(() => {
    if (diffEditorRef.current) {
      diffEditorRef.current.updateOptions({
        renderSideBySide: diffViewMode === 'side-by-side',
        fontSize,
        fontFamily,
        fontLigatures: ligatures,
        enableSplitViewResizing: true,
        useInlineViewWhenSpaceIsLimited: false,
      });
      diffEditorRef.current.layout();
    }
  }, [diffViewMode, fontSize, fontFamily, ligatures]);

  // Initialize Secondary Monaco Editor for Split Mode
  useEffect(() => {
    if (!isSplitEditor || !splitContainerRef.current) {
      if (splitEditorRef.current) {
        splitEditorRef.current.dispose();
        splitEditorRef.current = null;
      }
      return;
    }

    const splitEditor = monaco.editor.create(splitContainerRef.current, {
      value: '# Secondary Buffer (Split Mode)\n// Realtime synchronized inspector\n',
      language: 'markdown',
      theme: isEffectiveDark ? 'twominal-dark' : 'twominal-light',
      fontSize,
      fontFamily,
      fontLigatures: ligatures,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });

    splitEditorRef.current = splitEditor;

    return () => {
      splitEditor.dispose();
      splitEditorRef.current = null;
    };
  }, [isSplitEditor]);

  // Update theme dynamically
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(isEffectiveDark ? 'twominal-dark' : 'twominal-light');
    }
    if (splitEditorRef.current) {
      monaco.editor.setTheme(isEffectiveDark ? 'twominal-dark' : 'twominal-light');
    }
    if (diffEditorRef.current) {
      monaco.editor.setTheme(isEffectiveDark ? 'twominal-dark' : 'twominal-light');
    }
  }, [isEffectiveDark]);

  // Update editor value & language when active tab changes
  useEffect(() => {
    if (!editorRef.current) return;
    const currentModel = editorRef.current.getModel();
    if (!activeTab) {
      if (editorRef.current.getValue() !== '') {
        editorRef.current.setValue('');
      }
      return;
    }
    if (currentModel) {
      if (editorRef.current.getValue() !== activeTab.content) {
        editorRef.current.setValue(activeTab.content);
      }
      monaco.editor.setModelLanguage(currentModel, activeTab.language);
    }
  }, [activeTab?.id, activeTab?.content, activeTab]);

  // Update typography
  useEffect(() => {
    const opts = { fontSize, fontFamily, fontLigatures: ligatures };
    if (editorRef.current) editorRef.current.updateOptions(opts);
    if (splitEditorRef.current) splitEditorRef.current.updateOptions(opts);
  }, [fontSize, fontFamily, ligatures]);

  const handleAcceptAgentDiff = async () => {
    if (agentDiff) {
      if (editorRef.current) {
        const currentVal = editorRef.current.getValue();
        const updated = currentVal.replace(agentDiff.old_content, agentDiff.new_content);
        editorRef.current.setValue(updated);
        updateActiveContent(updated);
      }
      await approveCheckpoint();
      setAgentDiff(null);
      showToast('ACP Agent Diff Accepted & Applied');
    }
  };

  const handleRejectAgentDiff = async () => {
    if (agentDiff) {
      await rejectCheckpoint('User declined diff review');
      setAgentDiff(null);
      showToast('ACP Agent Diff Rejected');
    }
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-[#0f121a] flex">
      {/* Primary Editor Buffer */}
      <div className="flex-1 h-full relative overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />

        {/* Empty Workspace Overlay when all tabs are closed and no diff is active */}
        {!activeTab && !currentDiff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f121a] text-slate-500 z-10 select-none">
            <div className="text-4xl mb-3 opacity-30 font-display">⧉</div>
            <div className="text-sm font-semibold text-slate-400 mb-4 tracking-wide font-display">
              Twominal Code
            </div>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-0.5 bg-[#161a26] border border-slate-700 rounded text-slate-300 min-w-[100px] text-center text-[11px]">
                  ⌘P / Ctrl+P
                </kbd>
                <span className="text-slate-400">Quick Open File</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-0.5 bg-[#161a26] border border-slate-700 rounded text-slate-300 min-w-[100px] text-center text-[11px]">
                  ⌘B / Ctrl+B
                </kbd>
                <span className="text-slate-400">Toggle Explorer</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-0.5 bg-[#161a26] border border-slate-700 rounded text-slate-300 min-w-[100px] text-center text-[11px]">
                  ⌘I / Ctrl+I
                </kbd>
                <span className="text-slate-400">Toggle AI Assistant</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={openPetCodingTab}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 text-xs font-mono cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-sm">🐾</span>
                  <span>Open Pet Coding Arena (vscode-pets)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Viewport Pet Coding Arena (vscode-pets Webview) */}
        {activeTab?.path === 'pet-coding' && (
          <div className="absolute inset-0 bg-[#0a0c14] flex flex-col z-20 overflow-hidden">
            <div className="h-9 px-4 bg-[#0d101a] border-b border-[#1f2438] flex items-center justify-between text-xs font-mono select-none shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">🐾</span>
                <span className="font-bold text-slate-200">Pet Coding (vscode-pets Native Runtime)</span>
                <span className="text-[10px] text-pink-400 bg-pink-950/60 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => throwBall(15, 30, 5, -5)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161a28] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs cursor-pointer transition-colors"
                >
                  <span>🎾</span>
                  <span>Throw Ball</span>
                </button>
                <button
                  onClick={() => closeTab(activeTab.id)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Close Tab"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 relative w-full h-full overflow-hidden bg-slate-950">
              <VsCodePetsWebview theme={theme} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Real Monaco Native Diff Editor Viewport (Git & Agent Diffs) */}
        {currentDiff && (
          <div className="absolute inset-0 bg-[#0f121a] flex flex-col z-30 overflow-hidden">
            {/* Diff Header Bar */}
            <div className="h-10 px-4 bg-[#0d1017] border-b border-[#1f2433] flex items-center justify-between text-xs font-mono select-none z-10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    currentDiff.isAgent
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {currentDiff.isAgent
                    ? `ACP Diff (${activeProvider.toUpperCase()})`
                    : 'Git Diff (HEAD ↔ Working Tree)'}
                </span>
                <span className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{currentDiff.file_path}</span>
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Diff Navigation Controls */}
                <div className="flex items-center gap-1 border-r border-slate-700/60 pr-2 mr-1">
                  <button
                    onClick={() => diffEditorRef.current?.goToDiff('previous')}
                    className="p-1 rounded bg-[#161a26] hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs cursor-pointer transition-colors"
                    title="Previous Difference"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => diffEditorRef.current?.goToDiff('next')}
                    className="p-1 rounded bg-[#161a26] hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs cursor-pointer transition-colors"
                    title="Next Difference"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Side-by-Side vs Inline Toggle */}
                <button
                  onClick={() =>
                    setDiffViewMode(diffViewMode === 'side-by-side' ? 'inline' : 'side-by-side')
                  }
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161a26] hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] cursor-pointer transition-colors"
                  title="Toggle Side-by-Side / Inline Diff Mode"
                >
                  {diffViewMode === 'side-by-side' ? (
                    <>
                      <Columns className="w-3 h-3 text-sky-400" />
                      <span>Side-by-Side</span>
                    </>
                  ) : (
                    <>
                      <Rows className="w-3 h-3 text-sky-400" />
                      <span>Inline</span>
                    </>
                  )}
                </button>

                {currentDiff.isAgent ? (
                  <>
                    <button
                      onClick={handleAcceptAgentDiff}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Apply</span>
                    </button>
                    <button
                      onClick={handleRejectAgentDiff}
                      className="flex items-center gap-1 px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-xs cursor-pointer transition-colors border border-rose-500/30"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <>
                    {gitFiles.some((gf) => gf.path === currentDiff.file_path && gf.is_staged) ? (
                      <button
                        onClick={() => unstageFile(currentDiff.file_path)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 rounded text-xs font-medium cursor-pointer transition-colors"
                        title="Unstage this file"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Unstage</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => stageFile(currentDiff.file_path)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium cursor-pointer transition-colors"
                        title="Stage this file"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Stage</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Discard all changes in ${currentDiff.file_path}?`)) {
                          discardFile(currentDiff.file_path);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded text-xs cursor-pointer transition-colors"
                      title="Discard changes in file"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                    <button
                      onClick={() => {
                        openFile(currentDiff.file_path);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#161a26] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs cursor-pointer transition-colors"
                      title="Open file in standard editor"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Edit File</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    closeDiff();
                    if (currentDiff.isAgent) setAgentDiff(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer transition-colors ml-1"
                  title="Close Diff View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monaco Native Diff Editor Viewport */}
            <div className="flex-1 w-full h-full min-h-0 relative">
              <div ref={diffContainerRef} className="absolute inset-0 w-full h-full" />
            </div>
          </div>
        )}
      </div>

      {/* Optional Split Editor Buffer */}
      {isSplitEditor && !currentDiff && (
        <div className="flex-1 h-full border-l border-[#1f2433] relative overflow-hidden bg-[#0d1017]">
          <div ref={splitContainerRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
};
