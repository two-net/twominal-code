import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  GitCompare,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { SpecTask, TaskStatus } from '../../types/acp';

export const SpecRunner: React.FC = () => {
  const { activeSpec, runSpec, setActiveDiff, isStreaming } = useAgent();

  if (!activeSpec) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full font-mono text-slate-500 text-xs">
        <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
        <div className="font-semibold text-slate-400 mb-1">No Active Krypton Spec</div>
        <p className="text-[11px] max-w-xs">
          Generate an architectural specification via the AI chat or Command Palette (⌘K) to start a design-first workflow.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>DONE</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center space-x-1 text-cyan-400 text-[10px] font-semibold animate-pulse">
            <Clock className="w-3 h-3" />
            <span>RUNNING</span>
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="flex items-center space-x-1 text-amber-400 text-[10px] font-bold">
            <AlertCircle className="w-3 h-3" />
            <span>CHECKPOINT</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 text-rose-400 text-[10px] font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return <span className="text-slate-500 text-[10px]">PENDING</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080b12] font-mono text-xs overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-[#0a0e17]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KRYPTON SPECIFICATION</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
            {activeSpec.status}
          </span>
        </div>
        <h3 className="font-semibold text-slate-200 text-xs mb-1">{activeSpec.title}</h3>
        <p className="text-[11px] text-slate-400 leading-normal">{activeSpec.description}</p>
      </div>

      {/* Design Decisions */}
      <div className="p-3 border-b border-slate-800 space-y-1 bg-slate-950/40">
        <div className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
          Design Decisions
        </div>
        {activeSpec.design_decisions.map((dec, idx) => (
          <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-300">
            <span className="text-cyan-500 font-bold">•</span>
            <span>{dec}</span>
          </div>
        ))}
      </div>

      {/* Task Milestones Checklist */}
      <div className="p-3 flex-1 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
          Execution Milestones
        </div>

        {activeSpec.tasks.map((task: SpecTask, idx: number) => (
          <div
            key={task.id}
            className={`p-2.5 rounded-lg border transition-all ${
              task.status === 'awaiting_approval'
                ? 'bg-amber-950/20 border-amber-500/40 cyber-glow-amber'
                : task.status === 'completed'
                ? 'bg-slate-900/60 border-emerald-500/30'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[10px]">Phase {idx + 1}</span>
              {getStatusBadge(task.status)}
            </div>

            <div className="text-slate-200 text-xs mb-2 font-medium">
              {task.description}
            </div>

            {/* Checkpoint Diff trigger */}
            {task.diff && (
              <button
                onClick={() => setActiveDiff(task.diff || null)}
                className="w-full flex items-center justify-center space-x-1.5 py-1 px-2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-all text-[11px] font-semibold"
              >
                <GitCompare className="w-3 h-3" />
                <span>Review Checkpoint Diff</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Run Spec Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#0a0e17]">
        <button
          onClick={() => runSpec(activeSpec.id)}
          disabled={isStreaming || activeSpec.status === 'running'}
          className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Spec Workflows</span>
        </button>
      </div>
    </div>
  );
};
