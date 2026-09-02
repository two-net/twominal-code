pub mod agy;
pub mod claude;
pub mod codex;
pub mod grok;

use crate::acp::protocol::{AcpProviderId, ProviderInfo};
use crate::acp::process::AcpProcessManager;

pub struct ProviderRegistry;

impl ProviderRegistry {
    pub async fn get_all_providers() -> Vec<ProviderInfo> {
        let claude_avail = AcpProcessManager::check_binary_available(&AcpProviderId::Claude).await;
        let agy_avail = AcpProcessManager::check_binary_available(&AcpProviderId::Antigravity).await;
        let codex_avail = AcpProcessManager::check_binary_available(&AcpProviderId::Codex).await;
        let grok_avail = AcpProcessManager::check_binary_available(&AcpProviderId::Grok).await;

        vec![
            agy::AntigravityProvider::info(agy_avail),
            claude::ClaudeProvider::info(claude_avail),
            codex::CodexProvider::info(codex_avail),
            grok::GrokProvider::info(grok_avail),
        ]
    }
}
