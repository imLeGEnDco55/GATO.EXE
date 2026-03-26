import type { Hack, HackRarity } from '../types';

export type HackEffectId = 'extra-life' | 'reveal-cpu' | 'double-credits' | 'steal-credits' | 'force-tie';

export interface CustomHackData {
  id: string; // unique hash or UUID
  name: string;
  description: string;
  creator: string;
  effectId: HackEffectId;
  color: string; // hex color for card styling
  emoji: string;
}

export const HACK_EFFECTS: Record<HackEffectId, { name: string; description: string; rarity: HackRarity; price: number }> = {
  'extra-life': { name: '1-UP', description: 'El empate cuenta como victoria en la próxima serie', rarity: 'common', price: 2000 },
  'reveal-cpu': { name: 'WallHack', description: 'Revela la siguiente jugada de la CPU', rarity: 'rare', price: 3500 },
  'double-credits': { name: 'Money Dupe', description: 'Duplica las recompensas del próximo ciclo', rarity: 'legendary', price: 5000 },
  'steal-credits': { name: 'Siphon', description: 'Roba 500¢ al ganar una ronda', rarity: 'rare', price: 3000 },
  'force-tie': { name: 'RootKit', description: 'Fuerza un empate si vas a perder (1 uso)', rarity: 'legendary', price: 6000 },
};

export function validateCustomHack(data: any): data is CustomHackData {
  if (!data || typeof data !== 'object') return false;
  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.description === 'string' &&
    typeof data.creator === 'string' &&
    typeof data.color === 'string' &&
    typeof data.emoji === 'string' &&
    typeof data.effectId === 'string' &&
    data.effectId in HACK_EFFECTS
  );
}

export function customHackToHack(custom: CustomHackData): Hack {
  const effect = HACK_EFFECTS[custom.effectId];
  return {
    id: custom.id,
    name: custom.name,
    description: custom.description,
    price: effect.price,
    rarity: effect.rarity,
    emoji: custom.emoji,
  };
}
