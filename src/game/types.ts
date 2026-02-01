// Tile types in the grid
export type TileType = 'empty' | 'dirt' | 'wall' | 'boulder' | 'gem' | 'exit';

// Position on grid
export interface Position {
  x: number;
  y: number;
}

// Direction for movement
export type Direction = 'up' | 'down' | 'left' | 'right';

// Game status
export type GameStatus = 'playing' | 'won' | 'dead' | 'paused';

// A tile in the grid
export interface Tile {
  type: TileType;
  falling: boolean;
}

// Level definition
export interface LevelDef {
  name: string;
  width: number;
  height: number;
  gemsRequired: number;
  timeLimit: number;
  grid: string;
  playerStart: Position;
  exitPos: Position;
}

// Full game state
export interface GameState {
  status: GameStatus;
  level: number;
  grid: Tile[][];
  player: Position;
  exit: Position;
  gemsCollected: number;
  gemsRequired: number;
  timeRemaining: number;
  score: number;
  exitOpen: boolean;
}

// Input queue entry
export interface QueuedInput {
  direction: Direction;
  digOnly: boolean;
}

// Move result
export interface MoveResult {
  moved: boolean;
  collected: 'gem' | null;
  pushed: boolean;
  dugDirt: boolean;
}
