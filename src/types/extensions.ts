export interface ExtensionItem {
  id: string;
  namespace: string;
  name: string;
  display_name: string;
  description: string;
  version: string;
  download_count: number;
  rating: number;
  icon_url?: string;
  installed: boolean;
  categories: string[];
  source?: 'twominal' | 'vscode' | 'marketplace';
  download_url?: string;
}
