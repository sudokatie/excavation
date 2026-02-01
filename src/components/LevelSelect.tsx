'use client';

import { LEVELS } from '@/game/levels';

interface Props {
  onSelect: (levelIndex: number) => void;
  highestUnlocked: number;
}

export default function LevelSelect({ onSelect, highestUnlocked }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-cyan-400">EXCAVATION</h1>
      <p className="text-gray-400">Dig for gems. Avoid falling rocks.</p>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {LEVELS.map((level, index) => {
          const locked = index > highestUnlocked;
          return (
            <button
              key={index}
              onClick={() => !locked && onSelect(index)}
              disabled={locked}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${locked 
                  ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-700 border-gray-600 hover:border-cyan-400 hover:bg-gray-600 cursor-pointer'
                }
              `}
            >
              <div className="text-lg font-bold mb-1">
                {locked ? '🔒' : `Level ${index + 1}`}
              </div>
              <div className="text-sm text-gray-400">
                {locked ? 'Locked' : level.name}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 text-gray-500 text-sm">
        <p>Arrow keys or WASD to move</p>
        <p>Ctrl + direction to dig without moving</p>
        <p>P to pause, R to restart, ESC to quit</p>
      </div>
    </div>
  );
}
