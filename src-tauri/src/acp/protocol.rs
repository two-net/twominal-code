use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AcpProviderId {
    Antigravity,
    Claude,
    Codex,
    Grok,
}

impl AcpProviderId {
    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Antigravity => "Google Antigravity (agy)",
            Self::Claude => "Claude Code (ACP)",
            Self::Codex => "OpenAI Codex",
            Self::Grok => "xAI Grok",
        }
    }

    pub fn default_command(&self) -> &'static str {
        match self {
            Self::Antigravity => "agy",
            Self::Claude => "claude",
            Self::Codex => "codex",
            Self::Grok => "grok",
        }
    }

    pub fn default_args(&self) -> Vec<&'static str> {
        match self {
            Self::Antigravity => vec!["--input-format=stream-json", "--output-format=stream-json"],
            Self::Claude => vec!["-p", "--verbose", "--input-format=stream-json", "--output-format=stream-json"],
            Self::Codex => vec!["--no-alt-screen"],
            Self::Grok => vec!["agent", "--output-format=streaming-json"],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderInfo {
    pub id: AcpProviderId,
    pub name: String,
    pub description: String,
    pub command: String,
    pub is_available: bool,
    pub status: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub id: Option<Value>,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub id: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<JsonRpcError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i64,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Pending,
    InProgress,
    AwaitingApproval,
    Completed,
    Failed,
    Skipped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInvocation {
    pub call_id: String,
    pub tool_name: String,
    pub arguments: Value,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    pub call_id: String,
    pub output: String,
    pub success: bool,
    pub execution_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDiff {
    pub file_path: String,
    pub old_content: String,
    pub new_content: String,
    pub patch: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecTask {
    pub id: String,
    pub description: String,
    pub status: TaskStatus,
    pub requires_approval: bool,
    pub tool_call: Option<ToolInvocation>,
    pub tool_result: Option<ToolResult>,
    pub diff: Option<FileDiff>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SpecStatus {
    Drafting,
    Ready,
    Running,
    PausedForApproval,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KryptonSpec {
    pub id: String,
    pub provider: AcpProviderId,
    pub title: String,
    pub description: String,
    pub architecture_summary: String,
    pub design_decisions: Vec<String>,
    pub tasks: Vec<SpecTask>,
    pub status: SpecStatus,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum AgentEvent {
    TokenChunk {
        text: String,
    },
    ReasoningChunk {
        thought: String,
        timestamp: String,
    },
    ToolStarted {
        invocation: ToolInvocation,
    },
    ToolFinished {
        result: ToolResult,
    },
    CheckpointRequested {
        checkpoint_id: String,
        spec_id: String,
        task_id: String,
        description: String,
        diff: Option<FileDiff>,
    },
    DiffGenerated {
        diff: FileDiff,
    },
    SpecUpdated {
        spec: KryptonSpec,
    },
    StatusChanged {
        status: String,
        provider: AcpProviderId,
    },
    StreamFinished {},
    Error {
        message: String,
    },
}
