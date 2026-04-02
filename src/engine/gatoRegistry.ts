import type { GatoDefinition, GatoModifiers } from '../types';

// ─── Default Modifiers (baseline for all games) ──────────────────

export const DEFAULT_MODIFIERS: GatoModifiers = {
  gravity: false,
  torus: false,
  rotate: 0,
  misere: false,
  numeric: false,
  stealth: false,
  overclock: 0,
  decay: 0,
  blockedCells: 0,
  mine: false,
  quantum: false,
  infect: false,
  mirror: false,
  push: false,
  lag: false,
};

// ─── Registry ─────────────────────────────────────────────────────
// Empty — all GATOS are user-generated via SDKat (create/import).
// The engine, compatibility layer, and procedural boss generator
// work independently of this registry.

export const GATO_REGISTRY: GatoDefinition[] = [];
