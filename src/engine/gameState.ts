import type { Player, GameState, GameSettings, GameMode, Piece, GatoModifiers } from '../types';
import { checkWinner, getAdjacentMap } from './board';
import {
  applyGravity, applyLag, applyInfect, applyPush,
  applyDecay, rotateBoard90,
  getTorusWinningCombinations, checkNumericWin,
} from './gatoModifiers';

// ─── Immutable Engine State ───────────────────────────────────────

export interface EngineState {
  board: (Player | null)[];
  pieces: Piece[];
  currentPlayer: Player;
  moveCount: number;
  winner: Player | 'draw' | null;
  gameState: GameState;
  selectedPieceIndex: number | null;
  mineTriggered: boolean;
  lagDrifted: boolean;
}

export interface MoveIntent {
  targetIndex: number;
  fromIndex?: number; // for movement phase overrides
}

export interface TurnResult {
  state: EngineState;
  moveExecuted: boolean;
}

// ─── Factory ──────────────────────────────────────────────────────

export function createInitialState(settings: GameSettings): EngineState {
  const cells = settings.gridSize * settings.gridSize;
  const board: (Player | null)[] = Array(cells).fill(null);
  for (const idx of settings.blockedIndices) {
    board[idx] = 'BLOCKED' as any;
  }
  return {
    board,
    pieces: [],
    currentPlayer: settings.startingPlayer,
    moveCount: 0,
    winner: null,
    gameState: 'playing',
    selectedPieceIndex: null,
    mineTriggered: false,
    lagDrifted: false,
  };
}

// ─── Win Check (modifier-aware) ──────────────────────────────────

function checkWinState(
  board: (Player | null)[],
  mods: GatoModifiers,
  gridSize: number,
  numericValues: number[],
): Player | 'draw' | null {
  // NUMERIC (CROM)
  if (mods.numeric && numericValues.length > 0) {
    if (checkNumericWin(board, numericValues, 'X')) return mods.misere ? 'O' : 'X';
    if (checkNumericWin(board, numericValues, 'O')) return mods.misere ? 'X' : 'O';
    const filled = board.filter(c => c === 'X' || c === 'O').length;
    if (filled >= 9) return 'draw';
    return null;
  }

  // TORUS
  if (mods.torus) {
    const combos = getTorusWinningCombinations(gridSize);
    for (const combo of combos) {
      const first = board[combo[0]];
      if (first && (first === 'X' || first === 'O') && combo.every(idx => board[idx] === first)) {
        return mods.misere ? (first === 'X' ? 'O' : 'X') : first;
      }
    }
    if (board.every(cell => cell !== null)) return 'draw';
    return null;
  }

  // Standard
  const result = checkWinner(board);
  if (result && mods.misere) {
    if (result === 'X') return 'O';
    if (result === 'O') return 'X';
  }
  return result;
}

// ─── Modifier Pipeline ───────────────────────────────────────────
// Resolution order: CHAOS → TOPOLOGY → PLACEMENT → OWNERSHIP → LIFECYCLE → WIN_CHECK

function applyPostPlacementPipeline(
  board: (Player | null)[],
  pieces: Piece[],
  placedIndex: number,
  player: Player,
  moveCount: number,
  mods: GatoModifiers,
  size: number,
): { board: (Player | null)[]; pieces: Piece[] } {
  let b = board;
  let p = pieces;

  // OWNERSHIP — infect adjacent enemies
  if (mods.infect) {
    const r = applyInfect(b, p, placedIndex, player, size);
    b = r.board; p = r.pieces;
  }

  // OWNERSHIP — push adjacent enemies
  if (mods.push) {
    const r = applyPush(b, p, placedIndex, size);
    b = r.board; p = r.pieces;
  }

  // LIFECYCLE — stealth (mark old pieces invisible)
  if (mods.stealth) {
    p = p.map(pc =>
      pc.order < moveCount - 1 ? { ...pc, invisible: true } : pc
    );
  }

  // LIFECYCLE — decay old pieces
  if (mods.decay > 0) {
    const r = applyDecay(b, p, moveCount, mods.decay * 2);
    b = r.board; p = r.pieces;
  }

  // LIFECYCLE — rotate every N turns
  if (mods.rotate > 0 && moveCount % mods.rotate === 0 && moveCount > 0) {
    const r = rotateBoard90(b, p, size);
    b = r.board; p = r.pieces;
  }

  return { board: b, pieces: p };
}

// ─── Core: Pure Turn Processor ───────────────────────────────────

export function processTurn(
  state: EngineState,
  intent: MoveIntent,
  settings: GameSettings,
): TurnResult {
  const mods = settings.modifiers;
  const size = settings.gridSize;
  const { board, pieces, currentPlayer, moveCount, mineTriggered } = state;

  const playerPieces = pieces.filter(p => p.player === currentPlayer);
  const isPlacementPhase = settings.mode === 'classic' ? true : playerPieces.length < size;
  const fromIndex = intent.fromIndex !== undefined ? intent.fromIndex : state.selectedPieceIndex;

  // ═══════════════════════════════════════════════════════════════
  // PLACEMENT PHASE
  // ═══════════════════════════════════════════════════════════════
  if (isPlacementPhase) {
    let finalIndex = intent.targetIndex;

    // ── LAYER 1: CHAOS — Lag drift ──
    let lagDrifted = false;
    if (mods.lag && currentPlayer === 'X') {
      const original = finalIndex;
      finalIndex = applyLag(finalIndex, board, size);
      lagDrifted = finalIndex !== original;
    }

    // ── LAYER 2: TOPOLOGY — Gravity ──
    if (mods.gravity) {
      const col = intent.targetIndex % size;
      finalIndex = applyGravity(board, col, size);
      if (finalIndex === -1) {
        return { state: { ...state, lagDrifted: false }, moveExecuted: false };
      }
    }

    // Check cell availability
    if (board[finalIndex]) {
      return { state: { ...state, lagDrifted: false }, moveExecuted: false };
    }
    if (settings.blockedIndices.includes(finalIndex)) {
      return { state: { ...state, lagDrifted: false }, moveExecuted: false };
    }

    // ── LAYER 3: PLACEMENT — Place the piece ──
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

    // MINE check
    if (mods.mine && finalIndex === settings.mineIndex && !mineTriggered) {
      newBoard[finalIndex] = 'BLOCKED' as any;
      newPieces = newPieces.filter(p => p.id !== newPiece.id);

      return {
        state: {
          ...state,
          board: newBoard,
          pieces: newPieces,
          moveCount: newMoveCount,
          currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
          mineTriggered: true,
          lagDrifted,
        },
        moveExecuted: true,
      };
    }

    // ── LAYERS 4-5: Post-placement pipeline ──
    const post = applyPostPlacementPipeline(
      newBoard, newPieces, finalIndex, currentPlayer, newMoveCount, mods, size,
    );
    newBoard = post.board;
    newPieces = post.pieces;

    // ── LAYER 6: WIN CHECK ──
    const result = checkWinState(newBoard, mods, size, settings.numericValues);

    if (result) {
      return {
        state: {
          ...state,
          board: newBoard,
          pieces: newPieces,
          moveCount: newMoveCount,
          winner: result,
          gameState: result === 'draw' ? 'draw' : 'winner',
          lagDrifted,
        },
        moveExecuted: true,
      };
    }

    return {
      state: {
        ...state,
        board: newBoard,
        pieces: newPieces,
        moveCount: newMoveCount,
        currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
        lagDrifted,
      },
      moveExecuted: true,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // MOVEMENT PHASE (romano / free / terni)
  // ═══════════════════════════════════════════════════════════════

  const pieceAtTarget = pieces.find(
    p => p.position === intent.targetIndex && p.player === currentPlayer,
  );

  // Selection: clicking own piece to select it
  if (intent.fromIndex === undefined && pieceAtTarget) {
    if (settings.mode === 'terni') {
      const oldestPiece = [...playerPieces].sort((a, b) => a.order - b.order)[0];
      if (pieceAtTarget.id === oldestPiece.id) {
        return {
          state: { ...state, selectedPieceIndex: intent.targetIndex, lagDrifted: false },
          moveExecuted: false,
        };
      }
    } else {
      return {
        state: { ...state, selectedPieceIndex: intent.targetIndex, lagDrifted: false },
        moveExecuted: false,
      };
    }
    return { state: { ...state, lagDrifted: false }, moveExecuted: false };
  }

  // Actual movement
  if (fromIndex !== null && fromIndex !== undefined) {
    // Clicking occupied cell (reselect)
    if (board[intent.targetIndex] && intent.fromIndex === undefined) {
      const otherPiece = pieces.find(
        p => p.position === intent.targetIndex && p.player === currentPlayer,
      );
      if (otherPiece) {
        if (settings.mode === 'terni') {
          const oldestPiece = [...playerPieces].sort((a, b) => a.order - b.order)[0];
          if (otherPiece.id === oldestPiece.id) {
            return {
              state: { ...state, selectedPieceIndex: intent.targetIndex, lagDrifted: false },
              moveExecuted: false,
            };
          }
        } else {
          return {
            state: { ...state, selectedPieceIndex: intent.targetIndex, lagDrifted: false },
            moveExecuted: false,
          };
        }
      }
      return { state: { ...state, lagDrifted: false }, moveExecuted: false };
    }

    // Validate movement
    const adjacentMap = getAdjacentMap(size);
    let isValid = false;
    if (settings.mode === 'free' || settings.mode === 'terni') {
      isValid = true;
    } else if (settings.mode === 'romano') {
      isValid = adjacentMap[fromIndex].includes(intent.targetIndex);
    }

    if (isValid) {
      let newBoard = [...board];
      newBoard[fromIndex] = null;
      newBoard[intent.targetIndex] = currentPlayer;

      let newPieces = pieces.map(p =>
        p.position === fromIndex ? { ...p, position: intent.targetIndex, order: moveCount } : p
      );
      const newMoveCount = moveCount + 1;

      // Post-movement pipeline (same as post-placement)
      const post = applyPostPlacementPipeline(
        newBoard, newPieces, intent.targetIndex, currentPlayer, newMoveCount, mods, size,
      );
      newBoard = post.board;
      newPieces = post.pieces;

      // Win check
      const result = checkWinState(newBoard, mods, size, settings.numericValues);

      if (result) {
        return {
          state: {
            ...state,
            board: newBoard,
            pieces: newPieces,
            moveCount: newMoveCount,
            selectedPieceIndex: null,
            winner: result,
            gameState: result === 'draw' ? 'draw' : 'winner',
            lagDrifted: false,
          },
          moveExecuted: true,
        };
      }

      return {
        state: {
          ...state,
          board: newBoard,
          pieces: newPieces,
          moveCount: newMoveCount,
          selectedPieceIndex: null,
          currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
          lagDrifted: false,
        },
        moveExecuted: true,
      };
    }
  }

  return { state: { ...state, lagDrifted: false }, moveExecuted: false };
}
