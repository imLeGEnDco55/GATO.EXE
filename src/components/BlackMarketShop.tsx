import { useState } from 'react';
import { motion } from 'motion/react';
import type { Hack } from '../types';

interface BlackMarketShopProps {
  wallet: number;
  onBuyHack: (hackId: string, price: number) => void;
  onContinue: () => void;
}

const HACKS: Hack[] = [
  {
    id: 'h1_glitch',
    name: 'GLITCH.EXE',
    description: 'Anula el modificador del próximo Gato.',
    price: 300,
    rarity: 'rare',
  },
  {
    id: 'h2_overclock',
    name: 'OVERCLOCK',
    description: 'Aumenta el tiempo límite por turno a 10s.',
    price: 200,
    rarity: 'common',
  },
  {
    id: 'h3_root',
    name: 'ROOT_ACCESS',
    description: 'Revela la posición de las minas en el tablero.',
    price: 800,
    rarity: 'legendary',
  },
];

export function BlackMarketShop({ wallet, onBuyHack, onContinue }: BlackMarketShopProps) {
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});

  const handleBuy = (hack: Hack) => {
    if (wallet >= hack.price && !purchased[hack.id]) {
      onBuyHack(hack.id, hack.price);
      setPurchased(prev => ({ ...prev, [hack.id]: true }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#050505] text-white p-6 rounded-xl border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex flex-col items-center w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-widest text-rose-500 uppercase drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
          Black Market
        </h2>
        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
          Mejoras de sistema disponibles
        </p>
      </div>

      <div className="w-full bg-slate-900/50 rounded-lg p-3 mb-6 flex justify-between items-center border border-indigo-500/20">
        <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Wallet</span>
        <span className="text-lg font-black text-indigo-400 font-mono">{wallet} CR</span>
      </div>

      <div className="w-full flex flex-col gap-4 mb-8">
        {HACKS.map(hack => {
          const isPurchased = purchased[hack.id];
          const canAfford = wallet >= hack.price;

          let rarityColor = 'text-slate-400 border-slate-700/50';
          if (hack.rarity === 'rare') rarityColor = 'text-cyan-400 border-cyan-500/30';
          if (hack.rarity === 'legendary') rarityColor = 'text-amber-400 border-amber-500/30';

          return (
            <div key={hack.id} className={`p-4 rounded-lg bg-black border ${rarityColor} relative overflow-hidden group`}>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className={`font-black uppercase tracking-wider ${isPurchased ? 'text-slate-600' : 'text-white'}`}>
                  {hack.name}
                </h3>
                <span className={`text-xs font-mono font-bold ${isPurchased ? 'text-slate-600' : 'text-rose-400'}`}>
                  {hack.price} CR
                </span>
              </div>
              <p className={`text-xs ${isPurchased ? 'text-slate-700' : 'text-slate-400'} mb-4 relative z-10 min-h-[32px]`}>
                {hack.description}
              </p>

              <button
                onClick={() => handleBuy(hack)}
                disabled={isPurchased || !canAfford}
                className={`w-full py-2 rounded font-black text-xs tracking-widest uppercase transition-all relative z-10
                  ${isPurchased
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    : canAfford
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500/20 hover:shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-black text-slate-600 border border-slate-800 cursor-not-allowed'
                  }
                `}
              >
                {isPurchased ? 'Equipado' : canAfford ? 'Comprar' : 'Fondos Insuficientes'}
              </button>

              {/* Scanline effect on cards */}
              {!isPurchased && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/5 to-transparent h-[200%] -top-[100%] group-hover:animate-[scan_2s_linear_infinite] pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 font-black text-sm tracking-[0.2em] uppercase rounded-lg hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
      >
        Continuar Gauntlet
      </button>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(50%); }
        }
      `}</style>
    </motion.div>
  );
}
