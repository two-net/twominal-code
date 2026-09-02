pub mod fs_ops;

use std::path::{Path, PathBuf};
use self::fs_ops::{FileEntry, WorkspaceFs};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDiffData {
    pub file_path: String,
    pub old_content: String,
    pub new_content: String,
    pub status: String,
    pub diff_patch: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitFileStatus {
    pub path: String,
    pub status: String,
    pub is_staged: bool,
    pub is_untracked: bool,
    pub insertions: usize,
    pub deletions: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceInfo {
    pub root_path: String,
    pub branch: String,
    pub modified_files: Vec<GitFileStatus>,
}

pub fn resolve_workspace_root(root_path: Option<&str>) -> PathBuf {
    let start_dir = match root_path {
        Some(p) if !p.is_empty() && p != "." && Path::new(p).exists() => PathBuf::from(p),
        _ => std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
    };

    // 1. Try to find the git repo root via git rev-parse --show-toplevel
    if let Ok(output) = std::process::Command::new("git")
        .args(["rev-parse", "--show-toplevel"])
        .current_dir(&start_dir)
        .output()
    {
        if output.status.success() {
            let toplevel = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !toplevel.is_empty() && Path::new(&toplevel).exists() {
                return PathBuf::from(toplevel);
            }
        }
    }

    // 2. If current directory ends in src-tauri, check parent
    if start_dir.ends_with("src-tauri") {
        if let Some(parent) = start_dir.parent() {
            if parent.exists() {
                return parent.to_path_buf();
            }
        }
    }

    if let Ok(canon) = std::fs::canonicalize(&start_dir) {
        canon
    } else {
        start_dir
    }
}

#[tauri::command]
pub async fn workspace_get_info(root_path: Option<String>) -> Result<WorkspaceInfo, String> {
    let current_dir = resolve_workspace_root(root_path.as_deref());
    let root_str = current_dir.to_string_lossy().to_string();

    let branch = std::process::Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(&current_dir)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "main".to_string());
    let branch = if branch.is_empty() { "main".to_string() } else { branch };

    let mut numstat_map: std::collections::HashMap<String, (usize, usize)> = std::collections::HashMap::new();
    if let Ok(output) = std::process::Command::new("git")
        .args(["diff", "--numstat", "HEAD"])
        .current_dir(&current_dir)
        .output()
    {
        for line in String::from_utf8_lossy(&output.stdout).lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let ins = parts[0].parse::<usize>().unwrap_or(0);
                let del = parts[1].parse::<usize>().unwrap_or(0);
                let path = parts[2..].join(" ");
                numstat_map.insert(path, (ins, del));
            }
        }
    }

    let mut modified_files = Vec::new();
    if let Ok(output) = std::process::Command::new("git")
        .args(["status", "--porcelain=v1", "-uall"])
        .current_dir(&current_dir)
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            if line.len() >= 3 {
                let x = line.chars().next().unwrap_or(' ');
                let y = line.chars().nth(1).unwrap_or(' ');
                let file_rel = line[3..].trim().trim_matches('"').to_string();
                
                let (mut ins, del) = numstat_map.get(&file_rel).copied().unwrap_or((0, 0));

                if x == '?' && y == '?' {
                    // Untracked file
                    if ins == 0 && del == 0 {
                        let full_p = current_dir.join(&file_rel);
                        if let Ok(content) = std::fs::read_to_string(&full_p) {
                            ins = content.lines().count();
                        }
                    }

                    modified_files.push(GitFileStatus {
                        path: file_rel,
                        status: "U".to_string(),
                        is_staged: false,
                        is_untracked: true,
                        insertions: ins,
                        deletions: del,
                    });
                } else {
                    // Staged changes (Index)
                    if x != ' ' && x != '?' {
                        modified_files.push(GitFileStatus {
                            path: file_rel.clone(),
                            status: x.to_string(),
                            is_staged: true,
                            is_untracked: false,
                            insertions: ins,
                            deletions: del,
                        });
                    }
                    // Working tree changes (Unstaged)
                    if y != ' ' && y != '?' {
                        modified_files.push(GitFileStatus {
                            path: file_rel,
                            status: y.to_string(),
                            is_staged: false,
                            is_untracked: false,
                            insertions: ins,
                            deletions: del,
                        });
                    }
                }
            }
        }
    }

    Ok(WorkspaceInfo {
        root_path: root_str,
        branch,
        modified_files,
    })
}

#[tauri::command]
pub async fn workspace_get_file_diff(
    file_path: String,
    root_path: Option<String>,
) -> Result<FileDiffData, String> {
    let git_root = resolve_workspace_root(root_path.as_deref());
    let clean_path = file_path.trim_start_matches("./").trim_matches('"');
    
    // Resolve target path on disk
    let target_path = if Path::new(&file_path).is_absolute() && Path::new(&file_path).exists() {
        PathBuf::from(&file_path)
    } else {
        let p = git_root.join(clean_path);
        if p.exists() {
            p
        } else {
            PathBuf::from(&file_path)
        }
    };

    // Calculate relative path for Git commands
    let git_rel_path = if let Ok(rel) = target_path.strip_prefix(&git_root) {
        rel.to_string_lossy().to_string()
    } else {
        clean_path.to_string()
    };

    // Read new content from working directory file (if it exists)
    let new_content = if target_path.exists() && target_path.is_file() {
        std::fs::read_to_string(&target_path).unwrap_or_default()
    } else {
        String::new()
    };

    // Read old content from git HEAD
    let old_content_res = std::process::Command::new("git")
        .args(["show", &format!("HEAD:{}", git_rel_path)])
        .current_dir(&git_root)
        .output();

    let (old_content, in_head) = match old_content_res {
        Ok(output) if output.status.success() => (String::from_utf8_lossy(&output.stdout).to_string(), true),
        _ => (String::new(), false),
    };

    // Determine status
    let status = if !in_head && target_path.exists() {
        "??".to_string()
    } else if in_head && !target_path.exists() {
        "D".to_string()
    } else {
        "M".to_string()
    };

    // Run git diff HEAD -- <git_rel_path>
    let diff_output = std::process::Command::new("git")
        .args(["diff", "HEAD", "--", &git_rel_path])
        .current_dir(&git_root)
        .output();

    let diff_patch = match diff_output {
        Ok(out) if !out.stdout.is_empty() => String::from_utf8_lossy(&out.stdout).to_string(),
        _ => {
            if status == "??" {
                format!("--- /dev/null\n+++ b/{}\n@@ -0,0 +1,{} @@\n{}", git_rel_path, new_content.lines().count(), new_content)
            } else {
                String::new()
            }
        }
    };

    Ok(FileDiffData {
        file_path,
        old_content,
        new_content,
        status,
        diff_patch,
    })
}

#[tauri::command]
pub async fn workspace_git_stage(
    file_path: Option<String>,
    root_path: Option<String>,
) -> Result<(), String> {
    let git_root = resolve_workspace_root(root_path.as_deref());

    let mut cmd = std::process::Command::new("git");
    cmd.current_dir(&git_root);
    if let Some(ref fp) = file_path {
        let clean = fp.trim_start_matches("./").trim_matches('"');
        cmd.args(["add", "--", clean]);
    } else {
        cmd.args(["add", "-A"]);
    }

    let output = cmd.output().map_err(|e| format!("Failed to stage: {}", e))?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

#[tauri::command]
pub async fn workspace_git_unstage(
    file_path: Option<String>,
    root_path: Option<String>,
) -> Result<(), String> {
    let git_root = resolve_workspace_root(root_path.as_deref());

    let mut cmd = std::process::Command::new("git");
    cmd.current_dir(&git_root);
    if let Some(ref fp) = file_path {
        let clean = fp.trim_start_matches("./").trim_matches('"');
        cmd.args(["restore", "--staged", "--", clean]);
    } else {
        cmd.args(["restore", "--staged", "."]);
    }

    let output = cmd.output().map_err(|e| format!("Failed to unstage: {}", e))?;
    if !output.status.success() {
        // Fallback for older git versions
        let mut fallback_cmd = std::process::Command::new("git");
        fallback_cmd.current_dir(&git_root);
        if let Some(ref fp) = file_path {
            let clean = fp.trim_start_matches("./").trim_matches('"');
            fallback_cmd.args(["reset", "HEAD", "--", clean]);
        } else {
            fallback_cmd.args(["reset", "HEAD"]);
        }
        let _ = fallback_cmd.output();
    }
    Ok(())
}

#[tauri::command]
pub async fn workspace_git_discard(
    file_path: String,
    root_path: Option<String>,
) -> Result<(), String> {
    let git_root = resolve_workspace_root(root_path.as_deref());
    let clean_path = file_path.trim_start_matches("./").trim_matches('"');
    let full_path = git_root.join(clean_path);

    // Check if untracked
    let status_res = std::process::Command::new("git")
        .args(["status", "--porcelain", "--", clean_path])
        .current_dir(&git_root)
        .output();

    let is_untracked = if let Ok(out) = status_res {
        let text = String::from_utf8_lossy(&out.stdout);
        text.starts_with("??")
    } else {
        false
    };

    if is_untracked {
        if full_path.is_dir() {
            let _ = std::fs::remove_dir_all(&full_path);
        } else if full_path.exists() {
            let _ = std::fs::remove_file(&full_path);
        }
        return Ok(());
    }

    // Tracked file: restore working tree
    let output = std::process::Command::new("git")
        .args(["restore", "--", clean_path])
        .current_dir(&git_root)
        .output()
        .map_err(|e| format!("Failed to restore: {}", e))?;

    if !output.status.success() {
        // Fallback checkout
        let checkout_out = std::process::Command::new("git")
            .args(["checkout", "HEAD", "--", clean_path])
            .current_dir(&git_root)
            .output();
        if let Ok(co) = checkout_out {
            if !co.status.success() {
                return Err(String::from_utf8_lossy(&output.stderr).to_string());
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn workspace_git_commit(
    root_path: Option<String>,
    message: String,
) -> Result<String, String> {
    let git_root = resolve_workspace_root(root_path.as_deref());

    // Check if anything is staged
    let staged_check = std::process::Command::new("git")
        .args(["diff", "--cached", "--quiet"])
        .current_dir(&git_root)
        .status();

    // If exit code is 0, nothing was staged -> stage all changes
    if let Ok(st) = staged_check {
        if st.success() {
            let add_output = std::process::Command::new("git")
                .args(["add", "-A"])
                .current_dir(&git_root)
                .output()
                .map_err(|e| format!("Failed to stage files: {}", e))?;

            if !add_output.status.success() {
                return Err(String::from_utf8_lossy(&add_output.stderr).to_string());
            }
        }
    }

    let commit_msg = if message.trim().is_empty() {
        "Commit from Twominal Code".to_string()
    } else {
        message
    };

    let commit_output = std::process::Command::new("git")
        .args(["commit", "-m", &commit_msg])
        .current_dir(&git_root)
        .output()
        .map_err(|e| format!("Failed to commit: {}", e))?;

    if !commit_output.status.success() {
        return Err(String::from_utf8_lossy(&commit_output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&commit_output.stdout).trim().to_string())
}

#[tauri::command]
pub async fn workspace_git_diff(
    file_path: Option<String>,
    root_path: Option<String>,
) -> Result<String, String> {
    let git_root = resolve_workspace_root(root_path.as_deref());

    let mut cmd = std::process::Command::new("git");
    cmd.current_dir(&git_root);
    cmd.arg("diff");
    cmd.arg("HEAD");
    if let Some(ref fp) = file_path {
        let clean = fp.trim_start_matches("./").trim_matches('"');
        cmd.args(["--", clean]);
    }
    let output = cmd.output().map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
pub async fn workspace_read_tree(
    root_path: Option<String>,
    max_depth: Option<usize>,
) -> Result<FileEntry, String> {
    let depth = max_depth.unwrap_or(8);
    let resolved_path = resolve_workspace_root(root_path.as_deref());
    WorkspaceFs::read_tree(&resolved_path, depth)
}

#[tauri::command]
pub async fn workspace_read_file(path: String, root_path: Option<String>) -> Result<String, String> {
    WorkspaceFs::read_file(&path, root_path.as_deref())
}

#[tauri::command]
pub async fn workspace_write_file(path: String, content: String, root_path: Option<String>) -> Result<(), String> {
    WorkspaceFs::write_file(&path, &content, root_path.as_deref())
}

#[tauri::command]
pub async fn workspace_create_entry(path: String, is_dir: bool, root_path: Option<String>) -> Result<(), String> {
    WorkspaceFs::create_file_or_dir(&path, is_dir, root_path.as_deref())
}

#[tauri::command]
pub async fn workspace_delete_entry(path: String, root_path: Option<String>) -> Result<(), String> {
    WorkspaceFs::delete_path(&path, root_path.as_deref())
}
