import React, { createContext, useContext, useEffect, useState } from 'react';
import { FileService } from '../services/fileService';
import { EditorTab, FileDiffData, FileEntry, GitFileStatus } from '../types/workspace';

export type SidebarView = 'explorer' | 'krypton' | 'extensions' | 'git' | 'search' | 'pets';

interface WorkspaceContextType {
  workspacePath: string;
  gitBranch: string;
  gitFiles: GitFileStatus[];
  fileTree: FileEntry | null;
  tabs: EditorTab[];
  activeTabId: string | null;
  activeTab: EditorTab | null;
  sidebarView: SidebarView;
  isSidebarOpen: boolean;
  isAiPanelOpen: boolean;
  isSplitEditor: boolean;
  isDiffOverlayOpen: boolean;
  activeDiff: FileDiffData | null;
  diffViewMode: 'side-by-side' | 'inline';
  isCommandPaletteOpen: boolean;
  isQuickOpen: boolean;
  toastMessage: string | null;
  setWorkspacePath: (path: string) => void;
  setSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  toggleAiPanel: () => void;
  toggleSplitEditor: () => void;
  toggleDiffOverlay: () => void;
  setDiffViewMode: (mode: 'side-by-side' | 'inline') => void;
  setActiveDiff: (diff: FileDiffData | null) => void;
  openDiff: (filePath: string) => Promise<void>;
  closeDiff: () => void;
  stageFile: (filePath?: string) => Promise<void>;
  unstageFile: (filePath?: string) => Promise<void>;
  discardFile: (filePath: string) => Promise<void>;
  setCommandPaletteOpen: (open: boolean, isQuickOpen?: boolean) => void;
  showToast: (msg: string) => void;
  openFile: (path: string) => Promise<void>;
  openPetCodingTab: () => void;
  closeTab: (tabId: string) => void;
  updateActiveContent: (content: string) => void;
  saveActiveFile: () => Promise<void>;
  createFile: (path: string, isDir: boolean) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  refreshTree: () => Promise<void>;
  refreshGit: () => Promise<void>;
  commitChanges: (message?: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

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

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspacePath, setWorkspacePath] = useState<string>('.');
  const [gitBranch, setGitBranch] = useState<string>('main');
  const [gitFiles, setGitFiles] = useState<GitFileStatus[]>([]);
  const [fileTree, setFileTree] = useState<FileEntry | null>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(true);
  const [isSplitEditor, setIsSplitEditor] = useState<boolean>(false);
  const [isDiffOverlayOpen, setIsDiffOverlayOpen] = useState<boolean>(false);
  const [activeDiff, setActiveDiff] = useState<FileDiffData | null>(null);
  const [diffViewMode, setDiffViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isQuickOpen, setIsQuickOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const refreshTree = async () => {
    try {
      const tree = await FileService.readTree(workspacePath);
      setFileTree(tree);
    } catch (e) {
      console.error('Failed to read tree', e);
    }
  };

  const refreshGit = async () => {
    try {
      const info = await FileService.getInfo(workspacePath);
      if (info.root_path && info.root_path !== '.' && workspacePath === '.') {
        setWorkspacePath(info.root_path);
      }
      if (info.branch) {
        const modCount = info.modified_files ? info.modified_files.length : 0;
        setGitBranch(modCount > 0 ? `${info.branch} [${modCount}+]` : info.branch);
      }
      setGitFiles(info.modified_files || []);
    } catch (e) {
      console.error('Failed to read git info', e);
    }
  };

  // Initial load: tree, git status
  useEffect(() => {
    const init = async () => {
      await refreshGit();
      await refreshTree();
    };
    init();
  }, [workspacePath]);

  const openFile = async (path: string) => {
    // If opening a file, close diff overlay if active
    if (activeDiff) {
      setActiveDiff(null);
      setIsDiffOverlayOpen(false);
    }

    const existing = tabs.find((t) => t.path === path);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    try {
      const content = await FileService.readFile(path, workspacePath);
      const name = path.split('/').pop() || path;
      const newTab: EditorTab = {
        id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        path,
        title: name,
        content,
        language: detectLanguage(path),
        isDirty: false,
        cursorLine: 1,
        cursorColumn: 1,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } catch (e) {
      console.error(`Failed to open file ${path}`, e);
    }
  };

  const openPetCodingTab = () => {
    const existing = tabs.find((t) => t.path === 'pet-coding');
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const petTab: EditorTab = {
      id: `tab-pet-coding`,
      path: 'pet-coding',
      title: '🐾 Pet Coding',
      content: '',
      language: 'plaintext',
      isDirty: false,
      cursorLine: 1,
      cursorColumn: 1,
    };
    setTabs((prev) => [...prev, petTab]);
    setActiveTabId(petTab.id);
    showToast('Opened Pet Coding Arena');
  };

  const openDiff = async (filePath: string) => {
    try {
      const diffData = await FileService.getFileDiff(filePath, workspacePath);
      // If the file is open in an active tab and has modifications or content, ensure new_content matches
      const openTab = tabs.find(
        (t) => t.path === filePath || t.path.endsWith(filePath) || filePath.endsWith(t.path)
      );
      if (openTab && (!diffData.new_content || openTab.isDirty)) {
        diffData.new_content = openTab.content;
      }
      setActiveDiff(diffData);
      setIsDiffOverlayOpen(true);
      showToast(`Showing Git Diff: ${filePath}`);
    } catch (e) {
      console.error('Failed to open diff for ' + filePath, e);
      showToast(`Failed to load diff for ${filePath}`);
    }
  };

  const closeDiff = () => {
    setActiveDiff(null);
    setIsDiffOverlayOpen(false);
  };

  const stageFile = async (filePath?: string) => {
    try {
      await FileService.stage(filePath, workspacePath);
      await refreshGit();
      showToast(filePath ? `Staged: ${filePath}` : 'Staged all changes');
    } catch (e) {
      console.error('Failed to stage', e);
      showToast(`Stage failed: ${e}`);
    }
  };

  const unstageFile = async (filePath?: string) => {
    try {
      await FileService.unstage(filePath, workspacePath);
      await refreshGit();
      showToast(filePath ? `Unstaged: ${filePath}` : 'Unstaged all changes');
    } catch (e) {
      console.error('Failed to unstage', e);
      showToast(`Unstage failed: ${e}`);
    }
  };

  const discardFile = async (filePath: string) => {
    try {
      await FileService.discard(filePath, workspacePath);
      await refreshGit();
      await refreshTree();
      
      // Reload tab content if open
      const existingTab = tabs.find((t) => t.path === filePath);
      if (existingTab) {
        try {
          const freshContent = await FileService.readFile(filePath, workspacePath);
          setTabs((prev) =>
            prev.map((t) => (t.id === existingTab.id ? { ...t, content: freshContent, isDirty: false } : t))
          );
        } catch {
          // File was deleted during discard (e.g. untracked file)
          closeTab(existingTab.id);
        }
      }

      if (activeDiff && activeDiff.file_path === filePath) {
        closeDiff();
      }

      showToast(`Discarded changes in ${filePath}`);
    } catch (e) {
      console.error('Failed to discard changes', e);
      showToast(`Discard failed: ${e}`);
    }
  };

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
      }
      return filtered;
    });
  };

  const updateActiveContent = (content: string) => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, content, isDirty: true } : t))
    );
  };

  const saveActiveFile = async () => {
    const active = tabs.find((t) => t.id === activeTabId);
    if (!active) return;
    try {
      await FileService.writeFile(active.path, active.content, workspacePath);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isDirty: false } : t))
      );
      await refreshGit();
      showToast(`Saved ${active.title} to disk`);
    } catch (e) {
      console.error(`Failed to save file ${active.path}`, e);
      showToast(`Failed to save ${active.title}`);
    }
  };

  const createFile = async (path: string, isDir: boolean) => {
    await FileService.createEntry(path, isDir, workspacePath);
    await refreshTree();
    await refreshGit();
    if (!isDir) {
      await openFile(path);
    }
    showToast(`Created ${isDir ? 'directory' : 'file'}: ${path}`);
  };

  const deleteFile = async (path: string) => {
    await FileService.deleteEntry(path, workspacePath);
    await refreshTree();
    await refreshGit();
    const existing = tabs.find((t) => t.path === path);
    if (existing) closeTab(existing.id);
    showToast(`Deleted ${path}`);
  };

  const commitChanges = async (message?: string) => {
    try {
      const res = await FileService.commit(message || 'Commit from Twominal Code', workspacePath);
      await refreshGit();
      closeDiff();
      showToast(res ? `Committed: ${res.split('\n')[0]}` : 'Changes committed successfully');
    } catch (e) {
      console.error('Failed to commit', e);
      showToast(`Commit failed: ${e}`);
    }
  };

  const setCommandPaletteOpenState = (open: boolean, quickOpen = false) => {
    setIsCommandPaletteOpen(open);
    setIsQuickOpen(quickOpen);
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleAiPanel = () => setIsAiPanelOpen((prev) => !prev);
  const toggleSplitEditor = () => setIsSplitEditor((prev) => !prev);
  const toggleDiffOverlay = () => {
    if (activeDiff || isDiffOverlayOpen) {
      closeDiff();
    } else if (activeTab) {
      openDiff(activeTab.path);
    } else if (gitFiles.length > 0) {
      openDiff(gitFiles[0].path);
    } else {
      showToast('No active file or modified Git files to diff');
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspacePath,
        gitBranch,
        gitFiles,
        fileTree,
        tabs,
        activeTabId,
        activeTab,
        sidebarView,
        isSidebarOpen,
        isAiPanelOpen,
        isSplitEditor,
        isDiffOverlayOpen,
        activeDiff,
        diffViewMode,
        isCommandPaletteOpen,
        isQuickOpen,
        toastMessage,
        setWorkspacePath,
        setSidebarView,
        toggleSidebar,
        toggleAiPanel,
        toggleSplitEditor,
        toggleDiffOverlay,
        setDiffViewMode,
        setActiveDiff,
        openDiff,
        closeDiff,
        stageFile,
        unstageFile,
        discardFile,
        setCommandPaletteOpen: setCommandPaletteOpenState,
        showToast,
        openFile,
        openPetCodingTab,
        closeTab,
        updateActiveContent,
        saveActiveFile,
        createFile,
        deleteFile,
        refreshTree,
        refreshGit,
        commitChanges,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};

