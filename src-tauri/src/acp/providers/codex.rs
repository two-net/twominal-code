use crate::acp::protocol::{AcpProviderId, ProviderInfo};

pub struct CodexProvider;

impl CodexProvider {
    pub fn info(is_available: bool) -> ProviderInfo {
        ProviderInfo {
            id: AcpProviderId::Codex,
            name: "OpenAI Codex".to_string(),
            description: "OpenAI Codex Agent Server with stdio JSON-RPC interface.".to_string(),
            command: "codex-acp serve --stdio".to_string(),
            is_available,
            status: if is_available { "Ready" } else { "CLI Bridge Mode" }.to_string(),
            capabilities: vec![
                "streaming_tokens".to_string(),
                "ast_code_generation".to_string(),
                "multi_file_editing".to_string(),
                "terminal_execution".to_string(),
            ],
        }
    }
}
