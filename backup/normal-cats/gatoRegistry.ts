import type { GatoDefinition, GatoModifiers, GatoId } from '../types';

const NO_MOD: GatoModifiers = {
  gravity: false, torus: false, rotate: 0, misere: false,
  numeric: false, stealth: false, overclock: 0, decay: 0,
  blockedCells: 0, mine: false, quantum: false, infect: false,
  mirror: false, push: false, lag: false,
};

const mod = (overrides: Partial<GatoModifiers>): GatoModifiers => ({
  ...NO_MOD,
  ...overrides,
});

export const GATO_REGISTRY: GatoDefinition[] = [
  // MOVIMIENTO
  {
    id: 'LEGACY', name: 'LEGACY', emoji: '💀', family: 'movimiento',
    mode: 'classic', description: 'Sin alteración. Clásico puro.',
    modifiers: NO_MOD,
  },
  {
    id: 'CRAWLER', name: 'CRAWLER', emoji: '🕷️', family: 'movimiento',
    mode: 'romano', description: 'Fichas se mueven solo a casillas adyacentes.',
    modifiers: NO_MOD,
  },
  {
    id: 'PROXY', name: 'PROXY', emoji: '🌀', family: 'movimiento',
    mode: 'free', description: 'Fichas saltan a cualquier casilla vacía.',
    modifiers: NO_MOD,
  },
  {
    id: 'BUFFER', name: 'BUFFER', emoji: '📦', family: 'movimiento',
    mode: 'terni', description: 'Solo puedes mover tu ficha más vieja (FIFO).',
    modifiers: NO_MOD,
  },
  // GEOMETRÍA
  {
    id: 'GRAVIT', name: 'GRAVIT', emoji: '⬇️', family: 'geometria',
    mode: 'classic', description: 'Fichas caen al fondo de la columna.',
    modifiers: mod({ gravity: true }),
  },
  {
    id: 'TORUS', name: 'TORUS', emoji: '🔮', family: 'geometria',
    mode: 'classic', description: 'Bordes conectan con el lado opuesto.',
    modifiers: mod({ torus: true }),
  },
  {
    id: 'VORTEX', name: 'VORTEX', emoji: '🌪️', family: 'geometria',
    mode: 'classic', description: 'Cada 3 turnos el tablero rota 90°.',
    modifiers: mod({ rotate: 3 }),
  },
  // PERCEPCIÓN
  {
    id: 'MISERE', name: 'MISÈRE', emoji: '🪞', family: 'percepcion',
    mode: 'classic', description: 'Gana quien force al rival a hacer 3 en raya.',
    modifiers: mod({ misere: true }),
  },
  {
    id: 'CROM', name: 'CROM', emoji: '🔢', family: 'percepcion',
    mode: 'classic', description: 'Celdas valen 1–9. Gana quien sume 15.',
    modifiers: mod({ numeric: true }),
  },
  {
    id: 'STEALTH', name: 'STEALTH', emoji: '👻', family: 'percepcion',
    mode: 'classic', description: 'Fichas invisibles 1 turno después.',
    modifiers: mod({ stealth: true }),
  },
  // TIEMPO
  {
    id: 'OVERCLOCK', name: 'OVERCLOCK', emoji: '⏱️', family: 'tiempo',
    mode: 'classic', description: '3 segundos por turno o la CPU tira por ti.',
    modifiers: mod({ overclock: 3 }),
  },
  {
    id: 'DECAY', name: 'DECAY', emoji: '💨', family: 'tiempo',
    mode: 'classic', description: 'Fichas desaparecen después de 3 turnos.',
    modifiers: mod({ decay: 3 }),
  },
  // CORRUPCIÓN
  {
    id: 'MALWARE', name: 'MALWARE', emoji: '🦠', family: 'corrupcion',
    mode: 'classic', description: '1-2 casillas bloqueadas al inicio.',
    modifiers: mod({ blockedCells: 2 }),
  },
  {
    id: 'TROJAN', name: 'TROJAN', emoji: '💣', family: 'corrupcion',
    mode: 'classic', description: 'Mina oculta que destruye fichas.',
    modifiers: mod({ mine: true }),
  },
  {
    id: 'QUANTUM', name: 'QUANTUM', emoji: '⚛️', family: 'corrupcion',
    mode: 'classic', description: 'Primera ficha existe en 2 celdas.',
    modifiers: mod({ quantum: true }),
  },
  // INTERACCIÓN
  {
    id: 'CRYPTO', name: 'CRYPTO', emoji: '🔓', family: 'interaccion',
    mode: 'classic', description: '50% de hackear fichas enemigas adyacentes.',
    modifiers: mod({ infect: true }),
  },
  {
    id: 'MIRROR', name: 'MIRROR', emoji: '🪞', family: 'interaccion',
    mode: 'classic', description: 'CPU copia tu movimiento en espejo.',
    modifiers: mod({ mirror: true }),
  },
  {
    id: 'PUSH', name: 'PUSH', emoji: '👊', family: 'interaccion',
    mode: 'classic', description: 'Colocar ficha empuja fichas adyacentes.',
    modifiers: mod({ push: true }),
  },
  {
    id: 'LAG', name: 'LAG', emoji: '📡', family: 'interaccion',
    mode: 'classic', description: '30% de que tu ficha se deslice a otra celda.',
    modifiers: mod({ lag: true }),
  },
];

export const DEFAULT_MODIFIERS: GatoModifiers = NO_MOD;

export function getGato(id: GatoId): GatoDefinition {
  return GATO_REGISTRY.find(g => g.id === id)!;
}

export function pickRandomGatos(count: number, exclude: GatoId[] = []): GatoId[] {
  const available = GATO_REGISTRY.filter(g => !exclude.includes(g.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(g => g.id);
}
