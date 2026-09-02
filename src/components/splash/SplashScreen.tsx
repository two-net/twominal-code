import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onEnterEditor: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnterEditor }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [bootStep, setBootStep] = useState(0);

  const handleLaunch = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onEnterEditor();
    }, 600);
  };

  // Automated boot sequence and auto-dismiss
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setBootStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          return 4;
        }
        return prev + 1;
      });
    }, 220);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    if (bootStep >= 4) {
      const timer = setTimeout(() => {
        handleLaunch();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  // Keyboard shortcut to skip immediately if desired
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleLaunch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      id="splash-screen"
      className={`fixed inset-0 z-50 bg-[#08090d] flex flex-col items-center justify-center transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/80 to-[#08090d] pointer-events-none" />

      {/* Geometric Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-xl w-full px-6 flex flex-col items-center text-center select-none">
        {/* Animated Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-purple-500 p-0.5 shadow-2xl shadow-indigo-500/30 animate-pulse">
            <div className="w-full h-full bg-[#0d1017] rounded-2xl flex items-center justify-center">
              <span className="font-display font-bold text-3xl bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                ⧉
              </span>
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 retro-glow">
          TWOMINAL{' '}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            CODE
          </span>
        </h1>
        <p className="text-sm font-mono text-slate-400 mb-8 max-w-md">
          VS Code Extensibility + Native Speed + Krypton Spec Engine
        </p>

        {/* Boot Diagnostics Terminal */}
        <div className="w-full bg-[#0d1017]/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-left mb-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800/80 text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="ml-2 text-[10px] uppercase tracking-widest text-slate-400">
              Core Subsystem Boot
            </span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            {bootStep >= 1 && (
              <p className="flex items-center justify-between text-emerald-400">
                <span>[OK] Native Rendering Pipeline & Ligatures Engine</span>
                <span className="text-[10px] text-slate-500">0.4ms</span>
              </p>
            )}
            {bootStep >= 2 && (
              <p className="flex items-center justify-between text-sky-400">
                <span>[OK] Open-VSX Extension Host Compatibility Layer</span>
                <span className="text-[10px] text-slate-500">1.2ms</span>
              </p>
            )}
            {bootStep >= 3 && (
              <p className="flex items-center justify-between text-purple-400">
                <span>[OK] Krypton Spec & Design-First Skill Subsystem</span>
                <span className="text-[10px] text-slate-500">0.8ms</span>
              </p>
            )}
            {bootStep >= 4 && (
              <p className="flex items-center justify-between text-amber-400">
                <span>[OK] ACP Bridge (Claude, Antigravity, Codex, Grok)</span>
                <span className="text-[10px] text-slate-500">Ready</span>
              </p>
            )}
          </div>
        </div>

        {/* Boot Progress & Auto-Initialization Status */}
        <div className="w-full max-w-xs flex flex-col items-center gap-2">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (bootStep / 4) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{bootStep >= 4 ? 'Workspace Initialized. Launching...' : 'Initializing Subsystems...'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
