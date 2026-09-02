import { PetColor, PetData, PetType } from '../../types/pets';

// Color Palette Mappings
export function getPetColors(type: PetType, color: PetColor): {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  outline: string;
} {
  switch (color) {
    case 'black':
      return { primary: '#1e2029', secondary: '#12131a', accent: '#ff8080', highlight: '#3a3e52', outline: '#090a0f' };
    case 'brown':
      return { primary: '#8d5b4c', secondary: '#63382c', accent: '#f5c396', highlight: '#b57967', outline: '#3d1e16' };
    case 'white':
      return { primary: '#f1f5f9', secondary: '#cbd5e1', accent: '#fda4af', highlight: '#ffffff', outline: '#64748b' };
    case 'orange':
    case 'ginger':
      return { primary: '#f97316', secondary: '#c2410c', accent: '#fed7aa', highlight: '#fb923c', outline: '#7c2d12' };
    case 'yellow':
      return { primary: '#eab308', secondary: '#ca8a04', accent: '#fef08a', highlight: '#fde047', outline: '#713f12' };
    case 'gray':
      return { primary: '#64748b', secondary: '#475569', accent: '#e2e8f0', highlight: '#94a3b8', outline: '#1e293b' };
    case 'red':
      return { primary: '#ef4444', secondary: '#b91c1c', accent: '#fecaca', highlight: '#f87171', outline: '#7f1d1d' };
    case 'blue':
      return { primary: '#3b82f6', secondary: '#1d4ed8', accent: '#bfdbfe', highlight: '#60a5fa', outline: '#1e3a8a' };
    case 'calico':
      return { primary: '#ea580c', secondary: '#1e293b', accent: '#f8fafc', highlight: '#fed7aa', outline: '#0f172a' };
    case 'akita':
      return { primary: '#d97706', secondary: '#92400e', accent: '#ffffff', highlight: '#fbbf24', outline: '#451a03' };
    case 'green':
      return { primary: '#10b981', secondary: '#047857', accent: '#a7f3d0', highlight: '#34d399', outline: '#064e3b' };
    case 'purple':
      return { primary: '#8b5cf6', secondary: '#6d28d9', accent: '#ddd6fe', highlight: '#a78bfa', outline: '#4c1d95' };
    case 'neon':
      return { primary: '#06b6d4', secondary: '#ec4899', accent: '#a855f7', highlight: '#22d3ee', outline: '#0f172a' };
    case 'pink':
      return { primary: '#f43f5e', secondary: '#be123c', accent: '#fecdd3', highlight: '#fb7185', outline: '#881337' };
    case 'default':
    default:
      switch (type) {
        case 'cat':
          return { primary: '#ea580c', secondary: '#9a3412', accent: '#fed7aa', highlight: '#f97316', outline: '#431407' };
        case 'dog':
          return { primary: '#b45309', secondary: '#78350f', accent: '#fde68a', highlight: '#d97706', outline: '#451a03' };
        case 'duck':
        case 'rubber-duck':
          return { primary: '#facc15', secondary: '#ca8a04', accent: '#f97316', highlight: '#fef08a', outline: '#713f12' };
        case 'crab':
          return { primary: '#ef4444', secondary: '#b91c1c', accent: '#fca5a5', highlight: '#f87171', outline: '#7f1d1d' };
        case 'snake':
          return { primary: '#22c55e', secondary: '#15803d', accent: '#ef4444', highlight: '#4ade80', outline: '#14532d' };
        case 'clippy':
          return { primary: '#94a3b8', secondary: '#64748b', accent: '#f8fafc', highlight: '#cbd5e1', outline: '#1e293b' };
        case 'rocky':
          return { primary: '#64748b', secondary: '#475569', accent: '#f8fafc', highlight: '#94a3b8', outline: '#1e293b' };
        case 'totoro':
          return { primary: '#64748b', secondary: '#334155', accent: '#f1f5f9', highlight: '#94a3b8', outline: '#0f172a' };
        case 'fox':
          return { primary: '#ea580c', secondary: '#9a3412', accent: '#ffffff', highlight: '#fb923c', outline: '#431407' };
        case 'penguin':
          return { primary: '#1e293b', secondary: '#0f172a', accent: '#ffffff', highlight: '#f59e0b', outline: '#020617' };
        case 'chicken':
          return { primary: '#f8fafc', secondary: '#e2e8f0', accent: '#ef4444', highlight: '#ffffff', outline: '#64748b' };
        case 'frog':
          return { primary: '#4ade80', secondary: '#16a34a', accent: '#bbf7d0', highlight: '#86efac', outline: '#14532d' };
        case 'horse':
          return { primary: '#78350f', secondary: '#451a03', accent: '#fef3c7', highlight: '#92400e', outline: '#291102' };
        case 'snail':
          return { primary: '#fbbf24', secondary: '#b45309', accent: '#fed7aa', highlight: '#fde68a', outline: '#78350f' };
        case 'panda':
          return { primary: '#ffffff', secondary: '#0f172a', accent: '#cbd5e1', highlight: '#ffffff', outline: '#020617' };
        case 'monkey':
          return { primary: '#92400e', secondary: '#78350f', accent: '#fed7aa', highlight: '#b45309', outline: '#451a03' };
        case 'turtle':
          return { primary: '#15803d', secondary: '#166534', accent: '#86efac', highlight: '#22c55e', outline: '#14532d' };
        case 'bunny':
          return { primary: '#f8fafc', secondary: '#e2e8f0', accent: '#fca5a5', highlight: '#ffffff', outline: '#94a3b8' };
        case 'cockatiel':
          return { primary: '#94a3b8', secondary: '#64748b', accent: '#fde047', highlight: '#f87171', outline: '#334155' };
        case 'deno':
          return { primary: '#14b8a6', secondary: '#0f766e', accent: '#99f6e4', highlight: '#2dd4bf', outline: '#115e59' };
        case 'skeleton':
          return { primary: '#e2e8f0', secondary: '#94a3b8', accent: '#cbd5e1', highlight: '#ffffff', outline: '#334155' };
        case 'zappy':
          return { primary: '#facc15', secondary: '#eab308', accent: '#60a5fa', highlight: '#fef08a', outline: '#a16207' };
        case 'rat':
        case 'raccoon':
          return { primary: '#64748b', secondary: '#334155', accent: '#fca5a5', highlight: '#94a3b8', outline: '#1e293b' };
        default:
          return { primary: '#6366f1', secondary: '#4338ca', accent: '#c7d2fe', highlight: '#818cf8', outline: '#312e81' };
      }
  }
}

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string,
  outlineColor?: string
) {
  ctx.fillStyle = fillColor;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
  }
}

export function renderPetSprite(
  ctx: CanvasRenderingContext2D,
  pet: PetData,
  scaleFactor: number
) {
  ctx.save();
  ctx.translate(Math.round(pet.x), Math.round(pet.y));

  // Mirror horizontally if facing left
  if (pet.direction === 'left') {
    ctx.scale(-1, 1);
  }

  const baseScale =
    pet.size === 'nano'
      ? 0.7
      : pet.size === 'small'
      ? 0.85
      : pet.size === 'large'
      ? 1.4
      : 1.0;
  const s = baseScale * scaleFactor;
  ctx.scale(s, s);

  const colors = getPetColors(pet.type, pet.color);
  const isSleeping = pet.state === 'sleeping';
  const isSitting = pet.state === 'sitting';
  const isJumping = pet.state === 'jumping';
  const walkPhase = Math.sin(pet.animationTick * 0.4);
  const legOffset =
    pet.state === 'walking' || pet.state === 'running' || pet.state === 'chasing'
      ? walkPhase * 3
      : 0;

  // Render Sprite by Pet Type
  switch (pet.type) {
    case 'cat':
      drawCat(ctx, colors, pet.state, legOffset, isSleeping, isSitting, isJumping);
      break;
    case 'dog':
      drawDog(ctx, colors, pet.state, legOffset, isSleeping, isSitting, isJumping);
      break;
    case 'duck':
    case 'rubber-duck':
      drawDuck(ctx, colors, pet.state, legOffset, isSleeping, pet.type === 'rubber-duck');
      break;
    case 'crab':
      drawCrab(ctx, colors, pet.state, legOffset);
      break;
    case 'snake':
      drawSnake(ctx, colors, pet.state, pet.animationTick);
      break;
    case 'clippy':
      drawClippy(ctx, colors, pet.state, pet.animationTick);
      break;
    case 'rocky':
      drawRocky(ctx, colors, pet.state, pet.animationTick);
      break;
    case 'totoro':
      drawTotoro(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'fox':
      drawFox(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'penguin':
      drawPenguin(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'chicken':
      drawChicken(ctx, colors, pet.state, legOffset, pet.animationTick);
      break;
    case 'frog':
      drawFrog(ctx, colors, pet.state, pet.animationTick);
      break;
    case 'bunny':
      drawBunny(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'horse':
      drawHorse(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'snail':
      drawSnail(ctx, colors, pet.state, pet.animationTick);
      break;
    case 'panda':
      drawPanda(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'monkey':
      drawMonkey(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'turtle':
      drawTurtle(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'cockatiel':
      drawCockatiel(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'deno':
      drawDeno(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'skeleton':
      drawSkeleton(ctx, colors, pet.state, legOffset, isSleeping);
      break;
    case 'zappy':
      drawZappy(ctx, colors, pet.state, pet.animationTick);
      break;
    case 'rat':
    case 'raccoon':
    case 'morph':
    default:
      drawCat(ctx, colors, pet.state, legOffset, isSleeping, isSitting, isJumping);
      break;
  }

  ctx.restore();

  // Draw floating speech bubble or Zzz
  if (isSleeping) {
    drawSleepZzz(ctx, pet.x, pet.y - 20 * s, pet.animationTick);
  } else if (pet.speechText && (pet.speechTimer ?? 0) > 0) {
    drawSpeechBubble(ctx, pet.x, pet.y - 24 * s, pet.speechText);
  }
}

// -------------------------------------------------------------
// Pet Sprite Implementations
// -------------------------------------------------------------

function drawCat(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean,
  isSitting: boolean,
  isJumping: boolean
) {
  // Tail
  const tailY = isSitting ? -6 : -10;
  const tailWiggle = isSleeping ? 0 : Math.sin(legOffset) * 4;
  drawPixelRect(ctx, -14, tailY + tailWiggle, 4, 8, colors.primary, colors.outline);
  drawPixelRect(ctx, -16, tailY - 4 + tailWiggle * 1.5, 4, 6, colors.primary, colors.outline);

  // Body
  const bodyH = isSitting ? 14 : 12;
  const bodyY = isSitting ? -14 : -12 - (isJumping ? 6 : 0);
  drawPixelRect(ctx, -10, bodyY, 18, bodyH, colors.primary, colors.outline);
  drawPixelRect(ctx, -4, bodyY + 2, 8, 6, colors.accent);

  // Head
  const headY = isSitting ? -22 : -18 - (isJumping ? 6 : 0);
  drawPixelRect(ctx, 2, headY, 14, 12, colors.primary, colors.outline);

  // Ears
  drawPixelRect(ctx, 3, headY - 5, 4, 5, colors.primary, colors.outline);
  drawPixelRect(ctx, 4, headY - 3, 2, 3, '#fca5a5');
  drawPixelRect(ctx, 11, headY - 5, 4, 5, colors.primary, colors.outline);
  drawPixelRect(ctx, 12, headY - 3, 2, 3, '#fca5a5');

  // Eyes
  if (isSleeping) {
    drawPixelRect(ctx, 6, headY + 5, 3, 1, '#1e293b');
    drawPixelRect(ctx, 12, headY + 5, 3, 1, '#1e293b');
  } else {
    drawPixelRect(ctx, 6, headY + 4, 3, 4, '#0f172a');
    drawPixelRect(ctx, 7, headY + 4, 1, 2, '#ffffff');
    drawPixelRect(ctx, 12, headY + 4, 3, 4, '#0f172a');
    drawPixelRect(ctx, 13, headY + 4, 1, 2, '#ffffff');
  }

  // Pink nose
  drawPixelRect(ctx, 10, headY + 7, 2, 2, '#f43f5e');

  // Whiskers
  drawPixelRect(ctx, 14, headY + 6, 4, 1, '#cbd5e1');
  drawPixelRect(ctx, 14, headY + 9, 4, 1, '#cbd5e1');

  // Legs
  if (!isSitting && !isSleeping) {
    drawPixelRect(ctx, -8 + legOffset, 0 - (isJumping ? 6 : 0), 4, 4, colors.secondary, colors.outline);
    drawPixelRect(ctx, 4 - legOffset, 0 - (isJumping ? 6 : 0), 4, 4, colors.secondary, colors.outline);
  } else {
    drawPixelRect(ctx, -6, 0, 14, 3, colors.secondary, colors.outline);
  }
}

function drawDog(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean,
  isSitting: boolean,
  isJumping: boolean
) {
  const tailY = isSitting ? -8 : -11;
  const tailWag = isSleeping ? 0 : Math.sin(legOffset * 2) * 5;
  drawPixelRect(ctx, -14, tailY + tailWag, 4, 7, colors.secondary, colors.outline);

  const bodyH = isSitting ? 15 : 13;
  const bodyY = isSitting ? -15 : -13 - (isJumping ? 6 : 0);
  drawPixelRect(ctx, -10, bodyY, 18, bodyH, colors.primary, colors.outline);

  // Collar
  drawPixelRect(ctx, 2, bodyY + 1, 3, 9, '#ef4444');
  drawPixelRect(ctx, 3, bodyY + 7, 2, 2, '#fbbf24');

  const headY = isSitting ? -23 : -19 - (isJumping ? 6 : 0);
  drawPixelRect(ctx, 2, headY, 13, 13, colors.primary, colors.outline);
  drawPixelRect(ctx, 11, headY + 5, 6, 6, colors.accent, colors.outline);

  drawPixelRect(ctx, 0, headY - 1, 4, 9, colors.secondary, colors.outline);
  drawPixelRect(ctx, 11, headY - 1, 4, 8, colors.secondary, colors.outline);

  if (isSleeping) {
    drawPixelRect(ctx, 5, headY + 4, 3, 1, '#1e293b');
  } else {
    drawPixelRect(ctx, 5, headY + 3, 3, 3, '#0f172a');
    drawPixelRect(ctx, 6, headY + 3, 1, 1, '#ffffff');
  }

  drawPixelRect(ctx, 15, headY + 5, 3, 3, '#0f172a');

  if (!isSitting && !isSleeping) {
    drawPixelRect(ctx, -8 + legOffset, 0 - (isJumping ? 6 : 0), 4, 5, colors.secondary, colors.outline);
    drawPixelRect(ctx, 4 - legOffset, 0 - (isJumping ? 6 : 0), 4, 5, colors.secondary, colors.outline);
  } else {
    drawPixelRect(ctx, -6, 0, 14, 4, colors.secondary, colors.outline);
  }
}

function drawDuck(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean,
  isRubber: boolean
) {
  drawPixelRect(ctx, -10, -12, 16, 12, colors.primary, colors.outline);
  const wingOffset = Math.sin(legOffset) * 2;
  drawPixelRect(ctx, -6, -10 + wingOffset, 8, 6, colors.secondary, colors.outline);
  drawPixelRect(ctx, 0, -20, 12, 11, colors.primary, colors.outline);

  if (isSleeping) {
    drawPixelRect(ctx, 5, -16, 3, 1, '#1e293b');
  } else {
    drawPixelRect(ctx, 5, -17, 3, 3, '#0f172a');
    drawPixelRect(ctx, 6, -17, 1, 1, '#ffffff');
  }

  drawPixelRect(ctx, 10, -15, 6, 4, '#f97316', '#7c2d12');

  if (!isRubber) {
    drawPixelRect(ctx, -6 + legOffset, 0, 5, 2, '#f97316');
    drawPixelRect(ctx, 2 - legOffset, 0, 5, 2, '#f97316');
  }
}

function drawBunny(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Fluffy Tail
  drawPixelRect(ctx, -13, -8, 4, 4, '#ffffff', colors.outline);
  // Body
  drawPixelRect(ctx, -10, -12, 16, 12, colors.primary, colors.outline);
  // Head
  drawPixelRect(ctx, 2, -18, 11, 11, colors.primary, colors.outline);
  // Long Bunny Ears
  drawPixelRect(ctx, 3, -27, 3, 10, colors.primary, colors.outline);
  drawPixelRect(ctx, 4, -26, 1, 7, '#fca5a5');
  drawPixelRect(ctx, 8, -27, 3, 10, colors.primary, colors.outline);
  drawPixelRect(ctx, 9, -26, 1, 7, '#fca5a5');

  if (isSleeping) {
    drawPixelRect(ctx, 5, -14, 3, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 5, -15, 3, 3, '#0f172a');
    drawPixelRect(ctx, 6, -15, 1, 1, '#ffffff');
  }
  // Nose
  drawPixelRect(ctx, 11, -12, 2, 2, '#f43f5e');

  drawPixelRect(ctx, -7 + legOffset, 0, 4, 3, colors.secondary);
  drawPixelRect(ctx, 3 - legOffset, 0, 4, 3, colors.secondary);
}

function drawHorse(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Mane & Tail
  drawPixelRect(ctx, -15, -18, 3, 12, colors.secondary);
  // Body
  drawPixelRect(ctx, -12, -18, 22, 14, colors.primary, colors.outline);
  // Neck & Head
  drawPixelRect(ctx, 4, -28, 7, 14, colors.primary, colors.outline);
  drawPixelRect(ctx, 7, -31, 10, 8, colors.primary, colors.outline);
  drawPixelRect(ctx, 14, -28, 5, 5, colors.secondary); // Muzzle

  if (isSleeping) {
    drawPixelRect(ctx, 10, -29, 3, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 10, -30, 2, 2, '#0f172a');
  }

  // 4 Legs
  drawPixelRect(ctx, -10 + legOffset, -4, 3, 6, colors.primary);
  drawPixelRect(ctx, -10 + legOffset, 0, 3, 2, '#0f172a'); // Hoof
  drawPixelRect(ctx, 4 - legOffset, -4, 3, 6, colors.primary);
  drawPixelRect(ctx, 4 - legOffset, 0, 3, 2, '#0f172a');
}

function drawSnail(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  tick: number
) {
  const crawl = Math.sin(tick * 0.1) * 2;
  // Shell spiral
  drawPixelRect(ctx, -12, -18, 16, 16, colors.primary, colors.outline);
  drawPixelRect(ctx, -8, -14, 8, 8, colors.secondary);

  // Snail body
  drawPixelRect(ctx, -14 + crawl, -6, 26, 6, colors.accent, colors.outline);

  // Eye stalks
  drawPixelRect(ctx, 7 + crawl, -14, 2, 8, colors.accent);
  drawPixelRect(ctx, 6 + crawl, -16, 4, 3, '#ffffff', '#0f172a');
  drawPixelRect(ctx, 7 + crawl, -15, 2, 2, '#0f172a');
}

function drawPanda(
  ctx: CanvasRenderingContext2D,
  _colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Body (White with black arms/legs)
  drawPixelRect(ctx, -10, -14, 18, 14, '#ffffff', '#0f172a');
  drawPixelRect(ctx, -10, -14, 5, 14, '#0f172a');
  // Head
  drawPixelRect(ctx, 2, -22, 14, 14, '#ffffff', '#0f172a');
  // Black Panda Ears
  drawPixelRect(ctx, 2, -26, 4, 5, '#0f172a');
  drawPixelRect(ctx, 11, -26, 4, 5, '#0f172a');
  // Black Eye Patches
  drawPixelRect(ctx, 4, -18, 4, 5, '#0f172a');
  drawPixelRect(ctx, 10, -18, 4, 5, '#0f172a');

  if (isSleeping) {
    drawPixelRect(ctx, 5, -16, 2, 1, '#ffffff');
    drawPixelRect(ctx, 11, -16, 2, 1, '#ffffff');
  } else {
    drawPixelRect(ctx, 5, -17, 2, 2, '#ffffff');
    drawPixelRect(ctx, 11, -17, 2, 2, '#ffffff');
  }

  // Nose
  drawPixelRect(ctx, 8, -13, 2, 2, '#0f172a');

  // Legs
  drawPixelRect(ctx, -7 + legOffset, 0, 4, 4, '#0f172a');
  drawPixelRect(ctx, 3 - legOffset, 0, 4, 4, '#0f172a');
}

function drawMonkey(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Curled Tail
  drawPixelRect(ctx, -16, -16, 4, 10, colors.primary);
  drawPixelRect(ctx, -14, -18, 6, 3, colors.primary);
  // Body
  drawPixelRect(ctx, -10, -13, 16, 13, colors.primary, colors.outline);
  drawPixelRect(ctx, -4, -10, 8, 8, colors.accent); // Belly
  // Head
  drawPixelRect(ctx, 2, -21, 13, 13, colors.primary, colors.outline);
  drawPixelRect(ctx, 4, -17, 9, 8, colors.accent); // Face
  // Round Ears
  drawPixelRect(ctx, 0, -19, 4, 5, colors.accent, colors.outline);
  drawPixelRect(ctx, 13, -19, 4, 5, colors.accent, colors.outline);

  if (isSleeping) {
    drawPixelRect(ctx, 5, -15, 2, 1, '#0f172a');
    drawPixelRect(ctx, 9, -15, 2, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 5, -16, 2, 2, '#0f172a');
    drawPixelRect(ctx, 9, -16, 2, 2, '#0f172a');
  }

  drawPixelRect(ctx, -7 + legOffset, 0, 4, 4, colors.secondary);
  drawPixelRect(ctx, 3 - legOffset, 0, 4, 4, colors.secondary);
}

function drawTurtle(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Shell Dome
  drawPixelRect(ctx, -12, -14, 22, 12, colors.primary, colors.outline);
  drawPixelRect(ctx, -8, -12, 14, 8, colors.secondary);
  // Head
  drawPixelRect(ctx, 8, -10, 8, 7, colors.highlight, colors.outline);

  if (isSleeping) {
    drawPixelRect(ctx, 11, -8, 2, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 11, -9, 2, 2, '#0f172a');
  }

  // Flippers
  drawPixelRect(ctx, -8 + legOffset, -2, 5, 4, colors.highlight);
  drawPixelRect(ctx, 4 - legOffset, -2, 5, 4, colors.highlight);
}

function drawCockatiel(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Body & Tail
  drawPixelRect(ctx, -14, -8, 8, 5, colors.secondary);
  drawPixelRect(ctx, -8, -14, 14, 13, colors.primary, colors.outline);
  // Head & Crest
  drawPixelRect(ctx, 2, -22, 10, 10, colors.accent, colors.outline);
  drawPixelRect(ctx, 3, -28, 4, 7, '#facc15'); // Yellow Crest
  // Orange Cheek
  drawPixelRect(ctx, 4, -16, 3, 3, '#f97316');
  // Beak
  drawPixelRect(ctx, 10, -18, 4, 4, '#64748b');

  if (isSleeping) {
    drawPixelRect(ctx, 6, -19, 2, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 6, -20, 2, 2, '#0f172a');
  }

  drawPixelRect(ctx, -4 + legOffset, 0, 3, 2, '#64748b');
  drawPixelRect(ctx, 2 - legOffset, 0, 3, 2, '#64748b');
}

function drawDeno(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  // Dino Body & Tail
  drawPixelRect(ctx, -14, -14, 6, 6, colors.primary);
  drawPixelRect(ctx, -10, -16, 18, 15, colors.primary, colors.outline);
  // Back Spikes
  drawPixelRect(ctx, -8, -19, 3, 4, colors.secondary);
  drawPixelRect(ctx, -2, -19, 3, 4, colors.secondary);
  drawPixelRect(ctx, 4, -19, 3, 4, colors.secondary);
  // Snout Head
  drawPixelRect(ctx, 4, -24, 12, 11, colors.primary, colors.outline);

  if (isSleeping) {
    drawPixelRect(ctx, 8, -20, 3, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 8, -21, 3, 3, '#0f172a');
    drawPixelRect(ctx, 9, -21, 1, 1, '#ffffff');
  }

  drawPixelRect(ctx, -6 + legOffset, 0, 4, 4, colors.secondary);
  drawPixelRect(ctx, 4 - legOffset, 0, 4, 4, colors.secondary);
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  _isSleeping: boolean
) {
  // Ribcage Body
  drawPixelRect(ctx, -6, -14, 12, 12, colors.primary, colors.outline);
  drawPixelRect(ctx, -4, -12, 8, 2, '#0f172a');
  drawPixelRect(ctx, -4, -8, 8, 2, '#0f172a');
  // Skull Head
  drawPixelRect(ctx, -8, -24, 16, 11, colors.primary, colors.outline);
  // Dark Eye Sockets
  drawPixelRect(ctx, -5, -20, 3, 4, '#0f172a');
  drawPixelRect(ctx, 2, -20, 3, 4, '#0f172a');
  // Teeth
  drawPixelRect(ctx, -3, -15, 6, 2, '#0f172a');

  drawPixelRect(ctx, -5 + legOffset, 0, 3, 4, colors.secondary);
  drawPixelRect(ctx, 2 - legOffset, 0, 3, 4, colors.secondary);
}

function drawZappy(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  tick: number
) {
  const spark = Math.sin(tick * 0.4) * 2;
  // Lightning bolt body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(0, -26 + spark);
  ctx.lineTo(8, -14 + spark);
  ctx.lineTo(2, -14 + spark);
  ctx.lineTo(10, 0 + spark);
  ctx.lineTo(-4, -10 + spark);
  ctx.lineTo(1, -10 + spark);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.outline;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eyes
  drawPixelRect(ctx, 0, -18 + spark, 2, 3, '#0f172a');
  drawPixelRect(ctx, 4, -18 + spark, 2, 3, '#0f172a');
}

function drawCrab(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number
) {
  drawPixelRect(ctx, -12, -10, 24, 10, colors.primary, colors.outline);
  drawPixelRect(ctx, -6, -8, 12, 6, colors.highlight);

  drawPixelRect(ctx, -6, -16, 4, 6, colors.primary, colors.outline);
  drawPixelRect(ctx, -6, -16, 4, 4, '#ffffff');
  drawPixelRect(ctx, -5, -15, 2, 2, '#0f172a');

  drawPixelRect(ctx, 2, -16, 4, 6, colors.primary, colors.outline);
  drawPixelRect(ctx, 2, -16, 4, 4, '#ffffff');
  drawPixelRect(ctx, 3, -15, 2, 2, '#0f172a');

  const clawWave = Math.sin(legOffset * 1.5) * 3;
  drawPixelRect(ctx, -18, -14 + clawWave, 6, 7, colors.primary, colors.outline);
  drawPixelRect(ctx, -19, -16 + clawWave, 4, 4, colors.secondary);

  drawPixelRect(ctx, 12, -14 - clawWave, 6, 7, colors.primary, colors.outline);
  drawPixelRect(ctx, 15, -16 - clawWave, 4, 4, colors.secondary);

  drawPixelRect(ctx, -11 + legOffset, 0, 3, 3, colors.secondary);
  drawPixelRect(ctx, -5 - legOffset, 0, 3, 3, colors.secondary);
  drawPixelRect(ctx, 1 + legOffset, 0, 3, 3, colors.secondary);
  drawPixelRect(ctx, 7 - legOffset, 0, 3, 3, colors.secondary);
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  tick: number
) {
  for (let i = 0; i < 6; i++) {
    const segX = -12 + i * 4;
    const wave = Math.sin((tick * 0.3) + i * 0.8) * 3;
    drawPixelRect(ctx, segX, -6 + wave, 5, 6, i % 2 === 0 ? colors.primary : colors.secondary, colors.outline);
  }

  const headWave = Math.sin(tick * 0.3 + 4.8) * 3;
  drawPixelRect(ctx, 12, -8 + headWave, 7, 7, colors.primary, colors.outline);
  drawPixelRect(ctx, 14, -7 + headWave, 2, 2, '#fde047');
  drawPixelRect(ctx, 15, -7 + headWave, 1, 2, '#0f172a');

  if (Math.sin(tick * 0.5) > 0.4) {
    drawPixelRect(ctx, 19, -5 + headWave, 4, 1, '#ef4444');
    drawPixelRect(ctx, 22, -6 + headWave, 1, 3, '#ef4444');
  }
}

function drawClippy(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  tick: number
) {
  const bob = Math.sin(tick * 0.15) * 2;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 0 + bob);
  ctx.lineTo(-6, -18 + bob);
  ctx.arc(0, -18 + bob, 6, Math.PI, 0, false);
  ctx.lineTo(6, -4 + bob);
  ctx.arc(2, -4 + bob, 4, 0, Math.PI, false);
  ctx.lineTo(-2, -14 + bob);
  ctx.arc(0, -14 + bob, 2, Math.PI, 0, false);
  ctx.lineTo(2, -8 + bob);
  ctx.stroke();

  drawPixelRect(ctx, -8, -18 + bob, 6, 6, '#ffffff', '#0f172a');
  drawPixelRect(ctx, -6, -16 + bob, 2, 2, '#0f172a');

  drawPixelRect(ctx, 2, -18 + bob, 6, 6, '#ffffff', '#0f172a');
  drawPixelRect(ctx, 4, -16 + bob, 2, 2, '#0f172a');

  const browAngle = Math.sin(tick * 0.2) * 2;
  drawPixelRect(ctx, -9, -21 + bob + browAngle, 7, 2, '#0f172a');
  drawPixelRect(ctx, 1, -21 + bob - browAngle, 7, 2, '#0f172a');
}

function drawRocky(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  tick: number
) {
  drawPixelRect(ctx, -12, -14, 24, 14, colors.primary, colors.outline);
  drawPixelRect(ctx, -10, -16, 20, 4, colors.secondary);
  drawPixelRect(ctx, -6, -12, 10, 4, colors.highlight);

  const blink = Math.sin(tick * 0.1) > 0.96;
  if (blink) {
    drawPixelRect(ctx, -6, -9, 4, 1, '#0f172a');
    drawPixelRect(ctx, 2, -9, 4, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, -7, -11, 5, 5, '#ffffff', '#0f172a');
    drawPixelRect(ctx, -5, -9, 2, 2, '#0f172a');
    drawPixelRect(ctx, 2, -11, 5, 5, '#ffffff', '#0f172a');
    drawPixelRect(ctx, 4, -9, 2, 2, '#0f172a');
  }

  drawPixelRect(ctx, -9, -5, 3, 2, '#fca5a5');
  drawPixelRect(ctx, 6, -5, 3, 2, '#fca5a5');
}

function drawTotoro(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  drawPixelRect(ctx, -12, -20, 24, 20, colors.primary, colors.outline);
  drawPixelRect(ctx, -8, -14, 16, 13, '#f8fafc');
  drawPixelRect(ctx, -4, -12, 2, 2, colors.secondary);
  drawPixelRect(ctx, 2, -12, 2, 2, colors.secondary);
  drawPixelRect(ctx, -1, -8, 2, 2, colors.secondary);

  drawPixelRect(ctx, -8, -25, 4, 6, colors.primary, colors.outline);
  drawPixelRect(ctx, 4, -25, 4, 6, colors.primary, colors.outline);
  drawPixelRect(ctx, -2, -26, 6, 3, '#22c55e', '#15803d');

  if (isSleeping) {
    drawPixelRect(ctx, -6, -17, 3, 1, '#0f172a');
    drawPixelRect(ctx, 3, -17, 3, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, -6, -18, 4, 4, '#ffffff', '#0f172a');
    drawPixelRect(ctx, -4, -17, 2, 2, '#0f172a');
    drawPixelRect(ctx, 3, -18, 4, 4, '#ffffff', '#0f172a');
    drawPixelRect(ctx, 5, -17, 2, 2, '#0f172a');
  }

  drawPixelRect(ctx, -8 + legOffset, 0, 6, 3, colors.secondary);
  drawPixelRect(ctx, 2 - legOffset, 0, 6, 3, colors.secondary);
}

function drawFox(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  drawPixelRect(ctx, -18, -12, 8, 8, colors.primary, colors.outline);
  drawPixelRect(ctx, -22, -15, 6, 6, '#ffffff', colors.outline);
  drawPixelRect(ctx, -10, -12, 18, 12, colors.primary, colors.outline);
  drawPixelRect(ctx, 0, -10, 8, 8, '#ffffff');

  drawPixelRect(ctx, 4, -18, 11, 11, colors.primary, colors.outline);
  drawPixelRect(ctx, 11, -14, 6, 5, '#ffffff', colors.outline);
  drawPixelRect(ctx, 15, -14, 2, 2, '#0f172a');

  drawPixelRect(ctx, 4, -23, 4, 6, '#0f172a');
  drawPixelRect(ctx, 5, -21, 2, 3, colors.primary);
  drawPixelRect(ctx, 11, -23, 4, 6, '#0f172a');
  drawPixelRect(ctx, 12, -21, 2, 3, colors.primary);

  if (isSleeping) {
    drawPixelRect(ctx, 7, -14, 3, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, 7, -15, 3, 3, '#0f172a');
    drawPixelRect(ctx, 8, -15, 1, 1, '#ffffff');
  }

  drawPixelRect(ctx, -7 + legOffset, 0, 3, 4, '#0f172a');
  drawPixelRect(ctx, 5 - legOffset, 0, 3, 4, '#0f172a');
}

function drawPenguin(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  isSleeping: boolean
) {
  drawPixelRect(ctx, -8, -16, 16, 16, colors.primary, colors.outline);
  drawPixelRect(ctx, -4, -13, 9, 12, '#ffffff');

  const wingY = Math.sin(legOffset) * 2;
  drawPixelRect(ctx, -10, -12 + wingY, 3, 8, colors.secondary);
  drawPixelRect(ctx, 7, -12 - wingY, 3, 8, colors.secondary);

  if (isSleeping) {
    drawPixelRect(ctx, -2, -12, 3, 1, '#0f172a');
    drawPixelRect(ctx, 3, -12, 3, 1, '#0f172a');
  } else {
    drawPixelRect(ctx, -2, -13, 2, 2, '#0f172a');
    drawPixelRect(ctx, 3, -13, 2, 2, '#0f172a');
  }

  drawPixelRect(ctx, 0, -10, 4, 3, '#f59e0b');
  drawPixelRect(ctx, -6 + legOffset, 0, 4, 2, '#f59e0b');
  drawPixelRect(ctx, 2 - legOffset, 0, 4, 2, '#f59e0b');
}

function drawChicken(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  legOffset: number,
  tick: number
) {
  const peck = Math.sin(tick * 0.2) > 0.6 ? 3 : 0;
  drawPixelRect(ctx, -8, -12, 14, 12, colors.primary, colors.outline);
  drawPixelRect(ctx, -12, -14, 4, 6, '#ef4444');
  drawPixelRect(ctx, 2, -17 + peck, 9, 9, colors.primary, colors.outline);

  drawPixelRect(ctx, 3, -21 + peck, 6, 4, '#ef4444');
  drawPixelRect(ctx, 8, -9 + peck, 3, 3, '#ef4444');
  drawPixelRect(ctx, 10, -13 + peck, 4, 3, '#f59e0b');
  drawPixelRect(ctx, 5, -14 + peck, 2, 2, '#0f172a');

  drawPixelRect(ctx, -5 + legOffset, 0, 3, 3, '#f59e0b');
  drawPixelRect(ctx, 1 - legOffset, 0, 3, 3, '#f59e0b');
}

function drawFrog(
  ctx: CanvasRenderingContext2D,
  colors: ReturnType<typeof getPetColors>,
  _state: string,
  tick: number
) {
  drawPixelRect(ctx, -9, -10, 18, 10, colors.primary, colors.outline);
  drawPixelRect(ctx, -5, -6, 10, 5, colors.highlight);

  drawPixelRect(ctx, -7, -15, 6, 6, colors.primary, colors.outline);
  drawPixelRect(ctx, -6, -14, 4, 4, '#ffffff');
  drawPixelRect(ctx, -5, -13, 2, 2, '#0f172a');

  drawPixelRect(ctx, 1, -15, 6, 6, colors.primary, colors.outline);
  drawPixelRect(ctx, 2, -14, 4, 4, '#ffffff');
  drawPixelRect(ctx, 3, -13, 2, 2, '#0f172a');

  drawPixelRect(ctx, -4, -3, 8, 1, '#14532d');

  const hop = Math.sin(tick * 0.3) > 0.8 ? -4 : 0;
  drawPixelRect(ctx, -11, 0 + hop, 5, 2, colors.secondary);
  drawPixelRect(ctx, 6, 0 + hop, 5, 2, colors.secondary);
}

// -------------------------------------------------------------
// Visual FX & Speech Bubbles
// -------------------------------------------------------------

function drawSleepZzz(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  ctx.save();
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#a78bfa';
  const floatY = (tick % 40) * 0.4;
  ctx.fillText('Z', x + 8, y - floatY);
  ctx.font = 'bold 9px monospace';
  ctx.fillText('z', x + 16, y - floatY - 6);
  ctx.font = 'bold 7px monospace';
  ctx.fillText('z', x + 22, y - floatY - 11);
  ctx.restore();
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.save();
  ctx.font = '10px monospace';
  const metrics = ctx.measureText(text);
  const w = metrics.width + 12;
  const h = 18;
  const bx = x - w / 2;
  const by = y - h;

  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 3, by + h);
  ctx.lineTo(x + 3, by + h);
  ctx.lineTo(x, by + h + 4);
  ctx.closePath();
  ctx.fillStyle = '#1e1b4b';
  ctx.fill();
  ctx.strokeStyle = '#818cf8';
  ctx.stroke();

  ctx.fillStyle = '#c7d2fe';
  ctx.fillText(text, bx + 6, by + 12);
  ctx.restore();
}
