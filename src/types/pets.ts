export type PetType =
  | 'cat'
  | 'dog'
  | 'duck'
  | 'rubber-duck'
  | 'crab'
  | 'snake'
  | 'clippy'
  | 'rocky'
  | 'totoro'
  | 'fox'
  | 'penguin'
  | 'chicken'
  | 'frog'
  | 'horse'
  | 'snail'
  | 'panda'
  | 'monkey'
  | 'turtle'
  | 'bunny'
  | 'cockatiel'
  | 'deno'
  | 'skeleton'
  | 'zappy'
  | 'rat'
  | 'raccoon'
  | 'morph';

export type PetColor =
  | 'default'
  | 'brown'
  | 'black'
  | 'white'
  | 'orange'
  | 'yellow'
  | 'gray'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'calico'
  | 'neon'
  | 'pink'
  | 'akita'
  | 'ginger'
  | 'lightbrown';

export type PetSize = 'nano' | 'small' | 'medium' | 'large';

export type PetState =
  | 'idle'
  | 'walking'
  | 'running'
  | 'sitting'
  | 'sleeping'
  | 'chasing'
  | 'eating'
  | 'jumping'
  | 'celebrating'
  | 'swipe';

export type ArenaTheme = 'none' | 'castle' | 'forest' | 'cyberpunk' | 'beach' | 'space' | 'matrix' | 'sunset';

export interface PetData {
  id: string;
  name: string;
  type: PetType;
  color: PetColor;
  size: PetSize;
  speed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 'left' | 'right';
  state: PetState;
  stateTimer: number;
  frameIndex: number;
  animationTick: number;
  happiness: number; // 0 - 100
  energy: number; // 0 - 100
  hunger: number; // 0 - 100
  level: number;
  speechText?: string;
  speechTimer?: number;
  isCustom?: boolean;
}

export interface BallData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  active: boolean;
  bounces: number;
}

export interface FoodData {
  id: string;
  type: 'fish' | 'apple' | 'bone' | 'seed' | 'cookie' | 'cheese';
  x: number;
  y: number;
  vy: number;
  active: boolean;
}

export interface ParticleData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  text?: string;
  size: number;
}
