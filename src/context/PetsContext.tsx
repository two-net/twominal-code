import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ArenaTheme, BallData, FoodData, ParticleData, PetColor, PetData, PetSize, PetType } from '../types/pets';
import { PetAudio } from '../components/pets/PetAudio';

interface PetsContextType {
  pets: PetData[];
  activePetId: string | null;
  ball: BallData | null;
  food: FoodData[];
  particles: ParticleData[];
  theme: ArenaTheme;
  showEditorCompanion: boolean;
  soundEnabled: boolean;
  laserPointer: { active: boolean; x: number; y: number } | null;
  spawnPet: (type: PetType, name: string, color?: PetColor, size?: PetSize, speed?: number) => PetData;
  removePet: (id: string) => void;
  updatePet: (id: string, updates: Partial<PetData>) => void;
  selectPet: (id: string | null) => void;
  throwBall: (x: number, y: number, vx?: number, vy?: number) => void;
  dropFood: (type: FoodData['type'], x: number, y?: number) => void;
  setTheme: (theme: ArenaTheme) => void;
  toggleEditorCompanion: () => void;
  toggleSound: () => void;
  setLaserPointer: (pos: { active: boolean; x: number; y: number } | null) => void;
  interactWithPet: (id: string) => void;
  clearAllPets: () => void;
  loadPreset: (presetName: 'classic' | 'farm' | 'assistants' | 'cyberpunk') => void;
  addParticle: (x: number, y: number, text?: string, color?: string) => void;
  petSpeech: (petId: string, text: string) => void;
}

const PetsContext = createContext<PetsContextType | undefined>(undefined);

const PET_QUOTES = [
  'LGTM! 🚀',
  'Purrrr... 🐱',
  'Tabs or spaces?',
  'All tests passing! 🟢',
  'Need a break?',
  'Compiling... ⚡',
  'Clean code! ✨',
  'Don’t forget to push! 🐾',
  'Git blame: not me! 🙈',
  '0 syntax errors! 🎯',
];

const INITIAL_PETS: PetData[] = [
  {
    id: 'pet-cat-default',
    name: 'Milo',
    type: 'cat',
    color: 'orange',
    size: 'medium',
    speed: 1.5,
    x: 80,
    y: 120,
    vx: 1.2,
    vy: 0,
    direction: 'right',
    state: 'walking',
    stateTimer: 100,
    frameIndex: 0,
    animationTick: 0,
    happiness: 95,
    energy: 90,
    hunger: 20,
    level: 3,
  },
  {
    id: 'pet-duck-default',
    name: 'Quackers',
    type: 'duck',
    color: 'yellow',
    size: 'medium',
    speed: 1.2,
    x: 180,
    y: 120,
    vx: -0.8,
    vy: 0,
    direction: 'left',
    state: 'idle',
    stateTimer: 60,
    frameIndex: 0,
    animationTick: 0,
    happiness: 88,
    energy: 85,
    hunger: 35,
    level: 2,
  },
];

export const PetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<PetData[]>(() => {
    try {
      const saved = localStorage.getItem('twominal_pets_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PETS;
  });

  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [ball, setBall] = useState<BallData | null>(null);
  const [food, setFood] = useState<FoodData[]>([]);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [theme, setTheme] = useState<ArenaTheme>(() => {
    return (localStorage.getItem('twominal_pets_theme') as ArenaTheme) || 'castle';
  });
  const [showEditorCompanion, setShowEditorCompanion] = useState<boolean>(() => {
    return localStorage.getItem('twominal_pets_editor_bar') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('twominal_pets_sound') !== 'false';
  });
  const [laserPointer, setLaserPointer] = useState<{ active: boolean; x: number; y: number } | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('twominal_pets_list', JSON.stringify(pets));
    } catch {
      // ignore
    }
  }, [pets]);

  useEffect(() => {
    try {
      localStorage.setItem('twominal_pets_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('twominal_pets_editor_bar', String(showEditorCompanion));
    } catch {
      // ignore
    }
  }, [showEditorCompanion]);

  useEffect(() => {
    PetAudio.setEnabled(soundEnabled);
    try {
      localStorage.setItem('twominal_pets_sound', String(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  const addParticle = useCallback((x: number, y: number, text?: string, color = '#ec4899') => {
    const newP: ParticleData = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -1.5 - Math.random() * 2,
      life: 30,
      maxLife: 30,
      color,
      text,
      size: text ? 12 : 4,
    };
    setParticles((prev) => [...prev.slice(-20), newP]);
  }, []);

  const spawnPet = (
    type: PetType,
    name: string,
    color: PetColor = 'default',
    size: PetSize = 'medium',
    speed = 1.4
  ): PetData => {
    const newPet: PetData = {
      id: `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      color,
      size,
      speed,
      x: 60 + Math.random() * 120,
      y: 120,
      vx: (Math.random() > 0.5 ? 1 : -1) * speed,
      vy: 0,
      direction: Math.random() > 0.5 ? 'right' : 'left',
      state: 'walking',
      stateTimer: 80 + Math.floor(Math.random() * 80),
      frameIndex: 0,
      animationTick: 0,
      happiness: 100,
      energy: 100,
      hunger: 0,
      level: 1,
      isCustom: true,
    };

    setPets((prev) => [...prev, newPet]);
    PetAudio.playPetSound(type);
    addParticle(newPet.x, newPet.y - 20, '✨ New Friend! ✨', '#a855f7');
    return newPet;
  };

  const removePet = (id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
    if (activePetId === id) setActivePetId(null);
  };

  const updatePet = (id: string, updates: Partial<PetData>) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const selectPet = (id: string | null) => {
    setActivePetId(id);
  };

  const throwBall = (x: number, y: number, vx = 5, vy = -6) => {
    setBall({
      x,
      y,
      vx,
      vy,
      radius: 6,
      color: '#f43f5e',
      active: true,
      bounces: 0,
    });
    PetAudio.playBoing();
    addParticle(x, y, '🎾 Throw!', '#f43f5e');
  };

  const dropFood = (type: FoodData['type'], x: number, y = 30) => {
    const newFood: FoodData = {
      id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      x,
      y,
      vy: 2,
      active: true,
    };
    setFood((prev) => [...prev, newFood]);
    PetAudio.playBoing();
    addParticle(x, y, `+${type.toUpperCase()}`, '#fbbf24');
  };

  const interactWithPet = (id: string) => {
    const pet = pets.find((p) => p.id === id);
    if (!pet) return;

    PetAudio.playPetSound(pet.type);
    const quote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];

    setPets((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              happiness: Math.min(100, p.happiness + 15),
              state: 'jumping',
              stateTimer: 30,
              speechText: quote,
              speechTimer: 60,
              level: p.happiness > 95 ? p.level + 1 : p.level,
            }
          : p
      )
    );

    addParticle(pet.x, pet.y - 20, '❤️ +Happy', '#ec4899');
  };

  const petSpeech = (petId: string, text: string) => {
    setPets((prev) =>
      prev.map((p) =>
        p.id === petId
          ? {
              ...p,
              speechText: text,
              speechTimer: 90,
            }
          : p
      )
    );
  };

  const toggleEditorCompanion = () => {
    setShowEditorCompanion((prev) => !prev);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const clearAllPets = () => {
    setPets([]);
    setActivePetId(null);
  };

  const loadPreset = (presetName: 'classic' | 'farm' | 'assistants' | 'cyberpunk') => {
    let presetList: PetData[] = [];
    switch (presetName) {
      case 'classic':
        presetList = [
          {
            id: 'pet-cat-1',
            name: 'Oliver',
            type: 'cat',
            color: 'orange',
            size: 'medium',
            speed: 1.5,
            x: 60,
            y: 120,
            vx: 1.2,
            vy: 0,
            direction: 'right',
            state: 'walking',
            stateTimer: 100,
            frameIndex: 0,
            animationTick: 0,
            happiness: 100,
            energy: 90,
            hunger: 10,
            level: 5,
          },
          {
            id: 'pet-dog-1',
            name: 'Buster',
            type: 'dog',
            color: 'brown',
            size: 'medium',
            speed: 1.8,
            x: 160,
            y: 120,
            vx: -1.4,
            vy: 0,
            direction: 'left',
            state: 'walking',
            stateTimer: 120,
            frameIndex: 0,
            animationTick: 0,
            happiness: 100,
            energy: 95,
            hunger: 20,
            level: 4,
          },
          {
            id: 'pet-duck-1',
            name: 'Daffy',
            type: 'duck',
            color: 'yellow',
            size: 'medium',
            speed: 1.2,
            x: 220,
            y: 120,
            vx: 0.9,
            vy: 0,
            direction: 'right',
            state: 'idle',
            stateTimer: 80,
            frameIndex: 0,
            animationTick: 0,
            happiness: 90,
            energy: 85,
            hunger: 15,
            level: 3,
          },
        ];
        break;
      case 'assistants':
        presetList = [
          {
            id: 'pet-clippy-1',
            name: 'Clippy 2.0',
            type: 'clippy',
            color: 'default',
            size: 'medium',
            speed: 1.0,
            x: 80,
            y: 120,
            vx: 0.8,
            vy: 0,
            direction: 'right',
            state: 'idle',
            stateTimer: 90,
            frameIndex: 0,
            animationTick: 0,
            happiness: 100,
            energy: 100,
            hunger: 0,
            level: 99,
          },
          {
            id: 'pet-rocky-1',
            name: 'Rocky',
            type: 'rocky',
            color: 'default',
            size: 'medium',
            speed: 0.4,
            x: 180,
            y: 120,
            vx: 0.2,
            vy: 0,
            direction: 'left',
            state: 'sitting',
            stateTimer: 200,
            frameIndex: 0,
            animationTick: 0,
            happiness: 100,
            energy: 100,
            hunger: 0,
            level: 10,
          },
        ];
        break;
      case 'farm':
        presetList = [
          {
            id: 'pet-chicken-1',
            name: 'Henny',
            type: 'chicken',
            color: 'white',
            size: 'medium',
            speed: 1.3,
            x: 70,
            y: 120,
            vx: 1.1,
            vy: 0,
            direction: 'right',
            state: 'walking',
            stateTimer: 80,
            frameIndex: 0,
            animationTick: 0,
            happiness: 95,
            energy: 85,
            hunger: 10,
            level: 2,
          },
          {
            id: 'pet-frog-1',
            name: 'Kermit',
            type: 'frog',
            color: 'green',
            size: 'medium',
            speed: 1.4,
            x: 150,
            y: 120,
            vx: -1.0,
            vy: 0,
            direction: 'left',
            state: 'jumping',
            stateTimer: 60,
            frameIndex: 0,
            animationTick: 0,
            happiness: 90,
            energy: 90,
            hunger: 20,
            level: 3,
          },
          {
            id: 'pet-duck-2',
            name: 'Waddles',
            type: 'duck',
            color: 'yellow',
            size: 'medium',
            speed: 1.0,
            x: 210,
            y: 120,
            vx: 0.8,
            vy: 0,
            direction: 'right',
            state: 'idle',
            stateTimer: 90,
            frameIndex: 0,
            animationTick: 0,
            happiness: 95,
            energy: 90,
            hunger: 15,
            level: 3,
          },
        ];
        break;
      case 'cyberpunk':
        presetList = [
          {
            id: 'pet-fox-1',
            name: 'Kitsune.exe',
            type: 'fox',
            color: 'neon',
            size: 'medium',
            speed: 2.2,
            x: 60,
            y: 120,
            vx: 1.8,
            vy: 0,
            direction: 'right',
            state: 'running',
            stateTimer: 140,
            frameIndex: 0,
            animationTick: 0,
            happiness: 100,
            energy: 100,
            hunger: 5,
            level: 8,
          },
          {
            id: 'pet-totoro-1',
            name: 'Cyber-Totoro',
            type: 'totoro',
            color: 'purple',
            size: 'large',
            speed: 1.1,
            x: 180,
            y: 120,
            vx: -0.9,
            vy: 0,
            direction: 'left',
            state: 'walking',
            stateTimer: 100,
            frameIndex: 0,
            animationTick: 0,
            happiness: 100,
            energy: 90,
            hunger: 15,
            level: 7,
          },
        ];
        break;
    }

    setPets(presetList);
    PetAudio.playCheer();
  };

  return (
    <PetsContext.Provider
      value={{
        pets,
        activePetId,
        ball,
        food,
        particles,
        theme,
        showEditorCompanion,
        soundEnabled,
        laserPointer,
        spawnPet,
        removePet,
        updatePet,
        selectPet,
        throwBall,
        dropFood,
        setTheme,
        toggleEditorCompanion,
        toggleSound,
        setLaserPointer,
        interactWithPet,
        clearAllPets,
        loadPreset,
        addParticle,
        petSpeech,
      }}
    >
      {children}
    </PetsContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetsContext);
  if (!context) throw new Error('usePets must be used within PetsProvider');
  return context;
};
