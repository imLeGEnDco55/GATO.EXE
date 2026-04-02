# GATO.EXE

> _El juego del Hashtag. Hackeado._

Un roguelite cyberpunk construido sobre el juego más resuelto de la historia: el Gato (Tic-Tac-Toe). Lo que empieza como tres en raya termina siendo un sistema con 19 modificadores de reglas, generación procedural de jefes, economía de combate, síntesis de audio en tiempo real y cartas intercambiables embebidas en archivos PNG.

---

## Arquitectura del Proyecto

```
src/
├── components/          # UI: Board, GameHUD, BlackMarketShop, SDKat...
├── engine/
│   ├── audioEngine.ts   # Síntesis procedural (Web Audio API)
│   ├── board.ts         # Combinaciones ganadoras, mapa de adyacencia
│   ├── compatibility.ts # Matriz de compatibilidad + generador procedural
│   ├── gameState.ts     # Motor puro de turnos (inmutable, sin React)
│   ├── gatoModifiers.ts # Implementación de los 15 modificadores
│   └── gatoRegistry.ts  # Registro de los 19 GATOS canónicos
├── hooks/
│   ├── useCPU.ts        # IA con tasa de error escalable
│   ├── useGameEngine.ts # Bridge React ↔ motor puro
│   ├── useGameJuice.ts  # VFX + audio reactivos al estado del juego
│   └── useGauntlet.ts   # Progresión del Gauntlet + economía
├── sdk/
│   ├── cardRenderer.ts  # Render de GatoCard en Canvas 512×512
│   ├── gatoCard.ts      # Tipo GatoCard + validación
│   └── pngCodec.ts      # Esteganografía real: chunks tEXt en PNG
├── lib/
│   ├── hackCard.ts      # Sistema de Hack Cards del jugador
│   ├── hackCardRenderer.ts
│   └── pngCodec.ts      # Codec alternativo para Hack Cards
└── types.ts             # Todos los tipos del sistema
```

---

## Stack

| Tecnología             | Uso                                                   |
| ---------------------- | ----------------------------------------------------- |
| React 19 + TypeScript  | UI y hooks de estado                                  |
| Vite 6                 | Bundler                                               |
| Tailwind CSS 4         | Estilos utilitarios                                   |
| Framer Motion / Motion | Animaciones, screen shake, spring physics             |
| Web Audio API          | Síntesis procedural de audio (sin archivos de sonido) |
| Canvas API             | Render de cartas y esteganografía PNG                 |

---

## Inicio rápido

**Requisitos:** Node.js ≥ 20

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## El Sistema de Juego

### Los 19 GATOS — Modificadores de Reglas

Cada GATO es una variante del tablero 3×3 con una sola regla alterada. Están organizados en 6 familias:

#### ⚙️ Movimiento — _cómo se mueven las fichas_

| GATO        | Mecánica                                                  |
| ----------- | --------------------------------------------------------- |
| **LEGACY**  | Clásico puro. Sin alteración.                             |
| **CRAWLER** | Fichas se mueven solo a casillas adyacentes (Romano).     |
| **PROXY**   | Fichas saltan a cualquier casilla vacía (Libre).          |
| **BUFFER**  | Solo puedes mover tu ficha más vieja — cola FIFO (Terni). |

#### 🌐 Geometría — _cómo está conectado el espacio_

| GATO       | Mecánica                                                                   |
| ---------- | -------------------------------------------------------------------------- |
| **GRAVIT** | Las fichas caen al fondo de la columna (como Connect 4).                   |
| **TORUS**  | Los bordes del tablero se conectan — las líneas pueden cruzar los límites. |
| **VORTEX** | Cada 3 turnos el tablero rota 90°, reposicionando todas las fichas.        |

#### 🧠 Percepción — _cómo lees el estado del juego_

| GATO        | Mecánica                                                         |
| ----------- | ---------------------------------------------------------------- |
| **MISÈRE**  | Victoria invertida: gana quien force al rival a hacer 3 en raya. |
| **CROM**    | Celdas valen 1–9 (cuadrado mágico). Gana quien sume 15.          |
| **STEALTH** | Las fichas se vuelven invisibles un turno después de colocarse.  |

#### ⏱️ Tiempo — _restricciones de ritmo_

| GATO          | Mecánica                                                 |
| ------------- | -------------------------------------------------------- |
| **OVERCLOCK** | 3 segundos por turno. Si no juegas, la CPU tira al azar. |
| **DECAY**     | Las fichas desaparecen después de 3 turnos.              |

#### 💀 Corrupción — _el tablero está comprometido_

| GATO        | Mecánica                                                            |
| ----------- | ------------------------------------------------------------------- |
| **MALWARE** | 1-2 casillas bloqueadas aleatoriamente al inicio.                   |
| **TROJAN**  | Una mina oculta: quien tire ahí pierde la ficha y la casilla muere. |
| **QUANTUM** | Tu primera ficha existe en 2 celdas simultáneamente.                |

#### 🔄 Interacción — _las fichas se afectan entre sí_

| GATO       | Mecánica                                                                      |
| ---------- | ----------------------------------------------------------------------------- |
| **CRYPTO** | 50% de probabilidad de hackear una ficha enemiga adyacente al colocar.        |
| **MIRROR** | La CPU copia tu movimiento en simetría espejo. Manipula sus jugadas forzadas. |
| **PUSH**   | Colocar ficha junto a otra la empuja una casilla.                             |
| **LAG**    | 30% de probabilidad de que tu ficha se deslice a una casilla adyacente.       |

---

### El GAUNTLET — Modo Roguelite

El modo principal tiene progresión por fases:

```
CICLO 1 (Beginner)
  ├── GATO 1  — Best of 3  (CPU: 70% error rate)
  ├── GATO 2  — Best of 3
  └── BOSS ROUND — Tablero 4×4 clásico

        ↓  BLACK MARKET (tienda entre ciclos)

CICLO 2 (Intermediate)
  ├── GATO 1  — Best of 3  (CPU: 40% error rate)
  ├── GATO 2  — Best of 3
  └── BOSS ROUND — Tablero 5×5 clásico

        ↓  BLACK MARKET

CICLO 3 (Expert)
  ├── GATO 1  — Best of 3  (CPU: 10% error rate)
  ├── GATO 2  — Best of 3
  └── BOSS ROUND — Tablero 5×5 clásico

        ↓  MODO SUPERVIVENCIA (infinito)

CICLO 4+ — Jefes procedurales generados algorítmicamente
  └── Nivel creciente → modificadores combinados → CPU casi perfecta
```

Los primeros 3 ciclos usan los 19 GATOS canónicos. A partir del ciclo 4, el `compatibility.ts` genera jefes únicos combinando modificadores validados contra la **Matriz de Compatibilidad**.

#### Economía del Gauntlet

- **Wallet (¢):** Se ganan créditos por victorias.
- **Multiplicador de racha:** x1.5 con 2 victorias consecutivas, x2.0 con 3+.
- **Black Market:** Tienda entre ciclos. Compra HACKS con créditos acumulados.
- **HACKS disponibles:**
  - `EXTRA_LIFE.dll` (¢2,000) — El empate cuenta como victoria en la próxima serie.
  - `SNIFF.exe` (¢3,500) — Revela la siguiente jugada de la CPU por 3 turnos.
  - `FORK_BOMB.bat` (¢5,000) — Duplica las recompensas del próximo ciclo.

---

### El Motor de Reglas — `compatibility.ts`

El generador procedural está construido sobre un sistema de **axiomas** que categoriza cada modificador:

| Axioma          | Modificadores                      |
| --------------- | ---------------------------------- |
| `TOPOLOGY`      | gravity, torus                     |
| `MOVEMENT`      | (modos de movimiento)              |
| `LIFECYCLE`     | rotate, decay                      |
| `VISIBILITY`    | stealth, quantum                   |
| `OWNERSHIP`     | infect, mirror, push               |
| `WIN_CONDITION` | misere, numeric                    |
| `CHAOS`         | lag, blockedCells, mine, overclock |

La **Matriz de Compatibilidad** previene combinaciones que rompen la lógica del juego:

```
misere    ✗  numeric     → Condiciones de victoria contradictorias
gravity   ✗  torus       → La gravedad necesita un fondo fijo
gravity   ✗  push        → Push puede mover piezas por encima del suelo
quantum   ✗  stealth     → Superposición + invisibilidad = caos indefinible
decay     ✗  mine        → Doble castigo por colocación
rotate    ✗  mirror      → Ambos transforman el tablero simultáneamente
numeric   ✗  decay       → El sistema numérico requiere piezas persistentes
numeric   ✗  infect      → Infectar celdas numéricas rompe la suma
```

Cada jefe procedural tiene nombre generado algorítmicamente (`SHADOWFLUX`, `VOIDCORE`, etc.), dificultad escalada por nivel y tasa de error de CPU calculada con `max(0, 0.65 - level * 0.012)`.

---

## El Motor de Turnos — `gameState.ts`

El motor de juego es una función pura sin efectos secundarios:

```
processTurn(state, intent, settings) → TurnResult
```

Los modificadores se aplican en un pipeline con orden de resolución fijo:

```
CHAOS     → LAG drift (¿se desvía la ficha?)
TOPOLOGY  → GRAVITY (¿cae al fondo de la columna?)
PLACEMENT → Se coloca la picha / se verifica la MINA
OWNERSHIP → INFECT (¿hackea fichas adyacentes?) → PUSH (¿empuja?)
LIFECYCLE → STEALTH (invisibilidad) → DECAY (caducidad) → ROTATE (rotación)
WIN CHECK → Verifica victoria considerando MISÈRE, TORUS, NUMERIC
```

---

## Audio Procedural — `audioEngine.ts`

El juego no tiene archivos de audio. Todo se sintetiza en tiempo real con la **Web Audio API**:

| Evento        | Síntesis                                                       |
| ------------- | -------------------------------------------------------------- |
| Colocar ficha | Oscilador sine 120→40Hz con distorsión tanh (bajo saturado)    |
| LAG drift     | Buffer de ruido bitcrushed con filtro bandpass 2kHz            |
| Mina          | Oscilador sawtooth + burst de ruido con envolvente exponencial |
| Victoria      | Acorde mayor (C-E-G) con osciladores triangle staggered        |
| Derrota       | Oscilador square 200→80Hz                                      |
| Infección     | Sawtooth 600→200Hz con filtro lowpass                          |
| Rotación      | Sine 300→900→300Hz (efecto whoosh)                             |

---

## Sistema VFX — `useGameJuice.ts`

Cada evento del motor dispara efectos visuales en cascada:

```
Colocar ficha   → screen shake (120ms)
LAG drift       → glitch overlay + shake (300ms)
Mina            → explosion particles + glitch + flash rojo (500ms)
Infección       → flash cyan (200ms)
Rotación 90°    → shake (350ms)
Victoria X      → flash cyan
Derrota         → shake + flash rose
```

Los efectos visuales incluyen:

- **Screen shake:** `useMotionValue` + `animate()` de Framer Motion (no CSS, evita layout thrash)
- **Glitch overlay:** Scanlines + barras RGB split + ruido SVG fractal
- **Explosión de mina:** Ring de 8 partículas + onda de choque + flash central
- **Flash border:** `box-shadow` interno con color semántico según evento

---

## SDKat — El Sistema de Cartas

### GatoCards (`.gato.png`)

Las GatoCards son archivos PNG que contienen la definición completa de un ruleset embebida en el binario de la imagen usando **esteganografía real**:

**Cómo funciona el codec PNG (`sdk/pngCodec.ts`):**

1. Se parsea el binario PNG chunk por chunk.
2. Se construye un chunk `tEXt` con keyword `GatoCard` y el JSON de la carta.
3. El chunk se inyecta **antes del chunk IEND** (siguiendo la especificación PNG).
4. Se recalcula el **CRC32** correctamente para que el archivo sea un PNG válido.

Al importar, el codec lee todos los chunks `tEXt` buscando el keyword `GatoCard` y valida el JSON contra el esquema.

**El flujo completo:**

```
Editor → GatoCard JSON → renderCard() (Canvas 512×512) → encodeCardToPng() → .gato.png
.gato.png → decodeCardFromPng() → GatoCard JSON → aplicar al motor → jugar
```

### Hack Cards (SDKat Terminal)

Las Hack Cards usan un sistema de esteganografía diferente: el JSON se **append** después del chunk IEND con una firma `GATO_HACK_V1:`. Son más simples pero igualmente compartibles.

---

## Configuración

```bash
npm run dev       # Servidor de desarrollo en :3000
npm run build     # Build de producción
npm run lint      # TypeScript check (tsc --noEmit)
```

---

## Contexto del Proyecto

GATO.EXE nació como exploración de una pregunta de diseño: ¿qué pasa cuando tomas el juego más resuelto matemáticamente (el tres en raya tiene solución perfecta conocida) y lo conviertes en un sistema roguelite donde las reglas cambian constantemente?

La respuesta resultó ser que el "juego resuelto" se vuelve irrelevante cuando el espacio de decisión muta en cada partida. No juegas al gato — juegas contra el sistema de reglas que ese gato particular impone.

```
SYSTEM_ACTIVE // BUILD_2026 // SDKat_v1
```
