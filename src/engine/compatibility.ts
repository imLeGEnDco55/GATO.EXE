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
// Each key lists modifier keys it CANNOT coexist with.

const INCOMPATIBLE: Partial<Record<keyof GatoModifiers, Array<keyof GatoModifiers>>> = {
  misere: ['numeric'],      // contradictory win conditions
  numeric: ['misere'],
  gravity: ['torus'],        // gravity doesn't make sense when edges wrap
  torus: ['gravity'],
  quantum: ['stealth'],      // both hide info — cancels out
  stealth: ['quantum'],
};

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

  for (const key of activeKeys) {
    const banned = INCOMPATIBLE[key];
    if (!banned) continue;
    for (const other of banned) {
      if (activeKeys.includes(other)) {
        // Avoid duplicate reports (a↔b only once)
        if (!conflicts.some(c => (c.a === other && c.b === key))) {
          const axiomA = MODIFIER_AXIOMS[key];
          const axiomB = MODIFIER_AXIOMS[other];
          conflicts.push({
            a: key,
            b: other,
            reason: `${axiomA} + ${axiomB}: ${String(key)} and ${String(other)} are mutually exclusive`,
          });
        }
      }
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}

// ─── Procedural Gato Generator ────────────────────────────────────

const PROCEDURAL_NAMES = [
  'ENTROPY', 'PHANTOM', 'BREACH', 'DAEMON', 'FLUX',
  'CIPHER', 'NEXUS', 'PULSE', 'WRAITH', 'SURGE',
  'GLITCH', 'STATIC', 'ECHO', 'RIFT', 'APEX',
  'NOVA', 'SHADE', 'DRIFT', 'SPIKE', 'VOID',
];

const PROCEDURAL_EMOJIS = [
  '🌀', '💫', '🔥', '⚡', '🌊',
  '🎲', '🧬', '🔮', '👾', '🛸',
  '💎', '🌪️', '🌑', '🎯', '🧿',
];

// Modifier keys that can be randomly activated (excluding mode-related ones)
const RANDOMIZABLE_MODS: Array<keyof GatoModifiers> = [
  'gravity', 'torus', 'rotate', 'misere', 'numeric',
  'stealth', 'decay', 'blockedCells', 'mine',
  'infect', 'push', 'lag',
];

/**
 * Generate a procedurally-created gato with 1-3 random modifiers.
 * Validates against compatibility matrix. Retries up to 10 times if invalid.
 */
export function generateProceduralGato(): GatoDefinition {
  for (let attempt = 0; attempt < 10; attempt++) {
    const count = 1 + Math.floor(Math.random() * 2); // 1-2 modifiers
    const shuffled = [...RANDOMIZABLE_MODS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const mods: GatoModifiers = { ...DEFAULT_MODIFIERS };
    for (const key of selected) {
      switch (key) {
        case 'rotate': mods.rotate = 2 + Math.floor(Math.random() * 4); break; // 2-5
        case 'decay': mods.decay = 2 + Math.floor(Math.random() * 3); break; // 2-4
        case 'blockedCells': mods.blockedCells = 1 + Math.floor(Math.random() * 2); break; // 1-2
        default: (mods as any)[key] = true;
      }
    }

    const validation = validateModifiers(mods);
    if (validation.valid) {
      const nameIdx = Math.floor(Math.random() * PROCEDURAL_NAMES.length);
      const emojiIdx = Math.floor(Math.random() * PROCEDURAL_EMOJIS.length);

      // Determine family by primary axiom
      const primaryAxiom = MODIFIER_AXIOMS[selected[0]];
      const familyMap: Record<AxiomCategory, GatoFamily> = {
        TOPOLOGY: 'geometria',
        MOVEMENT: 'movimiento',
        LIFECYCLE: 'tiempo',
        VISIBILITY: 'percepcion',
        OWNERSHIP: 'interaccion',
        WIN_CONDITION: 'percepcion',
        CHAOS: 'corrupcion',
      };

      return {
        id: `PROC_${PROCEDURAL_NAMES[nameIdx]}` as GatoId,
        name: PROCEDURAL_NAMES[nameIdx],
        emoji: PROCEDURAL_EMOJIS[emojiIdx],
        family: familyMap[primaryAxiom],
        mode: 'classic' as GameMode,
        description: `Procedural: ${selected.join(' + ')}`,
        modifiers: mods,
      };
    }
  }

  // Fallback: single safe modifier
  return {
    id: 'PROC_FALLBACK' as GatoId,
    name: 'FALLBACK',
    emoji: '🎲',
    family: 'corrupcion',
    mode: 'classic',
    description: 'Procedural fallback: lag',
    modifiers: { ...DEFAULT_MODIFIERS, lag: true },
  };
}

/**
 * Get the axiom category for a modifier key.
 */
export function getAxiom(key: keyof GatoModifiers): AxiomCategory {
  return MODIFIER_AXIOMS[key];
}

/**
 * List all active axiom categories for a modifier set.
 */
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
