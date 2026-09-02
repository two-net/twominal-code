use std::collections::HashMap;
use std::process::Stdio;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{ChildStdin, Command};
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter};

use super::protocol::{AcpProviderId, AgentEvent, JsonRpcRequest};

pub struct AcpProcessSession {
    pub provider: AcpProviderId,
    pub stdin: Option<ChildStdin>,
    pub is_alive: bool,
    pub workspace_path: Option<String>,
}

pub struct AcpProcessManager {
    sessions: Arc<Mutex<HashMap<String, AcpProcessSession>>>,
    app_handle: AppHandle,
}

fn resolve_cli_path(cmd_name: &str) -> std::path::PathBuf {
    if let Ok(path) = which::which(cmd_name) {
        return path;
    }
    if let Ok(home) = std::env::var("HOME") {
        let local_bin = std::path::PathBuf::from(&home).join(".local/bin").join(cmd_name);
        if local_bin.exists() {
            return local_bin;
        }
        let grok_bin = std::path::PathBuf::from(&home).join(".grok/bin").join(cmd_name);
        if grok_bin.exists() {
            return grok_bin;
        }
        let cargo_bin = std::path::PathBuf::from(&home).join(".cargo/bin").join(cmd_name);
        if cargo_bin.exists() {
            return cargo_bin;
        }
    }
    let homebrew_bin = std::path::PathBuf::from("/opt/homebrew/bin").join(cmd_name);
    if homebrew_bin.exists() {
        return homebrew_bin;
    }
    let usr_local_bin = std::path::PathBuf::from("/usr/local/bin").join(cmd_name);
    if usr_local_bin.exists() {
        return usr_local_bin;
    }
    std::path::PathBuf::from(cmd_name)
}

impl AcpProcessManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            app_handle,
        }
    }

    pub async fn check_binary_available(provider: &AcpProviderId) -> bool {
        let cmd = provider.default_command();
        let path = resolve_cli_path(cmd);
        path.exists() || which::which(cmd).is_ok()
    }

    pub async fn start_session(
        &self,
        provider: AcpProviderId,
        custom_cmd: Option<String>,
        custom_args: Option<Vec<String>>,
        workspace_path: Option<String>,
    ) -> Result<String, String> {
        let session_id = uuid::Uuid::new_v4().to_string();
        let cmd_name = custom_cmd.unwrap_or_else(|| provider.default_command().to_string());
        let mut args: Vec<String> = provider
            .default_args()
            .into_iter()
            .map(|s| s.to_string())
            .collect();

        if let Some(extra) = custom_args {
            args.extend(extra);
        }

        let working_dir = crate::workspace::resolve_workspace_root(workspace_path.as_deref());
        let working_dir_str = working_dir.to_string_lossy().to_string();

        // Ensure workspace directory is passed to the provider CLI
        match provider {
            AcpProviderId::Antigravity => {
                if !args.iter().any(|a| a == "--add-dir") {
                    args.push("--add-dir".to_string());
                    args.push(working_dir_str.clone());
                }
            }
            AcpProviderId::Claude => {
                if !args.iter().any(|a| a == "--add-dir" || a == "--directory") {
                    args.push("--add-dir".to_string());
                    args.push(working_dir_str.clone());
                }
            }
            _ => {}
        }

        let exe_path = resolve_cli_path(&cmd_name);

        // Spawn real CLI child process with current working directory explicitly set to workspace
        let mut cmd = Command::new(&exe_path);
        cmd.args(&args)
            .current_dir(&working_dir)
            .env("PWD", &working_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let spawn_result = cmd.spawn();

        match spawn_result {
            Ok(mut child) => {
                let stdin = child.stdin.take();
                let stdout = child.stdout.take();
                let stderr = child.stderr.take();

                let app = self.app_handle.clone();

                // Spawn stdout stream parser task
                if let Some(stdout) = stdout {
                    let app_clone = app.clone();
                    tokio::spawn(async move {
                        let mut reader = BufReader::new(stdout).lines();
                        while let Ok(Some(line)) = reader.next_line().await {
                            let trimmed = line.trim();
                            if trimmed.is_empty() {
                                continue;
                            }
                            if let Ok(val) = serde_json::from_str::<serde_json::Value>(trimmed) {
                                // 1. Check for agy step_update
                                if let Some(su) = val.get("step_update") {
                                    if let Some(delta) = su.get("text_delta").and_then(|d| d.as_str()) {
                                        let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: delta.to_string() });
                                    }
                                    if let Some(thought) = su.get("thinking_delta").and_then(|d| d.as_str()) {
                                        let _ = app_clone.emit("acp-event", AgentEvent::ReasoningChunk {
                                            thought: thought.to_string(),
                                            timestamp: chrono::Utc::now().to_rfc3339(),
                                        });
                                    }
                                    if let Some(tool_name) = su.get("tool_name").and_then(|n| n.as_str()) {
                                        let state = su.get("state").and_then(|s| s.as_str()).unwrap_or("");
                                        let call_id = su.get("step_index").map(|i| i.to_string()).unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
                                        if state == "ACTIVE" {
                                            let invocation = super::protocol::ToolInvocation {
                                                call_id: call_id.clone(),
                                                tool_name: tool_name.to_string(),
                                                arguments: su.get("tool_info").and_then(|ti| ti.get("parameters")).cloned().unwrap_or(serde_json::json!({})),
                                                timestamp: chrono::Utc::now().to_rfc3339(),
                                            };
                                            let _ = app_clone.emit("acp-event", AgentEvent::ToolStarted { invocation });
                                        } else if state == "DONE" {
                                            let output = su.get("tool_info")
                                                .and_then(|ti| ti.get("output"))
                                                .and_then(|o| o.as_str())
                                                .unwrap_or("")
                                                .to_string();
                                            let result = super::protocol::ToolResult {
                                                call_id,
                                                output,
                                                success: true,
                                                execution_time_ms: su.get("duration_seconds").and_then(|d| d.as_f64()).map(|d| (d * 1000.0) as u64).unwrap_or(10),
                                            };
                                            let _ = app_clone.emit("acp-event", AgentEvent::ToolFinished { result });
                                        }
                                    }
                                }
                                // 2. Check for agy result event
                                else if val.get("event").and_then(|e| e.as_str()) == Some("result") {
                                    if let Some(res) = val.get("result").and_then(|r| r.as_str()) {
                                        let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: res.to_string() });
                                    }
                                    let _ = app_clone.emit("acp-event", AgentEvent::StreamFinished {});
                                }
                                // 3. Check for claude assistant content blocks
                                else if val.get("type").and_then(|t| t.as_str()) == Some("assistant") {
                                    if let Some(content_arr) = val.get("message").and_then(|m| m.get("content")).and_then(|c| c.as_array()) {
                                        for item in content_arr {
                                            if let Some(text) = item.get("text").and_then(|t| t.as_str()) {
                                                let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: text.to_string() });
                                            }
                                        }
                                    }
                                }
                                // 4. Check for claude result event
                                else if val.get("type").and_then(|t| t.as_str()) == Some("result") {
                                    if let Some(res_str) = val.get("result").and_then(|r| r.as_str()) {
                                        let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: res_str.to_string() });
                                    }
                                    let _ = app_clone.emit("acp-event", AgentEvent::StreamFinished {});
                                }
                                // 5. Check for JSON-RPC result
                                else if let Some(res) = val.get("result") {
                                    if let Some(text) = res.as_str() {
                                        let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: text.to_string() });
                                    } else {
                                        let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: res.to_string() });
                                    }
                                    let _ = app_clone.emit("acp-event", AgentEvent::StreamFinished {});
                                }
                                // 6. Fallback delta/text
                                else if let Some(text) = val.get("text").or_else(|| val.get("delta")).and_then(|t| t.as_str()) {
                                    let _ = app_clone.emit("acp-event", AgentEvent::TokenChunk { text: text.to_string() });
                                }
                            } else {
                                // Raw stream text
                                let _ = app_clone.emit(
                                    "acp-event",
                                    AgentEvent::TokenChunk {
                                        text: line + "\n",
                                    },
                                );
                            }
                        }
                        let _ = app_clone.emit("acp-event", AgentEvent::StreamFinished {});
                    });
                }

                // Spawn stderr reader task for telemetry/reasoning logs
                if let Some(stderr) = stderr {
                    let app_clone = app.clone();
                    tokio::spawn(async move {
                        let mut reader = BufReader::new(stderr).lines();
                        while let Ok(Some(line)) = reader.next_line().await {
                            let _ = app_clone.emit(
                                "acp-event",
                                AgentEvent::ReasoningChunk {
                                    thought: line,
                                    timestamp: chrono::Utc::now().to_rfc3339(),
                                },
                            );
                        }
                    });
                }

                let session = AcpProcessSession {
                    provider: provider.clone(),
                    stdin,
                    is_alive: true,
                    workspace_path: Some(working_dir_str.clone()),
                };

                let mut lock = self.sessions.lock().await;
                lock.insert(session_id.clone(), session);

                let _ = self.app_handle.emit(
                    "acp-event",
                    AgentEvent::StatusChanged {
                        status: format!("connected to workspace: {} ({})", working_dir_str, exe_path.display()),
                        provider,
                    },
                );

                Ok(session_id)
            }
            Err(err) => {
                Err(format!("Failed to spawn AI ACP CLI at {:?}: {}", exe_path, err))
            }
        }
    }

    pub async fn send_json_rpc(
        &self,
        session_id: &str,
        request: JsonRpcRequest,
    ) -> Result<(), String> {
        let mut lock = self.sessions.lock().await;
        if let Some(session) = lock.get_mut(session_id) {
            if let Some(ref mut stdin) = session.stdin {
                let prompt = request
                    .params
                    .as_ref()
                    .and_then(|p| p.get("prompt"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("");

                let line = match session.provider {
                    AcpProviderId::Antigravity => {
                        serde_json::json!({
                            "event": "user",
                            "message": {
                                "role": "user",
                                "content": prompt
                            }
                        })
                        .to_string()
                    }
                    AcpProviderId::Claude => {
                        serde_json::json!({
                            "type": "user",
                            "message": {
                                "role": "user",
                                "content": prompt
                            }
                        })
                        .to_string()
                    }
                    _ => {
                        serde_json::json!({
                            "type": "user",
                            "message": {
                                "role": "user",
                                "content": prompt
                            }
                        })
                        .to_string()
                    }
                };

                stdin
                    .write_all(format!("{}\n", line).as_bytes())
                    .await
                    .map_err(|e| format!("Failed to write to stdin: {}", e))?;
                stdin
                    .flush()
                    .await
                    .map_err(|e| format!("Failed to flush stdin: {}", e))?;
                Ok(())
            } else {
                Err("Session stdin is not open".to_string())
            }
        } else {
            Err("Session not found".to_string())
        }
    }

    pub async fn terminate_session(&self, session_id: &str) -> Result<(), String> {
        let mut lock = self.sessions.lock().await;
        if let Some(mut session) = lock.remove(session_id) {
            session.is_alive = false;
            let _ = self.app_handle.emit(
                "acp-event",
                AgentEvent::StatusChanged {
                    status: "disconnected".to_string(),
                    provider: session.provider,
                },
            );
            Ok(())
        } else {
            Err("Session not found".to_string())
        }
    }
}
