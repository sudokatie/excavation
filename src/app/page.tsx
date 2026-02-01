'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from '@/components/GameCanvas';
import HUD from '@/components/HUD';
import LevelSelect from '@/components/LevelSelect';
import GameOver from '@/components/GameOver';
import { Game } from '@/game/Game';
import { LEVELS } from '@/game/levels';

type Screen = 'menu' | 'playing' | 'gameover';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [levelIndex, setLevelIndex] = useState(0);
  const [won, setWon] = useState(false);
  const [highestUnlocked, setHighestUnlocked] = useState(LEVELS.length - 1); // All unlocked for now
  const gameRef = useRef<Game | null>(null);
  const [hudState, setHudState] = useState({
    levelName: '',
    gems: 0,
    gemsRequired: 0,
    timeRemaining: 0,
    score: 0,
    exitOpen: false,
  });

  const startLevel = useCallback((index: number) => {
    setLevelIndex(index);
    setScreen('playing');
    gameRef.current = new Game(index);
  }, []);

  const handleWin = useCallback(() => {
    setWon(true);
    setScreen('gameover');
    if (levelIndex + 1 > highestUnlocked) {
      setHighestUnlocked(levelIndex + 1);
    }
  }, [levelIndex, highestUnlocked]);

  const handleDeath = useCallback(() => {
    setWon(false);
    setScreen('gameover');
  }, []);

  const handleQuit = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('playing');
    gameRef.current = new Game(levelIndex);
  }, [levelIndex]);

  const handleNextLevel = useCallback(() => {
    if (levelIndex + 1 < LEVELS.length) {
      startLevel(levelIndex + 1);
    }
  }, [levelIndex, startLevel]);

  // Update HUD from game state
  useEffect(() => {
    if (screen !== 'playing') return;
    
    const interval = setInterval(() => {
      const game = gameRef.current;
      if (!game) return;
      
      setHudState({
        levelName: LEVELS[levelIndex].name,
        gems: game.state.gemsCollected,
        gemsRequired: game.state.gemsRequired,
        timeRemaining: game.state.timeRemaining,
        score: game.state.score,
        exitOpen: game.state.exitOpen,
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [screen, levelIndex]);

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {screen === 'menu' && (
        <LevelSelect onSelect={startLevel} highestUnlocked={highestUnlocked} />
      )}
      
      {screen === 'playing' && (
        <div className="relative">
          <HUD {...hudState} />
          <GameCanvas
            levelIndex={levelIndex}
            onWin={handleWin}
            onDeath={handleDeath}
            onQuit={handleQuit}
          />
        </div>
      )}
      
      {screen === 'gameover' && gameRef.current && (
        <div className="relative">
          <HUD {...hudState} />
          <div className="relative">
            <GameCanvas
              levelIndex={levelIndex}
              onWin={() => {}}
              onDeath={() => {}}
              onQuit={handleQuit}
            />
            <GameOver
              won={won}
              score={gameRef.current.state.score}
              gemsCollected={gameRef.current.state.gemsCollected}
              totalGems={gameRef.current.level.countGems()}
              onRestart={handleRestart}
              onNextLevel={handleNextLevel}
              onMenu={handleQuit}
              hasNextLevel={levelIndex + 1 < LEVELS.length}
            />
          </div>
        </div>
      )}
    </main>
  );
}
