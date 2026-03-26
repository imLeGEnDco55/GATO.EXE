import { motion } from 'motion/react';
import { Trophy, ChevronRight, Package, Download, Terminal, Cpu } from 'lucide-react';

interface MainMenuProps {
  onStartMainMode: () => void;
  onOpenEditor: () => void;
  onOpenImport: () => void;
  onOpenSDKat: () => void;
  onOpenHackEditor: () => void;
}

export function MainMenu({ onStartMainMode, onOpenEditor, onOpenImport, onOpenSDKat, onOpenHackEditor }: MainMenuProps) {
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      {/* Gauntlet Mode */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartMainMode}
        className="w-full p-8 bg-white text-black rounded-3xl flex items-center justify-between group relative overflow-hidden"
      >
        <div className="relative z-10 text-left">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] opacity-40">Modo Especial</span>
          <h2 className="text-4xl font-black italic tracking-tighter leading-none">GAUNTLET</h2>
        </div>
        <div className="relative z-10">
          <Trophy className="w-10 h-10" />
        </div>
        <div className="absolute inset-0 bg-indigo-400 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
      </motion.button>

      {/* SDKat Section */}
      <div className="space-y-3">
        <p className="text-[10px] font-mono text-slate-700 uppercase tracking-[0.3em] text-center">
          SDKat // Crea & Comparte
        </p>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenEditor}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-all group"
          >
            <Package className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs font-black tracking-wider text-slate-500 group-hover:text-white transition-colors">CREAR</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenImport}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-all group"
          >
            <Download className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs font-black tracking-wider text-slate-500 group-hover:text-white transition-colors">IMPORTAR</span>
          </motion.button>
        </div>

        {/* Hack Cards Section */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenHackEditor}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-emerald-500/50 transition-all group"
          >
            <Cpu className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            <span className="text-xs font-black tracking-wider text-slate-500 group-hover:text-white transition-colors">HACK EDITOR</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSDKat}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-green-500/50 transition-all group"
          >
            <Terminal className="w-6 h-6 text-slate-600 group-hover:text-green-400 transition-colors" />
            <span className="text-xs font-black tracking-wider text-slate-500 group-hover:text-white transition-colors">SDKat</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Play */}
      <button
        onClick={onStartMainMode}
        className="w-full py-6 bg-white text-black rounded-3xl font-black text-xl tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-3 hover:bg-indigo-400 hover:text-white"
      >
        EJECUTAR <ChevronRight size={24} />
      </button>
    </motion.div>
  );
}
