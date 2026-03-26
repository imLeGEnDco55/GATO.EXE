import { useState, useCallback, useRef, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GatoCard } from '../sdk/gatoCard';
import { MODIFIER_LABELS } from '../sdk/gatoCard';
import { decodeCardFromPng } from '../sdk/pngCodec';

interface CardImportProps {
  onBack: () => void;
  onPlayCard: (card: GatoCard) => void;
}

export function CardImport({ onBack, onPlayCard }: CardImportProps) {
  const [card, setCard] = useState<GatoCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setCard(null);

    if (!file.type.startsWith('image/png')) {
      setError('Solo archivos .PNG');
      return;
    }

    const decoded = await decodeCardFromPng(file);
    if (!decoded) {
      setError('No se encontró GatoCard en este PNG');
      return;
    }

    setCard(decoded);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const activeModifiers = card
    ? Object.entries(card.modifiers)
        .filter(([, val]) => val !== false && val !== 0)
        .map(([key, val]) => {
          const info = MODIFIER_LABELS[key];
          if (!info) return null;
          return { key, info, val };
        })
        .filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="text-[10px] font-mono text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
      >
        ← VOLVER
      </button>

      <h2 className="text-2xl font-black italic tracking-tighter text-white">IMPORTAR GATO</h2>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
        }`}
      >
        {!card && (
          <>
            <span className="text-6xl mb-4">📦</span>
            <p className="text-sm font-mono text-slate-500">Arrastra un .gato.png aquí</p>
            <p className="text-[10px] font-mono text-slate-700 mt-2">o click para seleccionar</p>
          </>
        )}

        {/* Card Preview */}
        <AnimatePresence>
          {card && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 space-y-4"
            >
              <span className="text-7xl">{card.emoji}</span>
              <h3 className="text-2xl font-black tracking-wider text-white">{card.name}</h3>
              <p className="text-xs font-mono text-slate-500">{card.description}</p>
              <p className="text-[10px] font-mono text-slate-700">by @{card.author} // {card.gridSize}×{card.gridSize}</p>

              {/* Modifier badges */}
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {activeModifiers.map((m: any) => (
                  <span
                    key={m.key}
                    className="px-2 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-[10px] font-mono text-indigo-300"
                  >
                    {m.info.emoji} {m.info.label}
                    {typeof m.val === 'number' ? `: ${m.val}` : ''}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileRef}
          type="file"
          accept=".png,image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-mono text-rose-500 text-center">{error}</p>
      )}

      {/* Play Button */}
      {card && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onPlayCard(card)}
          className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg tracking-tighter transition-all active:scale-95 hover:bg-indigo-400 hover:text-white"
        >
          JUGAR {card.name} ▶
        </motion.button>
      )}
    </motion.div>
  );
}
