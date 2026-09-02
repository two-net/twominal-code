use crate::acp::protocol::{AcpProviderId, ProviderInfo};

pub struct GrokProvider;

impl GrokProvider {
    pub fn info(is_available: bool) -> ProviderInfo {
        ProviderInfo {
            id: AcpProviderId::Grok,
            name: "xAI Grok".to_string(),
            description: "xAI Grok Agent Stdio bridge with fast reasoning and tool calling.".to_string(),
            command: "grok agent stdio".to_string(),
            is_available,
            status: if is_available { "Ready" } else { "CLI Bridge Mode" }.to_string(),
            capabilities: vec![
                "streaming_tokens".to_string(),
                "realtime_search".to_string(),
                "fast_reasoning".to_string(),
                "tool_execution".to_string(),
            ],
        }
    }
}
