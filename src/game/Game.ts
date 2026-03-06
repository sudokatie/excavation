import { Level } from './Level';
import { Physics } from './Physics';
import { Player } from './Player';
import { LEVELS } from './levels';
import { SCORING } from './constants';
import { Direction, GameState, QueuedInput } from './types';
import { Sound } from './Sound';
import { getDailyLevelIds, DailyLeaderboard, todayString, generateShareCode } from './Daily';

export class Game {
  state: GameState;
  level: Level;
  physics: Physics;
  player: Player;
  inputQueue: QueuedInput[] = [];

  // Daily challenge state
  private dailyMode: boolean = false;
  private dailyLevels: number[] = [];
  private dailyLevelIndex: number = 0;
  private dailyTotalGems: number = 0;
  private dailyStartTime: number = 0;

  // Callbacks
  onDailyComplete?: (result: {
    totalGems: number;
    levelsCompleted: number;
    timeSeconds: number;
    shareCode: string;
  }) => void;

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
      dailyMode: this.dailyMode,
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
      Sound.play('crush');
      return;
    }

    // Update exit state
    this.state.exitOpen = this.state.gemsCollected >= this.state.gemsRequired;

    // Check win
    if (this.isPlayerAtExit() && this.state.exitOpen) {
      this.state.status = 'won';
      this.state.score = this.calculateScore();
      Sound.play('levelComplete');
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
      Sound.play('collect');
    }
    if (result.moved) {
      if (result.dugDirt) {
        Sound.play('dig');
      } else {
        Sound.play('move');
      }
    }
    this.state.player = { x: this.player.x, y: this.player.y };
  }

  updateTime(deltaMs: number): void {
    if (this.state.status !== 'playing') return;
    if (this.state.timeRemaining <= 0) return;
    
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaMs / 1000);
    
    if (this.state.timeRemaining <= 0) {
      this.state.status = 'dead';
      Sound.play('death');
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
      dailyMode: this.dailyMode,
    };
  }

  /** Load a specific level */
  loadLevel(levelIndex: number): void {
    const def = LEVELS[levelIndex];
    this.level = new Level(def);
    this.physics = new Physics(this.level);
    this.player = new Player(def.playerStart.x, def.playerStart.y);
    this.inputQueue = [];
    
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
      dailyMode: this.dailyMode,
    };
  }

  /** Start a daily challenge */
  startDaily(): void {
    this.dailyMode = true;
    this.dailyLevels = getDailyLevelIds(LEVELS.length);
    this.dailyLevelIndex = 0;
    this.dailyTotalGems = 0;
    this.dailyStartTime = Date.now();
    
    this.loadLevel(this.dailyLevels[0]);
  }

  /** Advance to next daily level or complete */
  nextDailyLevel(): void {
    if (!this.dailyMode) return;
    
    this.dailyTotalGems += this.state.gemsCollected;
    this.dailyLevelIndex++;
    
    if (this.dailyLevelIndex < this.dailyLevels.length) {
      this.loadLevel(this.dailyLevels[this.dailyLevelIndex]);
    } else {
      // Daily complete
      const timeSeconds = Math.floor((Date.now() - this.dailyStartTime) / 1000);
      const shareCode = generateShareCode(todayString(), this.dailyTotalGems, this.dailyLevels.length);
      
      this.onDailyComplete?.({
        totalGems: this.dailyTotalGems,
        levelsCompleted: this.dailyLevels.length,
        timeSeconds,
        shareCode,
      });
    }
  }

  /** Exit daily mode */
  exitDaily(): void {
    this.dailyMode = false;
    this.dailyLevels = [];
    this.dailyLevelIndex = 0;
    this.dailyTotalGems = 0;
  }

  /** Submit daily score */
  submitDailyScore(name: string): number | null {
    const timeSeconds = Math.floor((Date.now() - this.dailyStartTime) / 1000);
    return DailyLeaderboard.recordScore(
      name,
      this.dailyTotalGems,
      this.dailyLevels.length,
      timeSeconds
    );
  }

  /** Check if in daily mode */
  isDailyMode(): boolean {
    return this.dailyMode;
  }

  /** Get daily progress */
  getDailyProgress(): { current: number; total: number; totalGems: number } {
    return {
      current: this.dailyLevelIndex + 1,
      total: this.dailyLevels.length,
      totalGems: this.dailyTotalGems + this.state.gemsCollected,
    };
  }

  /** Get state with daily progress */
  getState(): GameState {
    const state = { ...this.state };
    state.dailyMode = this.dailyMode;
    
    if (this.dailyMode) {
      state.dailyProgress = this.getDailyProgress();
    }
    
    return state;
  }

  toggleSound(): boolean {
    const newState = !Sound.isEnabled();
    Sound.setEnabled(newState);
    return newState;
  }

  isSoundEnabled(): boolean {
    return Sound.isEnabled();
  }
}
