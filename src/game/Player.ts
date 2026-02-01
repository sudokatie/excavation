import { Level } from './Level';
import { Direction, MoveResult, Position } from './types';

export class Player {
  alive = true;

  constructor(public x: number, public y: number) {}

  move(direction: Direction, level: Level, digOnly: boolean): MoveResult {
    const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const dy = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    const nx = this.x + dx;
    const ny = this.y + dy;

    const tile = level.getTile(nx, ny);
    if (!tile) return { moved: false, collected: null, pushed: false, dugDirt: false };

    // Dig dirt
    if (tile.type === 'dirt') {
      level.removeTile(nx, ny);
      if (!digOnly) {
        this.x = nx;
        this.y = ny;
      }
      return { moved: !digOnly, collected: null, pushed: false, dugDirt: true };
    }

    // Collect gem
    if (tile.type === 'gem' && !digOnly) {
      level.removeTile(nx, ny);
      this.x = nx;
      this.y = ny;
      return { moved: true, collected: 'gem', pushed: false, dugDirt: false };
    }

    // Push boulder (horizontal only)
    if (tile.type === 'boulder' && !digOnly && (direction === 'left' || direction === 'right')) {
      const pushX = nx + dx;
      if (level.isEmpty(pushX, ny) && !tile.falling) {
        level.moveTile({ x: nx, y: ny }, { x: pushX, y: ny });
        this.x = nx;
        this.y = ny;
        return { moved: true, collected: null, pushed: true, dugDirt: false };
      }
    }

    // Move to empty space
    if (tile.type === 'empty' && !digOnly) {
      this.x = nx;
      this.y = ny;
      return { moved: true, collected: null, pushed: false, dugDirt: false };
    }

    // Move to exit
    if (tile.type === 'exit' && !digOnly) {
      this.x = nx;
      this.y = ny;
      return { moved: true, collected: null, pushed: false, dugDirt: false };
    }

    return { moved: false, collected: null, pushed: false, dugDirt: false };
  }

  canMoveTo(x: number, y: number, level: Level): boolean {
    const tile = level.getTile(x, y);
    if (!tile) return false;
    return ['empty', 'dirt', 'gem', 'exit'].includes(tile.type);
  }

  canPush(x: number, y: number, direction: Direction, level: Level): boolean {
    if (direction !== 'left' && direction !== 'right') return false;
    const tile = level.getTile(x, y);
    if (!tile || tile.type !== 'boulder' || tile.falling) return false;
    const dx = direction === 'left' ? -1 : 1;
    return level.isEmpty(x + dx, y);
  }

  die(): void {
    this.alive = false;
  }

  getPosition(): Position {
    return { x: this.x, y: this.y };
  }
}
