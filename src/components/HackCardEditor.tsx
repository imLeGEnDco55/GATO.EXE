import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Play, Upload, Hash, Cpu, Bomb, ArrowLeft, RefreshCw, Layers, Zap, Hexagon } from 'lucide-react';
import type { GatoCard } from '../sdk/gatoCard';
import type { GatoModifiers } from '../types';
import { createBlankCard } from '../sdk/gatoCard';
import { renderCard } from '../sdk/cardRenderer';

interface HackCardEditorProps {
  onBack: () => void;
  onPlayCard: (card: GatoCard) => void;
}

export function HackCardEditor({ onBack, onPlayCard }: HackCardEditorProps) {
  const [card, setCard] = useState<GatoCard>(() => ({
    ...createBlankCard(),
    name: 'CUSTOM HACK',
    description: 'Bypass parameters...',
  }));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw canvas whenever card changes
  useEffect(() => {
    if (canvasRef.current) {
      const rendered = renderCard(card);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = rendered.width;
        canvasRef.current.height = rendered.height;
        ctx.drawImage(rendered, 0, 0);
      }
    }
  }, [card]);

  const exportCard = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(card, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `sdkat_${card.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataUrl);
    downloadAnchorNode.setAttribute("download", `sdkat_${card.name.toLowerCase().replace(/\s+/g, '_')}.png`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const updateCard = (updates: Partial<GatoCard>) => {
    setCard(prev => ({ ...prev, ...updates }));
  };

  const updateModifiers = (updates: Partial<GatoModifiers>) => {
    setCard(prev => ({
      ...prev,
      modifiers: { ...prev.modifiers, ...updates }
    }));
  };

  // No theme in GatoCard — colors handled by cardRenderer

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-slate-500">
          HACK CARD // SDKat
        </span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
        {/* Preview */}
        <div className="bg-[#111] p-6 rounded-3xl border border-slate-800 flex justify-center">
          <motion.canvas
            ref={canvasRef}
            width={300}
            height={420}
            className="w-full max-w-[240px] rounded-xl shadow-2xl shadow-black/50"
            whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
            style={{ transformStyle: 'preserve-3d' }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">IDENTIFICACIÓN</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={card.name}
                onChange={e => updateCard({ name: e.target.value })}
                className="w-full bg-[#111] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Nombre del Mod..."
                maxLength={20}
              />
              <textarea
                value={card.description}
                onChange={e => updateCard({ description: e.target.value })}
                className="w-full bg-[#111] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none custom-scrollbar"
                placeholder="Descripción del efecto..."
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">PARÁMETROS ENGINE</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Hash size={14} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">GRID</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="5"
                  value={card.gridSize}
                  onChange={e => updateCard({ gridSize: parseInt(e.target.value) as 3|4|5 })}
                  className="w-full"
                />
                <div className="text-right text-xs font-mono font-bold">{card.gridSize}x{card.gridSize}</div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Hexagon size={14} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">BLOCK</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={card.modifiers.blockedCells}
                  onChange={e => updateModifiers({ blockedCells: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-right text-xs font-mono font-bold">{card.modifiers.blockedCells}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-4 bg-[#111] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Cpu size={18} className={card.modifiers.gravity ? 'text-indigo-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold">Gravedad</span>
                </div>
                <input
                  type="checkbox"
                  checked={card.modifiers.gravity || false}
                  onChange={e => updateModifiers({ gravity: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-[#050505]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Zap size={18} className={card.modifiers.numeric ? 'text-yellow-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold">Modo Numérico</span>
                </div>
                <input
                  type="checkbox"
                  checked={card.modifiers.numeric || false}
                  onChange={e => updateModifiers({ numeric: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 text-yellow-500 focus:ring-0 focus:ring-offset-0 bg-[#050505]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Bomb size={18} className={card.modifiers.mine ? 'text-red-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold">Mina Oculta</span>
                </div>
                <input
                  type="checkbox"
                  checked={card.modifiers.mine || false}
                  onChange={e => updateModifiers({ mine: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 text-red-500 focus:ring-0 focus:ring-offset-0 bg-[#050505]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Layers size={18} className={card.modifiers.stealth ? 'text-fuchsia-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold">Stealth</span>
                </div>
                <input
                  type="checkbox"
                  checked={card.modifiers.stealth || false}
                  onChange={e => updateModifiers({ stealth: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 text-fuchsia-500 focus:ring-0 focus:ring-offset-0 bg-[#050505]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} className={card.modifiers.lag ? 'text-emerald-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold">Lag</span>
                </div>
                <input
                  type="checkbox"
                  checked={card.modifiers.lag || false}
                  onChange={e => updateModifiers({ lag: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#050505]"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">IDENTIDAD</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 block">EMOJI</label>
                <input
                  type="text"
                  value={card.emoji}
                  onChange={e => updateCard({ emoji: e.target.value })}
                  maxLength={2}
                  className="w-full bg-[#111] border border-slate-800 rounded-xl px-3 py-3 text-center text-2xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 block">AUTOR</label>
                <input
                  type="text"
                  value={card.author}
                  onChange={e => updateCard({ author: e.target.value })}
                  maxLength={12}
                  className="w-full bg-[#111] border border-slate-800 rounded-xl px-3 py-3 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 pb-4 mt-auto border-t border-slate-800/50 bg-[#050505] grid grid-cols-3 gap-3">
        <button
          onClick={exportImage}
          className="py-4 bg-[#111] text-white rounded-2xl font-bold text-xs tracking-wider transition-all active:scale-95 flex flex-col items-center justify-center gap-1 hover:bg-slate-800 border border-slate-800"
        >
          <Download size={16} />
          PNG
        </button>
        <button
          onClick={exportCard}
          className="py-4 bg-[#111] text-white rounded-2xl font-bold text-xs tracking-wider transition-all active:scale-95 flex flex-col items-center justify-center gap-1 hover:bg-slate-800 border border-slate-800"
        >
          <Upload size={16} />
          JSON
        </button>
        <button
          onClick={() => onPlayCard(card)}
          className="py-4 bg-white text-black rounded-2xl font-black text-xs tracking-wider transition-all active:scale-95 flex flex-col items-center justify-center gap-1 hover:bg-indigo-400 hover:text-white"
        >
          <Play size={16} className="fill-current" />
          TEST
        </button>
      </div>
    </motion.div>
  );
}
