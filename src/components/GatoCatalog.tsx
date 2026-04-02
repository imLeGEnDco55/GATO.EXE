import { motion } from 'motion/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { GatoCard } from '../sdk/gatoCard';

interface GatoCatalogProps {
  gatos: GatoCard[];
  onBack: () => void;
  onPlayCard: (card: GatoCard) => void;
  onToggleMain: (id: string) => void;
  onRemove: (id: string) => void;
}

export function GatoCatalog({ gatos, onBack, onPlayCard, onToggleMain, onRemove }: GatoCatalogProps) {
  return (
    <motion.div
      key="catalog"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-slate-500">
          SDKat // CATÁLOGO
        </span>
        <div className="w-6" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black italic tracking-tighter text-white">
          CATÁLOGO
        </h2>
        <p className="text-[10px] font-mono text-slate-600">
          {gatos.length} gato{gatos.length !== 1 ? 's' : ''} guardado{gatos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Empty state */}
      {gatos.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <div className="text-4xl">📦</div>
          <p className="text-sm text-slate-500 font-mono">
            Catálogo vacío
          </p>
          <p className="text-[10px] text-slate-700 font-mono">
            Crea un gato en el Editor y guárdalo aquí
          </p>
        </div>
      )}

      {/* Cards grid */}
      {gatos.length > 0 && (
        <div className="space-y-2">
          {gatos.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              {/* Top row: emoji + name + grid badge */}
              <button
                onClick={() => onPlayCard(card)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <span className="text-2xl">{card.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black tracking-wider text-white block truncate group-hover:text-indigo-400 transition-colors">
                    {card.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 block truncate">
                    {card.description}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 bg-slate-800 px-2 py-1 rounded-lg shrink-0">
                  {card.gridSize}×{card.gridSize}
                </span>
              </button>

              {/* Bottom row: MAIN toggle + delete */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onToggleMain(card.id)}
                  className={`text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all ${
                    card.inMainMode
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'bg-slate-800/60 text-slate-600 border border-slate-700/50'
                  }`}
                >
                  {card.inMainMode ? '✓ MAIN MODE' : 'MAIN MODE'}
                </button>

                <button
                  onClick={() => onRemove(card.id)}
                  className="text-slate-700 hover:text-red-400 transition-colors p-1"
                  title="Eliminar del catálogo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
