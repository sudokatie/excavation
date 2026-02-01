import { LevelDef, Position, Tile, TileType } from './types';
import { TILE_CHARS } from './constants';

export class Level {
  grid: Tile[][];
  width: number;
  height: number;

  constructor(def: LevelDef) {
    this.width = def.width;
    this.height = def.height;
    this.grid = this.parseGrid(def.grid, def.playerStart, def.exitPos);
  }

  private parseGrid(gridString: string, playerStart: Position, exitPos: Position): Tile[][] {
    const rows = gridString.split('\n');
    const grid: Tile[][] = [];

    for (let y = 0; y < rows.length; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < rows[y].length; x++) {
        const char = rows[y][x];
        let type: TileType = 'empty';

        if (char === '@') {
          // Player start position - leave empty
          type = 'empty';
        } else if (char === 'E') {
          type = 'exit';
        } else {
          const mapped = TILE_CHARS[char];
          if (mapped && mapped !== 'player') {
            type = mapped as TileType;
          }
        }

        row.push({ type, falling: false });
      }
      grid.push(row);
    }

    return grid;
  }

  getTile(x: number, y: number): Tile | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    if (!this.grid[y] || !this.grid[y][x]) return null;
    return this.grid[y][x];
  }

  setTile(x: number, y: number, tile: Tile): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y][x] = tile;
    }
  }

  isEmpty(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.type === 'empty';
  }

  isDirt(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.type === 'dirt';
  }

  isWall(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.type === 'wall';
  }

  isBoulder(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.type === 'boulder';
  }

  isGem(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.type === 'gem';
  }

  isExit(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.type === 'exit';
  }

  // Can things roll off this tile?
  isRounded(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    return ['boulder', 'gem', 'wall'].includes(tile.type);
  }

  removeTile(x: number, y: number): void {
    if (this.getTile(x, y)) {
      this.grid[y][x] = { type: 'empty', falling: false };
    }
  }

  moveTile(from: Position, to: Position): void {
    const tile = this.getTile(from.x, from.y);
    const destTile = this.getTile(to.x, to.y);
    if (tile && destTile && destTile.type === 'empty') {
      this.grid[to.y][to.x] = { ...tile };
      this.grid[from.y][from.x] = { type: 'empty', falling: false };
    }
  }

  countGems(): number {
    let count = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y]?.[x]?.type === 'gem') count++;
      }
    }
    return count;
  }
}
