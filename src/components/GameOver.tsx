interface Props {
  won: boolean;
  score: number;
  gemsCollected: number;
  totalGems: number;
  onRestart: () => void;
  onNextLevel: () => void;
  onMenu: () => void;
  hasNextLevel: boolean;
}

export default function GameOver({
  won,
  score,
  gemsCollected,
  totalGems,
  onRestart,
  onNextLevel,
  onMenu,
  hasNextLevel,
}: Props) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-gray-600">
        <h2 className={`text-4xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
          {won ? 'CAVE COMPLETE!' : 'CRUSHED!'}
        </h2>
        
        <div className="mb-6 space-y-2">
          <p className="text-2xl text-cyan-400">Score: {score}</p>
          <p className="text-gray-400">
            Gems: {gemsCollected}/{totalGems}
            {gemsCollected >= totalGems && ' ⭐ Perfect!'}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            Retry
          </button>
          
          {won && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              Next Level
            </button>
          )}
          
          <button
            onClick={onMenu}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}
