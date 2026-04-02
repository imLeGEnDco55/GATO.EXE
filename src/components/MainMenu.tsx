import { motion } from 'motion/react';
import { Zap, Terminal } from 'lucide-react';

interface MainMenuProps {
  onStartGlitch: () => void;
  onOpenSDKat: () => void;
}

export function MainMenu({ onStartGlitch, onOpenSDKat }: MainMenuProps) {
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      {/* GLITCH Mode */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartGlitch}
        className="w-full py-8 bg-white text-black rounded-3xl font-black text-2xl tracking-tighter transition-all flex items-center justify-center gap-4 hover:bg-indigo-500 hover:text-white group"
      >
        <Zap className="w-7 h-7 group-hover:animate-pulse" />
        GLITCH
      </motion.button>

      {/* SDKat Hub */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenSDKat}
        className="w-full py-6 bg-slate-900 border border-slate-800 rounded-3xl font-black text-lg tracking-wider text-slate-400 transition-all flex items-center justify-center gap-3 hover:border-green-500/50 hover:text-green-400 group"
      >
        <Terminal className="w-5 h-5 group-hover:text-green-400 transition-colors" />
        SDKat
      </motion.button>

      {/* Cycle info */}
      <p className="text-[10px] font-mono text-slate-800 uppercase tracking-[0.3em] text-center">
        GLITCH // 3×3 → 4×4 → 5×5 // ∞
      </p>
    </motion.div>
  );
}
