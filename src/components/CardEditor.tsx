import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { GatoCard } from '../sdk/gatoCard';
import { createBlankCard, MODIFIER_LABELS } from '../sdk/gatoCard';
import { renderCard, exportCardAsFile } from '../sdk/cardRenderer';

interface CardEditorProps {
  onBack: () => void;
  onPlayCard: (card: GatoCard) => void;
  onSaveToCatalog?: (card: GatoCard) => void;
}

export function CardEditor({ onBack, onPlayCard, onSaveToCatalog }: CardEditorProps) {
  const [card, setCard] = useState<GatoCard>(createBlankCard());
  const previewRef = useRef<HTMLDivElement>(null);

  // Update preview on every card change
  useEffect(() => {
    if (!previewRef.current) return;
    const canvas = renderCard(card);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.borderRadius = '16px';
    previewRef.current.innerHTML = '';
    previewRef.current.appendChild(canvas);
  }, [card]);

  const updateField = <K extends keyof GatoCard>(key: K, val: GatoCard[K]) => {
    setCard(prev => ({ ...prev, [key]: val }));
  };

  const toggleModifier = (key: string) => {
    setCard(prev => ({
      ...prev,
      modifiers: {
        ...prev.modifiers,
        [key]: typeof prev.modifiers[key as keyof typeof prev.modifiers] === 'boolean'
          ? !prev.modifiers[key as keyof typeof prev.modifiers]
          : prev.modifiers[key as keyof typeof prev.modifiers],
      },
    }));
  };

  const setModNum = (key: string, val: number) => {
    setCard(prev => ({
      ...prev,
      modifiers: { ...prev.modifiers, [key]: val },
    }));
  };

  const handleExport = async () => {
    await exportCardAsFile({ ...card, createdAt: Date.now() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-[10px] font-mono text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
      >
        ← VOLVER
      </button>

      <h2 className="text-2xl font-black italic tracking-tighter text-white">SDKat EDITOR</h2>

      {/* Preview */}
      <div
        ref={previewRef}
        className="aspect-square w-full rounded-2xl border border-slate-800 overflow-hidden bg-black"
      />

      {/* Metadata */}
      <div className="space-y-3">
        <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
          <label className="text-[10px] font-mono text-slate-600 uppercase">Emoji</label>
          <input
            type="text"
            value={card.emoji}
            onChange={e => updateField('emoji', e.target.value.slice(0, 2))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center text-2xl w-16"
            maxLength={2}
          />

          <label className="text-[10px] font-mono text-slate-600 uppercase">Nombre</label>
          <input
            type="text"
            value={card.name}
            onChange={e => updateField('name', e.target.value.slice(0, 12).toUpperCase())}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase tracking-wider"
            maxLength={12}
            placeholder="CUSTOM"
          />

          <label className="text-[10px] font-mono text-slate-600 uppercase">Autor</label>
          <input
            type="text"
            value={card.author}
            onChange={e => updateField('author', e.target.value.slice(0, 20))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            maxLength={20}
            placeholder="Anon"
          />

          <label className="text-[10px] font-mono text-slate-600 uppercase">Desc</label>
          <input
            type="text"
            value={card.description}
            onChange={e => updateField('description', e.target.value.slice(0, 80))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
            maxLength={80}
          />

          <label className="text-[10px] font-mono text-slate-600 uppercase">Grid</label>
          <div className="flex gap-2">
            {([3, 4, 5] as const).map(size => (
              <button
                key={size}
                onClick={() => updateField('gridSize', size)}
                className={`px-4 py-2 rounded-xl font-mono font-black text-sm transition-all ${
                  card.gridSize === size
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modifiers Grid */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Modificadores</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MODIFIER_LABELS).map(([key, info]) => {
            const val = card.modifiers[key as keyof typeof card.modifiers];
            const isActive = val !== false && val !== 0;

            if (info.type === 'bool') {
              return (
                <button
                  key={key}
                  onClick={() => toggleModifier(key)}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-mono transition-all border ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-600'
                  }`}
                >
                  {info.emoji} {info.label}
                </button>
              );
            }

            // Numeric modifier
            return (
              <div
                key={key}
                className={`px-3 py-2 rounded-xl text-xs font-mono border flex items-center justify-between ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-600'
                }`}
              >
                <span>{info.emoji} {info.label}</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={val as number}
                  onChange={e => setModNum(key, Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-10 bg-transparent text-right text-white font-mono border-b border-slate-700 outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        {onSaveToCatalog && (
          <button
            onClick={() => onSaveToCatalog({ ...card, createdAt: Date.now() })}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg tracking-tighter transition-all active:scale-95 hover:bg-green-500"
          >
            GUARDAR AL CATÁLOGO 💾
          </button>
        )}
        <button
          onClick={handleExport}
          className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg tracking-tighter transition-all active:scale-95 hover:bg-indigo-400 hover:text-white"
        >
          EXPORTAR .PNG 📦
        </button>
        <button
          onClick={() => onPlayCard(card)}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-tighter transition-all active:scale-95"
        >
          JUGAR ESTE GATO ▶
        </button>
      </div>
    </motion.div>
  );
}
