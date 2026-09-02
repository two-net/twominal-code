import React, { useState } from 'react';
import { Wrench, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
export const ToolExecLog: React.FC = () => {
  const { toolExecutions } = useAgent();
  const [isOpen, setIsOpen] = useState(true);

  if (toolExecutions.length === 0) return null;

  return (
    <div className="border-t border-slate-800 bg-[#06080e] font-mono text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 cursor-pointer hover:bg-slate-800/80 transition-colors select-none text-slate-300"
      >
        <div className="flex items-center space-x-2 text-amber-400 font-semibold">
          <Wrench className="w-3.5 h-3.5" />
          <span>TOOL EXECUTIONS ({toolExecutions.length})</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        )}
      </div>

      {isOpen && (
        <div className="max-h-40 overflow-y-auto p-2 space-y-1.5 text-[11px]">
          {toolExecutions.map((item, idx) => (
            <div
              key={idx}
              className="p-2 rounded bg-slate-950/70 border border-slate-800 flex flex-col space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-cyan-300 font-mono">
                    {item.invocation.tool_name}
                  </span>
                </div>
                {item.result ? (
                  item.result.success ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                      <CheckCircle className="w-3 h-3" />
                      <span>{item.result.execution_time_ms}ms</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-rose-400 text-[10px]">
                      <XCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-amber-400 animate-pulse">Running...</span>
                )}
              </div>

              {item.result && (
                <div className="text-slate-400 text-[10px] bg-slate-900/90 p-1 rounded font-mono truncate">
                  {item.result.output}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
