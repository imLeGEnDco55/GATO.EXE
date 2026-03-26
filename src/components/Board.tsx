import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { X, Circle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Player, GameSettings, Piece } from '../types';
import type { JuiceState } from '../hooks/useGameJuice';

interface BoardProps {
  board: (Player | null)[];
  pieces: Piece[];
  settings: GameSettings;
  currentPlayer: Player;
  selectedPieceIndex: number | null;
  winner: Player | 'draw' | null;
  mineTriggered: boolean;
  juice: JuiceState;
  onCellClick: (index: number) => void;
  onResetGame: () => void;
  onGoToMenu: () => void;
}

// ─── Glitch text scramble component ────────────────────────────────

function GlitchOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl"
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)',
        }}
      />
      {/* RGB split bars */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-1"
          style={{
            top: `${20 + i * 15}%`,
            background: i % 2 === 0
              ? 'rgba(255,0,100,0.15)'
              : 'rgba(0,255,255,0.15)',
            mixBlendMode: 'screen',
          }}
          animate={{
            x: [0, i % 2 === 0 ? 8 : -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 0.1, repeat: 2, ease: 'linear' }}
        />
      ))}
      {/* Static noise */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
          mixBlendMode: 'overlay',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 0.05, repeat: 5 }}
      />
    </motion.div>
  );
}

// ─── Explosion effect ──────────────────────────────────────────────

function ExplosionEffect({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Central flash */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,100,50,0.8) 0%, transparent 70%)' }}
        initial={{ width: 20, height: 20, opacity: 1 }}
        animate={{ width: 300, height: 300, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Particle ring */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-orange-400"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * 80,
              y: Math.sin(angle) * 80,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        );
      })}
      {/* Smoke ring */}
      <motion.div
        className="absolute rounded-full border-2 border-red-500/50"
        initial={{ width: 10, height: 10, opacity: 0.8 }}
        animate={{ width: 200, height: 200, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

// ─── Flash border ──────────────────────────────────────────────────

function FlashBorder({ color }: { color: 'cyan' | 'rose' | 'red' | null }) {
  if (!color) return null;
  const colorMap = {
    cyan: 'rgba(6,182,212,0.4)',
    rose: 'rgba(244,63,94,0.4)',
    red: 'rgba(255,50,30,0.6)',
  };
  return (
    <motion.div
      className="absolute inset-0 z-15 pointer-events-none rounded-3xl"
      style={{
        boxShadow: `inset 0 0 40px ${colorMap[color]}, 0 0 60px ${colorMap[color]}`,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    />
  );
}

// ─── Piece placement animation ────────────────────────────────────

const placementVariants = {
  initial: { opacity: 0, scale: 0.3, rotate: -15 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 22,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    filter: 'blur(4px)',
    transition: { duration: 0.15 },
  },
};

// ─── Main Board Component ─────────────────────────────────────────

export function Board({
  board,
  pieces,
  settings,
  currentPlayer,
  selectedPieceIndex,
  winner,
  mineTriggered,
  juice,
  onCellClick,
  onResetGame,
  onGoToMenu,
}: BoardProps) {
  const mods = settings.modifiers;
  const iconSize = settings.gridSize > 4 ? 24 : settings.gridSize > 3 ? 32 : 44;
  const iconSizeSmall = settings.gridSize > 4 ? 20 : settings.gridSize > 3 ? 28 : 36;

  // ── Screen shake via motion values ──
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);

  useEffect(() => {
    if (juice.shake) {
      const intensity = juice.flash === 'red' ? 8 : 3; // mine = bigger shake
      const keyframes = [0, intensity, -intensity, intensity / 2, -intensity / 2, 0];
      animate(shakeX, keyframes, { duration: 0.3, ease: 'easeOut' });
      animate(shakeY, keyframes.map(v => v * 0.6), { duration: 0.3, ease: 'easeOut' });
    }
  }, [juice.shake, juice.flash, shakeX, shakeY]);

  // ── Mine explosion state tracking ──
  const [showExplosion, setShowExplosion] = useState(false);
  const prevMineTriggered = useRef(mineTriggered);
  useEffect(() => {
    if (mineTriggered && !prevMineTriggered.current) {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 600);
    }
    prevMineTriggered.current = mineTriggered;
  }, [mineTriggered]);

  return (
    <motion.div
      className="relative aspect-square"
      style={{ x: shakeX, y: shakeY }}
    >
      {/* Glitch overlay */}
      <AnimatePresence>
        {juice.glitch && <GlitchOverlay active />}
      </AnimatePresence>

      {/* Flash border */}
      <AnimatePresence>
        {juice.flash && <FlashBorder color={juice.flash} />}
      </AnimatePresence>

      {/* Explosion */}
      <AnimatePresence>
        {showExplosion && <ExplosionEffect active />}
      </AnimatePresence>

      {/* Ambient scanlines (always on for cyberpunk feel) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-3xl opacity-[0.015]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      <div
        className="grid gap-2 h-full relative z-[1]"
        style={{
          gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${settings.gridSize}, 1fr)`,
          gap: settings.gridSize > 3 ? '6px' : '12px',
        }}
      >
        {board.map((cell, i) => {
          const isBlocked = settings.blockedIndices.includes(i) || cell === ('BLOCKED' as any);
          const isSelected = selectedPieceIndex === i;
          const isMineCell = mods.mine && i === settings.mineIndex && !mineTriggered;
          const piece = pieces.find(p => p.position === i);
          const isInvisible = mods.stealth && piece?.invisible;
          const numericVal = mods.numeric && settings.numericValues[i];

          // Terni oldest indicator
          let isOldest = false;
          if (settings.mode === 'terni' && cell === currentPlayer) {
            const playerPieces = pieces.filter(p => p.player === currentPlayer);
            if (playerPieces.length === settings.gridSize) {
              const oldest = [...playerPieces].sort((a, b) => a.order - b.order)[0];
              if (piece?.id === oldest.id) isOldest = true;
            }
          }

          // Render blocked cells (with mine crater effect)
          if (isBlocked) {
            const isCrater = mineTriggered && i === settings.mineIndex;
            return (
              <motion.div
                key={i}
                className={`rounded-2xl flex items-center justify-center ${
                  isCrater
                    ? 'bg-orange-950/30 border border-orange-900/40'
                    : 'bg-red-950/30 border border-red-900/40'
                }`}
                animate={isCrater ? {
                  boxShadow: ['0 0 20px rgba(255,100,30,0.3)', '0 0 0px rgba(255,100,30,0)'],
                } : undefined}
                transition={{ duration: 1 }}
              >
                <span className={`text-xs font-mono ${isCrater ? 'text-orange-700/60' : 'text-red-800/60'}`}>
                  {isCrater ? '💥' : '✕'}
                </span>
              </motion.div>
            );
          }

          // Determine cell display
          const showX = cell === 'X' && !isInvisible;
          const showO = cell === 'O' && !isInvisible;

          return (
            <motion.button
              key={i}
              onClick={() => onCellClick(i)}
              disabled={!!winner}
              whileTap={!winner ? { scale: 0.92 } : undefined}
              whileHover={!winner && !cell ? { scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' } : undefined}
              className={`relative rounded-xl transition-colors duration-300 flex items-center justify-center
                ${isSelected ? 'bg-indigo-600/20 border-2 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700'}
                ${isOldest ? 'border-yellow-500/40' : ''}
                ${settings.gridSize > 3 ? 'rounded-xl' : 'rounded-2xl'}
              `}
            >
              {/* Numeric value overlay (CROM) */}
              {mods.numeric && !cell && (
                <span className="absolute text-[10px] font-mono text-slate-700 top-1 right-2">
                  {numericVal}
                </span>
              )}

              {/* Mine hint (subtle pulse) */}
              {isMineCell && !cell && (
                <motion.span
                  className="absolute text-[8px] text-red-900/30 bottom-0.5 right-1"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  •
                </motion.span>
              )}

              <AnimatePresence mode="wait">
                {showX && (
                  <motion.div
                    key={`x-${i}`}
                    variants={placementVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  >
                    <X size={iconSize} strokeWidth={4} />
                  </motion.div>
                )}
                {showO && (
                  <motion.div
                    key={`o-${i}`}
                    variants={placementVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  >
                    <Circle size={iconSizeSmall} strokeWidth={4} />
                  </motion.div>
                )}
                {/* Ghost piece for stealth (occupied but invisible) */}
                {isInvisible && cell && (
                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{
                      opacity: [0.04, 0.1, 0.04],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={cell === 'X' ? 'text-cyan-900' : 'text-rose-900'}
                  >
                    {cell === 'X'
                      ? <X size={iconSize} strokeWidth={4} />
                      : <Circle size={iconSizeSmall} strokeWidth={4} />
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CROM: show value when occupied */}
              {mods.numeric && cell && (
                <span className="absolute text-[8px] font-mono text-slate-600 bottom-0 right-1">
                  {numericVal}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Winner Overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl border border-slate-800"
          >
            <motion.div
              initial={{ y: 30, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-center p-8"
            >
              <motion.h2
                className={`text-5xl font-black mb-2 italic tracking-tighter ${
                  winner === 'X' ? 'text-cyan-400' : winner === 'O' ? 'text-rose-400' : 'text-white'
                }`}
                animate={winner !== 'draw' ? {
                  textShadow: [
                    `0 0 20px ${winner === 'X' ? 'rgba(6,182,212,0.5)' : 'rgba(244,63,94,0.5)'}`,
                    `0 0 40px ${winner === 'X' ? 'rgba(6,182,212,0.3)' : 'rgba(244,63,94,0.3)'}`,
                    `0 0 20px ${winner === 'X' ? 'rgba(6,182,212,0.5)' : 'rgba(244,63,94,0.5)'}`,
                  ],
                } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {winner === 'draw' ? 'EMPATE' : `${winner} WINS`}
              </motion.h2>
              <motion.div
                className={`h-1 w-24 mx-auto mb-10 ${
                  winner === 'X' ? 'bg-cyan-500' : winner === 'O' ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              />

              <div className="space-y-3">
                <motion.button
                  onClick={onResetGame}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all hover:bg-indigo-500"
                >
                  SIGUIENTE
                </motion.button>
                <motion.button
                  onClick={onGoToMenu}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 bg-slate-900 text-slate-400 rounded-2xl font-bold transition-all hover:bg-slate-800"
                >
                  SALIR
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
