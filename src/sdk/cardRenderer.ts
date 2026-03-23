import type { GatoCard } from './gatoCard';
import { MODIFIER_LABELS } from './gatoCard';

/**
 * Render a GatoCard as a 512×512 canvas image.
 * Retro-terminal aesthetic matching the game.
 */
export function renderCard(card: GatoCard): HTMLCanvasElement {
  const SIZE = 512;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  // Background — dark with subtle grid
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Grid lines (subtle)
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1;
  for (let i = 0; i < SIZE; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, SIZE);
    ctx.moveTo(0, i); ctx.lineTo(SIZE, i);
    ctx.stroke();
  }

  // Border
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, SIZE - 32, SIZE - 32);

  // Inner border accent
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, SIZE - 40, SIZE - 40);

  // Header bar
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(20, 20, SIZE - 40, 48);

  // "GATO.EXE" label
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GATO.EXE // SDKat', 32, 50);

  // Version badge
  ctx.fillStyle = '#000';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`v${card.v} // ${card.gridSize}×${card.gridSize}`, SIZE - 32, 50);

  // Emoji (big, centered)
  ctx.font = '96px serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.emoji, SIZE / 2, 170);

  // Name
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(card.name.toUpperCase().slice(0, 12), SIZE / 2, 220);

  // Description
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  const descLines = wrapText(card.description, 40);
  descLines.forEach((line, i) => {
    ctx.fillText(line, SIZE / 2, 248 + i * 16);
  });

  // Divider
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 290);
  ctx.lineTo(SIZE - 40, 290);
  ctx.stroke();

  // Active modifiers — show as compact list
  const activeModifiers = Object.entries(card.modifiers)
    .filter(([, val]) => val !== false && val !== 0)
    .map(([key, val]) => {
      const info = MODIFIER_LABELS[key];
      if (!info) return null;
      const display = typeof val === 'number' ? `${info.emoji} ${info.label}: ${val}` : `${info.emoji} ${info.label}`;
      return display;
    })
    .filter(Boolean) as string[];

  if (activeModifiers.length === 0) {
    ctx.fillStyle = '#334155';
    ctx.font = '12px monospace';
    ctx.fillText('// SIN MODIFICADORES', SIZE / 2, 320);
  } else {
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';
    const cols = 2;
    const colWidth = (SIZE - 80) / cols;
    activeModifiers.forEach((mod, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(mod, 40 + col * colWidth, 316 + row * 20);
    });
  }

  // Footer — author + ID
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, SIZE - 68, SIZE - 40, 48);

  ctx.fillStyle = '#475569';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`@${card.author}`, 32, SIZE - 42);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#334155';
  ctx.fillText(card.id, SIZE - 32, SIZE - 42);

  // Timestamp
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = '9px monospace';
  const date = new Date(card.createdAt).toISOString().split('T')[0];
  ctx.fillText(date, SIZE / 2, SIZE - 28);

  return canvas;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, 3); // max 3 lines
}

/**
 * Export a card as a downloadable PNG file
 */
export async function exportCardAsFile(card: GatoCard): Promise<void> {
  const { encodeCardToPng } = await import('./pngCodec');

  const canvas = renderCard(card);
  const imageBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(blob => resolve(blob!), 'image/png');
  });

  const finalBlob = await encodeCardToPng(imageBlob, card);

  // Trigger download
  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${card.name.toLowerCase().replace(/\s+/g, '-')}.gato.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
