interface Props {
  levelName: string;
  gems: number;
  gemsRequired: number;
  timeRemaining: number;
  score: number;
  exitOpen: boolean;
}

export default function HUD({ levelName, gems, gemsRequired, timeRemaining, score, exitOpen }: Props) {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-lg mb-2 text-white font-mono">
      <div className="text-lg">{levelName}</div>
      
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">◆</span>
          <span className={gems >= gemsRequired ? 'text-green-400' : 'text-white'}>
            {gems}/{gemsRequired}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">⏱</span>
          <span className={timeRemaining < 30 ? 'text-red-400' : 'text-white'}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-purple-400">★</span>
          <span>{score}</span>
        </div>
        
        <div className={`px-2 py-1 rounded ${exitOpen ? 'bg-green-600' : 'bg-gray-600'}`}>
          {exitOpen ? 'EXIT OPEN' : 'LOCKED'}
        </div>
      </div>
    </div>
  );
}
