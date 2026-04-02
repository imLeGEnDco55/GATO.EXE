import { useState, useCallback, useEffect } from 'react';
import type { GatoCard } from '../sdk/gatoCard';
import type { CustomHackData } from '../lib/hackCard';

// ─── localStorage Keys ────────────────────────────────────────────
const LS_GATOS = 'gato-exe-catalog-gatos';
const LS_HAKZ  = 'gato-exe-catalog-hakz';

// ─── Helpers ──────────────────────────────────────────────────────

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useCatalog() {
  const [gatos, setGatos] = useState<GatoCard[]>(() => loadFromStorage<GatoCard>(LS_GATOS));
  const [hakz, setHakz]   = useState<CustomHackData[]>(() => loadFromStorage<CustomHackData>(LS_HAKZ));

  // Sync gatos to localStorage on change
  useEffect(() => {
    saveToStorage(LS_GATOS, gatos);
  }, [gatos]);

  // Sync hakz to localStorage on change
  useEffect(() => {
    saveToStorage(LS_HAKZ, hakz);
  }, [hakz]);

  // ── GATOS ─────────────────────────────────────────────────────

  const saveGato = useCallback((card: GatoCard) => {
    setGatos(prev => {
      const idx = prev.findIndex(g => g.id === card.id);
      if (idx >= 0) {
        // Update existing
        const next = [...prev];
        next[idx] = card;
        return next;
      }
      // Add new — default inMainMode to false
      return [...prev, { ...card, inMainMode: card.inMainMode ?? false }];
    });
  }, []);

  const removeGato = useCallback((id: string) => {
    setGatos(prev => prev.filter(g => g.id !== id));
  }, []);

  const toggleMainMode = useCallback((id: string) => {
    setGatos(prev =>
      prev.map(g =>
        g.id === id ? { ...g, inMainMode: !g.inMainMode } : g
      )
    );
  }, []);

  // ── HAKZ ──────────────────────────────────────────────────────

  const saveHack = useCallback((hack: CustomHackData) => {
    setHakz(prev => {
      const idx = prev.findIndex(h => h.id === hack.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = hack;
        return next;
      }
      return [...prev, hack];
    });
  }, []);

  const removeHack = useCallback((id: string) => {
    setHakz(prev => prev.filter(h => h.id !== id));
  }, []);

  // ── Derived ───────────────────────────────────────────────────

  const mainModeGatos = gatos.filter(g => g.inMainMode);

  return {
    catalogGatos: gatos,
    catalogHakz: hakz,
    mainModeGatos,
    saveGato,
    removeGato,
    toggleMainMode,
    saveHack,
    removeHack,
  };
}
