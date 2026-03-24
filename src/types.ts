export type Player = 'X' | 'O';
export type GameMode = 'classic' | 'romano' | 'free' | 'terni';
export type GameState = 'menu' | 'playing' | 'winner' | 'draw';
export type Opponent = 'human' | 'cpu';

export interface Piece {
  id: number;
  player: Player;
  position: number; // 0-8
  order: number; // For Terni Lapilli
}

export type CPUPhase = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export interface GameSettings {
  mode: GameMode;
  opponent: Opponent;
  startingPlayer: Player;
  isMainMode: boolean;
  gridSize: number;
}
