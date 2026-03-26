import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { GatoId, GauntletState, MatchScore, Player, GameSettings } from '../types';
import { pickRandomGatos, getGato, DEFAULT_MODIFIERS } from '../engine/gatoRegistry';
import { generateBlockedCells, generateMineIndex, generateNumericValues } from '../engine/gatoModifiers';

export function useGauntlet(
  setSettings: Dispatch<SetStateAction<GameSettings>>
) {
  const [gauntlet, setGauntlet] = useState<GauntletState>({
    cycle: 1,
    selectedGatos: [],
    currentGatoIdx: 0,
    matchScore: { player: 0, cpu: 0 },
    matchesNeeded: 2,
    isBossRound: false,
    isShopPhase: false,
    wallet: 0,
    totalWins: 0,
    message: null,
    defeatedGatos: [],
  });

  const clearMessage = useCallback(() => {
    setGauntlet(prev => ({ ...prev, message: null }));
  }, []);

  // Apply a gato's settings (mode + modifiers)
  const applyGato = useCallback((gatoId: GatoId, gridSize: number = 3) => {
    const gato = getGato(gatoId);
    const mods = gato.modifiers;
    const blocked = mods.blockedCells > 0
      ? generateBlockedCells(mods.blockedCells, gridSize * gridSize)
      : [];
    const mine = mods.mine ? generateMineIndex(gridSize * gridSize) : -1;
    const numeric = mods.numeric ? generateNumericValues() : [];

    setSettings(prev => ({
      ...prev,
      mode: gato.mode,
      gridSize,
      activeGato: gatoId,
      modifiers: mods,
      blockedIndices: blocked,
      mineIndex: mine,
      numericValues: numeric,
    }));
  }, [setSettings]);

  // Apply boss round (4x4 or 5x5 classic, no modifiers)
  const applyBossGrid = useCallback((gridSize: number) => {
    setSettings(prev => ({
      ...prev,
      mode: 'classic',
      gridSize,
      activeGato: null,
      modifiers: DEFAULT_MODIFIERS,
      blockedIndices: [],
      mineIndex: -1,
      numericValues: [],
    }));
  }, [setSettings]);

  // Start a new gauntlet run
  const startGauntlet = useCallback(() => {
    const gatos = pickRandomGatos(2);
    setGauntlet({
      cycle: 1,
      selectedGatos: gatos,
      currentGatoIdx: 0,
      matchScore: { player: 0, cpu: 0 },
      matchesNeeded: 2,
      isBossRound: false,
      isShopPhase: false,
      wallet: 0,
      totalWins: 0,
      message: `CICLO 1 — ${getGato(gatos[0]).emoji} ${getGato(gatos[0]).name}`,
      defeatedGatos: [],
    });
    applyGato(gatos[0]);
  }, [applyGato]);

  // Get CPU difficulty based on cycle
  const getCPUMistakeRate = useCallback((): number => {
    switch (gauntlet.cycle) {
      case 1: return 0.7;  // 70% mistakes
      case 2: return 0.4;  // 40% mistakes  
      case 3: return 0.1;  // 10% mistakes
      default: return 0.5;
    }
  }, [gauntlet.cycle]);

  // Handle match result
  const handleMatchResult = useCallback((winner: Player | 'draw') => {
    setGauntlet(prev => {
      const next = { ...prev };
      const newScore: MatchScore = { ...prev.matchScore };

      if (winner === 'X') {
        newScore.player++;
        next.wallet += 100; // Reward for winning a match
      } else if (winner === 'O') {
        newScore.cpu++;
      }
      // Draw doesn't count — replay

      next.matchScore = newScore;

      // Check if series is decided
      const seriesWon = newScore.player >= prev.matchesNeeded;
      const seriesLost = newScore.cpu >= prev.matchesNeeded;

      if (!seriesWon && !seriesLost) {
        // Series continues
        const total = newScore.player + newScore.cpu;
        if (winner === 'draw') {
          next.message = 'EMPATE — NO CUENTA. REPITE.';
        } else {
          const currentGato = prev.isBossRound ? null : getGato(prev.selectedGatos[prev.currentGatoIdx]);
          const name = currentGato ? currentGato.name : `${prev.cycle === 3 ? '5x5' : '4x4'}`;
          next.message = `${name} — ${newScore.player}:${newScore.cpu}`;
        }
        setTimeout(clearMessage, 2000);
        return next;
      }

      if (seriesLost) {
        // Lost series — restart current cycle with new gatos
        const newGatos = pickRandomGatos(2, prev.defeatedGatos);
        next.selectedGatos = newGatos;
        next.currentGatoIdx = 0;
        next.matchScore = { player: 0, cpu: 0 };
        next.isBossRound = false;
        next.message = `DERROTA. REINICIO CICLO ${prev.cycle} — ${getGato(newGatos[0]).emoji} ${getGato(newGatos[0]).name}`;
        setTimeout(() => {
          applyGato(newGatos[0]);
          clearMessage();
        }, 2000);
        return next;
      }

      // Series won
      if (prev.isBossRound) {
        // Won the boss round
        next.totalWins++;
        next.wallet += 500; // Reward for beating the boss

        if (prev.cycle === 3) {
          // Beat everything!
          next.message = '🏆 GAUNTLET COMPLETADO. SISTEMA DOMINADO.';
          return next;
        }

        // Instead of directly starting next cycle, go to Shop
        next.isShopPhase = true;
        next.message = 'ACCESO CONCEDIDO: BLACK MARKET SHOP';
        return next;
      }

      // Won a gato series — advance to next gato or boss
      const defeated = [...prev.defeatedGatos, prev.selectedGatos[prev.currentGatoIdx]];
      next.defeatedGatos = defeated;
      next.matchScore = { player: 0, cpu: 0 };

      const nextGatoIdx = prev.currentGatoIdx + 1;

      if (nextGatoIdx < prev.selectedGatos.length) {
        // Next gato in this cycle
        next.currentGatoIdx = nextGatoIdx;
        const nextGato = getGato(prev.selectedGatos[nextGatoIdx]);
        next.message = `VICTORIA. SIGUIENTE: ${nextGato.emoji} ${nextGato.name}`;

        setTimeout(() => {
          applyGato(prev.selectedGatos[nextGatoIdx]);
          clearMessage();
        }, 2500);
      } else {
        // All gatos defeated — boss round
        next.isBossRound = true;
        const bossSize = prev.cycle === 3 ? 5 : 4;
        next.message = `TODOS DERROTADOS. BOSS: TABLERO ${bossSize}x${bossSize}`;

        setTimeout(() => {
          applyBossGrid(bossSize);
          clearMessage();
        }, 2500);
      }

      return next;
    });
  }, [applyGato, applyBossGrid, clearMessage]);

  const getActiveGatoName = useCallback((): string => {
    if (gauntlet.isBossRound) {
      const size = gauntlet.cycle === 3 ? 5 : 4;
      return `GRID ${size}×${size}`;
    }
    if (gauntlet.selectedGatos.length === 0) return 'GATO.EXE';
    const gato = getGato(gauntlet.selectedGatos[gauntlet.currentGatoIdx]);
    return `${gato.emoji} ${gato.name}`;
  }, [gauntlet]);

  const getActiveGatoDesc = useCallback((): string => {
    if (gauntlet.isBossRound) return 'Clásico sin reglas especiales.';
    if (gauntlet.selectedGatos.length === 0) return '';
    return getGato(gauntlet.selectedGatos[gauntlet.currentGatoIdx]).description;
  }, [gauntlet]);

  const continueFromShop = useCallback(() => {
    setGauntlet(prev => {
      const nextCycle = (prev.cycle + 1) as 1 | 2 | 3;
      const count = nextCycle === 3 ? 2 : 2;
      const newGatos = pickRandomGatos(count, prev.defeatedGatos);

      const next = { ...prev };
      next.cycle = nextCycle;
      next.selectedGatos = newGatos;
      next.currentGatoIdx = 0;
      next.matchScore = { player: 0, cpu: 0 };
      next.isBossRound = false;
      next.isShopPhase = false;
      next.message = `CICLO ${nextCycle} — ${getGato(newGatos[0]).emoji} ${getGato(newGatos[0]).name}`;

      setTimeout(() => {
        applyGato(newGatos[0]);
        clearMessage();
      }, 2500);

      return next;
    });
  }, [applyGato, clearMessage]);

  const buyHack = useCallback((hackId: string, price: number) => {
    setGauntlet(prev => {
      if (prev.wallet >= price) {
        return { ...prev, wallet: prev.wallet - price };
      }
      return prev;
    });
  }, []);

  return {
    gauntlet,
    startGauntlet,
    handleMatchResult,
    getCPUMistakeRate,
    getActiveGatoName,
    getActiveGatoDesc,
    continueFromShop,
    buyHack,
  };
}
