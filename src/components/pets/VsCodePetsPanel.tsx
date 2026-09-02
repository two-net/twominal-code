import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  ExternalLink,
  MousePointer,
  Megaphone,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { usePets } from '../../context/PetsContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ArenaTheme, PetColor, PetSize, PetType } from '../../types/pets';
import { VsCodePetsWebview, VsCodePetsRef } from './VsCodePetsWebview';

const PET_TYPES: { type: PetType; label: string; emoji: string }[] = [
  { type: 'cat', label: 'Cat', emoji: '🐱' },
  { type: 'dog', label: 'Dog', emoji: '🐶' },
  { type: 'duck', label: 'Duck', emoji: '🦆' },
  { type: 'fox', label: 'Fox', emoji: '🦊' },
  { type: 'clippy', label: 'Clippy', emoji: '📎' },
  { type: 'crab', label: 'Crab', emoji: '🦀' },
  { type: 'rubber-duck', label: 'Rubber Duck', emoji: '🐥' },
  { type: 'bunny', label: 'Bunny', emoji: '🐰' },
  { type: 'panda', label: 'Panda', emoji: '🐼' },
  { type: 'monkey', label: 'Monkey', emoji: '🐵' },
  { type: 'horse', label: 'Horse', emoji: '🐴' },
  { type: 'turtle', label: 'Turtle', emoji: '🐢' },
  { type: 'snail', label: 'Snail', emoji: '🐌' },
  { type: 'chicken', label: 'Chicken', emoji: '🐔' },
  { type: 'cockatiel', label: 'Cockatiel', emoji: '🦜' },
  { type: 'frog', label: 'Frog', emoji: '🐸' },
  { type: 'penguin', label: 'Penguin', emoji: '🐧' },
  { type: 'snake', label: 'Snake', emoji: '🐍' },
  { type: 'totoro', label: 'Totoro', emoji: '🍃' },
  { type: 'rocky', label: 'Rocky', emoji: '🪨' },
  { type: 'deno', label: 'Deno Dino', emoji: '🦕' },
  { type: 'skeleton', label: 'Skeleton', emoji: '💀' },
  { type: 'zappy', label: 'Zappy Bolt', emoji: '⚡' },
];

export const SPECIES_COLORS: Record<string, { color: PetColor; label: string; hex: string }[]> = {
  cat: [
    { color: 'orange', label: 'Orange', hex: '#f97316' },
    { color: 'brown', label: 'Brown', hex: '#8d5b4c' },
    { color: 'black', label: 'Black', hex: '#1e2029' },
    { color: 'white', label: 'White', hex: '#f1f5f9' },
    { color: 'gray', label: 'Gray', hex: '#64748b' },
    { color: 'lightbrown', label: 'Light Brown', hex: '#d97706' },
  ],
  dog: [
    { color: 'brown', label: 'Brown', hex: '#8d5b4c' },
    { color: 'black', label: 'Black', hex: '#1e2029' },
    { color: 'white', label: 'White', hex: '#f1f5f9' },
    { color: 'akita', label: 'Akita', hex: '#d97706' },
  ],
  fox: [
    { color: 'red', label: 'Red Fox', hex: '#ef4444' },
    { color: 'white', label: 'Arctic Fox', hex: '#f1f5f9' },
  ],
  duck: [
    { color: 'yellow', label: 'Yellow', hex: '#eab308' },
    { color: 'white', label: 'White', hex: '#f1f5f9' },
  ],
  'rubber-duck': [{ color: 'yellow', label: 'Yellow', hex: '#eab308' }],
  clippy: [
    { color: 'black', label: 'Black', hex: '#1e2029' },
    { color: 'brown', label: 'Brown', hex: '#8d5b4c' },
    { color: 'green', label: 'Green', hex: '#10b981' },
    { color: 'yellow', label: 'Yellow', hex: '#eab308' },
  ],
  crab: [{ color: 'red', label: 'Red', hex: '#ef4444' }],
  frog: [{ color: 'green', label: 'Green', hex: '#10b981' }],
  chicken: [{ color: 'white', label: 'White', hex: '#f1f5f9' }],
  bunny: [
    { color: 'brown', label: 'Brown', hex: '#8d5b4c' },
    { color: 'white', label: 'White', hex: '#f1f5f9' },
  ],
  deno: [{ color: 'green', label: 'Green', hex: '#10b981' }],
  monkey: [{ color: 'brown', label: 'Brown', hex: '#8d5b4c' }],
  panda: [{ color: 'black', label: 'Black', hex: '#1e2029' }],
  horse: [
    { color: 'brown', label: 'Brown', hex: '#8d5b4c' },
    { color: 'white', label: 'White', hex: '#f1f5f9' },
    { color: 'black', label: 'Black', hex: '#1e2029' },
  ],
  penguin: [{ color: 'black', label: 'Black', hex: '#1e2029' }],
  snail: [{ color: 'brown', label: 'Brown', hex: '#8d5b4c' }],
  snake: [{ color: 'green', label: 'Green', hex: '#10b981' }],
  totoro: [{ color: 'gray', label: 'Gray', hex: '#64748b' }],
  rocky: [{ color: 'gray', label: 'Gray', hex: '#64748b' }],
  skeleton: [{ color: 'white', label: 'White', hex: '#f1f5f9' }],
  zappy: [{ color: 'yellow', label: 'Yellow', hex: '#eab308' }],
  cockatiel: [{ color: 'gray', label: 'Gray', hex: '#64748b' }],
  turtle: [{ color: 'green', label: 'Green', hex: '#10b981' }],
};

const THEMES: { id: ArenaTheme; label: string; icon: string }[] = [
  { id: 'castle', label: 'Castle', icon: '🏰' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'beach', label: 'Beach', icon: '🏖️' },
  { id: 'none', label: 'None', icon: '⬛' },
];

interface VsCodePetsPanelProps {
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const VsCodePetsPanel: React.FC<VsCodePetsPanelProps> = ({
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const {
    pets,
    theme,
    setTheme,
    spawnPet,
    removePet,
    clearAllPets,
  } = usePets();

  const { openPetCodingTab, showToast } = useWorkspace();
  const webviewRef = useRef<VsCodePetsRef>(null);

  const [isSpawning, setIsSpawning] = useState(false);
  const [newType, setNewType] = useState<PetType>('cat');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<PetColor>('orange');
  const [newSize, setNewSize] = useState<PetSize>('nano');

  const handleTypeSelect = (type: PetType) => {
    setNewType(type);
    const validColors = SPECIES_COLORS[type];
    if (validColors && validColors.length > 0) {
      setNewColor(validColors[0].color);
    }
  };

  const handleSpawn = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newName.trim() || undefined;
    const validColors = SPECIES_COLORS[newType] || [];
    const safeColor = validColors.some((c) => c.color === newColor)
      ? newColor
      : validColors[0]?.color || 'brown';

    webviewRef.current?.spawnPet(newType, safeColor, finalName);
    spawnPet(newType, finalName || newType, safeColor, newSize, 1.4);
    setNewName('');
    setIsSpawning(false);
    showToast(`Spawned ${safeColor} ${newType}`);
  };

  const handleThrowBall = () => {
    webviewRef.current?.throwBall();
  };

  const handleThrowWithMouse = () => {
    webviewRef.current?.throwWithMouse(true);
    showToast('vscode-pets: Mouse ball throwing enabled');
  };

  const handleRollCall = () => {
    webviewRef.current?.rollCall();
    const names = pets.map((p) => `${p.name} (${p.color} ${p.type})`).join(', ');
    showToast(names ? `Roll Call: ${names}` : 'No pets present');
  };

  const handleRemoveAll = () => {
    webviewRef.current?.resetPets();
    clearAllPets();
    showToast('vscode-pets: Removed all pets');
  };

  const handleThemeChange = (tId: ArenaTheme) => {
    setTheme(tId);
    webviewRef.current?.changeTheme(tId);
    showToast(`vscode-pets: Theme set to ${tId}`);
  };

  const activeTheme =
    theme === 'matrix' || theme === 'cyberpunk' || theme === 'sunset' || theme === 'space'
      ? 'castle'
      : theme;

  const availableColors = SPECIES_COLORS[newType] || [
    { color: 'brown', label: 'Brown', hex: '#8d5b4c' },
  ];

  return (
    <div
      className={`flex flex-col bg-[#0a0c12] text-xs font-sans select-none overflow-hidden ${
        isCollapsed ? 'h-7' : 'h-full'
      } ${className}`}
    >
      {/* VS Code Extension Navigation Toolbar */}
      <div
        onClick={isCollapsible ? onToggleCollapse : undefined}
        className={`h-7 px-1.5 bg-[#0d1017] border-b border-[#1f2433] flex items-center justify-between text-xs text-slate-400 shrink-0 ${
          isCollapsible ? 'cursor-pointer hover:bg-slate-800/40' : ''
        }`}
      >
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300 min-w-0 truncate">
          {isCollapsible && (
            <span className="text-slate-500 shrink-0">
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          )}
          <span className="shrink-0">🐾</span>
          <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] truncate">
            Pets
          </span>
          <span className="text-[9px] text-slate-500 shrink-0">({pets.length})</span>
        </div>

        {/* Action icons like in VS Code View Title */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleThrowBall}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
            title="Throw Ball (vscode-pets.throw-ball)"
          >
            <span className="text-xs leading-none">🎾</span>
          </button>

          <button
            onClick={handleThrowWithMouse}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
            title="Throw With Mouse (vscode-pets.throw-with-mouse)"
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsSpawning(!isSpawning)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isSpawning
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-800 text-slate-400 hover:text-indigo-400'
            }`}
            title="Spawn Pet (vscode-pets.spawn-pet)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRollCall}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            title="Roll Call (vscode-pets.roll-call)"
          >
            <Megaphone className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={openPetCodingTab}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
            title="Open Pet Coding Session in Editor (vscode-pets.start)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRemoveAll}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Remove All Pets (vscode-pets.remove-all-pets)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Spawn Pet Quick Pick Bar (Toggled) */}
          {isSpawning && (
            <form
              onSubmit={handleSpawn}
              className="p-2.5 bg-[#10131d] border-b border-[#1f2433] space-y-2 shrink-0 animate-in fade-in text-xs font-mono"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                <span>Spawn Pet</span>
                <span className="text-[9px] text-slate-500">
                  vscode-pets.spawn-pet
                </span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  SPECIES
                </label>
                <div className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto pr-1">
                  {PET_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.type}
                      onClick={() => handleTypeSelect(t.type)}
                      className={`p-1 rounded flex items-center justify-center gap-1 text-[10px] cursor-pointer transition-colors ${
                        newType === t.type
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span className="truncate text-[9px]">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    NAME
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Pet Name"
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    SIZE
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['nano', 'medium', 'large'] as PetSize[]).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewSize(s)}
                        className={`py-1 rounded text-[9px] capitalize cursor-pointer ${
                          newSize === s
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  COLOR
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableColors.map((c) => (
                    <button
                      type="button"
                      key={c.color}
                      onClick={() => setNewColor(c.color)}
                      className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                        newColor === c.color
                          ? 'border-white scale-110 ring-2 ring-indigo-500'
                          : 'border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSpawning(false)}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Spawn
                </button>
              </div>
            </form>
          )}

          {/* Main vscode-pets Webview Area */}
          <div className="flex-1 relative w-full h-full min-h-[140px] bg-slate-950 overflow-hidden">
            <VsCodePetsWebview
              ref={webviewRef}
              theme={activeTheme}
              petType={pets[0]?.type || 'cat'}
              petColor={pets[0]?.color || 'orange'}
              className="w-full h-full"
            />
          </div>

          {/* Active Pets List Strip */}
          {pets.length > 0 && (
            <div className="px-2 py-1 bg-[#0b0d14] border-t border-[#1a1f2c] flex items-center gap-1.5 overflow-x-auto shrink-0 text-[10px] font-mono">
              <span className="text-slate-500 text-[9px]">PETS:</span>
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 shrink-0"
                >
                  <span>
                    {PET_TYPES.find((t) => t.type === pet.type)?.emoji || '🐾'}
                  </span>
                  <span className="truncate max-w-[60px]">{pet.name}</span>
                  <button
                    onClick={() => {
                      webviewRef.current?.deletePet(
                        pet.name,
                        pet.type,
                        pet.color
                      );
                      removePet(pet.id);
                      showToast(`vscode-pets: Removed ${pet.name}`);
                    }}
                    className="hover:text-rose-400 p-0.5 cursor-pointer ml-0.5"
                    title={`Delete ${pet.name}`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer Toolbar: Themes & Actions */}
          <div className="p-1.5 bg-[#0d1017] border-t border-[#1f2433] flex items-center justify-between text-xs shrink-0">
            {/* Theme Picker */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 mr-0.5">
                THEME:
              </span>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    theme === t.id
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                  title={t.label}
                >
                  <span>{t.icon}</span>
                </button>
              ))}
            </div>

            {/* Quick Launch Button */}
            <button
              onClick={openPetCodingTab}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono cursor-pointer transition-colors"
              title="Open in Main Editor Window"
            >
              <span>⤢</span>
              <span>Editor View</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
