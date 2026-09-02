import React, { useState } from 'react';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { ProviderSelector } from './ProviderSelector';
import { ReasoningStream } from './ReasoningStream';
import { ToolExecLog } from './ToolExecLog';

export const AgentChat: React.FC = () => {
  const {
    chatMessages,
    sendMessage,
    generateSpec,
    clearHistory,
    isStreaming,
  } = useAgent();

  const [inputPrompt, setInputPrompt] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isStreaming) return;
    const prompt = inputPrompt.trim();
    setInputPrompt('');
    await sendMessage(prompt);
  };

  const handleSpecMode = async () => {
    if (!inputPrompt.trim() || isStreaming) return;
    const prompt = inputPrompt.trim();
    setInputPrompt('');
    await generateSpec(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#080b12] select-text">
      {/* Top Provider Selector */}
      <ProviderSelector />

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-1 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
              <span className="font-bold capitalize">
                {msg.sender === 'user' ? 'You' : msg.sender === 'system' ? 'System' : 'ACP Agent'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-2.5 rounded-lg max-w-[90%] leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-200'
                  : msg.sender === 'system'
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px]'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              {msg.text}

              {/* Embedded Spec Card if message created a spec */}
              {msg.spec && (
                <div className="mt-2 p-2 rounded bg-[#06080e] border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.spec.title}</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {msg.spec.tasks.length} task milestones ready.
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Reasoning & Tool Logs */}
      <ReasoningStream />
      <ToolExecLog />

      {/* Input Prompt Box */}
      <form
        onSubmit={handleSend}
        className="p-2 border-t border-slate-800 bg-[#090d16] flex flex-col space-y-1.5"
      >
        <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSpecMode}
              disabled={isStreaming || !inputPrompt.trim()}
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-40 font-bold"
            >
              <Sparkles className="w-3 h-3" />
              <span>Spec Plan ↵</span>
            </button>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            className="text-slate-500 hover:text-rose-400 transition-colors"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <div className="relative flex items-center">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask agent or prompt architecture spec... (⌘↵ to send)"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 pr-9 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 resize-none"
          />
          <button
            type="submit"
            disabled={isStreaming || !inputPrompt.trim()}
            className="absolute right-2 p-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-all font-bold"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
};
