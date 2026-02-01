import { Game } from './Game';
import { Level } from './Level';
import { Player } from './Player';
import { Position } from './types';
import { CANVAS, COLORS, GRID } from './constants';

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  render(game: Game): void {
    this.renderBackground();
    this.renderGrid(game.level);
    this.renderExit(game.state.exit, game.state.exitOpen);
    this.renderPlayer(game.player);
  }

  renderBackground(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
  }

  renderGrid(level: Level): void {
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const tile = level.getTile(x, y);
        if (!tile) continue;

        switch (tile.type) {
          case 'dirt':
            this.drawDirt(x, y);
            break;
          case 'wall':
            this.drawWall(x, y);
            break;
          case 'boulder':
            this.drawBoulder(x, y, tile.falling);
            break;
          case 'gem':
            this.drawGem(x, y);
            break;
        }
      }
    }
  }

  drawDirt(x: number, y: number): void {
    const px = x * GRID.CELL_SIZE;
    const py = y * GRID.CELL_SIZE;
    
    this.ctx.fillStyle = COLORS.dirt;
    this.ctx.fillRect(px, py, GRID.CELL_SIZE, GRID.CELL_SIZE);
    
    // Add texture
    this.ctx.fillStyle = COLORS.dirtLight;
    for (let i = 0; i < 5; i++) {
      const sx = px + (((x * 7 + i * 13) % 37) / 37) * GRID.CELL_SIZE;
      const sy = py + (((y * 11 + i * 17) % 41) / 41) * GRID.CELL_SIZE;
      this.ctx.fillRect(sx, sy, 2, 2);
    }
  }

  drawWall(x: number, y: number): void {
    const px = x * GRID.CELL_SIZE;
    const py = y * GRID.CELL_SIZE;
    
    this.ctx.fillStyle = COLORS.wall;
    this.ctx.fillRect(px, py, GRID.CELL_SIZE, GRID.CELL_SIZE);
    
    // Brick pattern
    this.ctx.strokeStyle = COLORS.wallLight;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 1, py + 1, GRID.CELL_SIZE - 2, GRID.CELL_SIZE - 2);
  }

  drawBoulder(x: number, y: number, falling: boolean): void {
    const cx = x * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
    const cy = y * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
    const r = GRID.CELL_SIZE / 2 - 4;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fillStyle = falling ? COLORS.boulderLight : COLORS.boulder;
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Highlight
    this.ctx.beginPath();
    this.ctx.arc(cx - r / 3, cy - r / 3, r / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.ctx.fill();
  }

  drawGem(x: number, y: number): void {
    const cx = x * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
    const cy = y * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;

    // Glow
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, GRID.CELL_SIZE / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = COLORS.gemGlow;
    this.ctx.fill();

    // Diamond shape
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - 14);
    this.ctx.lineTo(cx + 12, cy);
    this.ctx.lineTo(cx, cy + 14);
    this.ctx.lineTo(cx - 12, cy);
    this.ctx.closePath();
    this.ctx.fillStyle = COLORS.gem;
    this.ctx.fill();
    
    // Inner highlight
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - 8);
    this.ctx.lineTo(cx + 6, cy);
    this.ctx.lineTo(cx, cy + 8);
    this.ctx.lineTo(cx - 6, cy);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
    this.ctx.fill();
  }

  renderPlayer(player: Player): void {
    if (!player.alive) return;
    
    const cx = player.x * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;
    const cy = player.y * GRID.CELL_SIZE + GRID.CELL_SIZE / 2;

    // Body
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillRect(cx - 8, cy - 2, 16, 18);
    
    // Head
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - 8, 10, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Hard hat
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - 10, 8, Math.PI, 0);
    this.ctx.fill();
    this.ctx.fillRect(cx - 10, cy - 10, 20, 3);
  }

  renderExit(pos: Position, open: boolean): void {
    const px = pos.x * GRID.CELL_SIZE;
    const py = pos.y * GRID.CELL_SIZE;

    // Door frame
    this.ctx.fillStyle = open ? COLORS.exit : COLORS.exitLocked;
    this.ctx.fillRect(px + 4, py + 4, GRID.CELL_SIZE - 8, GRID.CELL_SIZE - 8);
    
    if (open) {
      // Glowing border
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(px + 4, py + 4, GRID.CELL_SIZE - 8, GRID.CELL_SIZE - 8);
      
      // Inner glow
      this.ctx.strokeStyle = 'rgba(0,255,0,0.5)';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(px + 8, py + 8, GRID.CELL_SIZE - 16, GRID.CELL_SIZE - 16);
    } else {
      // Locked indicator
      this.ctx.fillStyle = '#666';
      this.ctx.fillRect(px + 16, py + 20, 8, 10);
      this.ctx.beginPath();
      this.ctx.arc(px + 20, py + 18, 5, Math.PI, 0);
      this.ctx.strokeStyle = '#666';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  clear(): void {
    this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
  }
}
