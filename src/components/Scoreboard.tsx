interface ScoreboardProps {
  playerScore: number;
  opponentScore: number;
  coins: number;
  round: number;
  maxRounds: number;
}

export default function Scoreboard({ playerScore, opponentScore, coins, round, maxRounds }: ScoreboardProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2">
      {/* Player Score */}
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 text-white font-bold text-2xl px-3 py-1 rounded-lg shadow-lg min-w-[48px] text-center">
          {playerScore}
        </div>
      </div>

      {/* VS and Round */}
      <div className="flex flex-col items-center">
        <div className="bg-gray-800/80 text-white font-bold text-sm px-3 py-0.5 rounded-full">
          VS
        </div>
        <div className="text-white/60 text-xs mt-0.5">
          {round}/{maxRounds}
        </div>
      </div>

      {/* Opponent Score */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-500 text-white font-bold text-2xl px-3 py-1 rounded-lg shadow-lg min-w-[48px] text-center">
          {opponentScore}
        </div>
      </div>

      {/* Coins */}
      <div className="absolute top-2 right-2 bg-green-600/90 text-white font-bold text-sm px-2 py-1 rounded-lg flex items-center gap-1">
        <span className="text-yellow-300">&#9733;</span>
        {coins}
      </div>
    </div>
  );
}
