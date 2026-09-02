import React from 'react';
import { Bot, Sparkles, Cpu, Zap } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { AcpProviderId } from '../../types/acp';

export const ProviderSelector: React.FC = () => {
  const { activeProvider, setProvider } = useAgent();

  const providerOptions: {
    id: AcpProviderId;
    label: string;
    icon: React.ReactNode;
    color: string;
    tag: string;
  }[] = [
    {
      id: 'antigravity',
      label: 'Antigravity',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      tag: 'Google',
    },
    {
      id: 'claude',
      label: 'Claude Code',
      icon: <Bot className="w-3.5 h-3.5" />,
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      tag: 'Anthropic',
    },
    {
      id: 'codex',
      label: 'Codex',
      icon: <Cpu className="w-3.5 h-3.5" />,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      tag: 'OpenAI',
    },
    {
      id: 'grok',
      label: 'Grok',
      icon: <Zap className="w-3.5 h-3.5" />,
      color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
      tag: 'xAI',
    },
  ];

  return (
    <div className="p-2 border-b border-slate-800 bg-[#06080d]">
      <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5 font-bold tracking-wider">
        ACP Agent Protocol
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {providerOptions.map((opt) => {
          const isSelected = activeProvider === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setProvider(opt.id)}
              className={`flex items-center justify-between p-1.5 rounded-md border text-xs font-mono transition-all ${
                isSelected
                  ? `${opt.color} font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)]`
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                {opt.icon}
                <span className="truncate">{opt.label}</span>
              </div>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                {opt.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
