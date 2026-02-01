'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Game } from '@/game/Game';
import { Renderer } from '@/game/Renderer';
import { CANVAS, TIMING } from '@/game/constants';
import { Direction } from '@/game/types';

interface Props {
  levelIndex: number;
  onWin: () => void;
  onDeath: () => void;
  onQuit: () => void;
}

export default function GameCanvas({ levelIndex, onWin, onDeath, onQuit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const lastTickRef = useRef(0);
  const lastTimeRef = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const game = gameRef.current;
    if (!game) return;

    const digOnly = e.ctrlKey || e.metaKey;
    let direction: Direction | null = null;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right';
        break;
      case 'p':
      case 'P':
        if (game.state.status === 'paused') {
          game.resume();
        } else {
          game.pause();
        }
        return;
      case 'r':
      case 'R':
        game.restart();
        return;
      case 'Escape':
        onQuit();
        return;
    }

    if (direction) {
      e.preventDefault();
      game.queueInput(direction, digOnly);
    }
  }, [onQuit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameRef.current = new Game(levelIndex);
    rendererRef.current = new Renderer(ctx);
    lastTickRef.current = 0;
    lastTimeRef.current = 0;

    window.addEventListener('keydown', handleKeyDown);

    let animId: number;

    const loop = (time: number) => {
      const game = gameRef.current!;
      const renderer = rendererRef.current!;

      if (game.state.status === 'playing') {
        // Physics tick
        if (time - lastTickRef.current >= TIMING.PHYSICS_TICK_MS) {
          game.tick();
          lastTickRef.current = time;
        }

        // Time update
        if (lastTimeRef.current > 0 && game.state.timeRemaining > 0) {
          game.updateTime(time - lastTimeRef.current);
        }
        lastTimeRef.current = time;
      }

      renderer.render(game);

      if (game.state.status === 'won') {
        onWin();
      } else if (game.state.status === 'dead') {
        onDeath();
      } else {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [levelIndex, onWin, onDeath, handleKeyDown]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS.WIDTH}
      height={CANVAS.HEIGHT}
      className="border-2 border-gray-700 rounded-lg"
    />
  );
}
