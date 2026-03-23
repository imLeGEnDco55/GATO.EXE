import { useState, useCallback } from 'react';
import type { Player, GameState, GameSettings, Piece } from '../types';
import { checkWinner, getAdjacentMap } from '../engine/board';
import {
  applyGravity, rotateBoard90, applyDecay, applyLag,
  applyPush, applyInfect, getTorusWinningCombinations,
  checkNumericWin,
} from '../engine/gatoModifiers';

export function useGameEngine(settings: GameSettings) {
  const totalCells = settings.gridSize * settings.gridSize;

  const [board, setBoard] = useState<(Player | null)[]>(Array(totalCells).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(settings.startingPlayer);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [mineTriggered, setMineTriggered] = useState(false);
  const [lagMessage, setLagMessage] = useState<string | null>(null);

  const resetGame = useCallback(() => {
    const cells = settings.gridSize * settings.gridSize;
    const initBoard = Array(cells).fill(null);
    // Apply blocked cells
    for (const idx of settings.blockedIndices) {
      initBoard[idx] = 'BLOCKED' as any;
    }
    setBoard(initBoard);
    setCurrentPlayer(settings.startingPlayer);
    setWinner(null);
    setPieces([]);
    setSelectedPieceIndex(null);
    setMoveCount(0);
    setMineTriggered(false);
    setLagMessage(null);
    setGameState('playing');
  }, [settings.gridSize, settings.startingPlayer, settings.blockedIndices]);

  const goToMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  // Custom win check that respects modifiers
  const checkWinState = useCallback((b: (Player | null)[]): Player | 'draw' | null => {
    const mods = settings.modifiers;
    const size = settings.gridSize;

    // NUMERIC (CROM) — check sums
    if (mods.numeric && settings.numericValues.length > 0) {
      if (checkNumericWin(b, settings.numericValues, 'X')) return mods.misere ? 'O' : 'X';
      if (checkNumericWin(b, settings.numericValues, 'O')) return mods.misere ? 'X' : 'O';
      const filled = b.filter(c => c === 'X' || c === 'O').length;
      if (filled >= 9) return 'draw';
      return null;
    }

    // TORUS — use wrapping combinations
    if (mods.torus) {
      const combos = getTorusWinningCombinations(size);
      for (const combo of combos) {
        const first = b[combo[0]];
        if (first && (first === 'X' || first === 'O') && combo.every(idx => b[idx] === first)) {
          return mods.misere ? (first === 'X' ? 'O' : 'X') : first;
        }
      }
      if (b.every(cell => cell !== null)) return 'draw';
      return null;
    }

    // Standard win check
    const result = checkWinner(b);
    if (result && mods.misere) {
      // In misère, the "winner" actually loses
      if (result === 'X') return 'O';
      if (result === 'O') return 'X';
    }
    return result;
  }, [settings.modifiers, settings.gridSize, settings.numericValues]);

  const processMove = useCallback((toIndex: number, fromIndexOverride?: number) => {
    const mods = settings.modifiers;
    const size = settings.gridSize;
    const playerPieces = pieces.filter(p => p.player === currentPlayer);
    const isPlacementPhase = settings.mode === 'classic' ? true : playerPieces.length < size;
    const fromIndex = fromIndexOverride !== undefined ? fromIndexOverride : selectedPieceIndex;
    const adjacentMap = getAdjacentMap(size);

    if (isPlacementPhase) {
      let finalIndex = toIndex;

      // GRAVITY — override target to bottom of column
      if (mods.gravity) {
        const col = toIndex % size;
        finalIndex = applyGravity(board, col, size);
        if (finalIndex === -1) return null; // column full
      }

      // LAG — 30% chance to drift (player only)
      if (mods.lag && currentPlayer === 'X') {
        const original = finalIndex;
        finalIndex = applyLag(finalIndex, board, size);
        if (finalIndex !== original) {
          setLagMessage('⚠️ LAG: Ficha desviada');
          setTimeout(() => setLagMessage(null), 1500);
        }
      }

      // Check if cell is available
      if (board[finalIndex]) return null;
      if (settings.blockedIndices.includes(finalIndex)) return null;

      let newBoard = [...board];
      newBoard[finalIndex] = currentPlayer;

      const newPiece: Piece = {
        id: Date.now() + Math.random(),
        player: currentPlayer,
        position: finalIndex,
        order: moveCount,
      };
      let newPieces = [...pieces, newPiece];
      const newMoveCount = moveCount + 1;

      // MINE — check if placed on mine
      if (mods.mine && finalIndex === settings.mineIndex && !mineTriggered) {
        newBoard[finalIndex] = 'BLOCKED' as any;
        newPieces = newPieces.filter(p => p.id !== newPiece.id);
        setMineTriggered(true);
        setBoard(newBoard);
        setPieces(newPieces);
        setMoveCount(newMoveCount);
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        return null;
      }

      // INFECT — 50% flip adjacent enemies
      if (mods.infect) {
        const infected = applyInfect(newBoard, newPieces, finalIndex, currentPlayer, size);
        newBoard = infected.board;
        newPieces = infected.pieces;
      }

      // PUSH — push adjacent enemy pieces
      if (mods.push) {
        const pushed = applyPush(newBoard, newPieces, finalIndex, size);
        newBoard = pushed.board;
        newPieces = pushed.pieces;
      }

      // STEALTH — mark pieces invisible after 1 turn
      if (mods.stealth) {
        newPieces = newPieces.map(p =>
          p.order < newMoveCount - 1 ? { ...p, invisible: true } : p
        );
      }

      // DECAY — remove old pieces
      if (mods.decay > 0) {
        const decayed = applyDecay(newBoard, newPieces, newMoveCount, mods.decay * 2);
        newBoard = decayed.board;
        newPieces = decayed.pieces;
      }

      // ROTATE — every N turns
      if (mods.rotate > 0 && newMoveCount % mods.rotate === 0 && newMoveCount > 0) {
        const rotated = rotateBoard90(newBoard, newPieces, size);
        newBoard = rotated.board;
        newPieces = rotated.pieces;
      }

      setBoard(newBoard);
      setPieces(newPieces);
      setMoveCount(newMoveCount);

      const result = checkWinState(newBoard);
      if (result) {
        setWinner(result);
        setGameState(result === 'draw' ? 'draw' : 'winner');
        return result;
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        return null;
      }
    } else {
      // Movement Phase (romano / free / terni)
      const pieceAtPos = pieces.find(p => p.position === toIndex && p.player === currentPlayer);

      if (fromIndexOverride === undefined && pieceAtPos) {
        if (settings.mode === 'terni') {
          const oldestPiece = [...playerPieces].sort((a, b) => a.order - b.order)[0];
          if (pieceAtPos.id === oldestPiece.id) setSelectedPieceIndex(toIndex);
        } else {
          setSelectedPieceIndex(toIndex);
        }
        return null;
      }

      if (fromIndex !== null && fromIndex !== undefined) {
        if (board[toIndex] && fromIndexOverride === undefined) {
          const otherPiece = pieces.find(p => p.position === toIndex && p.player === currentPlayer);
          if (otherPiece) {
            if (settings.mode === 'terni') {
              const oldestPiece = [...playerPieces].sort((a, b) => a.order - b.order)[0];
              if (otherPiece.id === oldestPiece.id) setSelectedPieceIndex(toIndex);
            } else {
              setSelectedPieceIndex(toIndex);
            }
          }
          return null;
        }

        let isValid = false;
        if (settings.mode === 'free' || settings.mode === 'terni') {
          isValid = true;
        } else if (settings.mode === 'romano') {
          isValid = adjacentMap[fromIndex].includes(toIndex);
        }

        if (isValid) {
          let newBoard = [...board];
          newBoard[fromIndex] = null;
          newBoard[toIndex] = currentPlayer;

          let newPieces = pieces.map(p =>
            p.position === fromIndex ? { ...p, position: toIndex, order: moveCount } : p
          );

          const newMoveCount = moveCount + 1;

          // Apply post-move modifiers
          if (mods.infect) {
            const r = applyInfect(newBoard, newPieces, toIndex, currentPlayer, size);
            newBoard = r.board; newPieces = r.pieces;
          }
          if (mods.push) {
            const r = applyPush(newBoard, newPieces, toIndex, size);
            newBoard = r.board; newPieces = r.pieces;
          }
          if (mods.stealth) {
            newPieces = newPieces.map(p =>
              p.order < newMoveCount - 1 ? { ...p, invisible: true } : p
            );
          }
          if (mods.decay > 0) {
            const r = applyDecay(newBoard, newPieces, newMoveCount, mods.decay * 2);
            newBoard = r.board; newPieces = r.pieces;
          }
          if (mods.rotate > 0 && newMoveCount % mods.rotate === 0) {
            const r = rotateBoard90(newBoard, newPieces, size);
            newBoard = r.board; newPieces = r.pieces;
          }

          setBoard(newBoard);
          setPieces(newPieces);
          setSelectedPieceIndex(null);
          setMoveCount(newMoveCount);

          const result = checkWinState(newBoard);
          if (result) {
            setWinner(result);
            setGameState(result === 'draw' ? 'draw' : 'winner');
            return result;
          } else {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
            return null;
          }
        }
      }
    }
    return null;
  }, [board, currentPlayer, pieces, selectedPieceIndex, moveCount, settings, mineTriggered, checkWinState]);

  const handleCellClick = useCallback((index: number) => {
    if (winner || (gameState !== 'playing')) return null;
    if (settings.opponent === 'cpu' && currentPlayer === 'O') return null;
    if (settings.blockedIndices.includes(index)) return null;
    return processMove(index);
  }, [winner, gameState, settings.opponent, settings.blockedIndices, currentPlayer, processMove]);

  return {
    board,
    currentPlayer,
    winner,
    gameState,
    pieces,
    selectedPieceIndex,
    moveCount,
    mineTriggered,
    lagMessage,
    handleCellClick,
    processMove,
    resetGame,
    goToMenu,
  };
}
