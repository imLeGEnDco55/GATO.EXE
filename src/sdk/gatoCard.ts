import type { GatoModifiers } from '../types';

/**
 * GatoCard — The shareable rule definition embedded in PNG files.
 * This is the "DNA" of a custom GATO.
 */
export interface GatoCard {
  /** Schema version for forward compat */
  v: 1;
  /** Unique card ID (auto-generated UUID) */
  id: string;
  /** Display name */
  name: string;
  /** Single emoji */
  emoji: string;
  /** Creator name */
  author: string;
  /** Short description of the ruleset */
  description: string;
  /** Board size: 3, 4, or 5 */
  gridSize: 3 | 4 | 5;
  /** Active modifiers — the rule engine */
  modifiers: GatoModifiers;
  /** Unix timestamp of creation */
  createdAt: number;
}

/** PNG tEXt chunk keyword where card data lives */
export const CARD_CHUNK_KEY = 'GatoCard';

/** Generate a UUID v4 */
export function generateCardId(): string {
  return crypto.randomUUID();
}

/** Create a blank card with defaults */
export function createBlankCard(author: string = 'Anon'): GatoCard {
  return {
    v: 1,
    id: generateCardId(),
    name: 'CUSTOM',
    emoji: '🐱',
    author,
    description: 'Un gato personalizado.',
    gridSize: 3,
    modifiers: {
      gravity: false, torus: false, rotate: 0, misere: false,
      numeric: false, stealth: false, overclock: 0, decay: 0,
      blockedCells: 0, mine: false, quantum: false, infect: false,
      mirror: false, push: false, lag: false,
    },
    createdAt: Date.now(),
  };
}

/** Validate a parsed card object */
export function validateCard(obj: unknown): obj is GatoCard {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  if (c.v !== 1) return false;
  if (typeof c.name !== 'string' || c.name.length === 0) return false;
  if (typeof c.emoji !== 'string') return false;
  if (typeof c.gridSize !== 'number' || ![3, 4, 5].includes(c.gridSize)) return false;
  if (!c.modifiers || typeof c.modifiers !== 'object') return false;
  return true;
}

/** Modifier labels for UI */
export const MODIFIER_LABELS: Record<string, { label: string; emoji: string; type: 'bool' | 'num' }> = {
  gravity:     { label: 'Gravedad',        emoji: '⬇️', type: 'bool' },
  torus:       { label: 'Torus',           emoji: '🔮', type: 'bool' },
  rotate:      { label: 'Rotar (turnos)',  emoji: '🌪️', type: 'num' },
  misere:      { label: 'Misère',          emoji: '🪞', type: 'bool' },
  numeric:     { label: 'Numérico (15)',   emoji: '🔢', type: 'bool' },
  stealth:     { label: 'Stealth',         emoji: '👻', type: 'bool' },
  overclock:   { label: 'Timer (seg)',     emoji: '⏱️', type: 'num' },
  decay:       { label: 'Decay (turnos)',  emoji: '💨', type: 'num' },
  blockedCells:{ label: 'Celdas bloq.',    emoji: '🦠', type: 'num' },
  mine:        { label: 'Mina',            emoji: '💣', type: 'bool' },
  quantum:     { label: 'Quantum',         emoji: '⚛️', type: 'bool' },
  infect:      { label: 'Infect',          emoji: '🔓', type: 'bool' },
  mirror:      { label: 'Mirror',          emoji: '🪞', type: 'bool' },
  push:        { label: 'Push',            emoji: '👊', type: 'bool' },
  lag:         { label: 'Lag',             emoji: '📡', type: 'bool' },
};
