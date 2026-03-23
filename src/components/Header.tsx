import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

interface HeaderProps {
  onShowRules: () => void;
}

export function Header({ onShowRules }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
          GATO.EXE
        </h1>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onShowRules}
        className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors"
      >
        <HelpCircle size={20} />
      </motion.button>
    </header>
  );
}
