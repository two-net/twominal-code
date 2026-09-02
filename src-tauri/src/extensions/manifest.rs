use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionItem {
    pub id: String,
    pub namespace: String,
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub version: String,
    pub download_count: u64,
    pub rating: f64,
    pub icon_url: Option<String>,
    pub installed: bool,
    pub categories: Vec<String>,
    pub source: Option<String>, // "twominal", "vscode", "marketplace"
    pub download_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VsCodeThemeContribution {
    pub label: String,
    pub ui_theme: String, // "vs-dark", "vs", "hc-black"
    pub path: String,
}
