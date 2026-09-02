use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub children: Option<Vec<FileEntry>>,
}

pub struct WorkspaceFs;

impl WorkspaceFs {
    pub fn read_tree(root_path: &Path, max_depth: usize) -> Result<FileEntry, String> {
        Self::read_entry(root_path, 0, max_depth)
    }

    fn read_entry(path: &Path, current_depth: usize, max_depth: usize) -> Result<FileEntry, String> {
        let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .unwrap_or_else(|| {
                if let Ok(canon) = fs::canonicalize(path) {
                    canon
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("workspace")
                        .to_string()
                } else {
                    "workspace".to_string()
                }
            });
        let is_dir = metadata.is_dir();
        let size = metadata.len();
        let path_str = path.to_string_lossy().to_string();

        let mut children = None;

        if is_dir && current_depth < max_depth {
            let mut entries_vec = Vec::new();
            if let Ok(entries) = fs::read_dir(path) {
                for entry in entries.flatten() {
                    let child_path = entry.path();
                    let child_name = child_path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("");

                    // Filter noise
                    if child_name == ".git"
                        || child_name == "node_modules"
                        || child_name == "target"
                        || child_name == "dist"
                    {
                        continue;
                    }

                    if let Ok(child_entry) =
                        Self::read_entry(&child_path, current_depth + 1, max_depth)
                    {
                        entries_vec.push(child_entry);
                    }
                }
            }

            // Sort: directories first, then alphabetically
            entries_vec.sort_by(|a, b| {
                if a.is_dir == b.is_dir {
                    a.name.to_lowercase().cmp(&b.name.to_lowercase())
                } else if a.is_dir {
                    std::cmp::Ordering::Less
                } else {
                    std::cmp::Ordering::Greater
                }
            });

            children = Some(entries_vec);
        }

        Ok(FileEntry {
            name,
            path: path_str,
            is_dir,
            size,
            children,
        })
    }

    pub fn read_file(path_str: &str, root_path: Option<&str>) -> Result<String, String> {
        let path = Path::new(path_str);
        if path.exists() && path.is_file() {
            return fs::read_to_string(path).map_err(|e| format!("Failed to read file {}: {}", path_str, e));
        }

        let root = super::resolve_workspace_root(root_path);
        let clean = path_str.trim_start_matches("./").trim_matches('"');
        let resolved = root.join(clean);
        if resolved.exists() && resolved.is_file() {
            return fs::read_to_string(&resolved).map_err(|e| format!("Failed to read file {}: {}", path_str, e));
        }

        fs::read_to_string(path_str).map_err(|e| format!("Failed to read file {}: {}", path_str, e))
    }

    pub fn write_file(path_str: &str, content: &str, root_path: Option<&str>) -> Result<(), String> {
        let path = Path::new(path_str);
        let target = if path.is_absolute() || path.exists() {
            path.to_path_buf()
        } else {
            let root = super::resolve_workspace_root(root_path);
            let clean = path_str.trim_start_matches("./").trim_matches('"');
            root.join(clean)
        };

        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directories: {}", e))?;
        }
        fs::write(&target, content).map_err(|e| format!("Failed to write file {}: {}", path_str, e))
    }

    pub fn create_file_or_dir(path_str: &str, is_dir: bool, root_path: Option<&str>) -> Result<(), String> {
        let path = Path::new(path_str);
        let target = if path.is_absolute() || path.exists() {
            path.to_path_buf()
        } else {
            let root = super::resolve_workspace_root(root_path);
            let clean = path_str.trim_start_matches("./").trim_matches('"');
            root.join(clean)
        };

        if is_dir {
            fs::create_dir_all(&target).map_err(|e| e.to_string())
        } else {
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            fs::write(&target, "").map_err(|e| e.to_string())
        }
    }

    pub fn delete_path(path_str: &str, root_path: Option<&str>) -> Result<(), String> {
        let path = Path::new(path_str);
        let target = if path.is_absolute() || path.exists() {
            path.to_path_buf()
        } else {
            let root = super::resolve_workspace_root(root_path);
            let clean = path_str.trim_start_matches("./").trim_matches('"');
            root.join(clean)
        };

        if target.is_dir() {
            fs::remove_dir_all(&target).map_err(|e| e.to_string())
        } else {
            fs::remove_file(&target).map_err(|e| e.to_string())
        }
    }
}
