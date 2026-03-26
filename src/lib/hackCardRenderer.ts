import { CustomHackData, HACK_EFFECTS } from './hackCard';

export async function renderHackCard(data: CustomHackData): Promise<string> {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Parse color hex and draw glow
  const r = parseInt(data.color.slice(1, 3), 16) || 0;
  const g = parseInt(data.color.slice(3, 5), 16) || 255;
  const b = parseInt(data.color.slice(5, 7), 16) || 255;

  const gradient = ctx.createRadialGradient(size/2, size/2, 50, size/2, size/2, 250);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Border
  ctx.strokeStyle = data.color;
  ctx.lineWidth = 12;
  ctx.strokeRect(16, 16, size - 32, size - 32);

  // Scanlines
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.05)`;
  for (let i = 0; i < size; i += 4) {
    ctx.fillRect(0, i, size, 2);
  }

  // Effect Name / Info
  const effect = HACK_EFFECTS[data.effectId];

  // Draw Emoji
  ctx.font = '120px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.emoji, size / 2, size / 2 - 60);

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(data.name.toUpperCase(), size / 2, size / 2 + 60);

  // Creator
  ctx.fillStyle = data.color;
  ctx.font = '18px monospace';
  ctx.fillText(`by ${data.creator}`, size / 2, size / 2 + 100);

  // Rarity Badge
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
  ctx.fillRect(size / 2 - 80, size / 2 + 130, 160, 30);
  ctx.fillStyle = data.color;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(effect.rarity.toUpperCase(), size / 2, size / 2 + 152);

  return canvas.toDataURL('image/png');
}
