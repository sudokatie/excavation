import { Level } from './Level';
import { Physics } from './Physics';
import { Player } from './Player';
import { LEVELS } from './levels';
import { SCORING } from './constants';
import { Direction, GameState, QueuedInput } from './types';

export class Game {
  state: GameState;
  level: Level;
  physics: Physics;
  player: Player;
  inputQueue: QueuedInput[] = [];

  constructor(levelIndex: number) {
    const def = LEVELS[levelIndex];
    this.level = new Level(def);
    this.physics = new Physics(this.level);
    this.player = new Player(def.playerStart.x, def.playerStart.y);
    
    this.state = {
      status: 'playing',
      level: levelIndex,
      grid: this.level.grid,
      player: { ...def.playerStart },
      exit: { ...def.exitPos },
      gemsCollected: 0,
      gemsRequired: def.gemsRequired,
      timeRemaining: def.timeLimit,
      score: 0,
      exitOpen: false,
    };
  }

  queueInput(direction: Direction, digOnly: boolean): void {
    if (this.state.status !== 'playing') return;
    this.inputQueue.push({ direction, digOnly });
  }

  tick(): void {
    if (this.state.status !== 'playing') return;

    // Process one input
    this.processInput();

    // Run physics
    this.physics.tick();

    // Check death (crushed by falling object)
    if (this.physics.isDangerous(this.player.x, this.player.y)) {
      this.player.die();
      this.state.status = 'dead';
      return;
    }

    // Update exit state
    this.state.exitOpen = this.state.gemsCollected >= this.state.gemsRequired;

    // Check win
    if (this.isPlayerAtExit() && this.state.exitOpen) {
      this.state.status = 'won';
      this.state.score = this.calculateScore();
    }

    // Sync player position
    this.state.player = { x: this.player.x, y: this.player.y };
  }

  processInput(): void {
    const input = this.inputQueue.shift();
    if (!input) return;

    const result = this.player.move(input.direction, this.level, input.digOnly);
    if (result.collected === 'gem') {
      this.state.gemsCollected++;
      this.state.score += SCORING.GEM;
    }
    this.state.player = { x: this.player.x, y: this.player.y };
  }

  updateTime(deltaMs: number): void {
    if (this.state.status !== 'playing') return;
    if (this.state.timeRemaining <= 0) return;
    
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaMs / 1000);
    
    if (this.state.timeRemaining <= 0) {
      this.state.status = 'dead';
    }
  }

  calculateScore(): number {
    let score = this.state.score;
    score += Math.floor(this.state.timeRemaining) * SCORING.TIME_BONUS;
    
    const totalGems = this.level.countGems();
    if (totalGems > 0 && this.state.gemsCollected >= totalGems) {
      score += SCORING.PERFECT_CLEAR;
    }
    
    return score;
  }

  isExitOpen(): boolean {
    return this.state.exitOpen;
  }

  isPlayerAtExit(): boolean {
    return this.player.x === this.state.exit.x && this.player.y === this.state.exit.y;
  }

  pause(): void {
    if (this.state.status === 'playing') {
      this.state.status = 'paused';
    }
  }

  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'playing';
    }
  }

  restart(): void {
    const def = LEVELS[this.state.level];
    this.level = new Level(def);
    this.physics = new Physics(this.level);
    this.player = new Player(def.playerStart.x, def.playerStart.y);
    this.inputQueue = [];
    
    this.state = {
      status: 'playing',
      level: this.state.level,
      grid: this.level.grid,
      player: { ...def.playerStart },
      exit: { ...def.exitPos },
      gemsCollected: 0,
      gemsRequired: def.gemsRequired,
      timeRemaining: def.timeLimit,
      score: 0,
      exitOpen: false,
    };
  }
}
