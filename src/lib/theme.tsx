import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface ChartPalette {
  profit: string;
  loss: string;
  line: string;
  accent: string;
  muted: string;
  grid: string;
  axis: string;
  /** พื้นหลัง tooltip */
  surface: string;
  series: string[];
}

const LIGHT: ChartPalette = {
  profit: '#059669',
  loss: '#e11d48',
  line: '#0f172a',
  accent: '#0d9488',
  muted: '#94a3b8',
  grid: '#e2e8f0',
  axis: '#64748b',
  surface: '#ffffff',
  series: ['#0d9488', '#7c3aed', '#ea580c', '#2563eb', '#db2777'],
};

const DARK: ChartPalette = {
  profit: '#34d399',
  loss: '#fb7185',
  line: '#f1f5f9',
  accent: '#2dd4bf',
  muted: '#64748b',
  grid: '#1e293b',
  axis: '#94a3b8',
  surface: '#0f172a',
  series: ['#2dd4bf', '#a78bfa', '#fb923c', '#60a5fa', '#f472b6'],
};

interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
  palette: ChartPalette;
}

const Ctx = createContext<ThemeCtx>({ dark: false, toggle: () => {}, palette: LIGHT });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    setDark((d) => {
      try {
        localStorage.setItem('theme', d ? 'light' : 'dark');
      } catch {
        // storage ไม่พร้อมใช้งาน: ธีมจะไม่ถูกจำ แต่ยังสลับได้
      }
      return !d;
    });
  };

  return <Ctx.Provider value={{ dark, toggle, palette: dark ? DARK : LIGHT }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

export function tooltipStyle(palette: ChartPalette) {
  return {
    contentStyle: { background: palette.surface, border: `1px solid ${palette.grid}`, borderRadius: 12, fontSize: 13 },
    labelStyle: { color: palette.axis },
  };
}
