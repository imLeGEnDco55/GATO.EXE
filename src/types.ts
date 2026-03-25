export type Player = 'X' | 'O';
export type GameState = 'menu' | 'playing' | 'winner' | 'draw';
export type Opponent = 'human' | 'cpu';

// Original 4 movement modes
export type GameMode = 'classic' | 'romano' | 'free' | 'terni';

// All 19 GATOS.EXE
export type GatoId =
  | 'LEGACY' | 'CRAWLER' | 'PROXY' | 'BUFFER'
  | 'GRAVIT' | 'TORUS' | 'VORTEX'
  | 'MISERE' | 'CROM' | 'STEALTH'
  | 'OVERCLOCK' | 'DECAY'
  | 'MALWARE' | 'TROJAN' | 'QUANTUM'
  | 'CRYPTO' | 'MIRROR' | 'PUSH' | 'LAG';

export type GatoFamily = 'movimiento' | 'geometria' | 'percepcion' | 'tiempo' | 'corrupcion' | 'interaccion';

export interface GatoModifiers {
  gravity: boolean;
  torus: boolean;
  rotate: number; // 0 = off, N = rotate every N turns
  misere: boolean;
  numeric: boolean;
  stealth: boolean;
  overclock: number; // 0 = off, seconds per turn
  decay: number; // 0 = off, turns before decay
  blockedCells: number; // 0 = off, count of random blocked cells
  mine: boolean;
  quantum: boolean;
  infect: boolean;
  mirror: boolean;
  push: boolean;
  lag: boolean;
}

export interface GatoDefinition {
  id: GatoId;
  name: string;
  emoji: string;
  family: GatoFamily;
  mode: GameMode;
  description: string;
  modifiers: GatoModifiers;
}

export interface Piece {
  id: number;
  player: Player;
  position: number;
  order: number;
  invisible?: boolean; // stealth mode
}

export interface MatchScore {
  player: number;
  cpu: number;
}

export interface GauntletState {
  cycle: 1 | 2 | 3;
  selectedGatos: GatoId[];   // 2 per cycle (+ boss for cycle 3)
  currentGatoIdx: number;    // index into selectedGatos, or -1 for grid boss
  matchScore: MatchScore;
  matchesNeeded: number;     // 2 (best of 3)
  isBossRound: boolean;      // 4x4 or 5x5 classic round
  totalWins: number;
  message: string | null;
  defeatedGatos: GatoId[];   // gatos already beaten (no repeats)
  wallet: number;
  winStreak: number;
}

export interface GameSettings {
  mode: GameMode;
  opponent: Opponent;
  startingPlayer: Player;
  isMainMode: boolean;
  gridSize: number;
  activeGato: GatoId | null;
  modifiers: GatoModifiers;
  blockedIndices: number[];   // pre-computed blocked cells
  mineIndex: number;          // -1 if no mine
  numericValues: number[];    // cell values for CROM mode
}

export interface GameProgress {
  wins: number;
  streak: number;
  phase: string;
  message: string | null;
}
