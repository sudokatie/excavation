import { Level } from './Level';
import { Direction, Position } from './types';

export class Physics {
  constructor(private level: Level) {}

  // Run one physics tick
  // Returns list of positions that changed
  tick(): Position[] {
    const changes: Position[] = [];
    // Track cells that received a moved object this tick (skip processing them)
    const movedTo = new Set<string>();
    const key = (x: number, y: number) => `${x},${y}`;
    
    // Process bottom-to-top, left-to-right
    // This ensures cascades work correctly
    for (let y = this.level.height - 2; y >= 0; y--) {
      for (let x = 0; x < this.level.width; x++) {
        // Skip cells that just received a moved object
        if (movedTo.has(key(x, y))) continue;
        
        const tile = this.level.getTile(x, y);
        if (!tile) continue;
        if (tile.type !== 'boulder' && tile.type !== 'gem') continue;

        // Try falling first
        if (this.shouldFall(x, y)) {
          this.level.moveTile({ x, y }, { x, y: y + 1 });
          const newTile = this.level.getTile(x, y + 1);
          if (newTile) newTile.falling = true;
          movedTo.add(key(x, y + 1));
          changes.push({ x, y }, { x, y: y + 1 });
        } else {
          // Reset falling when landed
          if (tile.falling) {
            tile.falling = false;
          }
          
          // Try rolling
          const rollDir = this.shouldRoll(x, y);
          if (rollDir === 'left') {
            this.level.moveTile({ x, y }, { x: x - 1, y });
            movedTo.add(key(x - 1, y));
            changes.push({ x, y }, { x: x - 1, y });
          } else if (rollDir === 'right') {
            this.level.moveTile({ x, y }, { x: x + 1, y });
            movedTo.add(key(x + 1, y));
            changes.push({ x, y }, { x: x + 1, y });
          }
        }
      }
    }
    
    return changes;
  }

  // Check if position has something falling onto it
  isDangerous(x: number, y: number): boolean {
    const above = this.level.getTile(x, y - 1);
    return above !== null && above.falling;
  }

  // Check if boulder/gem at position should fall
  shouldFall(x: number, y: number): boolean {
    return this.level.isEmpty(x, y + 1);
  }

  // Check if boulder/gem at position should roll
  // Returns: null (no roll), 'left', or 'right'
  shouldRoll(x: number, y: number): Direction | null {
    // Must be sitting on something rounded
    if (!this.level.isRounded(x, y + 1)) return null;

    // Check left: space empty AND below-left empty
    if (this.level.isEmpty(x - 1, y) && this.level.isEmpty(x - 1, y + 1)) {
      return 'left';
    }

    // Check right: space empty AND below-right empty
    if (this.level.isEmpty(x + 1, y) && this.level.isEmpty(x + 1, y + 1)) {
      return 'right';
    }

    return null;
  }

  // Process gravity for one object (called by tick)
  processFalling(x: number, y: number): Position | null {
    if (this.shouldFall(x, y)) {
      this.level.moveTile({ x, y }, { x, y: y + 1 });
      const newTile = this.level.getTile(x, y + 1);
      if (newTile) newTile.falling = true;
      return { x, y: y + 1 };
    }
    return null;
  }

  // Process rolling for one object (called by tick)
  processRolling(x: number, y: number): Position | null {
    const dir = this.shouldRoll(x, y);
    if (dir === 'left') {
      this.level.moveTile({ x, y }, { x: x - 1, y });
      return { x: x - 1, y };
    } else if (dir === 'right') {
      this.level.moveTile({ x, y }, { x: x + 1, y });
      return { x: x + 1, y };
    }
    return null;
  }
}
