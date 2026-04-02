import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Package, Download, Terminal, BookOpen } from 'lucide-react';
import type { GatoCard } from '../sdk/gatoCard';
import type { CustomHackData } from '../lib/hackCard';
import { CardEditor } from './CardEditor';
import { CardImport } from './CardImport';
import { GatoCatalog } from './GatoCatalog';

// ─── Sub-screen definitions ───────────────────────────────────────

type SDKatScreen = 'hub' | 'editor' | 'import' | 'hakz' | 'catalog';

interface SDKatProps {
  onBack: () => void;
  onImport: (hack: CustomHackData) => void;
  onPlayCard: (card: GatoCard) => void;
  onImportGato: (card: GatoCard) => void;
  // Catalog props
  catalogGatos: GatoCard[];
  onSaveToCatalog: (card: GatoCard) => void;
  onRemoveFromCatalog: (id: string) => void;
  onToggleMainMode: (id: string) => void;
}

// ─── HAKZ Editor (current SDKat inline content) ────────────────────

// We import the original SDKat component renamed for use as the HAKZ editor sub-screen
import { SDKat as HakzEditor } from './SDKatHakzEditor';

// ─── Main SDKat Hub ──────────────────────────────────────────────

export function SDKat({
  onBack, onImport, onPlayCard, onImportGato,
  catalogGatos, onSaveToCatalog, onRemoveFromCatalog, onToggleMainMode,
}: SDKatProps) {
  const [sub, setSub] = useState<SDKatScreen>('hub');

  const mainCount = catalogGatos.filter(g => g.inMainMode).length;

  return (
    <motion.div
      key="sdkat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {sub === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
                SDKat // CREATION HUB
              </span>
              <div className="w-6" />
            </div>

            <h2 className="text-3xl font-black italic tracking-tighter text-white text-center">
              SDKat
            </h2>
            <p className="text-xs font-mono text-slate-600 text-center">
              Crea, importa y hackea tus GATOS
            </p>

            {/* Sub-screen buttons */}
            <div className="space-y-3">
              {/* Catálogo */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSub('catalog')}
                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-amber-500/50 transition-all group"
              >
                <BookOpen className="w-6 h-6 text-slate-600 group-hover:text-amber-400 transition-colors" />
                <div className="text-left flex-1">
                  <span className="text-sm font-black tracking-wider text-white block">CATÁLOGO</span>
                  <span className="text-[10px] font-mono text-slate-600 block">
                    {catalogGatos.length} gato{catalogGatos.length !== 1 ? 's' : ''}
                    {mainCount > 0 && ` · ${mainCount} en MAIN`}
                  </span>
                </div>
              </motion.button>

              {/* GATO Editor */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSub('editor')}
                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-indigo-500/50 transition-all group"
              >
                <Package className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                <div className="text-left flex-1">
                  <span className="text-sm font-black tracking-wider text-white block">CREAR GATO</span>
                  <span className="text-[10px] font-mono text-slate-600 block">Editor de cartas con preview</span>
                </div>
              </motion.button>

              {/* Import */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSub('import')}
                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-cyan-500/50 transition-all group"
              >
                <Download className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                <div className="text-left flex-1">
                  <span className="text-sm font-black tracking-wider text-white block">IMPORTAR</span>
                  <span className="text-[10px] font-mono text-slate-600 block">Leer GatoCard desde .PNG</span>
                </div>
              </motion.button>

              {/* HAKZ Editor */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSub('hakz')}
                className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-green-500/50 transition-all group"
              >
                <Terminal className="w-6 h-6 text-slate-600 group-hover:text-green-400 transition-colors" />
                <div className="text-left flex-1">
                  <span className="text-sm font-black tracking-wider text-white block">HAKZ EDITOR</span>
                  <span className="text-[10px] font-mono text-slate-600 block">Crear hacks para Black Market</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {sub === 'catalog' && (
          <GatoCatalog
            gatos={catalogGatos}
            onBack={() => setSub('hub')}
            onPlayCard={(card) => {
              onImportGato(card);
              onPlayCard(card);
            }}
            onToggleMain={onToggleMainMode}
            onRemove={onRemoveFromCatalog}
          />
        )}

        {sub === 'editor' && (
          <CardEditor
            onBack={() => setSub('hub')}
            onPlayCard={(card) => {
              onImportGato(card);
              onPlayCard(card);
            }}
            onSaveToCatalog={onSaveToCatalog}
          />
        )}

        {sub === 'import' && (
          <CardImport
            onBack={() => setSub('hub')}
            onPlayCard={(card) => {
              onImportGato(card);
              onPlayCard(card);
            }}
          />
        )}

        {sub === 'hakz' && (
          <HakzEditor
            onBack={() => setSub('hub')}
            onImport={onImport}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
