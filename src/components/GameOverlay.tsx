import type { GamePhase } from '../types/game';

interface GameOverlayProps {
  phase: GamePhase;
  playerScore: number;
  opponentScore: number;
  coins: number;
  lastScoreValue: number;
  combo: number;
  onStart: () => void;
  onNextRound: () => void;
}

export default function GameOverlay({
  phase,
  playerScore,
  opponentScore,
  coins,
  lastScoreValue,
  combo,
  onStart,
  onNextRound,
}: GameOverlayProps) {
  if (phase === 'menu') {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            PAPER
          </h1>
          <h1 className="text-5xl font-black text-yellow-400 mb-6 tracking-tight"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            FOOTBALL
          </h1>

          {/* Paper football icon */}
          <div className="mb-8">
            <svg width="80" height="70" viewBox="0 0 80 70" className="mx-auto drop-shadow-lg">
              <polygon
                points="40,5 75,65 5,65"
                fill="#f0f0ff"
                stroke="#8898c8"
                strokeWidth="2"
              />
              <line x1="20" y1="45" x2="60" y2="45" stroke="#aab8d8" strokeWidth="0.5" />
              <line x1="25" y1="35" x2="55" y2="35" stroke="#aab8d8" strokeWidth="0.5" />
              <line x1="30" y1="25" x2="50" y2="25" stroke="#aab8d8" strokeWidth="0.5" />
              <line x1="22" y1="65" x2="35" y2="15" stroke="#e8a0a0" strokeWidth="0.7" opacity="0.4" />
            </svg>
          </div>

          <button
            onClick={onStart}
            className="bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-bold text-xl px-10 py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            PLAY
          </button>

          <p className="text-white/50 text-sm mt-4">Swipe to flick the football</p>
        </div>
      </div>
    );
  }

  if (phase === 'scoring') {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                backgroundColor: ['#ffd700', '#ff4444', '#44ff44', '#4488ff', '#ff44ff'][i % 5],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center bg-black/40 px-8 py-6 rounded-2xl backdrop-blur-sm">
          <div className="text-6xl font-black text-yellow-400 mb-2"
               style={{ textShadow: '0 4px 12px rgba(255, 215, 0, 0.5)' }}>
            +{lastScoreValue}
          </div>
          {lastScoreValue >= 6 && (
            <div className="bg-green-500 text-white font-bold px-4 py-1 rounded-lg mb-2 inline-block">
              PERFECT!
            </div>
          )}
          {combo > 1 && (
            <div className="text-orange-400 font-bold text-lg">
              {combo}x COMBO!
            </div>
          )}
          <button
            onClick={onNextRound}
            className="mt-4 bg-white/20 text-white font-bold px-6 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'missed') {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
        <div className="text-center bg-black/40 px-8 py-6 rounded-2xl backdrop-blur-sm">
          <div className="text-4xl font-black text-red-400 mb-2">MISS!</div>
          <p className="text-white/60 mb-4">No good - try again!</p>
          <button
            onClick={onNextRound}
            className="bg-white/20 text-white font-bold px-6 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const won = playerScore > opponentScore;
    const tied = playerScore === opponentScore;

    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70">
        <div className="text-center bg-black/40 px-10 py-8 rounded-2xl backdrop-blur-sm">
          <div className="text-4xl font-black mb-4"
               style={{ color: won ? '#ffd700' : tied ? '#aaa' : '#ff4444' }}>
            {won ? 'YOU WIN!' : tied ? 'TIE GAME!' : 'YOU LOSE!'}
          </div>

          <div className="flex gap-6 mb-4 justify-center">
            <div className="text-center">
              <div className="text-sm text-white/60">You</div>
              <div className="text-3xl font-bold text-orange-400">{playerScore}</div>
            </div>
            <div className="text-white/40 text-2xl self-center">-</div>
            <div className="text-center">
              <div className="text-sm text-white/60">Opp</div>
              <div className="text-3xl font-bold text-blue-400">{opponentScore}</div>
            </div>
          </div>

          <div className="text-yellow-400 font-bold mb-6">
            <span className="text-yellow-300">&#9733;</span> {coins} coins earned
          </div>

          <button
            onClick={onStart}
            className="bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // Aiming phase - show instruction
  if (phase === 'aiming') {
    return (
      <div className="absolute bottom-24 left-0 right-0 z-10 text-center pointer-events-none">
        <div className="text-white/40 text-sm animate-pulse">
          Swipe up to flick!
        </div>
      </div>
    );
  }

  return null;
}
