import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { GatoId, GauntletState, MatchScore, Player, GameSettings } from '../types';
import { pickRandomGatos, getGato, DEFAULT_MODIFIERS, GATO_REGISTRY } from '../engine/gatoRegistry';
import { generateBlockedCells, generateMineIndex, generateNumericValues } from '../engine/gatoModifiers';
import { generateProceduralBoss, getDifficultyLabel } from '../engine/compatibility';
import type { ProceduralBoss } from '../engine/compatibility';

// ─── Constants ────────────────────────────────────────────────────

const REGISTRY_CYCLES = 3;       // First 3 cycles use the 19 primigenios
const GATOS_PER_CYCLE = 2;       // 2 gatos per cycle

// ─── Initial State ────────────────────────────────────────────────

function createInitialGauntlet(): GauntletState {
  return {
    cycle: 1,
    level: 1,
    selectedGatos: [],
    currentGatoIdx: 0,
    matchScore: { player: 0, cpu: 0 },
    matchesNeeded: 2,
    isBossRound: false,
    totalWins: 0,
    message: null,
    defeatedGatos: [],
    wallet: 0,
    winStreak: 0,
    isShopPhase: false,
    purchasedHacks: [],
    activeBoss: null,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useGauntlet(
  setSettings: Dispatch<SetStateAction<GameSettings>>
) {
  const [gauntlet, setGauntlet] = useState<GauntletState>(createInitialGauntlet);

  const clearMessage = useCallback(() => {
    setGauntlet(prev => ({ ...prev, message: null }));
  }, []);

  // Apply a registry gato's settings
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

  // Apply a procedural boss's settings
  const applyBoss = useCallback((boss: ProceduralBoss) => {
    const mods = boss.definition.modifiers;
    const cells = boss.gridSize * boss.gridSize;
    const blocked = mods.blockedCells > 0 ? generateBlockedCells(mods.blockedCells, cells) : [];
    const mine = mods.mine ? generateMineIndex(cells) : -1;
    const numeric = mods.numeric ? generateNumericValues() : [];

    setSettings(prev => ({
      ...prev,
      mode: boss.definition.mode,
      gridSize: boss.gridSize,
      activeGato: null,
      modifiers: mods,
      blockedIndices: blocked,
      mineIndex: mine,
      numericValues: numeric,
    }));
  }, [setSettings]);

  // Apply classic boss grid (cycles 1-3 end-of-cycle boss)
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
    const gatos = pickRandomGatos(GATOS_PER_CYCLE);
    setGauntlet({
      ...createInitialGauntlet(),
      selectedGatos: gatos,
      message: `CICLO 1 — ${getGato(gatos[0]).emoji} ${getGato(gatos[0]).name}`,
    });
    applyGato(gatos[0]);
  }, [applyGato]);

  // CPU difficulty — scales with level
  const getCPUMistakeRate = useCallback((): number => {
    const { cycle, level, isBossRound, activeBoss } = gauntlet;

    // Procedural boss has its own rate
    if (activeBoss && cycle > REGISTRY_CYCLES) {
      return Math.max(0, 0.65 - level * 0.012);
    }

    // Registry cycles (1-3)
    if (isBossRound) {
      switch (cycle) {
        case 1: return 0.5;
        case 2: return 0.25;
        case 3: return 0.05;
        default: return 0.3;
      }
    }

    switch (cycle) {
      case 1: return 0.7;
      case 2: return 0.4;
      case 3: return 0.1;
      default: return 0.5;
    }
  }, [gauntlet]);

  // ─── Start a new procedural cycle (cycle 4+) ──────────────────

  function startProceduralCycle(prevState: GauntletState): GauntletState {
    const nextLevel = prevState.level + 1;
    const nextCycle = prevState.cycle + 1;
    const boss = generateProceduralBoss(nextLevel);

    // Schedule settings application
    setTimeout(() => {
      applyBoss(boss);
      clearMessage();
    }, 2500);

    return {
      ...prevState,
      cycle: nextCycle,
      level: nextLevel,
      selectedGatos: [],
      currentGatoIdx: 0,
      matchScore: { player: 0, cpu: 0 },
      matchesNeeded: boss.matchesNeeded,
      isBossRound: true,
      activeBoss: {
        name: boss.definition.name,
        emoji: boss.definition.emoji,
        description: boss.definition.description,
        gridSize: boss.gridSize,
      },
      message: `${boss.definition.emoji} LV.${nextLevel} ${boss.definition.name} — ${getDifficultyLabel(nextLevel)}`,
    };
  }

  // ─── Handle match result ──────────────────────────────────────

  const handleMatchResult = useCallback((winner: Player | 'draw') => {
    setGauntlet(prev => {
      const next = { ...prev };
      const newScore: MatchScore = { ...prev.matchScore };

      if (winner === 'X') {
        newScore.player++;
        next.winStreak = prev.winStreak + 1;

        let multiplier = 1.0;
        if (next.winStreak >= 3) multiplier = 2.0;
        else if (next.winStreak >= 2) multiplier = 1.5;

        next.wallet = prev.wallet + (1000 * multiplier);
      } else if (winner === 'O') {
        newScore.cpu++;
        next.winStreak = 0;
      } else {
        // Draw — no score change, streak resets
        next.winStreak = 0;
      }

      next.matchScore = newScore;

      const seriesWon = newScore.player >= prev.matchesNeeded;
      const seriesLost = newScore.cpu >= prev.matchesNeeded;

      // ── Series continues ──
      if (!seriesWon && !seriesLost) {
        if (winner === 'draw') {
          next.message = 'EMPATE — NO CUENTA. REPITE.';
        } else if (prev.activeBoss) {
          next.message = `${prev.activeBoss.name} — ${newScore.player}:${newScore.cpu}`;
        } else if (prev.isBossRound) {
          const size = prev.cycle <= 2 ? 4 : 5;
          next.message = `GRID ${size}×${size} — ${newScore.player}:${newScore.cpu}`;
        } else {
          const gato = getGato(prev.selectedGatos[prev.currentGatoIdx]);
          next.message = `${gato.name} — ${newScore.player}:${newScore.cpu}`;
        }
        setTimeout(clearMessage, 2000);
        return next;
      }

      // ── Series lost ──
      if (seriesLost) {
        // In procedural mode (cycle 4+): restart same level with new boss
        if (prev.cycle > REGISTRY_CYCLES) {
          const boss = generateProceduralBoss(prev.level);
          next.matchScore = { player: 0, cpu: 0 };
          next.matchesNeeded = boss.matchesNeeded;
          next.activeBoss = {
            name: boss.definition.name,
            emoji: boss.definition.emoji,
            description: boss.definition.description,
            gridSize: boss.gridSize,
          };
          next.message = `DERROTA. NUEVO BOSS LV.${prev.level} — ${boss.definition.emoji} ${boss.definition.name}`;
          setTimeout(() => {
            applyBoss(boss);
            clearMessage();
          }, 2000);
          return next;
        }

        // Registry cycles: restart cycle with new gatos
        const newGatos = pickRandomGatos(GATOS_PER_CYCLE, prev.defeatedGatos);
        next.selectedGatos = newGatos;
        next.currentGatoIdx = 0;
        next.matchScore = { player: 0, cpu: 0 };
        next.isBossRound = false;
        next.activeBoss = null;
        next.message = `DERROTA. REINICIO CICLO ${prev.cycle} — ${getGato(newGatos[0]).emoji} ${getGato(newGatos[0]).name}`;
        setTimeout(() => {
          applyGato(newGatos[0]);
          clearMessage();
        }, 2000);
        return next;
      }

      // ── Series won ──
      next.totalWins++;

      // Won a procedural boss — open shop before next boss
      if (prev.cycle > REGISTRY_CYCLES) {
        next.isShopPhase = true;
        next.message = '⌐■-■ BLACK MARKET DESBLOQUEADO';
        return next;
      }

      // Won boss round of registry cycle — open shop before next cycle
      if (prev.isBossRound) {
        next.isShopPhase = true;
        if (prev.cycle >= REGISTRY_CYCLES) {
          next.message = '🔓 MODO SUPERVIVENCIA — ⌐■-■ BLACK MARKET';
        } else {
          next.message = '⌐■-■ BLACK MARKET DESBLOQUEADO';
        }
        return next;
      }

      // Won a gato series — advance to next gato or boss
      const defeated = [...prev.defeatedGatos, prev.selectedGatos[prev.currentGatoIdx]];
      next.defeatedGatos = defeated;
      next.matchScore = { player: 0, cpu: 0 };
      next.activeBoss = null;

      const nextGatoIdx = prev.currentGatoIdx + 1;

      if (nextGatoIdx < prev.selectedGatos.length) {
        next.currentGatoIdx = nextGatoIdx;
        const nextGato = getGato(prev.selectedGatos[nextGatoIdx]);
        next.message = `VICTORIA. SIGUIENTE: ${nextGato.emoji} ${nextGato.name}`;
        setTimeout(() => {
          applyGato(prev.selectedGatos[nextGatoIdx]);
          clearMessage();
        }, 2500);
      } else {
        // Boss round (registry cycles)
        next.isBossRound = true;
        const bossSize = prev.cycle >= 3 ? 5 : 4;
        next.message = `TODOS DERROTADOS. BOSS: TABLERO ${bossSize}×${bossSize}`;
        setTimeout(() => {
          applyBossGrid(bossSize);
          clearMessage();
        }, 2500);
      }

      return next;
    });
  }, [applyGato, applyBoss, applyBossGrid, clearMessage]);

  // ─── Display helpers ──────────────────────────────────────────

  const getActiveGatoName = useCallback((): string => {
    if (gauntlet.activeBoss) {
      return `${gauntlet.activeBoss.emoji} ${gauntlet.activeBoss.name}`;
    }
    if (gauntlet.isBossRound) {
      const size = gauntlet.cycle >= 3 ? 5 : 4;
      return `GRID ${size}×${size}`;
    }
    if (gauntlet.selectedGatos.length === 0) return 'GATO.EXE';
    const gato = getGato(gauntlet.selectedGatos[gauntlet.currentGatoIdx]);
    return `${gato.emoji} ${gato.name}`;
  }, [gauntlet]);

  const getActiveGatoDesc = useCallback((): string => {
    if (gauntlet.activeBoss) return gauntlet.activeBoss.description;
    if (gauntlet.isBossRound) return 'Clásico sin reglas especiales.';
    if (gauntlet.selectedGatos.length === 0) return '';
    return getGato(gauntlet.selectedGatos[gauntlet.currentGatoIdx]).description;
  }, [gauntlet]);

  // ─── Shop actions ────────────────────────────────────────────

  const buyHack = useCallback((hackId: string) => {
    setGauntlet(prev => {
      if (prev.purchasedHacks.includes(hackId)) return prev;
      // Price lookup — for now hardcoded, will move to registry
      const prices: Record<string, number> = {
        'extra-life': 2000,
        'reveal-cpu': 3500,
        'double-credits': 5000,
      };
      const price = prices[hackId] ?? 0;
      if (prev.wallet < price) return prev;
      return {
        ...prev,
        wallet: prev.wallet - price,
        purchasedHacks: [...prev.purchasedHacks, hackId],
      };
    });
  }, []);

  const continueFromShop = useCallback(() => {
    setGauntlet(prev => {
      const next = { ...prev, isShopPhase: false };

      // Procedural mode — generate next boss
      if (prev.cycle > REGISTRY_CYCLES) {
        return startProceduralCycle(next);
      }

      // Registry: finished all 3 cycles — enter infinite mode
      if (prev.isBossRound && prev.cycle >= REGISTRY_CYCLES) {
        const entering = startProceduralCycle({ ...next, cycle: REGISTRY_CYCLES });
        entering.message = `🔓 MODO SUPERVIVENCIA DESBLOQUEADO — ${entering.message}`;
        return entering;
      }

      // Registry: advance to next cycle
      const nextCycle = prev.cycle + 1;
      const newGatos = pickRandomGatos(GATOS_PER_CYCLE, prev.defeatedGatos);
      next.cycle = nextCycle;
      next.level = nextCycle;
      next.selectedGatos = newGatos;
      next.currentGatoIdx = 0;
      next.matchScore = { player: 0, cpu: 0 };
      next.isBossRound = false;
      next.activeBoss = null;
      next.message = `CICLO ${nextCycle} — ${getGato(newGatos[0]).emoji} ${getGato(newGatos[0]).name}`;
      setTimeout(() => {
        applyGato(newGatos[0]);
        clearMessage();
      }, 2500);
      return next;
    });
  }, [applyGato, applyBoss, clearMessage]);

  return {
    gauntlet,
    startGauntlet,
    handleMatchResult,
    getCPUMistakeRate,
    getActiveGatoName,
    getActiveGatoDesc,
    wallet: gauntlet.wallet,
    winStreak: gauntlet.winStreak,
    buyHack,
    continueFromShop,
  };
}
