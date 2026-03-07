import { useCallback, useRef, useState } from 'react';
import type { GameState, Position, ScorePopup } from '../types/game';

const INITIAL_FOOTBALL = {
  x: 0.5,
  y: 0.85,
  vx: 0,
  vy: 0,
  rotation: 0,
  spinning: 0,
};

const INITIAL_STATE: GameState = {
  phase: 'menu',
  playerScore: 0,
  opponentScore: 0,
  coins: 0,
  round: 0,
  maxRounds: 10,
  football: { ...INITIAL_FOOTBALL },
  dragStart: null,
  dragCurrent: null,
  lastScoreValue: 0,
  combo: 0,
};

// Goal post constants (normalized 0-1 coordinates)
const GOAL_Y = 0.12;
const GOAL_LEFT = 0.3;
const GOAL_RIGHT = 0.7;
const GOAL_CENTER = 0.5;

const FRICTION = 0.985;
const MIN_SPEED = 0.001;

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const popupIdRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const addPopup = useCallback((x: number, y: number, value: number, label?: string) => {
    const id = ++popupIdRef.current;
    setPopups(prev => [...prev, { id, x, y, value, label, opacity: 1, createdAt: Date.now() }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);

  const resetFootball = useCallback(() => {
    setState(prev => ({
      ...prev,
      football: { ...INITIAL_FOOTBALL },
      phase: 'aiming',
      dragStart: null,
      dragCurrent: null,
    }));
  }, []);

  const startGame = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      phase: 'aiming',
      football: { ...INITIAL_FOOTBALL },
    });
    setPopups([]);
  }, []);

  const onDragStart = useCallback((pos: Position) => {
    setState(prev => {
      if (prev.phase !== 'aiming') return prev;
      return { ...prev, dragStart: pos, dragCurrent: pos };
    });
  }, []);

  const onDragMove = useCallback((pos: Position) => {
    setState(prev => {
      if (!prev.dragStart || prev.phase !== 'aiming') return prev;
      return { ...prev, dragCurrent: pos };
    });
  }, []);

  const onDragEnd = useCallback(() => {
    setState(prev => {
      if (!prev.dragStart || !prev.dragCurrent || prev.phase !== 'aiming') return prev;

      const dx = prev.dragStart.x - prev.dragCurrent.x;
      const dy = prev.dragStart.y - prev.dragCurrent.y;
      const power = Math.min(Math.sqrt(dx * dx + dy * dy) * 3, 0.06);

      if (power < 0.005) {
        return { ...prev, dragStart: null, dragCurrent: null };
      }

      const angle = Math.atan2(dy, dx);
      const vx = Math.cos(angle) * power;
      const vy = Math.sin(angle) * power;

      return {
        ...prev,
        phase: 'sliding',
        dragStart: null,
        dragCurrent: null,
        football: {
          ...prev.football,
          vx,
          vy,
          spinning: vx * 15,
        },
      };
    });
  }, []);

  const simulate = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'sliding') return prev;

      const fb = { ...prev.football };
      fb.x += fb.vx;
      fb.y += fb.vy;
      fb.vx *= FRICTION;
      fb.vy *= FRICTION;
      fb.rotation += fb.spinning;
      fb.spinning *= 0.97;

      // Wall bounces
      if (fb.x < 0.05) { fb.x = 0.05; fb.vx = Math.abs(fb.vx) * 0.7; }
      if (fb.x > 0.95) { fb.x = 0.95; fb.vx = -Math.abs(fb.vx) * 0.7; }

      const speed = Math.sqrt(fb.vx * fb.vx + fb.vy * fb.vy);

      // Check if scored (reached goal area)
      if (fb.y <= GOAL_Y + 0.05) {
        const inGoal = fb.x >= GOAL_LEFT && fb.x <= GOAL_RIGHT;

        if (inGoal) {
          // Calculate accuracy bonus
          const distFromCenter = Math.abs(fb.x - GOAL_CENTER);
          const isPerfect = distFromCenter < 0.05;
          const basePoints = isPerfect ? 6 : 3;
          const newCombo = prev.combo + 1;
          const comboBonus = Math.min(newCombo - 1, 3);
          const totalPoints = basePoints + comboBonus;
          const coinReward = isPerfect ? 20 : 10;

          return {
            ...prev,
            phase: 'scoring',
            football: fb,
            playerScore: prev.playerScore + totalPoints,
            coins: prev.coins + coinReward,
            lastScoreValue: totalPoints,
            combo: newCombo,
            round: prev.round + 1,
          };
        } else {
          return {
            ...prev,
            phase: 'missed',
            football: fb,
            combo: 0,
            round: prev.round + 1,
          };
        }
      }

      // Ball went off screen or stopped
      if (fb.y < -0.1 || fb.y > 1.1 || (speed < MIN_SPEED && fb.y < 0.8)) {
        return {
          ...prev,
          phase: 'missed',
          football: fb,
          combo: 0,
          round: prev.round + 1,
        };
      }

      return { ...prev, football: fb };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(prev => {
      // Opponent scores randomly between 0-6
      const oppPoints = Math.random() < 0.4 ? (Math.random() < 0.5 ? 6 : 3) : 0;
      const newOppScore = prev.opponentScore + oppPoints;

      if (prev.round >= prev.maxRounds) {
        return {
          ...prev,
          phase: 'gameover',
          opponentScore: newOppScore,
        };
      }

      return {
        ...prev,
        phase: 'aiming',
        football: { ...INITIAL_FOOTBALL },
        opponentScore: newOppScore,
        dragStart: null,
        dragCurrent: null,
      };
    });
  }, []);

  return {
    state,
    popups,
    startGame,
    resetFootball,
    onDragStart,
    onDragMove,
    onDragEnd,
    simulate,
    nextRound,
    addPopup,
  };
}
