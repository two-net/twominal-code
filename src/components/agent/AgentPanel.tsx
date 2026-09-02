import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  CheckCircle2,
  Send,
  Terminal,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Cpu,
  Gauge,
  Check,
  Command,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AcpProviderId, PROVIDER_SLASH_COMMANDS, ReasoningEffort, SlashCommand } from '../../types/acp';

export const AgentPanel: React.FC = () => {
  const {
    activeProvider,
    setProvider,
    selectedModel,
    setModel,
    availableModels,
    reasoningEffort,
    setReasoningEffort,
    chatMessages,
    sendMessage,
    isStreaming,
    reasoningLogs,
    toolExecutions,
    kryptonDesignFirst,
    setKryptonDesignFirst,
    clearHistory,
  } = useAgent();
  const { isAiPanelOpen, toggleAiPanel, workspacePath, fileTree } = useWorkspace();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const providerSlashCommands = PROVIDER_SLASH_COMMANDS[activeProvider] || [];
  const filteredSlashCommands = inputPrompt.startsWith('/')
    ? providerSlashCommands.filter((sc) =>
        sc.command.toLowerCase().includes(inputPrompt.split(' ')[0].toLowerCase()) ||
        sc.description.toLowerCase().includes(inputPrompt.slice(1).toLowerCase())
      )
    : [];

  useEffect(() => {
    if (inputPrompt.startsWith('/') && !inputPrompt.includes(' ') && filteredSlashCommands.length > 0) {
      setSlashMenuOpen(true);
      setSelectedSlashIndex(0);
    } else {
      setSlashMenuOpen(false);
    }
  }, [inputPrompt]);

  if (!isAiPanelOpen) {
    return <aside id="agent-panel" className="w-0 overflow-hidden bg-[#0d1017] border-l border-[#1f2433] transition-all duration-200" />;
  }

  const providers: { id: AcpProviderId; label: string }[] = [
    { id: 'antigravity', label: 'Antigravity' },
    { id: 'claude', label: 'Claude' },
    { id: 'codex', label: 'Codex' },
    { id: 'grok', label: 'Grok' },
  ];

  const effortLevels: ReasoningEffort[] = ['low', 'medium', 'high', 'xhigh'];
  const effortLabels: Record<ReasoningEffort, { label: string; color: string; desc: string }> = {
    low: { label: 'Low', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40', desc: 'Fastest turnarounds, concise outputs' },
    medium: { label: 'Med', color: 'text-sky-400 bg-sky-950/60 border-sky-500/40', desc: 'Balanced reasoning effort' },
    high: { label: 'High', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40', desc: 'Deep multi-turn AST reasoning' },
    xhigh: { label: 'Max', color: 'text-purple-400 bg-purple-950/60 border-purple-500/40', desc: 'Exhaustive verification & planning' },
  };

  const currentEffortIndex = effortLevels.indexOf(reasoningEffort);
  const activeModelObj = availableModels.find((m) => m.id === selectedModel);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isStreaming) return;
    const prompt = inputPrompt.trim();
    setInputPrompt('');
    setSlashMenuOpen(false);

    if (prompt === '/clear') {
      clearHistory();
      return;
    }

    await sendMessage(prompt);
  };

  const applySlashCommand = (cmd: SlashCommand) => {
    if (cmd.command === '/clear') {
      clearHistory();
      setInputPrompt('');
      setSlashMenuOpen(false);
      return;
    }
    const nextText = cmd.syntax && cmd.syntax.includes('<') ? `${cmd.command} ` : cmd.command;
    setInputPrompt(nextText);
    setSlashMenuOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSlashClick = (cmd: string) => {
    if (cmd === '/clear') {
      clearHistory();
      return;
    }
    setInputPrompt(cmd.endsWith(' ') ? cmd : `${cmd} `);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <aside
      id="agent-panel"
      className="w-96 bg-[#0d1017] border-l border-[#1f2433] flex flex-col justify-between text-xs font-sans select-none z-10 shrink-0 transition-all duration-200"
    >
      {/* Agent Panel Header */}
      <div className="h-9 px-3 border-b border-[#1f2433] flex items-center justify-between text-slate-300 font-semibold">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ACP Multi-Agent Hub</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Krypton Spec Mode toggle */}
          <button
            onClick={() => setKryptonDesignFirst(!kryptonDesignFirst)}
            id="krypton-mode-toggle"
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
              kryptonDesignFirst
                ? 'bg-purple-950/80 border border-purple-500/50 text-purple-300'
                : 'bg-slate-800 border border-slate-700 text-slate-500'
            }`}
            title="Toggle Krypton Design-First Spec Mode"
          >
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>{kryptonDesignFirst ? 'SPEC ON' : 'SPEC OFF'}</span>
          </button>

          <button
            onClick={toggleAiPanel}
            className="p-1 hover:text-white cursor-pointer"
            title="Collapse Agent Panel"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Provider Switcher & Expandable Model/Effort Configuration */}
      <div className="p-2 border-b border-[#1f2433] bg-[#0a0c12] space-y-2">
        {/* Provider Tabs */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#161a26] rounded-md font-mono text-[10px] text-center">
          {providers.map((p) => {
            const isActive = activeProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id);
                }}
                className={`py-1 rounded transition-all cursor-pointer truncate px-1 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Model & Reasoning Effort Toggle Bar */}
        <button
          onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#121622] hover:bg-[#161c2b] rounded-md border border-[#1f2638] text-[11px] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-mono text-[10px]">Model:</span>
            <span className="text-slate-100 font-mono text-[11px] font-semibold truncate">
              {activeModelObj?.name || selectedModel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-1.5 py-0.2 rounded border font-bold text-[9px] font-mono ${
                effortLabels[reasoningEffort]?.color || 'text-slate-200'
              }`}
            >
              {effortLabels[reasoningEffort]?.label || reasoningEffort}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isModelMenuOpen ? 'rotate-180 text-indigo-400' : ''
              }`}
            />
          </div>
        </button>

        {/* Expandable Model & Reasoning Effort Selection Panel */}
        {isModelMenuOpen && (
          <div className="p-2.5 bg-[#121622] rounded-md border border-[#262e42] space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Model List */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-0.5">
                Available Models
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
                {availableModels.map((m) => {
                  const isSelected = m.id === selectedModel;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModel(m.id);
                      }}
                      className={`w-full flex items-start justify-between p-1.5 rounded text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/80 border border-indigo-500/50 text-indigo-100'
                          : 'bg-[#161a26]/70 border border-transparent text-slate-300 hover:bg-[#1c2233]'
                      }`}
                    >
                      <div className="flex-1 pr-2 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold truncate">{m.name}</span>
                          {m.badge && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            {m.description}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reasoning Effort Slider */}
            <div className="pt-2 border-t border-[#1f2638] space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-1 text-slate-300">
                  <Gauge className="w-3 h-3 text-indigo-400" />
                  <span>Reasoning Effort:</span>
                </div>
                <span
                  className={`px-1.5 py-0.2 rounded border font-bold text-[9px] ${
                    effortLabels[reasoningEffort]?.color || 'text-slate-200'
                  }`}
                >
                  {effortLabels[reasoningEffort]?.label || reasoningEffort}
                </span>
              </div>

              {/* Effort Range Input */}
              <div className="relative flex flex-col gap-1 px-0.5">
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={currentEffortIndex >= 0 ? currentEffortIndex : 2}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    const nextEffort = effortLevels[idx];
                    if (nextEffort) {
                      setReasoningEffort(nextEffort);
                    }
                  }}
                  className="w-full h-1 bg-[#1a2030] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                {/* Range Ticks / Labels */}
                <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
                  <span className={currentEffortIndex === 0 ? 'text-emerald-400 font-bold' : ''}>Low</span>
                  <span className={currentEffortIndex === 1 ? 'text-sky-400 font-bold' : ''}>Med</span>
                  <span className={currentEffortIndex === 2 ? 'text-indigo-400 font-bold' : ''}>High</span>
                  <span className={currentEffortIndex === 3 ? 'text-purple-400 font-bold' : ''}>Max</span>
                </div>
              </div>

              {/* Description helper text */}
              <div className="text-[9px] text-slate-500 italic pt-0.5">
                {effortLabels[reasoningEffort]?.desc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Activity / Transcript Stream */}
      <div
        id="agent-chat-stream"
        className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs select-text"
      >
        {/* Messages */}
        {chatMessages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1">
                <span className="text-[10px] text-slate-500">You • {msg.timestamp}</span>
                <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-100 max-w-[90%] whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className="p-2 rounded bg-[#161a26] border border-slate-800 text-slate-400 text-[11px] font-sans flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          return (
            <div key={msg.id} className="p-3 rounded-lg bg-[#161a26] border border-[#262c3e] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span className="font-semibold text-indigo-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {msg.modelName || 'Claude 3.7 Sonnet (ACP)'}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{msg.text}</p>
            </div>
          );
        })}

        {/* Real-time Thought / Reasoning Block */}
        {reasoningLogs.length > 0 && (
          <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {activeProvider.toUpperCase()} Thinking ({isStreaming ? 'streaming...' : '4.2s'})
                </span>
              </span>
              <span className="text-[9px] text-purple-400/80">CoT Extended</span>
            </div>
            <p className="text-[11px] text-purple-200/80 italic">
              "{reasoningLogs[reasoningLogs.length - 1].thought}"
            </p>
          </div>
        )}

        {/* Tool Execution Log */}
        {toolExecutions.length > 0 && (
          <div className="p-2.5 rounded bg-[#10131d] border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>Tool Execution</span>
              </span>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>SUCCESS</span>
              </span>
            </div>
            <div className="text-slate-300">
              <span className="text-indigo-400">{toolExecutions[toolExecutions.length - 1].invocation.tool_name}</span>
              <span className="text-slate-500"> → </span>
              <span>{toolExecutions[toolExecutions.length - 1].result?.output || 'Target: src/acp_bridge.rs (+18 lines)'}</span>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span className="inline-block w-2 h-4 bg-indigo-400 blink-cursor" />
            <span>Generating ACP response...</span>
          </div>
        )}
      </div>

      {/* Prompt Input Area */}
      <div className="p-3 border-t border-[#1f2433] bg-[#0a0c12] space-y-2 relative">
        {/* Dynamic Provider Slash Command Quick Action Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono text-slate-400 no-scrollbar">
          {providerSlashCommands.slice(0, 5).map((sc) => (
            <button
              key={sc.command}
              onClick={() => handleSlashClick(sc.command)}
              className="px-2 py-0.5 rounded bg-[#161a26] hover:bg-indigo-950/80 hover:text-indigo-200 hover:border-indigo-500/40 border border-slate-800 transition-all cursor-pointer shrink-0"
              title={sc.description}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Floating Slash Command Autocomplete Popover */}
        {slashMenuOpen && filteredSlashCommands.length > 0 && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0f121a] border border-[#2b354d] rounded-lg shadow-2xl overflow-hidden z-30 max-h-56 overflow-y-auto font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-2.5 py-1.5 bg-[#141824] border-b border-[#1f2638] flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-indigo-300 font-bold uppercase tracking-wider">
                <Command className="w-3 h-3 text-indigo-400" />
                <span>{activeProvider.toUpperCase()} Commands</span>
              </span>
              <span>↑↓ navigate • ↵ select • esc close</span>
            </div>
            <div className="p-1 space-y-0.5">
              {filteredSlashCommands.map((sc, idx) => {
                const isSelected = idx === selectedSlashIndex;
                return (
                  <div
                    key={sc.command}
                    onClick={() => applySlashCommand(sc)}
                    onMouseEnter={() => setSelectedSlashIndex(idx)}
                    className={`flex items-start justify-between p-2 rounded-md cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/80 text-white border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-[#161a26]'
                    }`}
                  >
                    <div className="flex-1 pr-2 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-300">{sc.command}</span>
                        {sc.category && (
                          <span className="text-[9px] px-1 rounded bg-[#1c2233] text-slate-400 uppercase">
                            {sc.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {sc.description}
                      </div>
                      {sc.syntax && (
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Syntax: {sc.syntax}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSend} className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (slashMenuOpen && filteredSlashCommands.length > 0) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedSlashIndex((prev) => (prev + 1) % filteredSlashCommands.length);
                  return;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedSlashIndex((prev) =>
                    prev === 0 ? filteredSlashCommands.length - 1 : prev - 1
                  );
                  return;
                }
                if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
                  e.preventDefault();
                  applySlashCommand(filteredSlashCommands[selectedSlashIndex]);
                  return;
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setSlashMenuOpen(false);
                  return;
                }
              }

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask ${activeProvider === 'claude' ? 'Claude Code' : activeProvider === 'antigravity' ? 'Antigravity' : activeProvider === 'codex' ? 'Codex' : 'Grok'} (type / for commands)...`}
            className="w-full bg-[#161a26] border border-[#262c3e] focus:border-indigo-500 rounded-lg p-2.5 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-mono"
          />
          <button
            type="submit"
            disabled={isStreaming || !inputPrompt.trim()}
            className="absolute right-2 bottom-3 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-md cursor-pointer transition-all shadow-md"
            title="Send (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="truncate max-w-[220px] text-indigo-400/90 font-semibold" title={workspacePath}>
            📂 {fileTree?.name || (workspacePath !== '.' ? workspacePath.split('/').pop() : 'Workspace')}
          </span>
          <span className="text-slate-400">JSON-RPC 2.0 ACP</span>
        </div>
      </div>
    </aside>
  );
};
