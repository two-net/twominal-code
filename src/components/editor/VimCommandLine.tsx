import React, { useRef, useEffect } from 'react';
import { useVim } from '../../context/VimContext';
import { useTheme } from '../../context/ThemeContext';
import { useAgent } from '../../context/AgentContext';
import { AcpProviderId } from '../../types/acp';

export const VimCommandLine: React.FC = () => {
  const { state, setCommandBuffer, executeCommand, setMode, focusEditor } = useVim();
  const { cycleSolarMode } = useTheme();
  const { setProvider } = useAgent();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when transitioning to COMMAND mode
  useEffect(() => {
    if (state.mode === 'COMMAND') {
      inputRef.current?.focus();
      // Ensure cursor is placed at end of buffer
      const len = inputRef.current?.value.length ?? 0;
      inputRef.current?.setSelectionRange(len, len);
    }
  }, [state.mode]);

  // Global window escape handler while in COMMAND mode
  useEffect(() => {
    if (state.mode !== 'COMMAND') return;

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        setCommandBuffer('');
        setMode('NORMAL');
        inputRef.current?.blur();
        focusEditor();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [state.mode, focusEditor, setCommandBuffer, setMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(state.commandBuffer, (action, arg) => {
        if (action === 'theme') {
          cycleSolarMode();
        } else if (action === 'acp' && arg) {
          setProvider(arg as AcpProviderId);
        }
      });
      setCommandBuffer('');
      inputRef.current?.blur();
      focusEditor();
    } else if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      e.stopPropagation();
      setCommandBuffer('');
      setMode('NORMAL');
      inputRef.current?.blur();
      focusEditor();
    }
  };

  return (
    <div
      id="vim-command-bar"
      className="h-7 bg-[#0a0c12] border-t border-[#1f2433] px-3 flex items-center justify-between text-xs font-mono select-none z-10"
    >
      <div className="flex items-center flex-1 mr-4">
        <input
          ref={inputRef}
          type="text"
          value={state.commandBuffer}
          onChange={(e) => setCommandBuffer(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (state.mode !== 'COMMAND') {
              setMode('COMMAND');
            }
            if (!state.commandBuffer) {
              setCommandBuffer(':');
            }
          }}
          onBlur={() => {
            if (state.mode === 'COMMAND' && (!state.commandBuffer || state.commandBuffer === ':' || state.commandBuffer === '/')) {
              setCommandBuffer('');
              setMode('NORMAL');
            }
          }}
          placeholder="Type Vim command (e.g. :w, :theme, :acp claude, :help)..."
          className="bg-transparent border-none text-slate-200 focus:outline-none w-full text-xs font-mono placeholder:text-slate-600"
        />
      </div>

      <div className="text-[11px] text-slate-500 shrink-0">
        Press <kbd className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded text-[10px]">i</kbd> to Insert,{' '}
        <kbd className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded text-[10px]">Esc</kbd> for Normal
      </div>
    </div>
  );
};
