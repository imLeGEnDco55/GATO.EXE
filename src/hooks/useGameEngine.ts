import { useState, useCallback, useEffect, useRef } from 'react';
import type { Player, GameState, GameSettings, Piece } from '../types';
import { createInitialState, processTurn } from '../engine/gameState';
import type { EngineState } from '../engine/gameState';

export function useGameEngine(settings: GameSettings) {
  const [engineState, setEngineState] = useState<EngineState>(() =>
    createInitialState(settings)
  );
  const [lagMessage, setLagMessage] = useState<string | null>(null);

  // Auto-reset when board-affecting settings change (fixes 4x4/5x5 first-render bug)
  const prevGridSize = useRef(settings.gridSize);
  const prevMode = useRef(settings.mode);
  useEffect(() => {
    const gridChanged = prevGridSize.current !== settings.gridSize;
    const modeChanged = prevMode.current !== settings.mode;
    prevGridSize.current = settings.gridSize;
    prevMode.current = settings.mode;

    if (gridChanged || modeChanged) {
      setEngineState(createInitialState(settings));
      setLagMessage(null);
    }
  }, [settings]);

  const resetGame = useCallback(() => {
    setEngineState(createInitialState(settings));
    setLagMessage(null);
  }, [settings]);

  const goToMenu = useCallback(() => {
    setEngineState(prev => ({ ...prev, gameState: 'menu' as GameState }));
  }, []);

  const processMove = useCallback((toIndex: number, fromIndexOverride?: number) => {
    const result = processTurn(
      engineState,
      { targetIndex: toIndex, fromIndex: fromIndexOverride },
      settings,
    );

    setEngineState(result.state);

    // Handle lag message (UI concern only)
    if (result.state.lagDrifted) {
      setLagMessage('⚠️ LAG: Ficha desviada');
      setTimeout(() => setLagMessage(null), 1500);
    }

    return result.state.winner;
  }, [engineState, settings]);

  const handleCellClick = useCallback((index: number) => {
    if (engineState.winner || engineState.gameState !== 'playing') return null;
    if (settings.opponent === 'cpu' && engineState.currentPlayer === 'O') return null;
    if (settings.blockedIndices.includes(index)) return null;
    return processMove(index);
  }, [engineState, settings, processMove]);

  // Expose same interface as before for backward compatibility
  return {
    board: engineState.board,
    currentPlayer: engineState.currentPlayer,
    winner: engineState.winner,
    gameState: engineState.gameState,
    pieces: engineState.pieces,
    selectedPieceIndex: engineState.selectedPieceIndex,
    moveCount: engineState.moveCount,
    mineTriggered: engineState.mineTriggered,
    lagDrifted: engineState.lagDrifted,
    lagMessage,
    handleCellClick,
    processMove,
    resetGame,
    goToMenu,
  };
}
