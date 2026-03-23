import type { Player, Piece, GatoModifiers } from '../types';

/**
 * GRAVITY — find the lowest empty row in a column
 */
export function applyGravity(board: (Player | null)[], col: number, size: number): number {
  for (let row = size - 1; row >= 0; row--) {
    if (board[row * size + col] === null) {
      return row * size + col;
    }
  }
  return -1; // column full
}

/**
 * TORUS adjacency — wrapping edges
 */
export function getTorusAdjacentMap(size: number): Record<number, number[]> {
  const map: Record<number, number[]> = {};
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const neighbors: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (row + dr + size) % size;
        const nc = (col + dc + size) % size;
        neighbors.push(nr * size + nc);
      }
    }
    map[i] = neighbors;
  }
  return map;
}

/**
 * TORUS winning combinations — lines that wrap around edges
 */
export function getTorusWinningCombinations(size: number): number[][] {
  const combos: number[][] = [];
  const winLen = 3;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Horizontal wrapping
      const hCombo: number[] = [];
      for (let k = 0; k < winLen; k++) hCombo.push(r * size + ((c + k) % size));
      combos.push(hCombo);
      // Vertical wrapping
      const vCombo: number[] = [];
      for (let k = 0; k < winLen; k++) vCombo.push(((r + k) % size) * size + c);
      combos.push(vCombo);
      // Diagonal ↘ wrapping
      const d1: number[] = [];
      for (let k = 0; k < winLen; k++) d1.push(((r + k) % size) * size + ((c + k) % size));
      combos.push(d1);
      // Diagonal ↙ wrapping
      const d2: number[] = [];
      for (let k = 0; k < winLen; k++) d2.push(((r + k) % size) * size + ((c - k + size) % size));
      combos.push(d2);
    }
  }
  // Deduplicate
  const seen = new Set<string>();
  return combos.filter(c => {
    const key = [...c].sort((a, b) => a - b).join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * ROTATE — rotate board 90° clockwise
 */
export function rotateBoard90(board: (Player | null)[], pieces: Piece[], size: number) {
  const newBoard: (Player | null)[] = Array(size * size).fill(null);
  const posMap: Record<number, number> = {};

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const oldIdx = r * size + c;
      const newIdx = c * size + (size - 1 - r);
      newBoard[newIdx] = board[oldIdx];
      posMap[oldIdx] = newIdx;
    }
  }

  const newPieces = pieces.map(p => ({
    ...p,
    position: posMap[p.position] ?? p.position,
  }));

  return { board: newBoard, pieces: newPieces };
}

/**
 * DECAY — remove pieces older than N turns
 */
export function applyDecay(
  board: (Player | null)[],
  pieces: Piece[],
  currentMoveCount: number,
  maxAge: number
): { board: (Player | null)[]; pieces: Piece[] } {
  const newBoard = [...board];
  const surviving: Piece[] = [];

  for (const p of pieces) {
    const age = currentMoveCount - p.order;
    if (age >= maxAge) {
      newBoard[p.position] = null;
    } else {
      surviving.push(p);
    }
  }

  return { board: newBoard, pieces: surviving };
}

/**
 * LAG — 30% chance to drift to a random adjacent empty cell
 */
export function applyLag(targetIndex: number, board: (Player | null)[], size: number): number {
  if (Math.random() > 0.3) return targetIndex;

  const row = Math.floor(targetIndex / size);
  const col = targetIndex % size;
  const candidates: number[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        const idx = nr * size + nc;
        if (board[idx] === null) candidates.push(idx);
      }
    }
  }

  if (candidates.length === 0) return targetIndex;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * PUSH — push adjacent enemy piece one cell away from placement
 */
export function applyPush(
  board: (Player | null)[],
  pieces: Piece[],
  placedIndex: number,
  size: number
): { board: (Player | null)[]; pieces: Piece[] } {
  const newBoard = [...board];
  let newPieces = [...pieces];
  const row = Math.floor(placedIndex / size);
  const col = placedIndex % size;
  const placedPlayer = newBoard[placedIndex];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const adjR = row + dr;
      const adjC = col + dc;
      if (adjR < 0 || adjR >= size || adjC < 0 || adjC >= size) continue;

      const adjIdx = adjR * size + adjC;
      if (newBoard[adjIdx] !== null && newBoard[adjIdx] !== placedPlayer) {
        // Push this piece further in the same direction
        const pushR = adjR + dr;
        const pushC = adjC + dc;
        if (pushR >= 0 && pushR < size && pushC >= 0 && pushC < size) {
          const pushIdx = pushR * size + pushC;
          if (newBoard[pushIdx] === null) {
            newBoard[pushIdx] = newBoard[adjIdx];
            newBoard[adjIdx] = null;
            newPieces = newPieces.map(p =>
              p.position === adjIdx ? { ...p, position: pushIdx } : p
            );
          }
        }
      }
    }
  }

  return { board: newBoard, pieces: newPieces };
}

/**
 * INFECT (CRYPTO) — 50% chance to flip adjacent enemy pieces
 */
export function applyInfect(
  board: (Player | null)[],
  pieces: Piece[],
  placedIndex: number,
  player: Player,
  size: number
): { board: (Player | null)[]; pieces: Piece[] } {
  const newBoard = [...board];
  let newPieces = [...pieces];
  const row = Math.floor(placedIndex / size);
  const col = placedIndex % size;
  const enemy: Player = player === 'X' ? 'O' : 'X';

  // Only cardinal directions (up/down/left/right)
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    const adjIdx = nr * size + nc;
    if (newBoard[adjIdx] === enemy && Math.random() < 0.5) {
      newBoard[adjIdx] = player;
      newPieces = newPieces.map(p =>
        p.position === adjIdx ? { ...p, player } : p
      );
    }
  }

  return { board: newBoard, pieces: newPieces };
}

/**
 * MIRROR — get the symmetric position (180° rotation)
 */
export function getMirrorPosition(index: number, size: number): number {
  return (size * size - 1) - index;
}

/**
 * NUMERIC (CROM) — generate cell values 1-9 and check if player sums to 15
 */
export function generateNumericValues(): number[] {
  // Magic square arrangement — standard 3x3 magic square
  return [2, 7, 6, 9, 5, 1, 4, 3, 8];
}

export function checkNumericWin(
  board: (Player | null)[],
  values: number[],
  player: Player
): boolean {
  const playerValues = board
    .map((cell, idx) => cell === player ? values[idx] : 0)
    .filter(v => v > 0);

  if (playerValues.length < 3) return false;

  // Check all combinations of 3 from player's values
  for (let i = 0; i < playerValues.length; i++) {
    for (let j = i + 1; j < playerValues.length; j++) {
      for (let k = j + 1; k < playerValues.length; k++) {
        if (playerValues[i] + playerValues[j] + playerValues[k] === 15) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * MALWARE — generate random blocked cell indices
 */
export function generateBlockedCells(count: number, totalCells: number): number[] {
  const indices: number[] = [];
  const available = Array.from({ length: totalCells }, (_, i) => i);
  for (let i = 0; i < Math.min(count, totalCells - 3); i++) {
    const pick = Math.floor(Math.random() * available.length);
    indices.push(available[pick]);
    available.splice(pick, 1);
  }
  return indices;
}

/**
 * TROJAN — generate random mine index
 */
export function generateMineIndex(totalCells: number): number {
  return Math.floor(Math.random() * totalCells);
}

/**
 * Check if any modifier is active
 */
export function hasActiveModifiers(mods: GatoModifiers): boolean {
  return Object.values(mods).some(v => v !== false && v !== 0);
}
