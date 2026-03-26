import { motion } from 'motion/react';
import type { Hack } from '../types';

// ─── Hardcoded Hacks (temporary) ─────────────────────────────────
const HACKS: Hack[] = [
  {
    id: 'extra-life',
    name: 'EXTRA_LIFE.dll',
    description: 'El empate cuenta como victoria en la próxima serie.',
    price: 2000,
    rarity: 'common',
    emoji: '💚',
  },
  {
    id: 'reveal-cpu',
    name: 'SNIFF.exe',
    description: 'Revela la siguiente jugada de la CPU por 3 turnos.',
    price: 3500,
    rarity: 'rare',
    emoji: '👁️',
  },
  {
    id: 'double-credits',
    name: 'FORK_BOMB.bat',
    description: 'Duplica las recompensas del próximo ciclo completo.',
    price: 5000,
    rarity: 'legendary',
    emoji: '💰',
  },
];

const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string }> = {
  common:    { border: 'border-cyan-800/60',    glow: 'shadow-cyan-900/20',    badge: 'bg-cyan-900/40 text-cyan-400' },
  rare:      { border: 'border-indigo-600/60',  glow: 'shadow-indigo-700/30',  badge: 'bg-indigo-900/40 text-indigo-400' },
  legendary: { border: 'border-rose-500/60',    glow: 'shadow-rose-700/30',    badge: 'bg-rose-900/40 text-rose-400' },
};

// ─── Component ────────────────────────────────────────────────────

interface BlackMarketShopProps {
  wallet: number;
  purchasedHacks: string[];
  onBuyHack: (hackId: string) => void;
  onContinue: () => void;
}

export function BlackMarketShop({ wallet, purchasedHacks, onBuyHack, onContinue }: BlackMarketShopProps) {
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
          INTERCYCLE_SHOP // CREDITOS DISPONIBLES
        </p>
      </div>

      {/* Wallet */}
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="text-xs text-slate-500 font-mono">WALLET:</span>
        <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
          ¢{wallet.toLocaleString()}
        </span>
      </div>

      {/* Hack Cards */}
      <div className="space-y-3">
        {HACKS.map((hack, i) => {
          const style = RARITY_STYLES[hack.rarity];
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
        })}
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
