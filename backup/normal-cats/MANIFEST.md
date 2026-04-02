# 🐱 Backup: 19 Gatos Normales
> Fecha: 2026-03-26
> Propósito: Respaldo completo de la lógica de los 19 gatos base para reinicializar la app limpia.

## Archivos respaldados

| Archivo | Contenido |
|---------|-----------|
| `gatoRegistry.ts` | Definiciones de los 19 gatos (id, nombre, emoji, familia, modo, modifiers) |
| `gatoModifiers.ts` | Toda la lógica de mecánicas: gravity, torus, rotate, decay, lag, push, infect, mirror, numeric, blocked cells, mine |
| `types.ts` | Tipos: `GatoId`, `GatoModifiers`, `GatoDefinition`, `GatoFamily`, `GameMode`, `Piece`, etc. |
| `GATOS.md` | Diseño y narrativa de los gatos originales |
| `GATOSEXE.md` | Documentación complementaria del proyecto |

## Los 19 Gatos

### Movimiento (4)
| ID | Nombre | Emoji | Modo |
|----|--------|-------|------|
| LEGACY | LEGACY | 💀 | classic |
| CRAWLER | CRAWLER | 🕷️ | romano |
| PROXY | PROXY | 🌀 | free |
| BUFFER | BUFFER | 📦 | terni |

### Geometría (3)
| ID | Nombre | Emoji | Modifier |
|----|--------|-------|----------|
| GRAVIT | GRAVIT | ⬇️ | gravity: true |
| TORUS | TORUS | 🔮 | torus: true |
| VORTEX | VORTEX | 🌪️ | rotate: 3 |

### Percepción (3)
| ID | Nombre | Emoji | Modifier |
|----|--------|-------|----------|
| MISERE | MISÈRE | 🪞 | misere: true |
| CROM | CROM | 🔢 | numeric: true |
| STEALTH | STEALTH | 👻 | stealth: true |

### Tiempo (2)
| ID | Nombre | Emoji | Modifier |
|----|--------|-------|----------|
| OVERCLOCK | OVERCLOCK | ⏱️ | overclock: 3 |
| DECAY | DECAY | 💨 | decay: 3 |

### Corrupción (3)
| ID | Nombre | Emoji | Modifier |
|----|--------|-------|----------|
| MALWARE | MALWARE | 🦠 | blockedCells: 2 |
| TROJAN | TROJAN | 💣 | mine: true |
| QUANTUM | QUANTUM | ⚛️ | quantum: true |

### Interacción (4)
| ID | Nombre | Emoji | Modifier |
|----|--------|-------|----------|
| CRYPTO | CRYPTO | 🔓 | infect: true |
| MIRROR | MIRROR | 🪞 | mirror: true |
| PUSH | PUSH | 👊 | push: true |
| LAG | LAG | 📡 | lag: true |

## Para restaurar
```bash
# Copiar de vuelta al proyecto
cp backup/normal-cats/gatoRegistry.ts src/engine/gatoRegistry.ts
cp backup/normal-cats/gatoModifiers.ts src/engine/gatoModifiers.ts
cp backup/normal-cats/types.ts src/types.ts
```

## Nota
El motor (`src/engine/gameState.ts`, `board.ts`, `compatibility.ts`, `audioEngine.ts`) y el SDK (`src/sdk/`) **NO** necesitan respaldo — son el motor universal que funciona con cualquier gato (normal o custom).
