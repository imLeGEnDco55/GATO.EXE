import { motion, AnimatePresence } from 'motion/react';
import type { Player, GauntletState } from '../types';

interface GameHUDProps {
  currentPlayer: Player;
  gauntlet: GauntletState;
  gatoName: string;
  gatoDesc: string;
  lagMessage: string | null;
}

export function GameHUD({ currentPlayer, gauntlet, gatoName, gatoDesc, lagMessage }: GameHUDProps) {
  const { matchScore, matchesNeeded, cycle, message, isBossRound } = gauntlet;
  const totalMatches = matchScore.player + matchScore.cpu;

  return (
    <div className="space-y-4">
      {/* Cycle + Gato Header */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <span>{cycle > 3 ? `Lv.${gauntlet.level}` : `Ciclo ${cycle}/3`}</span>
          <span>
            {gauntlet.activeBoss && cycle > 3
              ? 'SUPERVIVENCIA'
              : isBossRound
              ? `BOSS ROUND`
              : `GATO ${gauntlet.currentGatoIdx + 1}/${gauntlet.selectedGatos.length}`
            }
          </span>
        </div>

        {/* Active Gato Name */}
        <div className="text-center">
          <h3 className="text-lg font-black tracking-wider text-white uppercase">
            {gatoName}
          </h3>
          <p className="text-[9px] font-mono text-slate-600 mt-1">{gatoDesc}</p>
        </div>

        {/* Match Score */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-500">TÚ</span>
            <span className="text-lg font-black text-white">{matchScore.player}</span>
          </div>
          <span className="text-xs font-mono text-slate-700">vs</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">{matchScore.cpu}</span>
            <span className="text-xs font-mono text-rose-500">CPU</span>
          </div>
        </div>

        {/* Match dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: matchesNeeded * 2 - 1 }, (_, i) => {
            const isPlayerDot = i < matchScore.player;
            const isCpuDot = i >= matchesNeeded * 2 - 1 - matchScore.cpu;
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  isPlayerDot ? 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]'
                  : isCpuDot ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                  : i < totalMatches ? 'bg-slate-700' : 'bg-slate-900'
                }`}
              />
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(matchScore.player / matchesNeeded) * 100}%` }}
            className="h-full bg-indigo-500"
          />
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {(message || lagMessage) && (
          <motion.div
            key={message || lagMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-[10px] font-mono text-indigo-400 text-center uppercase"
          >
            {message || lagMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Player */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${currentPlayer === 'X' ? 'bg-cyan-500' : 'bg-rose-500'} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
          <span className="font-black tracking-widest text-sm uppercase text-slate-400">
            Turno {currentPlayer}
          </span>
        </div>
      </div>
    </div>
  );
}
