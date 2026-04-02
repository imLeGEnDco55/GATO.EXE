import { motion } from 'motion/react';
import type { Hack } from '../types';
import type { CustomHackData } from '../lib/hackCard';
import { HACK_EFFECTS, customHackToHack } from '../lib/hackCard';

const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string }> = {
  common:    { border: 'border-cyan-800/60',    glow: 'shadow-cyan-900/20',    badge: 'bg-cyan-900/40 text-cyan-400' },
  rare:      { border: 'border-indigo-600/60',  glow: 'shadow-indigo-700/30',  badge: 'bg-indigo-900/40 text-indigo-400' },
  legendary: { border: 'border-rose-500/60',    glow: 'shadow-rose-700/30',    badge: 'bg-rose-900/40 text-rose-400' },
};

// ─── Empty Slot Card ──────────────────────────────────────────────

function EmptySlot({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.3 }}
      className="relative border border-slate-800/40 rounded-lg p-4 bg-[#0a0a0a] border-dashed"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base opacity-30">📦</span>
            <span className="text-xs font-bold font-mono text-slate-700 tracking-wider">
              SLOT_{index + 1}_EMPTY
            </span>
          </div>
          <p className="text-[11px] text-slate-700 font-mono leading-relaxed">
            Importa un HAKZ desde SDKat para desbloquear este slot.
          </p>
        </div>
        <span className="shrink-0 px-3 py-1.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed">
          VACÍO
        </span>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────

interface BlackMarketShopProps {
  wallet: number;
  purchasedHacks: string[];
  customHacks: CustomHackData[];
  onBuyHack: (hackId: string) => void;
  onContinue: () => void;
}

export function BlackMarketShop({ wallet, purchasedHacks, customHacks, onBuyHack, onContinue }: BlackMarketShopProps) {
  // Shuffle and pick up to 3 random hacks per shop visit
  const shuffled = [...customHacks].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  const hacks: Hack[] = selected.map(customHackToHack);
  const hasHacks = hacks.length > 0;

  return (
    <motion.div
      key="shop"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold tracking-[0.3em] text-cyan-400 uppercase font-mono">
          ⌐■-■ BLACK MARKET
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-800 to-transparent" />
        <p className="text-[10px] text-slate-600 font-mono tracking-widest">
          {hasHacks ? 'INTERCYCLE_SHOP // CREDITOS DISPONIBLES' : 'EMPTY_STOCK // IMPORTA HAKZ PARA COMPRAR'}
        </p>
      </div>

      {/* Wallet */}
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="text-xs text-slate-500 font-mono">WALLET:</span>
        <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
          ¢{wallet.toLocaleString()}
        </span>
      </div>

      {/* Hack Cards or Empty Slots */}
      <div className="space-y-3">
        {hasHacks ? (
          hacks.map((hack, i) => {
            const style = RARITY_STYLES[hack.rarity] ?? RARITY_STYLES.common;
            const owned = purchasedHacks.includes(hack.id);
            const canAfford = wallet >= hack.price;

            return (
              <motion.div
                key={hack.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.3 }}
                className={`
                  relative border ${style.border} rounded-lg p-4
                  bg-[#0a0a0a] shadow-lg ${style.glow}
                  ${owned ? 'opacity-50' : ''}
                `}
              >
                {/* Scan line animation */}
                {!owned && (
                  <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                    <div className="scan-line absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{hack.emoji}</span>
                      <span className="text-xs font-bold font-mono text-white tracking-wider truncate">
                        {hack.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${style.badge}`}>
                        {hack.rarity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                      {hack.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onBuyHack(hack.id)}
                    disabled={owned || !canAfford}
                    className={`
                      shrink-0 px-3 py-1.5 rounded text-[11px] font-mono font-bold
                      transition-all duration-200
                      ${owned
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : canAfford
                          ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-800/60 hover:shadow-lg hover:shadow-cyan-900/30 active:scale-95'
                          : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed'
                      }
                    `}
                  >
                    {owned ? 'OWNED' : `¢${hack.price.toLocaleString()}`}
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          // 3 empty slots when no custom HAKZ have been imported
          <>
            <EmptySlot index={0} />
            <EmptySlot index={1} />
            <EmptySlot index={2} />
          </>
        )}
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={onContinue}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          w-full py-3 rounded-lg font-mono text-sm font-bold tracking-widest uppercase
          bg-gradient-to-r from-cyan-900/40 to-indigo-900/40
          border border-cyan-800/40 text-cyan-300
          hover:border-cyan-600/60 hover:shadow-lg hover:shadow-cyan-900/20
          transition-all duration-300
        "
      >
        CONTINUAR ▸
      </motion.button>

      <style>{`
        @keyframes scan {
          0% { top: -1px; }
          100% { top: 100%; }
        }
        .scan-line {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}
