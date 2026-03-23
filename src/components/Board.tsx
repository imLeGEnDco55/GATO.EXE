import { motion, AnimatePresence } from 'motion/react';
import { X, Circle } from 'lucide-react';
import type { Player, GameSettings, Piece } from '../types';

interface BoardProps {
  board: (Player | null)[];
  pieces: Piece[];
  settings: GameSettings;
  currentPlayer: Player;
  selectedPieceIndex: number | null;
  winner: Player | 'draw' | null;
  mineTriggered: boolean;
  onCellClick: (index: number) => void;
  onResetGame: () => void;
  onGoToMenu: () => void;
}

export function Board({
  board,
  pieces,
  settings,
  currentPlayer,
  selectedPieceIndex,
  winner,
  mineTriggered,
  onCellClick,
  onResetGame,
  onGoToMenu,
}: BoardProps) {
  const mods = settings.modifiers;
  const iconSize = settings.gridSize > 4 ? 24 : settings.gridSize > 3 ? 32 : 44;
  const iconSizeSmall = settings.gridSize > 4 ? 20 : settings.gridSize > 3 ? 28 : 36;

  return (
    <div className="relative aspect-square">
      <div
        className="grid gap-2 h-full"
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

          // Render blocked cells
          if (isBlocked) {
            return (
              <div
                key={i}
                className="rounded-2xl bg-red-950/30 border border-red-900/40 flex items-center justify-center"
              >
                <span className="text-red-800/60 text-xs font-mono">✕</span>
              </div>
            );
          }

          // Determine cell display
          const showX = cell === 'X' && !isInvisible;
          const showO = cell === 'O' && !isInvisible;

          return (
            <button
              key={i}
              onClick={() => onCellClick(i)}
              disabled={!!winner}
              className={`relative rounded-xl transition-all duration-300 flex items-center justify-center
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

              {/* Mine hint (subtle) */}
              {isMineCell && !cell && (
                <span className="absolute text-[8px] text-red-900/20 bottom-0.5 right-1">•</span>
              )}

              <AnimatePresence>
                {showX && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-cyan-500"
                  >
                    <X size={iconSize} strokeWidth={4} />
                  </motion.div>
                )}
                {showO && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-rose-500"
                  >
                    <Circle size={iconSizeSmall} strokeWidth={4} />
                  </motion.div>
                )}
                {/* Ghost piece for stealth (occupied but invisible) */}
                {isInvisible && cell && (
                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 0.08 }}
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
            </button>
          );
        })}
      </div>

      {/* Winner Overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl border border-slate-800"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-center p-8"
            >
              <h2 className="text-5xl font-black mb-2 italic tracking-tighter text-white">
                {winner === 'draw' ? 'EMPATE' : `${winner} WINS`}
              </h2>
              <div className="h-1 w-24 bg-indigo-500 mx-auto mb-10" />

              <div className="space-y-3">
                <button
                  onClick={onResetGame}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all active:scale-95"
                >
                  SIGUIENTE
                </button>
                <button
                  onClick={onGoToMenu}
                  className="w-full py-4 bg-slate-900 text-slate-400 rounded-2xl font-bold transition-all"
                >
                  SALIR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
