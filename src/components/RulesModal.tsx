import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Hash, Move, Zap, Repeat } from 'lucide-react';

interface RulesModalProps {
  show: boolean;
  onClose: () => void;
}

export function RulesModal({ show, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-8"
        >
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-black italic tracking-tighter text-indigo-400">REGLAS.DOC</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Hash size={14} /> Clásico
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                El juego original. Consigue 3 en raya antes que tu oponente.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Move size={14} /> Romano
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cada jugador tiene solo 3 fichas. Una vez colocadas, debes moverlas a casillas <span className="text-indigo-300">adyacentes</span> vacías.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Zap size={14} /> Libre
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Igual que el Romano, pero puedes mover tus fichas a <span className="text-indigo-300">cualquier</span> casilla vacía del tablero.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Repeat size={14} /> Terni
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Solo puedes mover la ficha que colocaste <span className="text-indigo-300">primero</span>. El orden de movimiento sigue la secuencia de colocación (FIFO).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-auto w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            ENTENDIDO
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
