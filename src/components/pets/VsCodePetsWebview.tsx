import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { usePets } from '../../context/PetsContext';
import { PetColor, PetType } from '../../types/pets';
import { ExtensionService } from '../../services/extensionService';

export interface VsCodePetsRef {
  throwBall: () => void;
  throwWithMouse: (enabled: boolean) => void;
  spawnPet: (type: string, color: string, name?: string) => void;
  deletePet: (name: string, type?: string, color?: string) => void;
  resetPets: () => void;
  rollCall: () => void;
  changeTheme: (theme: string) => void;
}

interface VsCodePetsWebviewProps {
  theme?: string;
  themeKind?: number; // 1 = light, 2 = dark
  petColor?: string;
  petSize?: string;
  petType?: string;
  throwBallWithMouse?: boolean;
  disableEffects?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Species to color normalizer
export function normalizePetColor(species: string, color: string): string {
  const s = species === 'duck' ? 'rubber-duck' : species.toLowerCase();
  const c = color.toLowerCase();

  const MAP: Record<string, string[]> = {
    cat: ['orange', 'brown', 'black', 'white', 'gray', 'lightbrown'],
    dog: ['brown', 'black', 'white', 'akita'],
    fox: ['red', 'white'],
    duck: ['yellow', 'white'],
    'rubber-duck': ['yellow'],
    chicken: ['white', 'brown'],
    bunny: ['brown', 'white', 'gray'],
    clippy: ['black', 'brown', 'green', 'yellow'],
    crab: ['red'],
    frog: ['green', 'blue'],
    deno: ['green'],
    monkey: ['brown'],
    panda: ['black'],
    horse: ['brown', 'white', 'black'],
    penguin: ['black'],
    snail: ['brown'],
    snake: ['green'],
    totoro: ['gray'],
    rocky: ['gray'],
    skeleton: ['white', 'blue'],
    zappy: ['yellow'],
    cockatiel: ['gray'],
    turtle: ['green'],
  };

  const allowed = MAP[s];
  if (!allowed || allowed.length === 0) return 'brown';
  if (allowed.includes(c)) return c;
  return allowed[0];
}

// Sprite URL resolver
export function getSpriteUrl(
  species: string,
  color: string,
  state: 'idle' | 'walk' | 'run' | 'climb' | 'swipe' | 'ball' = 'idle'
): string {
  const normSpecies = species === 'duck' ? 'rubber-duck' : species.toLowerCase();
  const safeColor = normalizePetColor(normSpecies, color);

  let action = 'idle';
  if (state === 'walk') action = 'walk';
  else if (state === 'run') action = 'run';
  else if (state === 'climb') action = 'wallclimb';
  else if (state === 'swipe') action = 'swipe';
  else if (state === 'ball') action = 'with_ball';

  return ExtensionService.getAssetUrl(
    'tonybaloney.vscode-pets',
    `media/${normSpecies}/${safeColor}_${action}_8fps.gif`
  );
}

// Theme floor heights (px from bottom)
const THEME_FLOORS: Record<string, number> = {
  castle: 45,
  forest: 35,
  beach: 30,
  winter: 35,
  autumn: 35,
  none: 15,
};

interface LivePet {
  id: string;
  name: string;
  type: string;
  color: string;
  x: number;
  y: number;
  direction: 'left' | 'right';
  state: 'idle' | 'walk' | 'run' | 'climb' | 'swipe' | 'ball';
  stateTimer: number;
  speech: string | null;
  speechTimer: number;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

const DEV_QUOTES = [
  'LGTM! 🚀',
  'Purrrr... 🐱',
  'Tabs or spaces?',
  'All tests passing! 🟢',
  '0 syntax errors! 🎯',
  'git push --force 🙈',
  'Need coffee! ☕',
  'Compiling... ⚡',
  'Clean code! ✨',
  'Woof! 🐶',
];

export const VsCodePetsWebview = forwardRef<VsCodePetsRef, VsCodePetsWebviewProps>(
  (
    {
      theme: propTheme = 'castle',
      className = '',
      style = {},
    },
    ref
  ) => {
    const { pets: contextPets, spawnPet, removePet, clearAllPets, theme: contextTheme, setTheme } = usePets();
    const activeTheme = (contextTheme || propTheme || 'castle').toLowerCase();

    const containerRef = useRef<HTMLDivElement>(null);
    const [livePets, setLivePets] = useState<LivePet[]>([]);
    const [ball, setBall] = useState<BallState | null>(null);
    const [mouseThrowEnabled, setMouseThrowEnabled] = useState(true);

    const floorHeight = THEME_FLOORS[activeTheme] || 35;

    // Sync live pets from PetsContext
    useEffect(() => {
      setLivePets((prev) => {
        const sourcePets =
          contextPets && contextPets.length > 0
            ? contextPets
            : [
                {
                  id: 'pet-cat-milo',
                  name: 'Milo',
                  type: 'cat' as PetType,
                  color: 'orange' as PetColor,
                },
              ];

        return sourcePets.map((cp, idx) => {
          const existing = prev.find((p) => p.id === cp.id);
          if (existing) {
            return {
              ...existing,
              type: cp.type,
              color: cp.color,
              name: cp.name,
            };
          }
          return {
            id: cp.id,
            name: cp.name,
            type: cp.type,
            color: cp.color,
            x: 60 + idx * 80,
            y: floorHeight,
            direction: idx % 2 === 0 ? 'right' : 'left',
            state: 'walk',
            stateTimer: 60 + Math.random() * 80,
            speech: idx === 0 ? 'Hello! 👋' : null,
            speechTimer: idx === 0 ? 120 : 0,
          };
        });
      });
    }, [contextPets, floorHeight]);

    // Launch Ball matching vscode-pets ball.js
    const launchBall = useCallback(
      (startX?: number, startY?: number, initialVx?: number, initialVy?: number) => {
        if (!containerRef.current) return;
        const sx = startX !== undefined ? startX : 100;
        const sy = startY !== undefined ? startY : floorHeight + 90;
        const vx = initialVx !== undefined ? initialVx : 4;
        const vy = initialVy !== undefined ? initialVy : 5;

        setBall({
          x: sx,
          y: sy,
          vx,
          vy,
          active: true,
        });

        // Trigger all pets with canChase to run after the ball
        setLivePets((prev) =>
          prev.map((p) => ({
            ...p,
            state: 'run',
            stateTimer: 240,
            direction: p.x < sx ? 'right' : 'left',
          }))
        );
      },
      [floorHeight]
    );

    // Imperative ref implementation
    useImperativeHandle(ref, () => ({
      throwBall: () => launchBall(),
      throwWithMouse: (enabled: boolean) => setMouseThrowEnabled(enabled),
      spawnPet: (type: string, color: string, name?: string) => {
        const safeColor = normalizePetColor(type, color);
        spawnPet(type as PetType, name || type, safeColor as PetColor, 'nano', 1.4);
      },
      deletePet: (name: string) => {
        const found = contextPets.find((p) => p.name === name);
        if (found) removePet(found.id);
      },
      resetPets: () => clearAllPets(),
      rollCall: () => {
        setLivePets((prev) =>
          prev.map((p) => ({
            ...p,
            speech: `${p.name}! 🐾`,
            speechTimer: 150,
          }))
        );
      },
      changeTheme: (t: string) => setTheme(t as any),
    }));

    // Mouse drag flick tracking refs
    const isDraggingBallRef = useRef(false);
    const mouseLastPosRef = useRef<{ x: number; y: number; time: number }>({
      x: 0,
      y: 0,
      time: 0,
    });
    const mouseVelRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

    // Main 24-60 FPS Ball & Pet Physics Loop matching ball.js
    useEffect(() => {
      let animationId: number;

      const tick = () => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth || 300;
        const height = containerRef.current.clientHeight || 200;
        const floor = floorHeight;

        // Update Ball Physics using exact ball.js equations:
        // gravity = 0.6, damping = 0.9, traction = 0.8
        const GRAVITY = 0.6;
        const DAMPING = 0.9;
        const TRACTION = 0.8;
        const BALL_RADIUS = 3;

        setBall((currentBall) => {
          if (!currentBall || !currentBall.active || isDraggingBallRef.current) {
            return currentBall;
          }

          let nx = currentBall.x + currentBall.vx;
          let ny = currentBall.y + currentBall.vy;
          let nvx = currentBall.vx;
          let nvy = currentBall.vy - GRAVITY; // gravity pulls down

          // Floor bounce
          if (ny <= floor + BALL_RADIUS) {
            ny = floor + BALL_RADIUS;
            nvy = -nvy * DAMPING;
            nvx *= TRACTION; // traction on floor

            // Settle when nearly stopped
            if (Math.abs(nvy) < 0.6) {
              nvy = 0;
            }
          }

          // Ceiling bounce
          if (ny >= height - BALL_RADIUS - 5) {
            ny = height - BALL_RADIUS - 5;
            nvy = -nvy * DAMPING;
          }

          // Left wall bounce
          if (nx <= BALL_RADIUS + 5) {
            nx = BALL_RADIUS + 5;
            nvx = -nvx * DAMPING;
          }
          // Right wall bounce
          else if (nx >= width - BALL_RADIUS - 5) {
            nx = width - BALL_RADIUS - 5;
            nvx = -nvx * DAMPING;
          }

          // Dissipate if stopped on floor for a while
          if (Math.abs(nvx) < 0.05 && Math.abs(nvy) < 0.1 && ny <= floor + BALL_RADIUS + 1) {
            return null;
          }

          return { x: nx, y: ny, vx: nvx, vy: nvy, active: true };
        });

        // Update Pets State
        setLivePets((prevPets) =>
          prevPets.map((pet) => {
            let { x, y, direction, state, stateTimer, speech, speechTimer } = pet;

            // Speech timer
            if (speechTimer > 0) {
              speechTimer--;
              if (speechTimer <= 0) speech = null;
            } else if (Math.random() < 0.0008) {
              speech = DEV_QUOTES[Math.floor(Math.random() * DEV_QUOTES.length)];
              speechTimer = 100;
            }

            // Ball chase mode (exact vscode-pets behavior)
            if (ball && ball.active && !isDraggingBallRef.current) {
              const dx = ball.x - x;
              const dist = Math.abs(dx);

              if (dist > 18) {
                state = 'run';
                direction = dx > 0 ? 'right' : 'left';
                x += direction === 'right' ? 2.5 : -2.5;
              } else {
                // Caught the ball! The ball hides, pet gets idleWithBall
                setBall(null);
                state = 'ball';
                stateTimer = 80;
                speech = 'Got it!';
                speechTimer = 80;
              }
              return {
                ...pet,
                x: Math.max(10, Math.min(width - 45, x)),
                y: floor,
                direction,
                state,
                stateTimer,
                speech,
                speechTimer,
              };
            }

            // Normal state progression
            stateTimer--;
            if (stateTimer <= 0) {
              if (state === 'walk' || state === 'run') {
                // Switch to idle
                state = 'idle';
                stateTimer = 60 + Math.random() * 80;
              } else if (state === 'idle') {
                // Switch to walk
                state = 'walk';
                direction = Math.random() > 0.5 ? 'right' : 'left';
                stateTimer = 90 + Math.random() * 120;
              } else if (state === 'climb') {
                // Done climbing wall, jump down
                state = 'walk';
                y = floor;
                direction = direction === 'right' ? 'left' : 'right';
                stateTimer = 80;
              } else if (state === 'swipe' || state === 'ball') {
                state = 'walk';
                stateTimer = 80;
              }
            }

            // Move pet during walking/running
            if (state === 'walk') {
              const speed = 1.2;
              x += direction === 'right' ? speed : -speed;

              // Hit left wall
              if (x <= 10) {
                x = 10;
                if (Math.random() < 0.35) {
                  state = 'climb';
                  stateTimer = 45;
                } else {
                  direction = 'right';
                }
              }
              // Hit right wall
              else if (x >= width - 45) {
                x = width - 45;
                if (Math.random() < 0.35) {
                  state = 'climb';
                  stateTimer = 45;
                } else {
                  direction = 'left';
                }
              }
            } else if (state === 'climb') {
              // Climb up the wall
              y = Math.min(height - 60, y + 1.8);
            }

            return {
              ...pet,
              x: Math.max(5, Math.min(width - 45, x)),
              y: state === 'climb' ? y : floor,
              direction,
              state,
              stateTimer,
              speech,
              speechTimer,
            };
          })
        );

        animationId = requestAnimationFrame(tick);
      };

      animationId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationId);
    }, [ball, floorHeight]);

    // Mouse Drag & Flick Throwing (matches vscode-pets dynamicThrowOn)
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mouseThrowEnabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = rect.bottom - e.clientY;

      isDraggingBallRef.current = true;
      mouseLastPosRef.current = { x: currentX, y: currentY, time: performance.now() };
      mouseVelRef.current = { vx: 0, vy: 0 };

      setBall({
        x: currentX,
        y: currentY,
        vx: 0,
        vy: 0,
        active: true,
      });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDraggingBallRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = rect.bottom - e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - mouseLastPosRef.current.time);

      const vx = ((currentX - mouseLastPosRef.current.x) / dt) * 16;
      const vy = ((currentY - mouseLastPosRef.current.y) / dt) * 16;
      mouseVelRef.current = { vx, vy };
      mouseLastPosRef.current = { x: currentX, y: currentY, time: now };

      setBall((b) => (b ? { ...b, x: currentX, y: currentY, vx: 0, vy: 0 } : null));
    };

    const handleMouseUp = () => {
      if (!isDraggingBallRef.current) return;
      isDraggingBallRef.current = false;
      const { vx, vy } = mouseVelRef.current;
      const finalVx = Math.abs(vx) > 0.5 ? Math.max(-12, Math.min(12, vx)) : 4;
      const finalVy = Math.abs(vy) > 0.5 ? Math.max(-8, Math.min(14, vy)) : 5;

      setBall((b) => (b ? { ...b, vx: finalVx, vy: finalVy } : null));

      // Pets chase the thrown ball
      setLivePets((prev) =>
        prev.map((p) => ({
          ...p,
          state: 'run',
          stateTimer: 240,
        }))
      );
    };

    // Hover or pet click interaction
    const handlePetInteract = (petId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setLivePets((prev) =>
        prev.map((p) => {
          if (p.id !== petId) return p;
          return {
            ...p,
            state: 'swipe',
            stateTimer: 45,
            speech: 'Meow! 🐾',
            speechTimer: 70,
          };
        })
      );
    };

    const hasBackground = activeTheme !== 'none';
    const bgUrl = hasBackground
      ? ExtensionService.getAssetUrl(
          'tonybaloney.vscode-pets',
          `media/backgrounds/${activeTheme}/background-dark-large.png`
        )
      : null;
    const fgUrl = hasBackground
      ? ExtensionService.getAssetUrl(
          'tonybaloney.vscode-pets',
          `media/backgrounds/${activeTheme}/foreground-dark-large.png`
        )
      : null;

    return (
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-full overflow-hidden select-none cursor-crosshair ${className}`}
        style={{
          ...style,
          backgroundColor: '#0a0d14',
          backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom left',
          backgroundSize: 'auto 100%',
        }}
        title="Click to throw ball 🎾"
      >
        {/* Foreground scenery layer */}
        {fgUrl && (
          <div
            className="absolute inset-0 pointer-events-none z-1"
            style={{
              backgroundImage: `url("${fgUrl}")`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'bottom left',
              backgroundSize: 'auto 100%',
            }}
          />
        )}

        {/* Official vscode-pets Bouncing Ball (green #2ed851 circle) */}
        {ball && ball.active && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${ball.x - 3}px`,
              bottom: `${ball.y - 3}px`,
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#2ed851',
              boxShadow: '0 0 2px rgba(46, 216, 81, 0.6)',
            }}
          />
        )}

        {/* Pets Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {livePets.map((pet) => {
            const spriteSrc = getSpriteUrl(pet.type, pet.color, pet.state);
            const isFlipped = pet.direction === 'left';

            return (
              <div
                key={pet.id}
                onClick={(e) => handlePetInteract(pet.id, e)}
                onMouseEnter={(e) => handlePetInteract(pet.id, e)}
                className="absolute pointer-events-auto cursor-pointer transition-transform duration-75 group"
                style={{
                  left: `${pet.x}px`,
                  bottom: `${pet.y}px`,
                }}
              >
                {/* Official vscode-pets Retro Speech Bubble */}
                {pet.speech && (
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-[8px] bg-white border-2 border-[#333333] text-[#333333] text-[9px] font-mono shadow-sm z-30 animate-in fade-in select-none"
                  >
                    {pet.speech}
                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rotate-45 border-r-2 border-b-2 border-[#333333]" />
                  </div>
                )}

                {/* Official Animated GIF Pet (pixelated rendering) */}
                <img
                  src={spriteSrc}
                  alt={pet.name}
                  onError={async (e) => {
                    const fallbackAction = 'idle';
                    const safeColor = normalizePetColor(pet.type, pet.color);
                    const normSpecies = pet.type === 'duck' ? 'rubber-duck' : pet.type.toLowerCase();
                    const path = `media/${normSpecies}/${safeColor}_${fallbackAction}_8fps.gif`;
                    try {
                      const dataUrl = await ExtensionService.getAssetData('tonybaloney.vscode-pets', path);
                      e.currentTarget.src = dataUrl;
                    } catch {
                      // ignore
                    }
                  }}
                  className="w-8 h-8 object-contain select-none"
                  style={{
                    transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
                    imageRendering: 'pixelated',
                  }}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

VsCodePetsWebview.displayName = 'VsCodePetsWebview';
