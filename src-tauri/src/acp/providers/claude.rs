use crate::acp::protocol::{AcpProviderId, ProviderInfo};

pub struct ClaudeProvider;

impl ClaudeProvider {
    pub fn info(is_available: bool) -> ProviderInfo {
        ProviderInfo {
            id: AcpProviderId::Claude,
            name: "Claude Code (ACP)".to_string(),
            description: "Anthropic Claude Code CLI with Agent Client Protocol JSON-RPC bridge.".to_string(),
            command: "claude --acp".to_string(),
            is_available,
            status: if is_available { "Ready" } else { "CLI Bridge Mode" }.to_string(),
            capabilities: vec![
                "streaming_tokens".to_string(),
                "reasoning_tokens".to_string(),
                "tool_execution".to_string(),
                "diff_generation".to_string(),
                "spec_workflows".to_string(),
            ],
        }
    }
}
