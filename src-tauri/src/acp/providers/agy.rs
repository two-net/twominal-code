use crate::acp::protocol::{AcpProviderId, ProviderInfo};

pub struct AntigravityProvider;

impl AntigravityProvider {
    pub fn info(is_available: bool) -> ProviderInfo {
        ProviderInfo {
            id: AcpProviderId::Antigravity,
            name: "Google Antigravity (agy)".to_string(),
            description: "DeepMind Antigravity Advanced Agentic Coding CLI ACP bridge.".to_string(),
            command: "agy acp stdio".to_string(),
            is_available,
            status: if is_available { "Ready" } else { "CLI Bridge Mode" }.to_string(),
            capabilities: vec![
                "streaming_tokens".to_string(),
                "deep_reasoning".to_string(),
                "subagent_orchestration".to_string(),
                "artifact_generation".to_string(),
                "design_checkpoints".to_string(),
            ],
        }
    }
}
