import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AcpProviderId,
  CheckpointData,
  FileDiff,
  KryptonSpec,
  ProviderInfo,
  ProviderModel,
  PROVIDER_MODELS,
  ReasoningEffort,
  ToolInvocation,
  ToolResult,
} from '../types/acp';
import { AcpService } from '../services/acpService';
import { useWorkspace } from './WorkspaceContext';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  provider?: AcpProviderId;
  modelName?: string;
  text: string;
  timestamp: string;
  isThinking?: boolean;
  spec?: KryptonSpec;
}

interface AgentContextType {
  activeProvider: AcpProviderId;
  selectedModel: string;
  selectedModels: Record<AcpProviderId, string>;
  availableModels: ProviderModel[];
  reasoningEffort: ReasoningEffort;
  setReasoningEffort: (effort: ReasoningEffort) => Promise<void>;
  providers: ProviderInfo[];
  sessionId: string | null;
  activeSpec: KryptonSpec | null;
  specs: KryptonSpec[];
  activeDiff: FileDiff | null;
  pendingCheckpoint: CheckpointData | null;
  reasoningLogs: { thought: string; timestamp: string }[];
  toolExecutions: { invocation: ToolInvocation; result?: ToolResult }[];
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  kryptonDesignFirst: boolean;
  setKryptonDesignFirst: (val: boolean) => void;
  setProvider: (provider: AcpProviderId) => Promise<void>;
  setModel: (modelId: string) => Promise<void>;
  sendMessage: (prompt: string) => Promise<void>;
  generateSpec: (prompt: string, skipUserMsg?: boolean) => Promise<KryptonSpec>;
  runSpec: (specId: string) => Promise<void>;
  selectSpec: (specId: string) => void;
  approveCheckpoint: () => Promise<void>;
  rejectCheckpoint: (reason?: string) => Promise<void>;
  clearHistory: () => void;
  setActiveDiff: (diff: FileDiff | null) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const buildCliArgs = (
  provider: AcpProviderId,
  model: string,
  effort: ReasoningEffort
): string[] => {
  switch (provider) {
    case 'antigravity':
      return ['--model', model, '--effort', effort === 'xhigh' ? 'high' : effort];
    case 'claude':
      return ['--model', model, '--effort', effort === 'xhigh' ? 'high' : effort];
    case 'codex':
      return ['--model', model, '-c', `model_reasoning_effort="${effort}"`];
    case 'grok':
      return ['--model', model, '--reasoning-effort', effort === 'xhigh' ? 'high' : effort];
    default:
      return ['--model', model];
  }
};

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { workspacePath } = useWorkspace();
  const [activeProvider, setActiveProvider] = useState<AcpProviderId>('antigravity');
  const [reasoningEffort, setReasoningEffortState] = useState<ReasoningEffort>('high');
  const [selectedModels, setSelectedModels] = useState<Record<AcpProviderId, string>>({
    antigravity: 'gemini-3.7-flash-high',
    claude: 'claude-sonnet-5',
    codex: 'gpt-5.4',
    grok: 'grok-4.6',
  });
  const [kryptonDesignFirst, setKryptonDesignFirst] = useState<boolean>(false);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSpec, setActiveSpec] = useState<KryptonSpec | null>(null);
  const [specs, setSpecs] = useState<KryptonSpec[]>([]);
  const [activeDiff, setActiveDiff] = useState<FileDiff | null>(null);
  const [pendingCheckpoint, setPendingCheckpoint] = useState<CheckpointData | null>(null);
  const [reasoningLogs, setReasoningLogs] = useState<{ thought: string; timestamp: string }[]>([]);
  const [toolExecutions, setToolExecutions] = useState<
    { invocation: ToolInvocation; result?: ToolResult }[]
  >([]);

  const selectedModel = selectedModels[activeProvider] || PROVIDER_MODELS[activeProvider][0]?.id || 'default';
  const availableModels = PROVIDER_MODELS[activeProvider] || [];

  const getModelDisplayName = (provider: AcpProviderId, modelId: string) => {
    return PROVIDER_MODELS[provider]?.find((m) => m.id === modelId)?.name || modelId;
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      provider: 'antigravity',
      modelName: 'Gemini 3.7 Flash',
      text: "I'm connected via the standard JSON-RPC Agent Client Protocol. I can answer questions, inspect workspace files, and run multi-agent workflows.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Load providers on mount
  useEffect(() => {
    AcpService.listProviders().then((list) => {
      setProviders(list);
    });
  }, []);

  // Initialize or re-sync active ACP session when provider, model, reasoningEffort, or workspacePath changes
  useEffect(() => {
    const initModel = selectedModels[activeProvider];
    const args = buildCliArgs(activeProvider, initModel, reasoningEffort);
    AcpService.startSession(activeProvider, undefined, args, workspacePath)
      .then((sid) => setSessionId(sid))
      .catch((err) => console.error('Failed to start ACP session', err));
  }, [workspacePath]);

  // Listen to Tauri ACP Events
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    AcpService.onEvent((event) => {
      if (event.type === 'TokenChunk') {
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'agent' && !last.isThinking) {
            return [
              ...prev.slice(0, -1),
              { ...last, text: last.text + event.payload.text },
            ];
          } else {
            return [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                sender: 'agent',
                provider: activeProvider,
                modelName: getModelDisplayName(activeProvider, selectedModels[activeProvider]),
                text: event.payload.text,
                timestamp: new Date().toLocaleTimeString(),
              },
            ];
          }
        });
      } else if (event.type === 'ReasoningChunk') {
        setReasoningLogs((prev) => [...prev, event.payload]);
      } else if (event.type === 'ToolStarted') {
        setToolExecutions((prev) => [...prev, { invocation: event.payload.invocation }]);
      } else if (event.type === 'ToolFinished') {
        setToolExecutions((prev) =>
          prev.map((item) =>
            item.invocation.call_id === event.payload.result.call_id
              ? { ...item, result: event.payload.result }
              : item
          )
        );
      } else if (event.type === 'CheckpointRequested') {
        setPendingCheckpoint(event.payload);
        if (event.payload.diff) {
          setActiveDiff(event.payload.diff);
        }
      } else if (event.type === 'DiffGenerated') {
        setActiveDiff(event.payload.diff);
      } else if (event.type === 'StreamFinished') {
        setIsStreaming(false);
      } else if (event.type === 'SpecUpdated') {
        setActiveSpec(event.payload.spec);
        setSpecs((prev) => {
          const index = prev.findIndex((s) => s.id === event.payload.spec.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload.spec;
            return next;
          }
          return [...prev, event.payload.spec];
        });
      }
    }).then((unsub) => {
      unlisten = unsub;
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [activeProvider]);

  const setReasoningEffort = async (effort: ReasoningEffort) => {
    setReasoningEffortState(effort);
    if (sessionId) {
      try {
        await AcpService.terminateSession(sessionId);
      } catch (e) {
        console.warn('Could not terminate previous session', e);
      }
    }
    const currentModel = selectedModels[activeProvider] || PROVIDER_MODELS[activeProvider][0]?.id;
    const args = buildCliArgs(activeProvider, currentModel, effort);
    const newSession = await AcpService.startSession(activeProvider, undefined, args, workspacePath);
    setSessionId(newSession);

    const note: ChatMessage = {
      id: `effort-${Date.now()}`,
      sender: 'system',
      text: `Adjusted reasoning effort to ${effort.toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, note]);
  };

  const setModel = async (modelId: string) => {
    setSelectedModels((prev) => ({ ...prev, [activeProvider]: modelId }));
    if (sessionId) {
      try {
        await AcpService.terminateSession(sessionId);
      } catch (e) {
        console.warn('Could not terminate previous session', e);
      }
    }
    const args = buildCliArgs(activeProvider, modelId, reasoningEffort);
    const newSession = await AcpService.startSession(activeProvider, undefined, args, workspacePath);
    setSessionId(newSession);

    const modelName = getModelDisplayName(activeProvider, modelId);
    const note: ChatMessage = {
      id: `model-${Date.now()}`,
      sender: 'system',
      text: `Switched active model to ${modelName} (${modelId}) [Effort: ${reasoningEffort.toUpperCase()}]`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, note]);
  };

  const setProvider = async (provider: AcpProviderId) => {
    setActiveProvider(provider);
    if (sessionId) {
      try {
        await AcpService.terminateSession(sessionId);
      } catch (e) {
        console.warn('Could not terminate previous session', e);
      }
    }
    const targetModel = selectedModels[provider] || PROVIDER_MODELS[provider][0]?.id;
    const args = buildCliArgs(provider, targetModel, reasoningEffort);
    const newSession = await AcpService.startSession(provider, undefined, args, workspacePath);
    setSessionId(newSession);

    const modelName = getModelDisplayName(provider, targetModel);
    const note: ChatMessage = {
      id: `switch-${Date.now()}`,
      sender: 'system',
      text: `Switched ACP harness to ${provider.toUpperCase()} (${modelName}) [Effort: ${reasoningEffort.toUpperCase()}]`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, note]);
  };

  const generateSpec = async (prompt: string, skipUserMsg = false): Promise<KryptonSpec> => {
    setIsStreaming(true);
    if (!skipUserMsg) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: prompt,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, userMsg]);
    }

    const spec = await AcpService.generateKryptonSpec(activeProvider, prompt, workspacePath);
    setActiveSpec(spec);
    setSpecs((prev) => {
      const exists = prev.some((s) => s.id === spec.id);
      return exists ? prev.map((s) => (s.id === spec.id ? spec : s)) : [...prev, spec];
    });

    const currentModel = selectedModels[activeProvider];
    const specMsg: ChatMessage = {
      id: `spec-${Date.now()}`,
      sender: 'agent',
      provider: activeProvider,
      modelName: getModelDisplayName(activeProvider, currentModel),
      text: `Generated Krypton Architecture Blueprint: "${spec.title}"`,
      timestamp: new Date().toLocaleTimeString(),
      spec,
    };
    setChatMessages((prev) => [...prev, specMsg]);
    setIsStreaming(false);
    return spec;
  };

  const selectSpec = (specId: string) => {
    const found = specs.find((s) => s.id === specId);
    if (found) {
      setActiveSpec(found);
    }
  };

  const runSpec = async (specId: string) => {
    setIsStreaming(true);
    await AcpService.runKryptonSpec(specId, workspacePath);
  };

  const approveCheckpoint = async () => {
    if (!pendingCheckpoint) return;
    await AcpService.approveCheckpoint(pendingCheckpoint.checkpoint_id);
    setPendingCheckpoint(null);
  };

  const rejectCheckpoint = async (reason = 'User requested revision') => {
    if (!pendingCheckpoint) return;
    await AcpService.rejectCheckpoint(pendingCheckpoint.checkpoint_id, reason);
    setPendingCheckpoint(null);
  };

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    if (kryptonDesignFirst || prompt.startsWith('/spec')) {
      const cleanPrompt = prompt.replace('/spec', '').replace(':', '').trim() || prompt;
      const spec = await generateSpec(cleanPrompt, true);
      await runSpec(spec.id);
    } else {
      try {
        let activeSession = sessionId;
        if (!activeSession) {
          const currentModel = selectedModels[activeProvider];
          const args = buildCliArgs(activeProvider, currentModel, reasoningEffort);
          activeSession = await AcpService.startSession(activeProvider, undefined, args, workspacePath);
          setSessionId(activeSession);
        }
        await AcpService.sendPrompt(activeSession, prompt);
      } catch (err) {
        console.error('Failed to send ACP prompt', err);
        setIsStreaming(false);
      }
    }
  };

  const clearHistory = () => {
    setChatMessages([]);
    setReasoningLogs([]);
    setToolExecutions([]);
    setActiveSpec(null);
    setActiveDiff(null);
    setPendingCheckpoint(null);
  };

  return (
    <AgentContext.Provider
      value={{
        activeProvider,
        selectedModel,
        selectedModels,
        availableModels,
        reasoningEffort,
        setReasoningEffort,
        providers,
        sessionId,
        activeSpec,
        specs,
        activeDiff,
        pendingCheckpoint,
        reasoningLogs,
        toolExecutions,
        chatMessages,
        isStreaming,
        kryptonDesignFirst,
        setKryptonDesignFirst,
        setProvider,
        setModel,
        sendMessage,
        generateSpec,
        runSpec,
        selectSpec,
        approveCheckpoint,
        rejectCheckpoint,
        clearHistory,
        setActiveDiff,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent must be used within AgentProvider');
  return context;
};
