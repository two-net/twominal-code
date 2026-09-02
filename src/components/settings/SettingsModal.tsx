import React from 'react';
import { X, Sun, Moon, SunMedium, Type, Monitor, Sliders, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    mode,
    solarState,
    ligatures,
    fontFamily,
    fontSize,
    setMode,
    setLigatures,
    setFontFamily,
    setFontSize,
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0d1017] border border-[#262c3e] rounded-2xl shadow-2xl p-6 flex flex-col space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2433] pb-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold">
            <Sliders className="w-5 h-5" />
            <span className="text-base text-white font-display">
              Twominal Preferences & Theming
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theming Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <Monitor className="w-4 h-4 text-indigo-400" />
            <span>Theme & Solar Mode</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setMode('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                mode === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 text-slate-400 hover:bg-[#161a26]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Always Dark</span>
            </button>

            <button
              onClick={() => setMode('light')}
              className={`p-3 rounded-xl border flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                mode === 'light'
                  ? 'border-amber-400 bg-amber-950/40 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                  : 'border-slate-800 text-slate-400 hover:bg-[#161a26]'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Always Light</span>
            </button>

            <button
              onClick={() => setMode('solar')}
              className={`p-3 rounded-xl border flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                mode === 'solar'
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold shadow-md shadow-emerald-500/10'
                  : 'border-slate-800 text-slate-400 hover:bg-[#161a26]'
              }`}
            >
              <SunMedium className="w-4 h-4" />
              <span>Dynamic Solar</span>
            </button>
          </div>

          {mode === 'solar' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
              Solar Zenith Active: <strong>{solarState.solarPhase}</strong> (Sunrise:{' '}
              {solarState.sunriseTime}, Sunset: {solarState.sunsetTime})
            </div>
          )}
        </div>

        {/* Typography & Ligatures */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <Type className="w-4 h-4 text-indigo-400" />
            <span>Typography & Coding Ligatures</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-mono">
                Font Family (Ligatures Supported)
              </label>
              <input
                type="text"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-[#161a26] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-300 font-mono">Font Size ({fontSize}px)</span>
              <input
                type="range"
                min="11"
                max="22"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-44 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1f2433]">
              <div>
                <div className="text-slate-200 font-semibold">Contextual Font Ligatures</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Renders glyphs like <code className="text-indigo-400">{'->, =>, ===, !=, <=, >='}</code>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ligatures}
                onChange={(e) => setLigatures(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1f2433] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
