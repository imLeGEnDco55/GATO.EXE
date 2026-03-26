import type { Player } from '../types';

const combinationsCache: Record<number, number[][]> = {};

/**
 * Returns all winning line combinations for a given grid size.
 * For grids > 3, win length stays at 3.
 */
export const getWinningCombinations = (size: number): number[][] => {
  if (combinationsCache[size]) {
    return combinationsCache[size];
  }

  const combos: number[][] = [];
  const winLength = size > 3 ? 3 : size;

  // Rows
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const combo: number[] = [];
      for (let k = 0; k < winLength; k++) combo.push(r * size + (c + k));
      combos.push(combo);
    }
  }

  // Columns
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const combo: number[] = [];
      for (let k = 0; k < winLength; k++) combo.push((r + k) * size + c);
      combos.push(combo);
    }
  }

  // Diagonals ↘
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const combo: number[] = [];
      for (let k = 0; k < winLength; k++) combo.push((r + k) * size + (c + k));
      combos.push(combo);
    }
  }

  // Diagonals ↙
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const combo: number[] = [];
      for (let k = 0; k < winLength; k++) combo.push((r + k) * size + (c - k));
      combos.push(combo);
    }
  }

  combinationsCache[size] = combos;
  return combos;
};

/**
 * Returns a map of each cell index to its adjacent neighbors (8-directional).
 */
export const getAdjacentMap = (size: number): Record<number, number[]> => {
  const map: Record<number, number[]> = {};
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const neighbors: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          neighbors.push(nr * size + nc);
        }
      }
    }
    map[i] = neighbors;
  }
  return map;
};

/**
 * Checks for a winner or draw on the board.
 */
export const checkWinner = (board: (Player | null)[]): Player | 'draw' | null => {
  const size = Math.sqrt(board.length);
  const combinations = getWinningCombinations(size);
  for (const combo of combinations) {
    if (board[combo[0]] && combo.every(idx => board[idx] === board[combo[0]])) {
      return board[combo[0]];
    }
  }
  if (board.every(cell => cell !== null)) return 'draw';
  return null;
};
