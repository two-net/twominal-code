import React from 'react';
import { Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useWorkspace();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 animate-fade-in">
      <div className="px-4 py-2.5 rounded-xl bg-[#131722]/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-mono text-slate-100">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
