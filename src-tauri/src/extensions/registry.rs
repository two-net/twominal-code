use super::manifest::ExtensionItem;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

pub struct OpenVsxRegistry;

impl OpenVsxRegistry {
    /// Dedicated in-app directory for Twominal Code extensions: ~/.twominal/extensions
    pub fn get_storage_dir() -> PathBuf {
        let home = std::env::var("HOME")
            .or_else(|_| std::env::var("USERPROFILE"))
            .unwrap_or_else(|_| ".".to_string());
        let dir = PathBuf::from(home).join(".twominal").join("extensions");
        let _ = fs::create_dir_all(&dir);
        dir
    }

    /// Helper to parse an extension directory containing a package.json
    fn parse_extension_dir(dir_path: &Path) -> Option<ExtensionItem> {
        let pkg_path = dir_path.join("package.json");
        if !pkg_path.is_file() {
            return None;
        }

        let content = fs::read_to_string(&pkg_path).ok()?;
        let json: serde_json::Value = serde_json::from_str(&content).ok()?;

        let raw_name = json.get("name").and_then(|v| v.as_str())?.to_string();
        let publisher = json
            .get("publisher")
            .and_then(|v| v.as_str())
            .unwrap_or("twominal")
            .to_string();

        let display_name = json
            .get("displayName")
            .and_then(|v| v.as_str())
            .unwrap_or(&raw_name)
            .to_string();

        let description = json
            .get("description")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let version = json
            .get("version")
            .and_then(|v| v.as_str())
            .unwrap_or("1.0.0")
            .to_string();

        let categories: Vec<String> = json
            .get("categories")
            .and_then(|c| c.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default();

        let icon_file = json.get("icon").and_then(|v| v.as_str());
        let icon_url = icon_file.map(|rel| {
            let full_icon = dir_path.join(rel);
            if full_icon.exists() {
                format!("file://{}", full_icon.to_string_lossy())
            } else {
                rel.to_string()
            }
        });

        let id = format!("{}.{}", publisher, raw_name);

        Some(ExtensionItem {
            id,
            namespace: publisher,
            name: raw_name,
            display_name,
            description,
            version,
            download_count: 0,
            rating: 5.0,
            icon_url,
            installed: true,
            categories,
            source: Some("in-app".to_string()),
            download_url: None,
        })
    }

    /// Read all in-app installed extensions from ~/.twominal/extensions
    pub fn get_installed() -> Vec<ExtensionItem> {
        let storage_dir = Self::get_storage_dir();
        let mut map: HashMap<String, ExtensionItem> = HashMap::new();

        if let Ok(entries) = fs::read_dir(&storage_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let dir_name = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
                    if dir_name.starts_with('.') || dir_name.is_empty() {
                        continue;
                    }
                    if let Some(item) = Self::parse_extension_dir(&path) {
                        map.insert(item.id.to_lowercase(), item);
                    }
                }
            }
        }

        let mut list: Vec<ExtensionItem> = map.into_values().collect();
        list.sort_by(|a, b| a.display_name.to_lowercase().cmp(&b.display_name.to_lowercase()));
        list
    }

    /// Set of lowercase IDs of in-app installed extensions
    pub fn get_installed_ids() -> HashSet<String> {
        Self::get_installed()
            .into_iter()
            .map(|ext| ext.id.to_lowercase())
            .collect()
    }

    /// Install an extension from Open-VSX directly into in-app storage (~/.twominal/extensions)
    pub async fn install(
        extension_id: &str,
        download_url: Option<&str>,
    ) -> Result<ExtensionItem, String> {
        let storage_dir = Self::get_storage_dir();

        // 1. Resolve direct download URL if not provided
        let url = if let Some(durl) = download_url {
            durl.to_string()
        } else {
            let parts: Vec<&str> = extension_id.split('.').collect();
            if parts.len() < 2 {
                return Err(format!("Invalid extension ID format: {}", extension_id));
            }
            let namespace = parts[0];
            let name = parts[1..].join(".");
            let api_url = format!("https://open-vsx.org/api/{}/{}", namespace, name);

            let client = reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .user_agent("Twominal-Code/2.4")
                .build()
                .map_err(|e| e.to_string())?;

            let resp = client
                .get(&api_url)
                .send()
                .await
                .map_err(|e| format!("Failed to fetch extension info: {}", e))?;

            let json: serde_json::Value = resp
                .json()
                .await
                .map_err(|e| format!("Invalid extension metadata JSON: {}", e))?;

            json.get("files")
                .and_then(|f| f.get("download"))
                .and_then(|d| d.as_str())
                .ok_or_else(|| "Extension does not provide a downloadable VSIX".to_string())?
                .to_string()
        };

        // 2. Download VSIX binary
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .user_agent("Twominal-Code/2.4")
            .build()
            .map_err(|e| e.to_string())?;

        let vsix_bytes = client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to download VSIX from {}: {}", url, e))?
            .bytes()
            .await
            .map_err(|e| format!("Failed to read VSIX stream: {}", e))?;

        // 3. Extract VSIX archive into ~/.twominal/extensions/<extension_id>
        let target_folder_name = extension_id.to_string();
        let target_dir = storage_dir.join(&target_folder_name);
        if target_dir.exists() {
            let _ = fs::remove_dir_all(&target_dir);
        }
        fs::create_dir_all(&target_dir).map_err(|e| format!("Failed to create folder {:?}: {}", target_dir, e))?;

        let reader = std::io::Cursor::new(vsix_bytes);
        let mut zip = zip::ZipArchive::new(reader)
            .map_err(|e| format!("Failed to parse VSIX zip archive: {}", e))?;

        for i in 0..zip.len() {
            let mut file = zip.by_index(i).map_err(|e| format!("Failed to read zip item: {}", e))?;
            let name = file.name().to_string();

            // Extract contents from "extension/" directory inside the VSIX package
            if let Some(rel_path) = name.strip_prefix("extension/") {
                if rel_path.is_empty() {
                    continue;
                }
                let out_path = target_dir.join(rel_path);
                if file.is_dir() {
                    let _ = fs::create_dir_all(&out_path);
                } else {
                    if let Some(parent) = out_path.parent() {
                        let _ = fs::create_dir_all(parent);
                    }
                    let mut outfile = fs::File::create(&out_path)
                        .map_err(|e| format!("Failed to create output file {:?}: {}", out_path, e))?;
                    std::io::copy(&mut file, &mut outfile)
                        .map_err(|e| format!("Failed to extract file: {}", e))?;
                }
            }
        }

        // 4. Parse installed package.json
        let installed_item = Self::parse_extension_dir(&target_dir)
            .ok_or_else(|| "Failed to parse package.json from extracted extension".to_string())?;

        Ok(installed_item)
    }

    /// Uninstall an in-app extension strictly from ~/.twominal/extensions
    pub fn uninstall(extension_id: &str) -> Result<(), String> {
        let storage_dir = Self::get_storage_dir();
        let q_id = extension_id.to_lowercase();

        if let Ok(entries) = fs::read_dir(&storage_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(item) = Self::parse_extension_dir(&path) {
                        if item.id.to_lowercase() == q_id {
                            let _ = fs::remove_dir_all(&path);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// Live query to Open-VSX Registry API
    pub async fn search(query: &str) -> Vec<ExtensionItem> {
        let q_trimmed = query.trim();
        let url = if q_trimmed.is_empty() {
            "https://open-vsx.org/api/-/search?size=30&sortBy=downloadCount&sortOrder=desc".to_string()
        } else {
            format!(
                "https://open-vsx.org/api/-/search?query={}&size=30",
                urlencoding_query(q_trimmed)
            )
        };

        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(5))
            .user_agent("Twominal-Code/2.4")
            .build();

        let installed_ids = Self::get_installed_ids();

        if let Ok(client) = client {
            if let Ok(resp) = client.get(&url).send().await {
                if let Ok(json) = resp.json::<serde_json::Value>().await {
                    if let Some(exts) = json.get("extensions").and_then(|e| e.as_array()) {
                        let mut results = Vec::new();
                        for ext in exts {
                            let namespace = ext.get("namespace").and_then(|v| v.as_str()).unwrap_or("").to_string();
                            let name = ext.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
                            if namespace.is_empty() || name.is_empty() {
                                continue;
                            }
                            let id = format!("{}.{}", namespace, name);
                            let display_name = ext.get("displayName").and_then(|v| v.as_str()).unwrap_or(&name).to_string();
                            let description = ext.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();
                            let version = ext.get("version").and_then(|v| v.as_str()).unwrap_or("1.0.0").to_string();
                            let download_count = ext.get("downloadCount").and_then(|v| v.as_u64()).unwrap_or(0);
                            let rating = ext.get("averageRating").and_then(|v| v.as_f64()).unwrap_or(5.0);
                            let icon_url = ext.get("files").and_then(|f| f.get("icon")).and_then(|i| i.as_str()).map(|s| s.to_string());
                            let download_url = ext.get("files").and_then(|f| f.get("download")).and_then(|d| d.as_str()).map(|s| s.to_string());
                            let categories = ext.get("categories")
                                .and_then(|c| c.as_array())
                                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
                                .unwrap_or_default();

                            let is_installed = installed_ids.contains(&id.to_lowercase());

                            results.push(ExtensionItem {
                                id,
                                namespace,
                                name,
                                display_name,
                                description,
                                version,
                                download_count,
                                rating,
                                icon_url,
                                installed: is_installed,
                                categories,
                                source: Some("marketplace".to_string()),
                                download_url,
                            });
                        }
                        return results;
                    }
                }
            }
        }

        Vec::new()
    }
}

fn urlencoding_query(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            ' ' => "+".to_string(),
            _ => format!("%{:02X}", c as u32),
        })
        .collect()
}
