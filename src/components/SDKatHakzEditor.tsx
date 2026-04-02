import React, { useState, useEffect } from 'react';
import { Terminal, Download, ArrowLeft, Upload } from 'lucide-react';
import { CustomHackData, HACK_EFFECTS, HackEffectId } from '../lib/hackCard';
import { renderHackCard } from '../lib/hackCardRenderer';
import { encodeHackToPng, decodeHackFromPng } from '../lib/pngCodec';

interface SDKatProps {
  onBack: () => void;
  onImport: (hack: CustomHackData) => void;
}

export function SDKat({ onBack, onImport }: SDKatProps) {
  const [data, setData] = useState<CustomHackData>({
    id: crypto.randomUUID(),
    name: 'MY HACK',
    description: 'Custom effect',
    creator: 'GUEST',
    effectId: 'extra-life',
    color: '#00ff00',
    emoji: '💀',
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    generatePreview();
  }, [data]);

  const generatePreview = async () => {
    try {
      const base64 = await renderHackCard(data);
      setPreviewUrl(base64);
      const encoded = await encodeHackToPng(base64, data);
      setDownloadUrl(encoded);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const hack = await decodeHackFromPng(file);
    if (hack) {
      setData({ ...hack, id: crypto.randomUUID() });
      alert('¡Hack cargado exitosamente!');
    } else {
      alert('Error: La imagen no contiene código SDKat válido o está corrupta.');
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff00] p-4 flex flex-col md:flex-row gap-8 font-mono overflow-y-auto">
      <div className="flex-1 space-y-6 max-w-xl mx-auto">
        <div className="flex items-center gap-4 border-b border-[#00ff00]/30 pb-4">
          <button onClick={onBack} className="hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ff00] to-emerald-500">
              [SDKat] EDITOR
            </h1>
          </div>
        </div>

        <div className="bg-black/50 border border-[#00ff00]/30 p-6 rounded-lg space-y-4 shadow-xl">
          <div>
            <label className="block text-sm mb-1 text-[#00ff00]/70">HACK_NAME</label>
            <input
              type="text"
              maxLength={15}
              value={data.name}
              onChange={e => setData(d => ({...d, name: e.target.value}))}
              className="w-full bg-black border border-[#00ff00]/30 p-2 focus:border-[#00ff00] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#00ff00]/70">PAYLOAD_DESC</label>
            <input
              type="text"
              maxLength={40}
              value={data.description}
              onChange={e => setData(d => ({...d, description: e.target.value}))}
              className="w-full bg-black border border-[#00ff00]/30 p-2 focus:border-[#00ff00] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-[#00ff00]/70">CREATOR_ID</label>
              <input
                type="text"
                maxLength={12}
                value={data.creator}
                onChange={e => setData(d => ({...d, creator: e.target.value}))}
                className="w-full bg-black border border-[#00ff00]/30 p-2 focus:border-[#00ff00] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#00ff00]/70">EMOJI_ICON</label>
              <input
                type="text"
                maxLength={2}
                value={data.emoji}
                onChange={e => setData(d => ({...d, emoji: e.target.value}))}
                className="w-full bg-black border border-[#00ff00]/30 p-2 focus:border-[#00ff00] focus:outline-none transition-colors text-center text-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-[#00ff00]/70">HEX_COLOR</label>
              <input
                type="color"
                value={data.color}
                onChange={e => setData(d => ({...d, color: e.target.value}))}
                className="w-full h-10 bg-black border border-[#00ff00]/30 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#00ff00]/70">ROOT_EFFECT</label>
              <select
                value={data.effectId}
                onChange={e => setData(d => ({...d, effectId: e.target.value as HackEffectId}))}
                className="w-full bg-black border border-[#00ff00]/30 p-2 h-10 focus:border-[#00ff00] focus:outline-none"
              >
                {Object.entries(HACK_EFFECTS).map(([id, fx]) => (
                  <option key={id} value={id}>{fx.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <label className="flex-1 flex justify-center items-center gap-2 border border-[#00ff00]/30 hover:border-[#00ff00] py-3 cursor-pointer transition-all hover:bg-[#00ff00]/10 text-sm font-bold tracking-wider">
              <Upload className="w-4 h-4" />
              INJECT_PNG
              <input type="file" accept="image/png" className="hidden" onChange={handleUpload} />
            </label>
            <button 
              onClick={() => {
                onImport(data);
                onBack();
              }}
              className="flex-1 border border-blue-500/50 hover:border-blue-500 py-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all font-bold tracking-widest text-sm"
            >
              LOAD_TO_DECK
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#00ff00]/10 pt-8 pd:pt-0 pl-0 md:pl-8">
        <div className="mb-4 text-sm text-[#00ff00]/50 tracking-widest uppercase">Visual Preview</div>
        <div className="relative group p-4">
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Hack Preview" 
              className="w-full max-w-[400px] aspect-square border-2 border-transparent group-hover:border-[#00ff00]/50 transition-all rounded shadow-2xl shadow-[#00ff00]/10 object-contain"
            />
          )}
          
          <a
            href={downloadUrl}
            download={`${data.name.replace(/\s+/g, '_')}_sdk.png`}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#00ff00] text-black px-6 py-2 rounded-full font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 shadow-lg shadow-[#00ff00]/50"
          >
            <Download className="w-4 h-4" />
            COMPILE
          </a>
        </div>
        <p className="mt-8 text-xs text-center text-[#00ff00]/30 max-w-xs leading-relaxed hidden md:block">
          La imagen exportada contiene esteganografía con el código del hack. 
          Compártela para que otros puedan inyectarla en su terminal.
        </p>
      </div>
    </div>
  );
}
