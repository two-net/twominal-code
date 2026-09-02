pub mod krypton_spec;
pub mod process;
pub mod protocol;
pub mod providers;

use std::sync::Arc;
use tauri::{AppHandle, State};

use self::krypton_spec::KryptonSpecEngine;
use self::process::AcpProcessManager;
use self::protocol::{AcpProviderId, JsonRpcRequest, KryptonSpec, ProviderInfo};

pub struct AcpState {
    pub process_mgr: Arc<AcpProcessManager>,
    pub spec_engine: Arc<KryptonSpecEngine>,
}

impl AcpState {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            process_mgr: Arc::new(AcpProcessManager::new(app_handle.clone())),
            spec_engine: Arc::new(KryptonSpecEngine::new(app_handle)),
        }
    }
}

#[tauri::command]
pub async fn acp_list_providers() -> Result<Vec<ProviderInfo>, String> {
    Ok(providers::ProviderRegistry::get_all_providers().await)
}

#[tauri::command]
pub async fn acp_start_session(
    state: State<'_, AcpState>,
    provider: AcpProviderId,
    custom_cmd: Option<String>,
    custom_args: Option<Vec<String>>,
    workspace_path: Option<String>,
) -> Result<String, String> {
    state
        .process_mgr
        .start_session(provider, custom_cmd, custom_args, workspace_path)
        .await
}

#[tauri::command]
pub async fn acp_terminate_session(
    state: State<'_, AcpState>,
    session_id: String,
) -> Result<(), String> {
    state.process_mgr.terminate_session(&session_id).await
}

#[tauri::command]
pub async fn acp_send_prompt(
    state: State<'_, AcpState>,
    session_id: String,
    prompt: String,
) -> Result<(), String> {
    let request = JsonRpcRequest {
        jsonrpc: "2.0".to_string(),
        id: Some(serde_json::json!(uuid::Uuid::new_v4().to_string())),
        method: "agent/prompt".to_string(),
        params: Some(serde_json::json!({ "prompt": prompt })),
    };
    state.process_mgr.send_json_rpc(&session_id, request).await
}

#[tauri::command]
pub async fn krypton_generate_spec(
    state: State<'_, AcpState>,
    provider: AcpProviderId,
    prompt: String,
    workspace_path: Option<String>,
) -> Result<KryptonSpec, String> {
    state.spec_engine.generate_spec(provider, &prompt, workspace_path.as_deref()).await
}

#[tauri::command]
pub async fn krypton_run_spec(
    state: State<'_, AcpState>,
    spec_id: String,
    workspace_path: Option<String>,
) -> Result<(), String> {
    state.spec_engine.run_spec(&spec_id, workspace_path.as_deref()).await
}

#[tauri::command]
pub async fn krypton_approve_checkpoint(
    state: State<'_, AcpState>,
    checkpoint_id: String,
) -> Result<(), String> {
    state.spec_engine.approve_checkpoint(&checkpoint_id).await
}

#[tauri::command]
pub async fn krypton_reject_checkpoint(
    state: State<'_, AcpState>,
    checkpoint_id: String,
    reason: String,
) -> Result<(), String> {
    state.spec_engine.reject_checkpoint(&checkpoint_id, &reason).await
}
