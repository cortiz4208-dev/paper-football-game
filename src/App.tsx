import GameCanvas from './components/GameCanvas';
import GameOverlay from './components/GameOverlay';
import Scoreboard from './components/Scoreboard';
import ScorePopups from './components/ScorePopups';
import { useGameState } from './hooks/useGameState';

function App() {
  const {
    state,
    popups,
    startGame,
    onDragStart,
    onDragMove,
    onDragEnd,
    simulate,
    nextRound,
    addPopup,
  } = useGameState();

  const handleNextRound = () => {
    if (state.phase === 'scoring') {
      addPopup(state.football.x, state.football.y, state.lastScoreValue,
        state.lastScoreValue >= 6 ? 'PERFECT' : undefined);
    }
    nextRound();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      <GameCanvas
        state={state}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        simulate={simulate}
      />

      {state.phase !== 'menu' && state.phase !== 'gameover' && (
        <Scoreboard
          playerScore={state.playerScore}
          opponentScore={state.opponentScore}
          coins={state.coins}
          round={state.round}
          maxRounds={state.maxRounds}
        />
      )}

      <ScorePopups popups={popups} />

      <GameOverlay
        phase={state.phase}
        playerScore={state.playerScore}
        opponentScore={state.opponentScore}
        coins={state.coins}
        lastScoreValue={state.lastScoreValue}
        combo={state.combo}
        onStart={startGame}
        onNextRound={handleNextRound}
      />
    </div>
  );
}

export default App;
