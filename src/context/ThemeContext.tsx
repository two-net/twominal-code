import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculateSolarState, SolarState } from '../services/solarService';

export type ThemeMode = 'dark' | 'light' | 'solar';
export type ThemePreset =
  | 'twominal-cyber'
  | 'tokyo-night'
  | 'one-dark-pro'
  | 'catppuccin-mocha'
  | 'solar-light';

interface ThemeContextType {
  mode: ThemeMode;
  preset: ThemePreset;
  isEffectiveDark: boolean;
  solarState: SolarState;
  solarLabel: string;
  ligatures: boolean;
  fontFamily: string;
  fontSize: number;
  hudScanlines: boolean;
  setMode: (mode: ThemeMode) => void;
  cycleSolarMode: () => void;
  setPreset: (preset: ThemePreset) => void;
  setLigatures: (ligatures: boolean) => void;
  toggleLigatures: () => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setHudScanlines: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('solar');
  const [preset, setPreset] = useState<ThemePreset>('twominal-cyber');
  const [solarState, setSolarState] = useState<SolarState>(calculateSolarState());
  const [ligatures, setLigatures] = useState<boolean>(true);
  const [fontFamily, setFontFamily] = useState<string>('"JetBrains Mono", "Fira Code", monospace');
  const [fontSize, setFontSize] = useState<number>(13);
  const [hudScanlines, setHudScanlines] = useState<boolean>(false);

  // Poll solar state every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSolarState(calculateSolarState());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const isEffectiveDark =
    mode === 'dark' ? true : mode === 'light' ? false : !solarState.isDaytime;

  const cycleSolarMode = () => {
    const modes: ThemeMode[] = ['solar', 'dark', 'light'];
    const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
    setMode(modes[nextIdx]);
  };

  const toggleLigatures = () => {
    setLigatures((prev) => !prev);
  };

  const solarLabel =
    mode === 'solar'
      ? `Sunset Sync (${solarState.isDaytime ? 'Day' : 'Night'})`
      : mode === 'dark'
      ? 'Always Dark'
      : 'Always Light';

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isEffectiveDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    if (ligatures) {
      body.classList.add('ligatures-enabled');
      body.classList.remove('ligatures-disabled');
    } else {
      body.classList.add('ligatures-disabled');
      body.classList.remove('ligatures-enabled');
    }
  }, [isEffectiveDark, ligatures]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        preset,
        isEffectiveDark,
        solarState,
        solarLabel,
        ligatures,
        fontFamily,
        fontSize,
        hudScanlines,
        setMode,
        cycleSolarMode,
        setPreset,
        setLigatures,
        toggleLigatures,
        setFontFamily,
        setFontSize,
        setHudScanlines,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
