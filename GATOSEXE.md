# GATOS.EXE — Roster Básico

> Cada GATO.EXE tiene **una sola habilidad** que define su identidad mecánica.
> No hay repeticiones. Organizados por familia de alteración.

---

## ⚙️ FAMILIA: MOVIMIENTO
*Cómo se mueven las fichas después de colocarlas.*

| # | GATO.EXE | Habilidad |
|---|----------|-----------|
| 1 | **LEGACY** | Sin alteración. Clásico puro. Fichas permanentes, sin movimiento. |
| 2 | **CRAWLER** | Fichas se mueven solo a casillas **adyacentes** vacías (Romano). |
| 3 | **PROXY** | Fichas saltan a **cualquier** casilla vacía del tablero (Libre). |
| 4 | **BUFFER** | Solo puedes mover tu ficha **más vieja** — cola FIFO (Terni). |

---

## 🌐 FAMILIA: GEOMETRÍA
*Cómo está conectado el espacio del tablero.*

| # | GATO.EXE | Habilidad |
|---|----------|-----------|
| 5 | **GRAVIT** | Las fichas **caen** al fondo de la columna (Connect 4 en 3x3). |
| 6 | **TORUS** | El tablero se **envuelve** — bordes conectan con el lado opuesto. Las líneas cruzan los límites. |
| 7 | **VORTEX** | Cada 3 turnos el tablero **rota 90°**, reposicionando todas las fichas. |

---

## 🧠 FAMILIA: PERCEPCIÓN
*Cómo lees o interpretas el estado del juego.*

| # | GATO.EXE | Habilidad |
|---|----------|-----------|
| 8 | **MISÈRE** | Gana quien **force al rival** a hacer 3 en raya. Objetivo invertido. |
| 9 | **CROM** | Celdas valen **1–9**. Gana quien sume **15** primero. Mismo juego, otro paradigma. |
| 10 | **STEALTH** | Fichas se vuelven **invisibles** 1 turno después de colocarse. Juega de memoria. |

---

## ⏱️ FAMILIA: TIEMPO
*Restricciones temporales que alteran el ritmo.*

| # | GATO.EXE | Habilidad |
|---|----------|-----------|
| 11 | **OVERCLOCK** | Temporizador de **3 segundos** por turno. Si no juegas, la CPU tira por ti al azar. |
| 12 | **DECAY** | Las fichas tienen **tiempo de vida** — desaparecen después de 3 turnos. |

---

## 💀 FAMILIA: CORRUPCIÓN
*El tablero o las fichas están comprometidos.*

| # | GATO.EXE | Habilidad |
|---|----------|-----------|
| 13 | **MALWARE** | Al inicio, 1-2 casillas aleatorias están **corruptas** (bloqueadas). Nadie puede usarlas. |
| 14 | **TROJAN** | Una casilla tiene una **mina oculta**. Quien tire ahí pierde la ficha y la casilla queda muerta. |
| 15 | **QUANTUM** | Tu primera ficha existe en **2 celdas simultáneas** hasta que el rival "observe" una zona. |

---

## 🔄 FAMILIA: INTERACCIÓN
*Las fichas interactúan entre sí de formas no estándar.*

| # | GATO.EXE | Habilidad |
|---|----------|-----------|
| 16 | **CRYPTO** | Al colocar ficha, 50% de probabilidad de **hackear** una ficha enemiga adyacente (cambia de color). |
| 17 | **MIRROR** | La CPU **copia** tu movimiento en simetría espejo. Manipula sus movimientos forzados. |
| 18 | **PUSH** | Al colocar ficha junto a otra, la **empuja** una casilla en la dirección opuesta. |
| 19 | **LAG** | 30% de probabilidad de que tu ficha se **deslice** a una casilla adyacente aleatoria. |

---

## Resumen

| Familia | Cantidad | GATOS |
|---------|----------|-------|
| Movimiento | 4 | LEGACY, CRAWLER, PROXY, BUFFER |
| Geometría | 3 | GRAVIT, TORUS, VORTEX |
| Percepción | 3 | MISÈRE, CROM, STEALTH |
| Tiempo | 2 | OVERCLOCK, DECAY |
| Corrupción | 3 | MALWARE, TROJAN, QUANTUM |
| Interacción | 4 | CRYPTO, MIRROR, PUSH, LAG |
| **Total** | **19** | — |
