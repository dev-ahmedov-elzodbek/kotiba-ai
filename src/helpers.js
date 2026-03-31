import { useState } from 'react';
import { COLORS } from './constants';

// ── localStorage helpers ──────────────────────────────────
export const LS = {
  get: (k, def = null) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : def;
    } catch { return def; }
  },
  set: (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};

// ── Theme hook ────────────────────────────────────────────
export function useTheme() {
  const [dark, setDark] = useState(() => LS.get('kotiba_dark', true));
  const toggle = () => setDark(d => { LS.set('kotiba_dark', !d); return !d; });
  const t = {
    dark,
    bg:     dark ? COLORS.bgDark     : COLORS.bgLight,
    card:   dark ? COLORS.cardDark   : COLORS.cardLight,
    card2:  dark ? COLORS.card2Dark  : COLORS.card2Light,
    text:   dark ? COLORS.textPrimary  : '#1C1C1E',
    text2:  dark ? COLORS.textSecondary: '#636366',
    border: dark ? COLORS.borderDark : COLORS.borderLight,
  };
  return { ...t, toggle };
}

// ── Formatters ────────────────────────────────────────────
export const fmt = (n, cur = 'UZS') => {
  if (cur === 'UZS') return n.toLocaleString('uz-UZ') + " so'm";
  return '$' + n.toLocaleString('en-US');
};

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
