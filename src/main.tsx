import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { VimProvider } from './context/VimContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AgentProvider } from './context/AgentContext';
import { PetsProvider } from './context/PetsContext';
import './index.css';

// Monaco Web Worker setup for Vite
// @ts-ignore
window.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new Worker(
        new URL('../node_modules/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
        { type: 'module' }
      );
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new Worker(
        new URL('../node_modules/monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url),
        { type: 'module' }
      );
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(
        new URL('../node_modules/monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url),
        { type: 'module' }
      );
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(
        new URL('../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
        { type: 'module' }
      );
    }
    return new Worker(
      new URL('../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
      { type: 'module' }
    );
  },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <VimProvider>
        <WorkspaceProvider>
          <AgentProvider>
            <PetsProvider>
              <App />
            </PetsProvider>
          </AgentProvider>
        </WorkspaceProvider>
      </VimProvider>
    </ThemeProvider>
  </React.StrictMode>
);
