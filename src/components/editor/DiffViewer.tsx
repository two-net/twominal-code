import React from 'react';
import { Check, X, GitCompare, FileCode } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export const DiffViewer: React.FC = () => {
  const { activeDiff, pendingCheckpoint, approveCheckpoint, rejectCheckpoint, setActiveDiff } =
    useAgent();

  if (!activeDiff) return null;

  const oldLines = activeDiff.old_content.split('\n');
  const newLines = activeDiff.new_content.split('\n');

  const handleApprove = async () => {
    await approveCheckpoint();
    setActiveDiff(null);
  };

  const handleReject = async () => {
    await rejectCheckpoint('User declined diff review');
    setActiveDiff(null);
  };

  return (
    <div className="absolute inset-0 bg-[#080b12]/95 backdrop-blur-md flex flex-col z-40 p-4 font-mono text-xs overflow-hidden">
      {/* Diff Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-300">KRYPTON CHECKPOINT REVIEW</span>
          <span className="text-slate-600">|</span>
          <FileCode className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-200">{activeDiff.file_path}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReject}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all font-semibold"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all font-bold cyber-glow-green"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve & Apply Diff</span>
          </button>
          <button
            onClick={() => setActiveDiff(null)}
            className="p-1 rounded text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {pendingCheckpoint && (
        <div className="mb-3 p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs">
          <strong>Checkpoint Trigger:</strong> {pendingCheckpoint.description}
        </div>
      )}

      {/* Side-by-Side Diff View */}
      <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
        {/* Left: Original Buffer */}
        <div className="flex flex-col bg-[#05070a] border border-rose-500/30 rounded-lg overflow-hidden">
          <div className="bg-rose-950/40 px-3 py-1.5 text-rose-300 font-bold border-b border-rose-500/20">
            Original (Old)
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre">
            {oldLines.map((line, idx) => (
              <div key={idx} className="flex">
                <span className="w-8 text-slate-600 select-none mr-2">{idx + 1}</span>
                <span className="text-rose-300/80 bg-rose-500/10 w-full">{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: New Krypton Spec Implementation */}
        <div className="flex flex-col bg-[#05070a] border border-emerald-500/30 rounded-lg overflow-hidden">
          <div className="bg-emerald-950/40 px-3 py-1.5 text-emerald-300 font-bold border-b border-emerald-500/20">
            Proposed (New - ACP Agent)
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre">
            {newLines.map((line, idx) => (
              <div key={idx} className="flex">
                <span className="w-8 text-slate-600 select-none mr-2">{idx + 1}</span>
                <span className="text-emerald-300/90 bg-emerald-500/10 w-full">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
