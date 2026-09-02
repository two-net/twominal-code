export type AcpProviderId = 'antigravity' | 'claude' | 'codex' | 'grok';

export type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh';

export interface ProviderModel {
  id: string;
  name: string;
  badge?: string;
  description?: string;
}

export const PROVIDER_MODELS: Record<AcpProviderId, ProviderModel[]> = {
  antigravity: [
    { id: 'gemini-3.7-flash-high', name: 'Gemini 3.7 Flash', badge: 'High Reasoning', description: 'Deep reasoning' },
    { id: 'gemini-3.7-flash-medium', name: 'Gemini 3.7 Flash', badge: 'Medium', description: 'Balanced reasoning' },
    { id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro', badge: 'Pro', description: 'High capability model' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', badge: 'Recommended', description: 'Advanced agentic coding' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', badge: 'Fast', description: 'Ultra-low latency' },
  ],
  claude: [
    { id: 'claude-opus-5', name: 'Claude Opus 5', badge: '1M Context', description: 'Flagship frontier intelligence' },
    { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', badge: 'Recommended', description: 'Optimal speed & intelligence' },
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', badge: 'Thinking', description: 'Hybrid reasoning' },
    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', badge: 'Fast', description: 'Lightweight & instant' },
  ],
  codex: [
    { id: 'gpt-5.5', name: 'GPT-5.5', badge: 'Flagship', description: 'Frontier reasoning & code architecture' },
    { id: 'gpt-5.4', name: 'GPT-5.4', badge: 'Recommended', description: 'Deep agentic coding model' },
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', badge: 'Fast', description: 'High-speed compact reasoning' },
    { id: 'o3', name: 'OpenAI o3', badge: 'Reasoning', description: 'Deep multi-step reasoning' },
    { id: 'o3-mini', name: 'OpenAI o3-mini', badge: 'Low Latency', description: 'Fast reasoning' },
  ],
  grok: [
    { id: 'grok-4.6', name: 'Grok 4.6', badge: 'Latest Flagship', description: 'Frontier multi-modal reasoning' },
    { id: 'grok-4.5', name: 'Grok 4.5', badge: 'Stable', description: 'High intelligence coding' },
    { id: 'grok-3', name: 'Grok 3', badge: 'Recommended', description: 'Fast agentic reasoning' },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', badge: 'Fast', description: 'Compact fast reasoning' },
  ],
};

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  syntax?: string;
  category?: 'workflow' | 'diagnostics' | 'tooling' | 'context';
}

export const PROVIDER_SLASH_COMMANDS: Record<AcpProviderId, SlashCommand[]> = {
  antigravity: [
    { command: '/goal', label: '/goal', description: 'Run a thorough, autonomous task until complete', syntax: '/goal <task description>', category: 'workflow' },
    { command: '/plan', label: '/plan', description: 'Architect multi-step implementation plan & dependencies', syntax: '/plan <feature>', category: 'workflow' },
    { command: '/spec', label: '/spec', description: 'Generate Krypton architectural spec with checkpoint gates', syntax: '/spec <objective>', category: 'workflow' },
    { command: '/grill-me', label: '/grill-me', description: 'Interactive alignment interview on architecture decisions', syntax: '/grill-me', category: 'workflow' },
    { command: '/boost', label: '/boost', description: 'Deep multi-perspective reasoning and AST verification', syntax: '/boost <prompt>', category: 'workflow' },
    { command: '/schedule', label: '/schedule', description: 'Set a background timer or recurring cron check', syntax: '/schedule <time/cron>', category: 'tooling' },
    { command: '/browser', label: '/browser', description: 'Live web navigation, DOM extraction, and search', syntax: '/browser <url/search>', category: 'tooling' },
    { command: '/teamwork-preview', label: '/teamwork-preview', description: 'Coordinate autonomous team of specialized subagents', syntax: '/teamwork-preview', category: 'workflow' },
    { command: '/learn', label: '/learn', description: 'Persist project conventions and custom rules', syntax: '/learn <instruction>', category: 'context' },
    { command: '/clear', label: '/clear', description: 'Clear conversation history and thinking logs', syntax: '/clear', category: 'context' },
  ],
  claude: [
    { command: '/compact', label: '/compact', description: 'Compact conversation context to optimize token usage', syntax: '/compact', category: 'context' },
    { command: '/cost', label: '/cost', description: 'Display session token breakdown, cache stats, and cost', syntax: '/cost', category: 'diagnostics' },
    { command: '/doctor', label: '/doctor', description: 'Run diagnostic health check on environment and tools', syntax: '/doctor', category: 'diagnostics' },
    { command: '/init', label: '/init', description: 'Initialize CLAUDE.md guidelines in active workspace', syntax: '/init', category: 'context' },
    { command: '/review', label: '/review', description: 'Multi-file code review of working tree and git diffs', syntax: '/review [branch]', category: 'workflow' },
    { command: '/pr', label: '/pr', description: 'Prepare pull request title, description, and summary', syntax: '/pr', category: 'workflow' },
    { command: '/terminal-setup', label: '/terminal-setup', description: 'Configure terminal keybindings and shell integration', syntax: '/terminal-setup', category: 'tooling' },
    { command: '/spec', label: '/spec', description: 'Run Krypton design-first architectural spec', syntax: '/spec <blueprint>', category: 'workflow' },
    { command: '/clear', label: '/clear', description: 'Clear active session and reset context', syntax: '/clear', category: 'context' },
  ],
  codex: [
    { command: '/review', label: '/review', description: 'Inspect AST diffs, detect anti-patterns and vulnerabilities', syntax: '/review', category: 'workflow' },
    { command: '/test', label: '/test', description: 'Run test suite, parse errors, and propose code fixes', syntax: '/test <command>', category: 'tooling' },
    { command: '/refactor', label: '/refactor', description: 'Structural multi-file refactoring and type alignment', syntax: '/refactor <target>', category: 'workflow' },
    { command: '/fix', label: '/fix', description: 'Diagnose compiler errors and apply AST patches', syntax: '/fix <error message>', category: 'workflow' },
    { command: '/explain', label: '/explain', description: 'Detailed architecture walkthrough and symbol call graphs', syntax: '/explain', category: 'workflow' },
    { command: '/spec', label: '/spec', description: 'Generate design blueprint and task checkpoints', syntax: '/spec <feature>', category: 'workflow' },
    { command: '/clear', label: '/clear', description: 'Reset Codex conversation buffer', syntax: '/clear', category: 'context' },
  ],
  grok: [
    { command: '/deepsearch', label: '/deepsearch', description: 'Combine codebase symbols with real-time web telemetry', syntax: '/deepsearch <query>', category: 'tooling' },
    { command: '/think', label: '/think', description: 'Extended mathematical reasoning and logic verification', syntax: '/think <problem>', category: 'workflow' },
    { command: '/audit', label: '/audit', description: 'Security audit for memory safety and business invariants', syntax: '/audit', category: 'diagnostics' },
    { command: '/bench', label: '/bench', description: 'Generate benchmark harnesses and profile throughput', syntax: '/bench <target>', category: 'tooling' },
    { command: '/spec', label: '/spec', description: 'Create Krypton design spec before execution', syntax: '/spec <task>', category: 'workflow' },
    { command: '/clear', label: '/clear', description: 'Clear Grok context buffer', syntax: '/clear', category: 'context' },
  ],
};

export interface ProviderInfo {
  id: AcpProviderId;
  name: string;
  description: string;
  command: string;
  is_available: boolean;
  status: string;
  capabilities: string[];
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface ToolInvocation {
  call_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  timestamp: string;
}

export interface ToolResult {
  call_id: string;
  output: string;
  success: boolean;
  execution_time_ms: number;
}

export interface FileDiff {
  file_path: string;
  old_content: string;
  new_content: string;
  patch: string;
}

export interface CheckpointData {
  checkpoint_id: string;
  spec_id: string;
  task_id: string;
  description: string;
  diff?: FileDiff;
}

export interface SpecTask {
  id: string;
  description: string;
  status: TaskStatus;
  requires_approval: boolean;
  tool_call?: ToolInvocation;
  tool_result?: ToolResult;
  diff?: FileDiff;
}

export type SpecStatus =
  | 'drafting'
  | 'ready'
  | 'running'
  | 'paused_for_approval'
  | 'completed'
  | 'failed';

export interface KryptonSpec {
  id: string;
  provider: AcpProviderId;
  title: string;
  description: string;
  architecture_summary: string;
  design_decisions: string[];
  tasks: SpecTask[];
  status: SpecStatus;
  created_at: string;
  updated_at: string;
}

export type AgentEvent =
  | { type: 'TokenChunk'; payload: { text: string } }
  | { type: 'ReasoningChunk'; payload: { thought: string; timestamp: string } }
  | { type: 'ToolStarted'; payload: { invocation: ToolInvocation } }
  | { type: 'ToolFinished'; payload: { result: ToolResult } }
  | {
      type: 'CheckpointRequested';
      payload: {
        checkpoint_id: string;
        spec_id: string;
        task_id: string;
        description: string;
        diff?: FileDiff;
      };
    }
  | { type: 'DiffGenerated'; payload: { diff: FileDiff } }
  | { type: 'SpecUpdated'; payload: { spec: KryptonSpec } }
  | { type: 'StatusChanged'; payload: { status: string; provider: AcpProviderId } }
  | { type: 'StreamFinished'; payload: Record<string, never> }
  | { type: 'Error'; payload: { message: string } };
