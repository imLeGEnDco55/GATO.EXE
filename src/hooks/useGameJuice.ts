import { useState, useEffect, useRef, useCallback } from 'react';
import type { Player, Piece, GatoModifiers } from '../types';
import {
  sfxPlace, sfxGlitch, sfxExplosion, sfxWin, sfxLose,
  sfxInfect, sfxRotate,
} from '../engine/audioEngine';

// ─── VFX State Types ──────────────────────────────────────────────

export type VfxEvent =
  | 'place'        // normal piece placement
  | 'lag-glitch'   // lag drift happened
  | 'mine-boom'    // mine triggered
  | 'infect'       // virus converted a piece
  | 'rotate'       // board rotated
  | 'win'          // player won
  | 'lose'         // player lost
  | 'draw';

export interface JuiceState {
  shake: boolean;        // screen shake active
  glitch: boolean;       // glitch/static overlay active
  explosion: number;     // explosion cell index (-1 if none)
  flash: 'cyan' | 'rose' | 'red' | null; // border flash color
  scanlines: boolean;    // CRT scanline overlay
}

const INITIAL_JUICE: JuiceState = {
  shake: false,
  glitch: false,
  explosion: -1,
  flash: null,
  scanlines: false,
};

// ─── Hook ─────────────────────────────────────────────────────────

interface UseGameJuiceParams {
  moveCount: number;
  winner: Player | 'draw' | null;
  mineTriggered: boolean;
  lagDrifted: boolean;
  pieces: Piece[];
  modifiers: GatoModifiers;
}

export function useGameJuice({
  moveCount,
  winner,
  mineTriggered,
  lagDrifted,
  pieces,
  modifiers,
}: UseGameJuiceParams) {
  const [juice, setJuice] = useState<JuiceState>(INITIAL_JUICE);
  const prevMoveCount = useRef(moveCount);
  const prevMineTriggered = useRef(mineTriggered);
  const prevWinner = useRef(winner);
  const prevPieceCount = useRef(pieces.length);

  // Fire VFX for a given duration, then auto-clear
  const fireVfx = useCallback((partial: Partial<JuiceState>, durationMs: number) => {
    setJuice(prev => ({ ...prev, ...partial }));
    setTimeout(() => {
      setJuice(prev => ({ ...prev, ...INITIAL_JUICE }));
    }, durationMs);
  }, []);

  // ── React to engine state changes ───────────────────────────────
  useEffect(() => {
    const moveChanged = moveCount !== prevMoveCount.current;
    const mineJustTriggered = mineTriggered && !prevMineTriggered.current;
    const winnerJustSet = winner && !prevWinner.current;

    prevMoveCount.current = moveCount;
    prevMineTriggered.current = mineTriggered;
    prevWinner.current = winner;

    // MINE EXPLOSION — highest priority
    if (mineJustTriggered) {
      sfxExplosion();
      fireVfx({
        shake: true,
        flash: 'red',
        explosion: -1, // handled by Board with mineTriggered prop
        glitch: true,
      }, 500);
      prevPieceCount.current = pieces.length;
      return;
    }

    // WINNER
    if (winnerJustSet) {
      if (winner === 'X') {
        sfxWin();
        fireVfx({ flash: 'cyan' }, 400);
      } else if (winner === 'O') {
        sfxLose();
        fireVfx({ shake: true, flash: 'rose' }, 300);
      }
      // draw = no vfx
      prevPieceCount.current = pieces.length;
      return;
    }

    // MOVE HAPPENED
    if (moveChanged && moveCount > 0) {
      // Check for LAG drift
      if (lagDrifted) {
        sfxGlitch();
        fireVfx({ glitch: true, shake: true }, 300);
        prevPieceCount.current = pieces.length;
        return;
      }

      // Check for INFECT (piece count unchanged but owners changed)
      // Simple heuristic: if pieces swapped ownership, infect happened
      if (modifiers.infect && pieces.length > prevPieceCount.current) {
        sfxInfect();
        fireVfx({ flash: 'cyan' }, 200);
      }

      // Check for ROTATE
      if (modifiers.rotate > 0 && moveCount > 0 && moveCount % modifiers.rotate === 0) {
        sfxRotate();
        fireVfx({ shake: true }, 350);
        prevPieceCount.current = pieces.length;
        return;
      }

      // Normal placement
      sfxPlace();
      fireVfx({ shake: true }, 120);
      prevPieceCount.current = pieces.length;
    }
  }, [moveCount, mineTriggered, winner, lagDrifted, pieces, modifiers, fireVfx]);

  // Reset on game restart
  useEffect(() => {
    if (moveCount === 0) {
      setJuice(INITIAL_JUICE);
    }
  }, [moveCount]);

  return juice;
}
