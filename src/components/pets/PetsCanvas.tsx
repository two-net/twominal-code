import React, { useEffect, useRef } from 'react';
import { usePets } from '../../context/PetsContext';
import { ArenaTheme, FoodData, ParticleData, PetData } from '../../types/pets';
import { renderPetSprite } from './PetSprites';
import { PetAudio } from './PetAudio';

interface PetsCanvasProps {
  height?: number;
  interactive?: boolean;
  className?: string;
}

export const PetsCanvas: React.FC<PetsCanvasProps> = ({
  height = 180,
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    pets,
    ball,
    food,
    particles,
    theme,
    throwBall,
    interactWithPet,
    addParticle,
  } = usePets();

  // Keep references for animation loop without stale state
  const petsRef = useRef<PetData[]>(pets);
  petsRef.current = pets;

  const ballRef = useRef(ball);
  ballRef.current = ball;

  const foodRef = useRef<FoodData[]>(food);
  foodRef.current = food;

  const particlesRef = useRef<ParticleData[]>(particles);
  particlesRef.current = particles;

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      const floorY = h - 22;

      // 1. Clear & Draw Background Theme
      drawThemeBackground(ctx, width, h, floorY, theme);

      // 2. Update and Draw Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life / p.maxLife;
          if (p.text) {
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // 3. Update & Draw Food
      foodRef.current.forEach((item) => {
        if (item.active) {
          if (item.y < floorY) {
            item.y += item.vy;
          }
          drawFoodItem(ctx, item.type, item.x, item.y);
        }
      });

      // 4. Update & Draw Ball Physics
      if (ballRef.current && ballRef.current.active) {
        const b = ballRef.current;
        b.vy += 0.35; // Gravity
        b.x += b.vx;
        b.y += b.vy;

        // Bounce on floor
        if (b.y >= floorY - b.radius) {
          b.y = floorY - b.radius;
          b.vy = -b.vy * 0.7; // Damping
          b.vx *= 0.95; // Friction
          b.bounces += 1;
          if (Math.abs(b.vy) > 1) {
            PetAudio.playBoing();
          }
          if (b.bounces > 15 || (Math.abs(b.vy) < 0.4 && Math.abs(b.vx) < 0.2)) {
            b.active = false;
          }
        }

        // Wall collisions
        if (b.x <= b.radius) {
          b.x = b.radius;
          b.vx = -b.vx * 0.8;
        } else if (b.x >= width - b.radius) {
          b.x = width - b.radius;
          b.vx = -b.vx * 0.8;
        }

        // Render Ball
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Tennis ball / toy pattern lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x - 2, b.y, b.radius - 2, 0, Math.PI * 0.8);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Update & Draw Pets
      petsRef.current.forEach((pet) => {
        pet.animationTick = (pet.animationTick || 0) + 1;
        pet.y = floorY;

        // Decrement timers
        if (pet.speechTimer && pet.speechTimer > 0) {
          pet.speechTimer -= 1;
          if (pet.speechTimer <= 0) pet.speechText = undefined;
        }

        // Food Detection
        const activeFood = foodRef.current.find((f) => f.active);
        if (activeFood && pet.state !== 'eating') {
          const distToFood = activeFood.x - pet.x;
          if (Math.abs(distToFood) > 10) {
            pet.state = 'chasing';
            pet.direction = distToFood > 0 ? 'right' : 'left';
            pet.vx = (distToFood > 0 ? 1 : -1) * (pet.speed * 1.4);
            pet.x += pet.vx;
          } else {
            // Eat food!
            pet.state = 'eating';
            pet.stateTimer = 45;
            activeFood.active = false;
            pet.hunger = Math.max(0, pet.hunger - 30);
            pet.happiness = Math.min(100, pet.happiness + 20);
            PetAudio.playMunch();
            addParticle(pet.x, pet.y - 15, '❤️ Yum!', '#ec4899');
          }
        }
        // Ball Detection & Chase
        else if (ballRef.current && ballRef.current.active && pet.state !== 'sleeping') {
          const targetX = ballRef.current.x;
          const dist = targetX - pet.x;

          if (Math.abs(dist) > 14) {
            pet.state = 'chasing';
            pet.direction = dist > 0 ? 'right' : 'left';
            pet.vx = (dist > 0 ? 1 : -1) * (pet.speed * 1.6);
            pet.x += pet.vx;
          } else {
            // Boop the ball!
            ballRef.current.vy = -6.5;
            ballRef.current.vx = (Math.random() - 0.5) * 6;
            ballRef.current.bounces = 0;
            pet.state = 'jumping';
            pet.stateTimer = 25;
            pet.happiness = Math.min(100, pet.happiness + 5);
            PetAudio.playBoing();
            addParticle(pet.x, pet.y - 20, '🐾 Boop!', '#38bdf8');
          }
        }
        // Normal State Machine
        else {
          pet.stateTimer = (pet.stateTimer || 50) - 1;

          if (pet.stateTimer <= 0) {
            const roll = Math.random();
            if (roll < 0.45) {
              pet.state = 'walking';
              pet.direction = Math.random() > 0.5 ? 'right' : 'left';
              pet.vx = (pet.direction === 'right' ? 1 : -1) * pet.speed;
              pet.stateTimer = 80 + Math.floor(Math.random() * 100);
            } else if (roll < 0.7) {
              pet.state = 'idle';
              pet.vx = 0;
              pet.stateTimer = 40 + Math.floor(Math.random() * 50);
            } else if (roll < 0.88) {
              pet.state = 'sitting';
              pet.vx = 0;
              pet.stateTimer = 90 + Math.floor(Math.random() * 80);
            } else {
              pet.state = 'sleeping';
              pet.vx = 0;
              pet.stateTimer = 160 + Math.floor(Math.random() * 120);
            }
          }

          if (pet.state === 'walking' || pet.state === 'running') {
            pet.x += pet.vx;

            // Turn around at walls
            if (pet.x <= 20) {
              pet.x = 20;
              pet.direction = 'right';
              pet.vx = Math.abs(pet.vx);
            } else if (pet.x >= width - 20) {
              pet.x = width - 20;
              pet.direction = 'left';
              pet.vx = -Math.abs(pet.vx);
            }
          }
        }

        // Render Pet Sprite
        renderPetSprite(ctx, pet, 1.0);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [theme, addParticle]);

  // Canvas Click: Throw Ball or Interact with Pet
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked on any pet
    let clickedPet: PetData | null = null;
    for (const pet of pets) {
      const dx = Math.abs(pet.x - clickX);
      const dy = Math.abs((pet.y - 12) - clickY);
      if (dx < 25 && dy < 25) {
        clickedPet = pet;
        break;
      }
    }

    if (clickedPet) {
      interactWithPet(clickedPet.id);
    } else {
      // Throw ball towards clicked point
      const startX = clickX < canvas.width / 2 ? 15 : canvas.width - 15;
      const vx = (clickX - startX) * 0.08;
      const vy = (clickY - 40) * 0.08 - 4;
      throwBall(startX, 40, vx, vy);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-slate-800 bg-[#080b12] select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
};

// -------------------------------------------------------------
// Background Theme Renderers
// -------------------------------------------------------------

function drawThemeBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  floorY: number,
  theme: ArenaTheme
) {
  switch (theme) {
    case 'cyberpunk': {
      // Dark purple-cyan gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f051d');
      grad.addColorStop(0.7, '#1e103a');
      grad.addColorStop(1, '#090314');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Neon horizon grid
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();

      // Grid perspective lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x + (x - w / 2) * 0.5, h);
        ctx.stroke();
      }
      break;
    }
    case 'forest': {
      // Soft sky
      const sky = ctx.createLinearGradient(0, 0, 0, floorY);
      sky.addColorStop(0, '#0c2340');
      sky.addColorStop(1, '#1b4332');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, floorY);

      // Distant Trees
      ctx.fillStyle = '#2d6a4f';
      for (let i = 10; i < w; i += 45) {
        ctx.beginPath();
        ctx.moveTo(i, floorY);
        ctx.lineTo(i + 15, floorY - 35);
        ctx.lineTo(i + 30, floorY);
        ctx.fill();
      }

      // Green Grass Floor
      ctx.fillStyle = '#40916c';
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = '#52b788';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();

      // Grass Tufts
      ctx.fillStyle = '#74c69d';
      for (let g = 15; g < w; g += 35) {
        ctx.fillRect(g, floorY - 3, 2, 4);
        ctx.fillRect(g + 3, floorY - 5, 2, 6);
        ctx.fillRect(g + 6, floorY - 2, 2, 3);
      }
      break;
    }
    case 'beach': {
      // Sky & Sun
      const sky = ctx.createLinearGradient(0, 0, 0, floorY);
      sky.addColorStop(0, '#0284c7');
      sky.addColorStop(1, '#38bdf8');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, floorY);

      // Sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(w - 50, 35, 18, 0, Math.PI * 2);
      ctx.fill();

      // Sandy Floor
      ctx.fillStyle = '#fde047';
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();
      break;
    }
    case 'space': {
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 40; s++) {
        const sx = (s * 47) % w;
        const sy = (s * 31) % (floorY - 10);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Moon / Lunar Floor
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();
      break;
    }
    case 'matrix': {
      ctx.fillStyle = '#020d08';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.font = '10px monospace';
      for (let x = 10; x < w; x += 25) {
        ctx.fillText('1010', x, 30);
        ctx.fillText('0101', x, 60);
        ctx.fillText('1100', x, 90);
      }

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();
      break;
    }
    case 'sunset': {
      const grad = ctx.createLinearGradient(0, 0, 0, floorY);
      grad.addColorStop(0, '#4c1d95');
      grad.addColorStop(0.5, '#be185d');
      grad.addColorStop(1, '#f97316');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, floorY);

      // Mountains
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(80, floorY - 40);
      ctx.lineTo(160, floorY);
      ctx.lineTo(260, floorY - 55);
      ctx.lineTo(w, floorY);
      ctx.fill();

      // Floor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();
      break;
    }
    case 'castle':
    default: {
      // Stone castle wall
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);

      // Brick lines
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      for (let y = 15; y < floorY; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        const offset = (y % 40 === 15) ? 0 : 25;
        for (let bx = offset; bx < w; bx += 50) {
          ctx.beginPath();
          ctx.moveTo(bx, y);
          ctx.lineTo(bx, y + 20);
          ctx.stroke();
        }
      }

      // Stone floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();
      break;
    }
  }
}

function drawFoodItem(
  ctx: CanvasRenderingContext2D,
  type: FoodData['type'],
  x: number,
  y: number
) {
  ctx.save();
  ctx.translate(x, y);

  switch (type) {
    case 'fish':
      // Blue fish
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-8, -4, 12, 6);
      ctx.beginPath();
      ctx.moveTo(4, -1);
      ctx.lineTo(9, -5);
      ctx.lineTo(9, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -3, 2, 2);
      break;
    case 'apple':
      // Red apple
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      // Green leaf
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, -7, 3, 2);
      break;
    case 'bone':
      // White bone
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-6, -2, 12, 4);
      ctx.beginPath();
      ctx.arc(-6, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(-6, 2, 2.5, 0, Math.PI * 2);
      ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(6, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'seed':
      // Golden seeds
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -2, 3, 3);
      ctx.fillRect(1, -3, 3, 3);
      ctx.fillRect(-1, 0, 3, 3);
      break;
    case 'cookie':
      // Chocolate chip cookie
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-2, -2, 1.5, 1.5);
      ctx.fillRect(2, -1, 1.5, 1.5);
      ctx.fillRect(-1, 2, 1.5, 1.5);
      break;
    default:
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-4, -4, 8, 8);
      break;
  }

  ctx.restore();
}
