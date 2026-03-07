export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Football extends Position, Velocity {
  rotation: number;
  spinning: number;
}

export type GamePhase = 'menu' | 'aiming' | 'sliding' | 'scoring' | 'missed' | 'gameover';

export interface GameState {
  phase: GamePhase;
  playerScore: number;
  opponentScore: number;
  coins: number;
  round: number;
  maxRounds: number;
  football: Football;
  dragStart: Position | null;
  dragCurrent: Position | null;
  lastScoreValue: number;
  combo: number;
}

export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  value: number;
  label?: string;
  opacity: number;
  createdAt: number;
}
