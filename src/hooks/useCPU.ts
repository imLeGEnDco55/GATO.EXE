import { useEffect, useCallback } from 'react';
import type { Player, GameSettings, Piece } from '../types';
import { checkWinner, getWinningCombinations, getAdjacentMap } from '../engine/board';
import { getMirrorPosition, getTorusWinningCombinations, checkNumericWin } from '../engine/gatoModifiers';

interface UseCPUParams {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  gameState: string;
  pieces: Piece[];
  settings: GameSettings;
  mistakeRate: number;
  processMove: (toIndex: number, fromIndexOverride?: number) => Player | 'draw' | null;
}

export function useCPU({
  board,
  currentPlayer,
  winner,
  gameState,
  pieces,
  settings,
  mistakeRate,
  processMove,
}: UseCPUParams) {

  // Custom win check for CPU planning — respects modifiers
  const testWin = useCallback((testBoard: (Player | null)[], player: Player): boolean => {
    const mods = settings.modifiers;

    if (mods.numeric && settings.numericValues.length > 0) {
      return checkNumericWin(testBoard, settings.numericValues, player);
    }

    if (mods.torus) {
      const combos = getTorusWinningCombinations(settings.gridSize);
      for (const combo of combos) {
        if (testBoard[combo[0]] === player && combo.every(idx => testBoard[idx] === player)) {
          return true;
        }
      }
      return false;
    }

    return checkWinner(testBoard) === player;
  }, [settings]);

  const makeCPUMove = useCallback(() => {
    const mods = settings.modifiers;
    const size = settings.gridSize;
    const playerPieces = pieces.filter(p => p.player === 'O');
    const isPlacementPhase = settings.mode === 'classic' ? true : playerPieces.length < size;
    const adjacentMap = getAdjacentMap(size);

    const shouldMakeMistake = Math.random() < mistakeRate;

    // MIRROR mode — CPU copies player's move symmetrically
    if (mods.mirror && isPlacementPhase) {
      const humanPieces = pieces.filter(p => p.player === 'X').sort((a, b) => b.order - a.order);
      if (humanPieces.length > 0) {
        const lastHumanPos = humanPieces[0].position;
        const mirrorPos = getMirrorPosition(lastHumanPos, size);
        if (board[mirrorPos] === null && !settings.blockedIndices.includes(mirrorPos)) {
          processMove(mirrorPos);
          return;
        }
      }
      // Fallback to random if mirror pos taken
      const empty = board.map((v, i) => v === null && !settings.blockedIndices.includes(i) ? i : null)
        .filter((v): v is number => v !== null);
      if (empty.length > 0) processMove(empty[Math.floor(Math.random() * empty.length)]);
      return;
    }

    if (isPlacementPhase) {
      const emptyIndices = board
        .map((val, idx) => (val === null && !settings.blockedIndices.includes(idx) ? idx : null))
        .filter((val): val is number => val !== null);

      if (emptyIndices.length === 0) return;

      if (!shouldMakeMistake) {
        // Determine which player to "help" based on misère
        const cpuPlayer: Player = mods.misere ? 'X' : 'O';
        const humanPlayer: Player = mods.misere ? 'O' : 'X';

        // 1. Win (or in misère: force human to win)
        for (const idx of emptyIndices) {
          const testBoard = [...board];
          testBoard[idx] = 'O';
          if (testWin(testBoard, cpuPlayer)) {
            processMove(idx);
            return;
          }
        }
        // 2. Block (or in misère: avoid blocking human)
        for (const idx of emptyIndices) {
          const testBoard = [...board];
          testBoard[idx] = 'X';
          if (testWin(testBoard, humanPlayer)) {
            if (!mods.misere) {
              processMove(idx);
              return;
            }
            // In misère, we WANT human to complete the line, so avoid this
          }
        }
        // 3. Strategic (4x4/5x5)
        if (size > 3) {
          const combinations = getWinningCombinations(size);
          for (const combo of combinations) {
            const xCount = combo.filter(idx => board[idx] === 'X').length;
            const emptyCount = combo.filter(idx => board[idx] === null).length;
            if (xCount === 2 && emptyCount === 1) {
              const targetIdx = combo.find(idx => board[idx] === null);
              if (targetIdx !== undefined) {
                processMove(targetIdx);
                return;
              }
            }
          }
        }
      }

      // Random fallback
      processMove(emptyIndices[Math.floor(Math.random() * emptyIndices.length)]);
    } else {
      // Movement phase
      const availablePieces = settings.mode === 'terni'
        ? [[...playerPieces].sort((a, b) => a.order - b.order)[0]]
        : playerPieces;

      const possibleMoves: { piecePos: number; targetPos: number }[] = [];

      for (const piece of availablePieces) {
        if (!piece) continue;
        const targets = settings.mode === 'romano'
          ? adjacentMap[piece.position].filter(idx => board[idx] === null)
          : board.map((v, i) => (v === null ? i : null)).filter((v): v is number => v !== null);

        for (const target of targets) {
          possibleMoves.push({ piecePos: piece.position, targetPos: target });
        }
      }

      if (possibleMoves.length === 0) return;

      if (!shouldMakeMistake) {
        const cpuPlayer: Player = mods.misere ? 'X' : 'O';
        const humanPlayer: Player = mods.misere ? 'O' : 'X';

        // 1. Win
        for (const move of possibleMoves) {
          const testBoard = [...board];
          testBoard[move.piecePos] = null;
          testBoard[move.targetPos] = 'O';
          if (testWin(testBoard, cpuPlayer)) {
            processMove(move.targetPos, move.piecePos);
            return;
          }
        }
        // 2. Block
        for (const move of possibleMoves) {
          const testBoard = [...board];
          testBoard[move.piecePos] = null;
          testBoard[move.targetPos] = 'X';
          if (testWin(testBoard, humanPlayer) && !mods.misere) {
            processMove(move.targetPos, move.piecePos);
            return;
          }
        }
        // 3. Strategic (4x4/5x5)
        if (size > 3) {
          const combinations = getWinningCombinations(size);
          for (const move of possibleMoves) {
            for (const combo of combinations) {
              if (combo.includes(move.targetPos)) {
                const xCount = combo.filter(idx => board[idx] === 'X').length;
                if (xCount === 2) {
                  processMove(move.targetPos, move.piecePos);
                  return;
                }
              }
            }
          }
        }
      }

      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      processMove(randomMove.targetPos, randomMove.piecePos);
    }
  }, [board, pieces, settings, mistakeRate, processMove, testWin]);

  useEffect(() => {
    if (settings.opponent === 'cpu' && currentPlayer === 'O' && !winner && gameState === 'playing') {
      const timer = setTimeout(makeCPUMove, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, settings.opponent, winner, gameState, makeCPUMove]);
}
