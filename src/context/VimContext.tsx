import React, { createContext, useContext, useState } from 'react';
import { VimMode, VimState } from '../types/workspace';

interface VimContextType {
  state: VimState;
  vimEnabled: boolean;
  setMode: (mode: VimMode) => void;
  toggleVimEnabled: () => void;
  setCommandBuffer: (buffer: string) => void;
  setSearchBuffer: (buffer: string) => void;
  setStatusMessage: (msg: string) => void;
  executeCommand: (cmd: string, onSpecialAction?: (action: string, arg?: string) => void) => void;
  registerSaveHandler: (fn: () => void) => void;
  registerCloseTabHandler: (fn: () => void) => void;
  registerSubstituteHandler: (fn: (find: string, replace: string, flags: string) => number) => void;
  registerSearchHandler: (fn: (query: string, reverse?: boolean) => void) => void;
  registerFocusEditorHandler: (fn: () => void) => void;
  focusEditor: () => void;
}

const VimContext = createContext<VimContextType | undefined>(undefined);

export const VimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vimEnabled, setVimEnabled] = useState<boolean>(true);
  const [state, setState] = useState<VimState>({
    mode: 'NORMAL',
    commandBuffer: '',
    searchBuffer: '',
    lastCommand: '',
    statusMessage: 'Twominal Vim Core Active. Press : for commands or i to insert.',
  });

  const [saveHandler, setSaveHandler] = useState<(() => void) | null>(null);
  const [closeTabHandler, setCloseTabHandler] = useState<(() => void) | null>(null);
  const [substituteHandler, setSubstituteHandler] = useState<((find: string, replace: string, flags: string) => number) | null>(null);
  const [searchHandler, setSearchHandler] = useState<((query: string, reverse?: boolean) => void) | null>(null);
  const [focusEditorHandler, setFocusEditorHandler] = useState<(() => void) | null>(null);

  const focusEditor = () => {
    if (focusEditorHandler) {
      focusEditorHandler();
    }
  };

  const toggleVimEnabled = () => {
    setVimEnabled((prev) => !prev);
  };

  const setMode = (mode: VimMode) => {
    setState((prev) => ({ ...prev, mode, statusMessage: `-- ${mode} --` }));
  };

  const setCommandBuffer = (commandBuffer: string) => {
    setState((prev) => ({ ...prev, commandBuffer }));
  };

  const setSearchBuffer = (searchBuffer: string) => {
    setState((prev) => ({ ...prev, searchBuffer }));
  };

  const setStatusMessage = (statusMessage: string) => {
    setState((prev) => ({ ...prev, statusMessage }));
  };

  const executeCommand = (
    cmd: string,
    onSpecialAction?: (action: string, arg?: string) => void
  ) => {
    const trimmed = cmd.trim();
    setState((prev) => ({
      ...prev,
      lastCommand: trimmed,
      commandBuffer: '',
      mode: 'NORMAL',
    }));

    if (trimmed === ':w' || trimmed === ':write') {
      if (saveHandler) {
        saveHandler();
        setStatusMessage('File saved successfully.');
      }
    } else if (trimmed === ':q' || trimmed === ':quit' || trimmed === ':q!') {
      if (closeTabHandler) {
        closeTabHandler();
        setStatusMessage('Buffer closed.');
      }
    } else if (trimmed === ':wq' || trimmed === ':x') {
      if (saveHandler) saveHandler();
      if (closeTabHandler) closeTabHandler();
      setStatusMessage('Buffer saved and closed.');
    } else if (trimmed.startsWith(':theme')) {
      if (onSpecialAction) onSpecialAction('theme');
      setStatusMessage('Theme toggled.');
    } else if (trimmed.startsWith(':acp')) {
      const parts = trimmed.split(' ');
      const provider = parts[1] || 'claude';
      if (onSpecialAction) onSpecialAction('acp', provider);
      setStatusMessage(`Switched ACP provider to ${provider.toUpperCase()}`);
    } else if (trimmed.startsWith(':%s/') || trimmed.startsWith(':s/')) {
      const match = trimmed.match(/^:%?s\/([^\/]*)\/([^\/]*)(?:\/([gi]*))?$/);
      if (match && substituteHandler) {
        const [, findStr, replaceStr, flags] = match;
        const count = substituteHandler(findStr, replaceStr, flags || 'g');
        setStatusMessage(`Substituted ${count} occurrence(s) of "${findStr}".`);
      } else {
        setStatusMessage(`Invalid substitution syntax. Use :%s/old/new/g`);
      }
    } else if (trimmed.startsWith('/')) {
      const query = trimmed.slice(1);
      if (searchHandler) searchHandler(query, false);
      setStatusMessage(`Search: ${query}`);
    } else if (trimmed.startsWith('?')) {
      const query = trimmed.slice(1);
      if (searchHandler) searchHandler(query, true);
      setStatusMessage(`Search backwards: ${query}`);
    } else if (trimmed === ':noh' || trimmed === ':nohlsearch') {
      setStatusMessage('Search highlight cleared.');
    } else if (trimmed === ':help') {
      setStatusMessage('Commands: :w (save), :q (close), :wq (save+close), :%s/find/replace/g, :theme, :acp <provider>');
    } else {
      setStatusMessage(`Executed command: ${trimmed}`);
    }
  };

  return (
    <VimContext.Provider
      value={{
        state,
        vimEnabled,
        setMode,
        toggleVimEnabled,
        setCommandBuffer,
        setSearchBuffer,
        setStatusMessage,
        executeCommand,
        registerSaveHandler: (fn) => setSaveHandler(() => fn),
        registerCloseTabHandler: (fn) => setCloseTabHandler(() => fn),
        registerSubstituteHandler: (fn) => setSubstituteHandler(() => fn),
        registerSearchHandler: (fn) => setSearchHandler(() => fn),
        registerFocusEditorHandler: (fn) => setFocusEditorHandler(() => fn),
        focusEditor,
      }}
    >
      {children}
    </VimContext.Provider>
  );
};

export const useVim = () => {
  const context = useContext(VimContext);
  if (!context) throw new Error('useVim must be used within VimProvider');
  return context;
};
