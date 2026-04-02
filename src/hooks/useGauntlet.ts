import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { GauntletState, MatchScore, Player, GameSettings } from '../types';
import { DEFAULT_MODIFIERS } from '../engine/gatoRegistry';
import { generateBlockedCells, generateMineIndex, generateNumericValues } from '../engine/gatoModifiers';
import { generateProceduralBossForGrid, getDifficultyLabel } from '../engine/compatibility';
import type { ProceduralBoss } from '../engine/compatibility';
import type { CustomHackData } from '../lib/hackCard';
import { HACK_EFFECTS } from '../lib/hackCard';
import type { GatoCard } from '../sdk/gatoCard';

// ─── GLITCH Cycle Pattern ─────────────────────────────────────────
// Position 0: 3×3 (Normal)
// Position 1: 3×3 (Normal)
// Position 2: 4×4 (Subjefe)     → SHOP
// Position 3: 3×3 (Normal)
// Position 4: 3×3 (Normal)
// Position 5: 5×5 (Jefe)        → SHOP
// Then repeat from 0

const GLITCH_CYCLE: Array<3 | 4 | 5> = [3, 3, 4, 3, 3, 5];
const SHOP_AFTER = [2, 5]; // Show shop after encounter index 2 and 5

function getGridForEncounter(encounter: number): 3 | 4 | 5 {
  return GLITCH_CYCLE[encounter % GLITCH_CYCLE.length];
}

function isShopEncounter(encounter: number): boolean {
  return SHOP_AFTER.includes(encounter % GLITCH_CYCLE.length);
}

// ─── Initial State ────────────────────────────────────────────────

function createInitialGauntlet(): GauntletState {
  return {
    cycle: 1,
    level: 1,
    encounterInCycle: 0,
    selectedGatos: [],
    currentGatoIdx: 0,
    matchScore: { player: 0, cpu: 0 },
    matchesNeeded: 2,
    isBossRound: true,
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

// ─── Tier labels ──────────────────────────────────────────────────

function getTierLabel(gridSize: number): string {
  if (gridSize === 5) return '🔥 JEFE';
  if (gridSize === 4) return '⚔️ SUBJEFE';
  return '🐱 NORMAL';
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useGauntlet(
  setSettings: Dispatch<SetStateAction<GameSettings>>,
  customHacks: CustomHackData[] = [],
  customGatos: GatoCard[] = [],
) {
  const [gauntlet, setGauntlet] = useState<GauntletState>(createInitialGauntlet);

  const clearMessage = useCallback(() => {
    setGauntlet(prev => ({ ...prev, message: null }));
  }, []);

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

  // Apply a custom GatoCard's settings
  const applyCustomGato = useCallback((card: GatoCard) => {
    const mods = card.modifiers;
    const cells = card.gridSize * card.gridSize;
    const blocked = mods.blockedCells > 0 ? generateBlockedCells(mods.blockedCells, cells) : [];
    const mine = mods.mine ? generateMineIndex(cells) : -1;
    const numeric = mods.numeric ? generateNumericValues() : [];

    setSettings(prev => ({
      ...prev,
      mode: 'classic',
      gridSize: card.gridSize,
      activeGato: null,
      modifiers: mods,
      blockedIndices: blocked,
      mineIndex: mine,
      numericValues: numeric,
    }));
  }, [setSettings]);

  // Pick a custom gato for the required grid size, or null if none match
  const pickCustomGatoForGrid = useCallback((gridSize: 3 | 4 | 5): GatoCard | null => {
    const matching = customGatos.filter(g => g.gridSize === gridSize);
    if (matching.length === 0) return null;
    return matching[Math.floor(Math.random() * matching.length)];
  }, [customGatos]);

  // Setup encounter — either custom gato or procedural boss
  const setupEncounter = useCallback((level: number, encounterIdx: number): {
    boss: ProceduralBoss | null;
    customCard: GatoCard | null;
    gridSize: 3 | 4 | 5;
  } => {
    const gridSize = getGridForEncounter(encounterIdx);
    const customCard = pickCustomGatoForGrid(gridSize);

    if (customCard) {
      return { boss: null, customCard, gridSize };
    }

    // No custom gato for this tier — generate procedural
    const boss = generateProceduralBossForGrid(level, gridSize);
    return { boss, customCard: null, gridSize };
  }, [pickCustomGatoForGrid]);

  // Start a new GLITCH run
  const startGauntlet = useCallback(() => {
    const initial = createInitialGauntlet();
    const { boss, customCard, gridSize } = setupEncounter(1, 0);

    initial.isBossRound = true;
    initial.encounterInCycle = 0;

    if (customCard) {
      initial.matchesNeeded = 2;
      initial.activeBoss = {
        name: customCard.name,
        emoji: customCard.emoji,
        description: customCard.description,
        gridSize: customCard.gridSize,
      };
      initial.message = `${customCard.emoji} LV.1 ${customCard.name} — ${getTierLabel(gridSize)}`;
      setGauntlet(initial);
      applyCustomGato(customCard);
    } else if (boss) {
      initial.matchesNeeded = boss.matchesNeeded;
      initial.activeBoss = {
        name: boss.definition.name,
        emoji: boss.definition.emoji,
        description: boss.definition.description,
        gridSize: boss.gridSize,
      };
      initial.message = `${boss.definition.emoji} LV.1 ${boss.definition.name} — ${getDifficultyLabel(1)}`;
      setGauntlet(initial);
      applyBoss(boss);
    }
  }, [setupEncounter, applyBoss, applyCustomGato]);

  // CPU difficulty — scales with level
  const getCPUMistakeRate = useCallback((): number => {
    const { level } = gauntlet;
    return Math.max(0, 0.65 - level * 0.012);
  }, [gauntlet]);

  // ─── Advance to next encounter in GLITCH cycle ──────────────────

  function advanceToNextEncounter(prevState: GauntletState): GauntletState {
    const nextLevel = prevState.level + 1;
    const nextEncounter = (prevState.encounterInCycle + 1) % GLITCH_CYCLE.length;
    const nextCycle = nextEncounter === 0 ? prevState.cycle + 1 : prevState.cycle;
    const { boss, customCard, gridSize } = setupEncounter(nextLevel, nextEncounter);

    const next: GauntletState = {
      ...prevState,
      cycle: nextCycle,
      level: nextLevel,
      encounterInCycle: nextEncounter,
      selectedGatos: [],
      currentGatoIdx: 0,
      matchScore: { player: 0, cpu: 0 },
      matchesNeeded: 2,
      isBossRound: true,
      activeBoss: null,
      message: null,
    };

    if (customCard) {
      next.matchesNeeded = 2;
      next.activeBoss = {
        name: customCard.name,
        emoji: customCard.emoji,
        description: customCard.description,
        gridSize: customCard.gridSize,
      };
      next.message = `${customCard.emoji} LV.${nextLevel} ${customCard.name} — ${getTierLabel(gridSize)}`;

      setTimeout(() => {
        applyCustomGato(customCard);
        clearMessage();
      }, 2500);
    } else if (boss) {
      next.matchesNeeded = boss.matchesNeeded;
      next.activeBoss = {
        name: boss.definition.name,
        emoji: boss.definition.emoji,
        description: boss.definition.description,
        gridSize: boss.gridSize,
      };
      next.message = `${boss.definition.emoji} LV.${nextLevel} ${boss.definition.name} — ${getDifficultyLabel(nextLevel)}`;

      setTimeout(() => {
        applyBoss(boss);
        clearMessage();
      }, 2500);
    }

    return next;
  }

  // ─── Handle match result ──────────────────────────────────────────

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
        }
        setTimeout(clearMessage, 2000);
        return next;
      }

      // ── Series lost — retry same level with new encounter ──
      if (seriesLost) {
        const gridSize = getGridForEncounter(prev.encounterInCycle);
        const customCard = pickCustomGatoForGrid(gridSize);

        next.matchScore = { player: 0, cpu: 0 };

        if (customCard) {
          next.matchesNeeded = 2;
          next.activeBoss = {
            name: customCard.name,
            emoji: customCard.emoji,
            description: customCard.description,
            gridSize: customCard.gridSize,
          };
          next.message = `DERROTA. NUEVO OPONENTE LV.${prev.level} — ${customCard.emoji} ${customCard.name}`;
          setTimeout(() => {
            applyCustomGato(customCard);
            clearMessage();
          }, 2000);
        } else {
          const boss = generateProceduralBossForGrid(prev.level, gridSize);
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
        }
        return next;
      }

      // ── Series won ──
      next.totalWins++;

      // Check if this encounter triggers shop
      if (isShopEncounter(prev.encounterInCycle)) {
        next.isShopPhase = true;
        next.message = '⌐■-■ BLACK MARKET DESBLOQUEADO';
      } else {
        // No shop — advance directly to next encounter
        return advanceToNextEncounter(next);
      }

      return next;
    });
  }, [applyBoss, applyCustomGato, clearMessage, setupEncounter, pickCustomGatoForGrid]);

  // ─── Display helpers ──────────────────────────────────────────────

  const getActiveGatoName = useCallback((): string => {
    if (gauntlet.activeBoss) {
      return `${gauntlet.activeBoss.emoji} ${gauntlet.activeBoss.name}`;
    }
    return 'GATO.EXE';
  }, [gauntlet]);

  const getActiveGatoDesc = useCallback((): string => {
    if (gauntlet.activeBoss) return gauntlet.activeBoss.description;
    return '';
  }, [gauntlet]);

  // ─── Shop actions ────────────────────────────────────────────────

  const buyHack = useCallback((hackId: string) => {
    setGauntlet(prev => {
      if (prev.purchasedHacks.includes(hackId)) return prev;

      // Look up price from custom hacks
      const custom = customHacks.find(h => h.id === hackId);
      const price = custom ? (HACK_EFFECTS[custom.effectId]?.price ?? 0) : 0;
      if (prev.wallet < price) return prev;

      return {
        ...prev,
        wallet: prev.wallet - price,
        purchasedHacks: [...prev.purchasedHacks, hackId],
      };
    });
  }, [customHacks]);

  const continueFromShop = useCallback(() => {
    setGauntlet(prev => {
      const next = { ...prev, isShopPhase: false };
      return advanceToNextEncounter(next);
    });
  }, [setupEncounter, applyBoss, applyCustomGato, clearMessage]);

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
