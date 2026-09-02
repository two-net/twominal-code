export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  children?: FileEntry[];
}

export interface EditorTab {
  id: string;
  path: string;
  title: string;
  content: string;
  language: string;
  isDirty: boolean;
  cursorLine: number;
  cursorColumn: number;
}

export interface GitFileStatus {
  path: string;
  status: string;
  is_staged?: boolean;
  is_untracked?: boolean;
  insertions: number;
  deletions: number;
}

export interface FileDiffData {
  file_path: string;
  old_content: string;
  new_content: string;
  status: string;
  diff_patch: string;
}

export interface WorkspaceInfo {
  root_path: string;
  branch: string;
  modified_files: GitFileStatus[];
}

export type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'VISUAL_LINE' | 'COMMAND';

export interface VimState {
  mode: VimMode;
  commandBuffer: string;
  searchBuffer: string;
  lastCommand: string;
  statusMessage: string;
}
