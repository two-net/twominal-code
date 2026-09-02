import { invoke } from '@tauri-apps/api/core';
import { ExtensionItem } from '../types/extensions';

export class ExtensionService {
  private static isTauriAvailable(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  static async getInstalled(): Promise<ExtensionItem[]> {
    if (!this.isTauriAvailable()) {
      return [];
    }
    return invoke<ExtensionItem[]>('extensions_get_installed');
  }

  static async install(extensionId: string, downloadUrl?: string): Promise<ExtensionItem> {
    if (!this.isTauriAvailable()) {
      throw new Error('Tauri API not available');
    }
    return invoke<ExtensionItem>('extensions_install', {
      extensionId,
      downloadUrl,
    });
  }

  static async uninstall(extensionId: string): Promise<void> {
    if (!this.isTauriAvailable()) {
      return;
    }
    return invoke<void>('extensions_uninstall', { extensionId });
  }

  static async getPopular(): Promise<ExtensionItem[]> {
    if (!this.isTauriAvailable()) {
      return [];
    }
    return invoke<ExtensionItem[]>('extensions_get_popular');
  }

  static async search(query: string): Promise<ExtensionItem[]> {
    if (!this.isTauriAvailable()) {
      return [];
    }
    return invoke<ExtensionItem[]>('extensions_search', { query });
  }

  static getAssetUrl(extensionId: string, relativePath: string): string {
    return `ext://${extensionId}/${relativePath.replace(/^\/+/, '')}`;
  }

  static async getAssetData(extensionId: string, relativePath: string): Promise<string> {
    if (!this.isTauriAvailable()) {
      return this.getAssetUrl(extensionId, relativePath);
    }
    try {
      return await invoke<string>('extensions_get_asset', {
        extensionId,
        relativePath,
      });
    } catch {
      return this.getAssetUrl(extensionId, relativePath);
    }
  }
}
