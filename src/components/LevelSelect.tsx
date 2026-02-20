'use client';

import { useState } from 'react';
import { LEVELS } from '@/game/levels';
import { Music } from '@/game/Music';
import { Sound } from '@/game/Sound';

interface Props {
  onSelect: (levelIndex: number) => void;
  highestUnlocked: number;
}

export default function LevelSelect({ onSelect, highestUnlocked }: Props) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

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

      {/* Audio Settings */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg w-64">
        <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Audio Settings</h3>
        
        {/* Music Volume */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-400">Music</label>
            <button
              onClick={toggleMusic}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                musicEnabled
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
              }`}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            disabled={!musicEnabled}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
          />
        </div>

        {/* Sound Volume */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-400">Sound Effects</label>
            <button
              onClick={toggleSound}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                soundEnabled
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundVolume}
            onChange={handleSoundVolumeChange}
            disabled={!soundEnabled}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
