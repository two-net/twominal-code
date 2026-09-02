pub mod acp;
pub mod extensions;
pub mod workspace;

use acp::AcpState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .register_uri_scheme_protocol("ext", |_app, request| {
            let host = request.uri().host().unwrap_or("");
            let path = request.uri().path();
            let file_path = extensions::registry::OpenVsxRegistry::get_storage_dir()
                .join(host)
                .join(path.trim_start_matches('/'));
            if let Ok(data) = std::fs::read(&file_path) {
                let mime = if path.ends_with(".gif") {
                    "image/gif"
                } else if path.ends_with(".png") {
                    "image/png"
                } else if path.ends_with(".svg") {
                    "image/svg+xml"
                } else if path.ends_with(".css") {
                    "text/css"
                } else if path.ends_with(".js") {
                    "application/javascript"
                } else {
                    "application/octet-stream"
                };
                tauri::http::Response::builder()
                    .header("Content-Type", mime)
                    .header("Access-Control-Allow-Origin", "*")
                    .body(data)
                    .unwrap()
            } else {
                tauri::http::Response::builder()
                    .status(404)
                    .body(Vec::new())
                    .unwrap()
            }
        })
        .setup(|app| {
            let handle = app.handle().clone();
            app.manage(AcpState::new(handle));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // ACP Commands
            acp::acp_list_providers,
            acp::acp_start_session,
            acp::acp_terminate_session,
            acp::acp_send_prompt,
            acp::krypton_generate_spec,
            acp::krypton_run_spec,
            acp::krypton_approve_checkpoint,
            acp::krypton_reject_checkpoint,
            // Workspace Commands
            workspace::workspace_get_info,
            workspace::workspace_git_diff,
            workspace::workspace_get_file_diff,
            workspace::workspace_git_stage,
            workspace::workspace_git_unstage,
            workspace::workspace_git_discard,
            workspace::workspace_git_commit,
            workspace::workspace_read_tree,
            workspace::workspace_read_file,
            workspace::workspace_write_file,
            workspace::workspace_create_entry,
            workspace::workspace_delete_entry,
            // In-App Extension Commands
            extensions::extensions_get_installed,
            extensions::extensions_install,
            extensions::extensions_uninstall,
            extensions::extensions_search,
            extensions::extensions_get_popular,
            extensions::extensions_get_asset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Twominal Code application");
}
