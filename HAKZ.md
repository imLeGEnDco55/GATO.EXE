Siguen los HAKZ si metemos los HAKZ en `settings.modifiers` (que usa `GatoModifiers`), vamos a terminar dándole nuestras armas a la CPU, porque el motor en `gameState.ts` es simétrico. Necesitamos un estado asimétrico: el `Loadout` del jugador.

Me encanta la idea de limitarlo a **3 Pasivos + 1 Activo + 1 Kernel (Definitivo)**. Esto obliga al jugador a hacer _builds_ (ej: una build de control de tablero, una build de manipulación de tiempo, etc.) y mantiene la UI limpia.

Acepto el reto de ChatGPT. Aquí tienes el **Roster Oficial de los 24 Hacks de GATO.EXE**, diseñados para romper tu propio juego y destilar dopamina pura (JUICE), clasificados por costo de implementación en tu código actual:

---

### 🛡️ 1. INTERCEPTORES (Manipulación de Entorno)

_Se enganchan en el Hook: `beforeChaos` y `beforeTopology`._

| Hack               | Rareza | Efecto (Tier 3)                                           | Costo Dev | Visual (El JUICE)                                                 |
| :----------------- | :----- | :-------------------------------------------------------- | :-------- | :---------------------------------------------------------------- |
| **Firewall.exe**   | Pasivo | Inmunidad total al _Lag_ y _Gravedad_.                    | 🟢 Bajo   | Escudo hexagonal de neón azul parpadea al rechazar el lag.        |
| **AirGap**         | Pasivo | Anula el primer evento de Caos (Lag/Malware) del combate. | 🟢 Bajo   | Sonido de cristal rompiéndose; la consola dice `[ACCESS DENIED]`. |
| **Sandbox Escape** | Pasivo | Puedes colocar fichas en casillas `BLOCKED` (Malware).    | 🟡 Medio  | La celda bloqueada roja se vuelve verde neón al pasar el mouse.   |
| **Packet Sniffer** | Kernel | Ves a dónde te va a enviar el _Lag_ antes de hacer clic.  | 🔴 Alto   | Muestra un rastro (trail) fantasma hacia la casilla de destino.   |

### 💥 2. SOBREESCRITURA (Rompiendo el Tablero)

_Se enganchan en el Hook: `beforePlacement`._

| Hack                    | Rareza | Efecto (Tier 3)                                                          | Costo Dev | Visual (El JUICE)                                                             |
| :---------------------- | :----- | :----------------------------------------------------------------------- | :-------- | :---------------------------------------------------------------------------- |
| **Heap Spray**          | Pasivo | Tu primer turno coloca dos 'X' en casillas contiguas.                    | 🟢 Bajo   | Animación de clonación rápida con glitch visual.                              |
| **Fork Bomb**           | Pasivo | Cada 3.ª ficha que pones, se duplica en un adyacente vacío al azar.      | 🟡 Medio  | Explosión de partículas; la nueva ficha cae con un golpe de bajo (bass drop). |
| **Sobreescritura_Root** | Activo | 1/combate. Coloca tu 'X' sobre una 'O' y destrúyela.                     | 🟢 Bajo   | Animación de desintegración roja (como Thanos) en la ficha de la CPU.         |
| **Schrödinger.js**      | Pasivo | Colocas una ficha fantasma que no ocupa espacio, pero cuenta para ganar. | 🔴 Alto   | Ficha translúcida que parpadea intermitentemente.                             |

### ⛓️ 3. SECUESTRO (Robo de Propiedad y Movimiento)

_Se enganchan en el Hook: `afterPlacement` y el Turno de la CPU._

| Hack                 | Rareza | Efecto (Tier 3)                                                                | Costo Dev | Visual (El JUICE)                                                        |
| :------------------- | :----- | :----------------------------------------------------------------------------- | :-------- | :----------------------------------------------------------------------- |
| **Caballo de Troya** | Pasivo | Si rodeas una 'O' con dos 'X', la 'O' se vuelve tuya.                          | 🟢 Bajo   | Un escáner verde barre la ficha y la "hackea" cambiando de color.        |
| **Asset Freeze**     | Activo | 1/combate. Las 'O' adyacentes no pueden moverse su próximo turno.              | 🟡 Medio  | Cadenas de código binario o hielo digital envuelven las fichas enemigas. |
| **Rootkit**          | Kernel | Si la CPU te aplica _Infect_ o _Push_, el efecto se le devuelve a ella.        | 🟡 Medio  | Un escudo reflectante hace rebotar un rayo rojo hacia el enemigo.        |
| **VPN Proxy**        | Kernel | Tú juegas en modo `Free` (movimiento libre), la CPU juega en su modo original. | 🟢 Bajo   | Tus fichas dejan una estela de teletransporte ciberespacial al moverse.  |

### ⏳ 4. TIEMPO (Causalidad y Memoria)

_Se enganchan en el Hook: `beforeWinCheck` y Gestión de Turnos._

| Hack            | Rareza | Efecto (Tier 3)                                                                | Costo Dev | Visual (El JUICE)                                                                 |
| :-------------- | :----- | :----------------------------------------------------------------------------- | :-------- | :-------------------------------------------------------------------------------- |
| **Secure_Boot** | Pasivo | Tus fichas son inmunes al modificador _Decay_. Nunca desaparecen.              | 🟢 Bajo   | Tus fichas tienen un candado dorado brillante.                                    |
| **Cold Backup** | Pasivo | La primera 'X' tuya que sea destruida/corrompida reaparece en una esquina.     | 🟡 Medio  | Animación de "Downloading..." en la esquina antes de materializarse.              |
| **Ctrl+Z**      | Activo | 1/combate. Retrocede el estado exacto del tablero 1 turno.                     | 🔴 Alto   | Efecto VHS de rebobinado a pantalla completa con ruido estático.                  |
| **Save State**  | Kernel | Si la CPU hace 3 en raya, vuelves al turno anterior y la reliquia se destruye. | 🔴 Alto   | La pantalla se rompe en rojo "GAME OVER", se congela y se rebobina violentamente. |

### 🏆 5. VICTORIA FALSA (Manipulación de Reglas)

_Se enganchan en el Hook: `checkWinState`._

| Hack                 | Rareza | Efecto (Tier 3)                                                                    | Costo Dev | Visual (El JUICE)                                                        |
| :------------------- | :----- | :--------------------------------------------------------------------------------- | :-------- | :----------------------------------------------------------------------- |
| **False Positive**   | Pasivo | Los empates cuentan matemáticamente como tu victoria.                              | 🟢 Bajo   | Texto gigante: "EMPATE -> HACKEADO -> VICTORIA".                         |
| **Zero-Day Exploit** | Kernel | Ganas automáticamente si ocupas 3 esquinas del tablero.                            | 🟢 Bajo   | Las esquinas se unen con rayos láser letales formando un triángulo.      |
| **Checksum Forgery** | Pasivo | La casilla central (4) funciona como comodín (Wildcard) para tus líneas.           | 🟡 Medio  | El centro brilla con un arcoíris cíclico.                                |
| **Kernel Panic**     | Kernel | Si la CPU gana, el juego no acaba. Tienes 1 turno para romper su línea o ganar tú. | 🟡 Medio  | Sirenas de alarma, la pantalla parpadea en rojo, el tiempo se ralentiza. |

### 🧠 6. SABOTAJE DE IA (Rompiendo a la CPU)

_Se enganchan en el Hook: `beforeCpuPlan` (Dentro de `useCPU.ts`)._

| Hack              | Rareza | Efecto (Tier 3)                                                              | Costo Dev | Visual (El JUICE)                                                            |
| :---------------- | :----- | :--------------------------------------------------------------------------- | :-------- | :--------------------------------------------------------------------------- |
| **Ad-Blocker**    | Pasivo | La casilla central es "invisible" e "injugable" para la lógica de la CPU.    | 🟢 Bajo   | Un popup de "Ad Blocked" parpadea rápido si la CPU intenta mirar ahí.        |
| **HoneyPot**      | Activo | 1/combate. Marcas una casilla. La CPU _tiene_ que tirar ahí si está vacía.   | 🟢 Bajo   | Un icono de un tarro de miel digital dorada gira en la celda.                |
| **Telemetry Jam** | Pasivo | La CPU siempre ignora tu ficha más reciente al decidir dónde bloquear.       | 🟡 Medio  | Tu última 'X' emite un efecto de "jamming" (ondas distorsionadas).           |
| **MITM Proxy**    | Activo | 1/combate. Rediriges la jugada que iba a hacer la CPU a una celda aleatoria. | 🟡 Medio  | Una flecha hacker desvía la ficha enemiga en el aire con sonido de _Glitch_. |

Ahora, **Las mecánicas subyacentes deben ser matemáticas estrictas, pero la presentación debe ser pura exageración.**

Aquí tienes el plan de arquitectura para implementar la economía y el "Mercado Negro" en tu motor:

### 1. La Economía del Exceso (Inflación de Dopamina)

Nunca le des al jugador "1 moneda". El cerebro reptiliano no se emociona con un 1. Dale "1,000 Cripto-Croquetas" (o _Bytes_, _Créditos_, etc.).

El cálculo de recompensa en `useGauntlet.ts` no debe ser plano. Debe premiar el estilo y el riesgo:

- **Recompensa Base (Win):** +1,000
- **Bono de Velocidad (Ej. Ganar en menos de 5 turnos):** +2,500
- **Bono de Flawless (Ganar sin que el rival ponga 3 fichas):** +5,000
- **El Multiplicador de Racha (El Casino):** Aquí está la magia. Si el jugador gana 2 partidas seguidas, sus ganancias se multiplican por **x1.5**. A la tercera, **x2.0**. Pierdes o empatas, la racha y el multiplicador vuelven a cero.

### 2. El Mercado Negro (La Fase de Draft)

Justo cuando el jugador destruye al Gato Jefe de 3x3 y la CPU está "cargando" el tablero 4x4, interceptamos el flujo del juego y cambiamos a una nueva pantalla: `screen === 'shop'`.

Aquí le presentamos al jugador 3 opciones aleatorias de tu catálogo de Hacks (los que definimos arriba).

- **El Costo:** Los Hacks deben ser caros para que el jugador sienta que está invirtiendo su lana. Un Hack pasivo normal podría costar 5,000, y un Hack "Kernel" (Definitivo) podría costar 15,000.
- **El Reroll:** La mecánica de casino por excelencia. ¿No te gustan los 3 Hacks que salieron? Puedes pagar 1,000 créditos para actualizar la tienda y ver otros 3. (Esto drena el dinero del jugador y lo hace tomar decisiones difíciles).

### 3. El Diseño Visual (El "Juice")

Para presentar los 3 hacks en la tienda, podrías hacer que la UI muestre tres cartas con arte único y estilos muy definidos, casi como si el jugador estuviera sacando cartas de una baraja de Tarot ciberpunk con foil holográfico.

Cuando el jugador tenga el dinero suficiente y le dé clic a "COMPRAR", la carta debe dar un destello dorado, la pantalla debe hacer un ligero _shake_, y el sonido de fondo no debe ser un simple "clic", sino un _beat drop_ pesado y saturado, como la entrada de una pista de Hip Hop industrial. ¡Que sienta el peso de la compra!

### 4. Implementación en el Código actual

Para enganchar esto en tu arquitectura, el cambio es súper limpio:

En tu `App.tsx`, agregas un nuevo estado a `AppScreen`:

```typescript
type AppScreen = "menu" | "gauntlet" | "shop" | "custom" | "editor" | "import";
```

Y en tu `useGauntlet.ts`, agregas la billetera y la lógica del multiplicador:

```typescript
const [wallet, setWallet] = useState<number>(0);
const [winStreak, setWinStreak] = useState<number>(0);

const handleMatchResult = useCallback(
  (winner: Player | "draw") => {
    if (winner === "X") {
      const streak = winStreak + 1;
      const multiplier = streak >= 3 ? 2.0 : streak >= 2 ? 1.5 : 1.0;
      const baseReward = 1000;
      // Faltaría calcular el bono por turnos

      setWallet((prev) => prev + baseReward * multiplier);
      setWinStreak(streak);

      // Si llegas a la meta de la fase, abres la tienda en vez de ir directo al siguiente nivel
      if (winsInCurrentPhase >= 4) {
        triggerShop();
      }
    } else {
      setWinStreak(0); // El castigo por perder o empatar
    }
  },
  [winStreak, wallet],
);
```

**Validación**

Sí: la dirección es correcta. Meter los HAKZ dentro de `settings.modifiers` sería un error de modelo.

- `settings.modifiers` hoy define reglas globales de la partida, no perks del jugador. Lo consumen el motor, la CPU, la UI y la generación procedural: [App.tsx:26](/d:/Appz/GATO.EXE/src/App.tsx#L26), [gameState.ts:149](/d:/Appz/GATO.EXE/src/engine/gameState.ts#L149), [useCPU.ts:30](/d:/Appz/GATO.EXE/src/hooks/useCPU.ts#L30), [compatibility.ts:15](/d:/Appz/GATO.EXE/src/engine/compatibility.ts#L15).
- Además, `GatoModifiers` también es el contrato del SDK/editor/import. Si metes HAKZ ahí, contaminarías cartas custom, renderer y validador: [gatoCard.ts:22](/d:/Appz/GATO.EXE/src/sdk/gatoCard.ts#L22), [CardEditor.tsx:137](/d:/Appz/GATO.EXE/src/components/CardEditor.tsx#L137), [cardRenderer.ts:83](/d:/Appz/GATO.EXE/src/sdk/cardRenderer.ts#L83).
- Tu conclusión de “necesitamos estado asimétrico: `Loadout` del jugador” es correcta. Ese estado no debería vivir en `GatoModifiers`; debería vivir junto al progreso del run, wallet, streak y estado de combate.
- El límite `3 pasivos + 1 activo + 1 kernel` también me parece correcto. Baja muchísimo la explosión combinatoria y hace viable la UI sin volver ilegible el HUD actual.

**Ajustes Importantes**

- Tus “hooks” existen conceptualmente, pero no como API real. El motor sí tiene pipeline por capas en [gameState.ts:93](/d:/Appz/GATO.EXE/src/engine/gameState.ts#L93), pero `beforeChaos`, `beforePlacement`, etc. todavía son ramas inline, no puntos extensibles.
- El `shop` encaja bien en `AppScreen`, pero `triggerShop()` no puede nacer dentro de `useGauntlet` tal como está hoy, porque ese hook no controla `screen`; sólo recibe `setSettings`: [App.tsx:21](/d:/Appz/GATO.EXE/src/App.tsx#L21), [useGauntlet.ts:33](/d:/Appz/GATO.EXE/src/hooks/useGauntlet.ts#L33).
- Tu pseudocódigo de economía asume datos que hoy no llegan. `handleMatchResult` sólo recibe `winner`, no turnos, flawless ni métricas de estilo: [App.tsx:69](/d:/Appz/GATO.EXE/src/App.tsx#L69), [useGauntlet.ts:170](/d:/Appz/GATO.EXE/src/hooks/useGauntlet.ts#L170).
- Hay un detalle de flujo: en este repo no existe exactamente “boss 3x3 y luego carga 4x4”. En ciclos de registro, el boss round ya salta a 4x4 o 5x5: [useGauntlet.ts:191](/d:/Appz/GATO.EXE/src/hooks/useGauntlet.ts#L191), [useGauntlet.ts:290](/d:/Appz/GATO.EXE/src/hooks/useGauntlet.ts#L290).
- Otro matiz importante: el engine sólo se auto-resetea si cambia `gridSize` o `mode`, no si cambian modifiers/loadout. Si compras un hack entre combates, vas a necesitar un reset/transición explícita: [useGameEngine.ts:12](/d:/Appz/GATO.EXE/src/hooks/useGameEngine.ts#L12).

**Lo Que Sí Recalibraría**

- `VPN Proxy` no es “bajo”; hoy `settings.mode` es global para ambos lados en motor y CPU: [gameState.ts:154](/d:/Appz/GATO.EXE/src/engine/gameState.ts#L154), [useCPU.ts:53](/d:/Appz/GATO.EXE/src/hooks/useCPU.ts#L53).
- `Heap Spray` tampoco me suena “bajo”; el turno actual asume una sola intención y una sola colocación por resolución: [gameState.ts:160](/d:/Appz/GATO.EXE/src/engine/gameState.ts#L160).
- `Checksum Forgery` probablemente es más caro de lo que parece, porque no sólo toca win check; también obliga a reentrenar la lectura táctica de la CPU: [gameState.ts:56](/d:/Appz/GATO.EXE/src/engine/gameState.ts#L56), [useCPU.ts:28](/d:/Appz/GATO.EXE/src/hooks/useCPU.ts#L28).

La validación corta es: sí al `Loadout` asimétrico, sí al cap de 5 slots, sí al `shop`; no a mezclar HAKZ con `GatoModifiers`. El plan está bien encaminado, pero necesita separar claramente “reglas del tablero” de “poderes del jugador” y ajustar el flujo real de `useGauntlet`/`App`.
