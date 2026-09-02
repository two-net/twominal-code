pub mod manifest;
pub mod registry;

use self::manifest::ExtensionItem;
use self::registry::OpenVsxRegistry;

#[tauri::command]
pub async fn extensions_get_installed() -> Result<Vec<ExtensionItem>, String> {
    Ok(OpenVsxRegistry::get_installed())
}

#[tauri::command]
pub async fn extensions_install(
    extension_id: String,
    download_url: Option<String>,
) -> Result<ExtensionItem, String> {
    OpenVsxRegistry::install(&extension_id, download_url.as_deref()).await
}

#[tauri::command]
pub async fn extensions_uninstall(extension_id: String) -> Result<(), String> {
    OpenVsxRegistry::uninstall(&extension_id)
}

#[tauri::command]
pub async fn extensions_search(query: String) -> Result<Vec<ExtensionItem>, String> {
    Ok(OpenVsxRegistry::search(&query).await)
}

#[tauri::command]
pub async fn extensions_get_popular() -> Result<Vec<ExtensionItem>, String> {
    Ok(OpenVsxRegistry::search("").await)
}

#[tauri::command]
pub async fn extensions_get_asset(
    extension_id: String,
    relative_path: String,
) -> Result<String, String> {
    let file_path = OpenVsxRegistry::get_storage_dir()
        .join(&extension_id)
        .join(relative_path.trim_start_matches('/'));
    if !file_path.is_file() {
        return Err(format!("Asset not found at: {:?}", file_path));
    }
    let bytes = std::fs::read(&file_path).map_err(|e| e.to_string())?;
    let mime = if relative_path.ends_with(".gif") {
        "image/gif"
    } else if relative_path.ends_with(".png") {
        "image/png"
    } else if relative_path.ends_with(".svg") {
        "image/svg+xml"
    } else if relative_path.ends_with(".css") {
        "text/css"
    } else if relative_path.ends_with(".js") {
        "application/javascript"
    } else {
        "application/octet-stream"
    };
    use base64::engine::general_purpose::STANDARD;
    use base64::Engine;
    Ok(format!("data:{};base64,{}", mime, STANDARD.encode(&bytes)))
}

