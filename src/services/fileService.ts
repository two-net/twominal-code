import { invoke } from '@tauri-apps/api/core';
import { FileDiffData, FileEntry, WorkspaceInfo } from '../types/workspace';

export class FileService {
  private static isTauriAvailable(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  static async getInfo(rootPath?: string): Promise<WorkspaceInfo> {
    if (!this.isTauriAvailable()) {
      return {
        root_path: '.',
        branch: 'main',
        modified_files: [],
      };
    }
    return invoke<WorkspaceInfo>('workspace_get_info', { rootPath });
  }

  static async getDiff(filePath?: string, rootPath?: string): Promise<string> {
    if (!this.isTauriAvailable()) {
      return '';
    }
    return invoke<string>('workspace_git_diff', { filePath, rootPath });
  }

  static async getFileDiff(filePath: string, rootPath?: string): Promise<FileDiffData> {
    if (!this.isTauriAvailable()) {
      const current = await this.readFile(filePath);
      return {
        file_path: filePath,
        old_content: `// Previous committed version: ${filePath}\n` + current,
        new_content: current,
        status: 'M',
        diff_patch: `--- a/${filePath}\n+++ b/${filePath}\n`,
      };
    }
    return invoke<FileDiffData>('workspace_get_file_diff', { filePath, rootPath });
  }

  static async stage(filePath?: string, rootPath?: string): Promise<void> {
    if (!this.isTauriAvailable()) return;
    return invoke('workspace_git_stage', { filePath, rootPath });
  }

  static async unstage(filePath?: string, rootPath?: string): Promise<void> {
    if (!this.isTauriAvailable()) return;
    return invoke('workspace_git_unstage', { filePath, rootPath });
  }

  static async discard(filePath: string, rootPath?: string): Promise<void> {
    if (!this.isTauriAvailable()) return;
    return invoke('workspace_git_discard', { filePath, rootPath });
  }

  static async commit(message: string, rootPath?: string): Promise<string> {
    if (!this.isTauriAvailable()) {
      return 'commit-simulated';
    }
    return invoke<string>('workspace_git_commit', { message, rootPath });
  }

  static async readTree(rootPath: string): Promise<FileEntry> {
    if (!this.isTauriAvailable()) {
      return {
        name: 'workspace',
        path: '.',
        is_dir: true,
        size: 0,
        children: [],
      };
    }
    return invoke<FileEntry>('workspace_read_tree', { rootPath });
  }

  static async readFile(path: string, rootPath?: string): Promise<string> {
    if (!this.isTauriAvailable()) {
      return `// File: ${path}\n`;
    }
    return invoke<string>('workspace_read_file', { path, rootPath });
  }

  static async writeFile(path: string, content: string, rootPath?: string): Promise<void> {
    if (!this.isTauriAvailable()) return;
    return invoke('workspace_write_file', { path, content, rootPath });
  }

  static async createEntry(path: string, isDir: boolean, rootPath?: string): Promise<void> {
    if (!this.isTauriAvailable()) return;
    return invoke('workspace_create_entry', { path, isDir, rootPath });
  }

  static async deleteEntry(path: string, rootPath?: string): Promise<void> {
    if (!this.isTauriAvailable()) return;
    return invoke('workspace_delete_entry', { path, rootPath });
  }
}
