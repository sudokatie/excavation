import { TileType } from './types';

export const GRID = {
  WIDTH: 20,
  HEIGHT: 12,
  CELL_SIZE: 40,
};

export const CANVAS = {
  WIDTH: GRID.WIDTH * GRID.CELL_SIZE,   // 800
  HEIGHT: GRID.HEIGHT * GRID.CELL_SIZE, // 480
};

export const TIMING = {
  PHYSICS_TICK_MS: 200,      // 5 physics updates per second
  DEFAULT_TIME_LIMIT: 120,   // 2 minutes
};

export const SCORING = {
  GEM: 100,
  TIME_BONUS: 10,       // Per second remaining
  PERFECT_CLEAR: 500,   // All gems collected
};

export const COLORS = {
  background: '#1a1a1a',
  dirt: '#8b4513',
  dirtLight: '#a0522d',
  wall: '#4a4a4a',
  wallLight: '#5a5a5a',
  boulder: '#6b6b6b',
  boulderLight: '#888888',
  gem: '#00ffff',
  gemGlow: 'rgba(0, 255, 255, 0.3)',
  player: '#ff6b6b',
  playerDark: '#cc5555',
  exit: '#00ff00',
  exitLocked: '#444444',
  empty: '#111111',
};

export const TILE_CHARS: Record<string, TileType | 'player'> = {
  ' ': 'empty',
  ':': 'dirt',
  '#': 'wall',
  'O': 'boulder',
  '*': 'gem',
  'E': 'exit',
  '@': 'player',
};
