import type { GatoDefinition, GatoModifiers, GatoId, GatoFamily, GameMode } from '../types';
import { DEFAULT_MODIFIERS } from './gatoRegistry';

// ─── Axiom Categories ─────────────────────────────────────────────

export type AxiomCategory =
  | 'TOPOLOGY'
  | 'MOVEMENT'
  | 'LIFECYCLE'
  | 'VISIBILITY'
  | 'OWNERSHIP'
  | 'WIN_CONDITION'
  | 'CHAOS';

// Map each modifier key to its axiom category
const MODIFIER_AXIOMS: Record<keyof GatoModifiers, AxiomCategory> = {
  gravity: 'TOPOLOGY',
  torus: 'TOPOLOGY',
  rotate: 'LIFECYCLE',
  misere: 'WIN_CONDITION',
  numeric: 'WIN_CONDITION',
  stealth: 'VISIBILITY',
  overclock: 'CHAOS',
  decay: 'LIFECYCLE',
  blockedCells: 'CHAOS',
  mine: 'CHAOS',
  quantum: 'VISIBILITY',
  infect: 'OWNERSHIP',
  mirror: 'OWNERSHIP',
  push: 'OWNERSHIP',
  lag: 'CHAOS',
};

// ─── Incompatibility Matrix ───────────────────────────────────────
// Bidirectional: if A bans B, B bans A.

const RAW_INCOMPATIBLE: Array<[keyof GatoModifiers, keyof GatoModifiers, string]> = [
  ['misere', 'numeric', 'Contradictory win conditions'],
  ['gravity', 'torus', 'Gravity needs a fixed bottom — torus wraps edges'],
  ['quantum', 'stealth', 'Both hide info, superposition + invisibility cancel out'],
  ['gravity', 'push', 'Push can send pieces above gravity floor — undefined behavior'],
  ['decay', 'mine', 'Mine triggers on placement, decay removes pieces — double punishment'],
  ['rotate', 'mirror', 'Both transform the board — chaotic interaction'],
  ['numeric', 'decay', 'Numbers require persistent cells, decay removes them'],
  ['numeric', 'infect', 'Infecting numeric cells scrambles sum logic'],
];

// Build lookup map
const INCOMPATIBLE: Map<keyof GatoModifiers, Set<keyof GatoModifiers>> = new Map();
for (const [a, b] of RAW_INCOMPATIBLE) {
  if (!INCOMPATIBLE.has(a)) INCOMPATIBLE.set(a, new Set());
  if (!INCOMPATIBLE.has(b)) INCOMPATIBLE.set(b, new Set());
  INCOMPATIBLE.get(a)!.add(b);
  INCOMPATIBLE.get(b)!.add(a);
}

// ─── Difficulty weights (how punishing each modifier is) ──────────

const MODIFIER_WEIGHT: Partial<Record<keyof GatoModifiers, number>> = {
  lag: 1,
  blockedCells: 1,
  mine: 1.5,
  gravity: 1,
  torus: 1.5,
  rotate: 2,
  misere: 2,
  numeric: 2.5,
  stealth: 2,
  overclock: 1.5,
  decay: 2,
  infect: 1.5,
  push: 1,
  mirror: 1.5,
  quantum: 2,
};

// ─── Validation ───────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  conflicts: Array<{ a: keyof GatoModifiers; b: keyof GatoModifiers; reason: string }>;
}

export function validateModifiers(mods: GatoModifiers): ValidationResult {
  const conflicts: ValidationResult['conflicts'] = [];
  const activeKeys = (Object.keys(mods) as Array<keyof GatoModifiers>).filter(k => {
    const v = mods[k];
    return v !== false && v !== 0;
  });

  const seen = new Set<string>();
  for (const key of activeKeys) {
    const banned = INCOMPATIBLE.get(key);
    if (!banned) continue;
    for (const other of banned) {
      if (activeKeys.includes(other)) {
        const pairKey = [key, other].sort().join(':');
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          const entry = RAW_INCOMPATIBLE.find(
            ([a, b]) => (a === key && b === other) || (a === other && b === key)
          );
          conflicts.push({
            a: key,
            b: other,
            reason: entry ? entry[2] : `${key} + ${other} are incompatible`,
          });
        }
      }
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}

// ─── Procedural Name Generator ────────────────────────────────────

const NAME_PREFIXES = [
  'SHADOW', 'VOID', 'NETHER', 'HYPER', 'ULTRA', 'OMEGA', 'DARK',
  'CYBER', 'GHOST', 'HELL', 'DEEP', 'OVER', 'MEGA', 'NEO', 'NULL',
  'ZERO', 'ANTI', 'PROTO', 'DREAD', 'GRIM',
];

const NAME_SUFFIXES = [
  'FLUX', 'CORE', 'STORM', 'BITE', 'CLAW', 'MIND', 'BANE',
  'FANG', 'PULSE', 'RIFT', 'LOCK', 'SPIKE', 'CRASH', 'BURN',
  'WIRE', 'BYTE', 'WAVE', 'SURGE', 'DRIFT', 'STRIKE',
];

const BOSS_EMOJIS = [
  '💀', '🔥', '⚡', '👹', '🌋',
  '☠️', '🧿', '🕳️', '👾', '🩸',
  '💣', '🌪️', '🐍', '🦷', '🎭',
];

function generateBossName(level: number): { name: string; emoji: string } {
  const pi = (level * 7 + 13) % NAME_PREFIXES.length;
  const si = (level * 11 + 3) % NAME_SUFFIXES.length;
  const ei = (level * 5 + 7) % BOSS_EMOJIS.length;
  return {
    name: `${NAME_PREFIXES[pi]}${NAME_SUFFIXES[si]}`,
    emoji: BOSS_EMOJIS[ei],
  };
}

// ─── Modifier pool (excludes mode-related modifiers) ──────────────

const RANDOMIZABLE_MODS: Array<keyof GatoModifiers> = [
  'gravity', 'torus', 'rotate', 'misere', 'numeric',
  'stealth', 'decay', 'blockedCells', 'mine',
  'infect', 'push', 'lag',
];

function activateModifier(mods: GatoModifiers, key: keyof GatoModifiers, level: number): void {
  switch (key) {
    case 'rotate':
      mods.rotate = Math.max(2, 5 - Math.floor(level / 15)); // faster at high levels
      break;
    case 'decay':
      mods.decay = Math.max(2, 4 - Math.floor(level / 20)); // shorter lifespan
      break;
    case 'blockedCells':
      mods.blockedCells = Math.min(3, 1 + Math.floor(level / 15)); // more blocked
      break;
    case 'overclock':
      mods.overclock = Math.max(2, 5 - Math.floor(level / 10)); // tighter timer
      break;
    default:
      (mods as any)[key] = true;
  }
}

// ─── The Game Director ────────────────────────────────────────────

export interface ProceduralBoss {
  definition: GatoDefinition;
  gridSize: number;
  cpuMistakeRate: number;
  matchesNeeded: number;
  difficultyScore: number;
}

/**
 * Generate a procedural boss scaled to the given level.
 *
 * Scaling curves:
 * - Level  1-10:  1 modifier, 3×3, CPU 60-40% mistakes, Bo3
 * - Level 11-25:  2 modifiers, 3×3, CPU 30-15% mistakes, Bo3
 * - Level 26-40:  2-3 modifiers, occasional 4×4, CPU 10-5%, Bo3
 * - Level 41+:    3 modifiers, 4×4/5×5, CPU 3-0%, Bo5
 */
export function generateProceduralBoss(level: number): ProceduralBoss {
  // Modifier count by level bracket
  let modCount: number;
  if (level <= 10) modCount = 1;
  else if (level <= 25) modCount = 2;
  else if (level <= 40) modCount = Math.random() < 0.6 ? 2 : 3;
  else modCount = 3;

  // Grid size escalation
  let gridSize = 3;
  if (level >= 26 && level <= 40 && Math.random() < 0.3) gridSize = 4;
  if (level > 40 && Math.random() < 0.5) gridSize = level > 60 ? 5 : 4;

  // CPU mistake rate (decreasing with level)
  const cpuMistakeRate = Math.max(0, 0.65 - level * 0.012);

  // Matches needed
  const matchesNeeded = level >= 41 ? 3 : 2; // Bo5 at level 41+

  // Build modifiers with retry for compatibility
  let finalMods: GatoModifiers = { ...DEFAULT_MODIFIERS };
  let selectedKeys: Array<keyof GatoModifiers> = [];
  let difficultyScore = 0;

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate: GatoModifiers = { ...DEFAULT_MODIFIERS };
    const shuffled = [...RANDOMIZABLE_MODS].sort(() => Math.random() - 0.5);
    const picked: Array<keyof GatoModifiers> = [];

    for (const key of shuffled) {
      if (picked.length >= modCount) break;

      // Check compatibility with already-picked modifiers
      const banned = INCOMPATIBLE.get(key);
      const hasConflict = banned && picked.some(p => banned.has(p));
      if (hasConflict) continue;

      picked.push(key);
    }

    if (picked.length < modCount) continue; // retry

    for (const key of picked) {
      activateModifier(candidate, key, level);
    }

    const validation = validateModifiers(candidate);
    if (validation.valid) {
      finalMods = candidate;
      selectedKeys = picked;
      difficultyScore = picked.reduce((sum, k) => sum + (MODIFIER_WEIGHT[k] || 1), 0);
      break;
    }
  }

  // Generate name
  const { name, emoji } = generateBossName(level);

  // Determine family from primary axiom
  const primaryAxiom = selectedKeys.length > 0 ? MODIFIER_AXIOMS[selectedKeys[0]] : 'CHAOS';
  const familyMap: Record<AxiomCategory, GatoFamily> = {
    TOPOLOGY: 'geometria',
    MOVEMENT: 'movimiento',
    LIFECYCLE: 'tiempo',
    VISIBILITY: 'percepcion',
    OWNERSHIP: 'interaccion',
    WIN_CONDITION: 'percepcion',
    CHAOS: 'corrupcion',
  };

  // Build description from active modifiers
  const modDescriptions: Record<string, string> = {
    gravity: 'Gravedad', torus: 'Torus', rotate: 'Rotación',
    misere: 'Misère', numeric: 'Numérico', stealth: 'Stealth',
    overclock: 'Overclock', decay: 'Decay', blockedCells: 'Celdas bloqueadas',
    mine: 'Mina', quantum: 'Quantum', infect: 'Infección',
    mirror: 'Mirror', push: 'Push', lag: 'Lag',
  };
  const desc = selectedKeys.map(k => modDescriptions[k as string] || k).join(' + ');

  const definition: GatoDefinition = {
    id: `BOSS_LV${level}_${name}` as GatoId,
    name,
    emoji,
    family: familyMap[primaryAxiom],
    mode: 'classic' as GameMode,
    description: `Lv.${level} — ${desc}`,
    modifiers: finalMods,
  };

  return {
    definition,
    gridSize,
    cpuMistakeRate,
    matchesNeeded,
    difficultyScore,
  };
}

// ─── Simple procedural gato (for non-boss encounters) ─────────────

export function generateProceduralGato(): GatoDefinition {
  const boss = generateProceduralBoss(Math.floor(Math.random() * 10) + 1);
  return boss.definition;
}

// ─── Utilities ────────────────────────────────────────────────────

export function getAxiom(key: keyof GatoModifiers): AxiomCategory {
  return MODIFIER_AXIOMS[key];
}

export function getActiveAxioms(mods: GatoModifiers): AxiomCategory[] {
  const axioms = new Set<AxiomCategory>();
  for (const key of Object.keys(mods) as Array<keyof GatoModifiers>) {
    const v = mods[key];
    if (v !== false && v !== 0) {
      axioms.add(MODIFIER_AXIOMS[key]);
    }
  }
  return [...axioms];
}

export function getDifficultyLabel(level: number): string {
  if (level <= 5) return 'TRIVIAL';
  if (level <= 10) return 'FÁCIL';
  if (level <= 20) return 'NORMAL';
  if (level <= 35) return 'DIFÍCIL';
  if (level <= 50) return 'BRUTAL';
  if (level <= 75) return 'PESADILLA';
  return 'IMPOSIBLE';
}
