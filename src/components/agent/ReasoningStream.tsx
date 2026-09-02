import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export const ReasoningStream: React.FC = () => {
  const { reasoningLogs } = useAgent();
  const [isOpen, setIsOpen] = useState(true);

  if (reasoningLogs.length === 0) return null;

  return (
    <div className="border-t border-slate-800 bg-[#06080e] font-mono text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 cursor-pointer hover:bg-slate-800/80 transition-colors select-none text-slate-300"
      >
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <Brain className="w-3.5 h-3.5" />
          <span>REASONING TRACE ({reasoningLogs.length})</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        )}
      </div>

      {isOpen && (
        <div className="max-h-40 overflow-y-auto p-2 space-y-1.5 text-[11px]">
          {reasoningLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-2 rounded bg-slate-950/70 border border-slate-800 text-slate-300 flex flex-col space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="text-cyan-400 font-bold">Step {idx + 1}</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </span>
              </div>
              <div className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {log.thought}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
