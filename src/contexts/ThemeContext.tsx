'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  accentHover: string;
  text: string;
  background: string;
  card: string;
}

export interface ThemeTypography {
  titleFont: string;
  bodyFont: string;
  baseSize: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  typography: ThemeTypography;
  logo_url: string;
  favicon_url: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
}

const DEFAULT_THEME: ThemeSettings = {
  colors: {
    primary: '#08152F',
    secondary: '#091731',
    accent: '#C9C9C9',
    accentHover: '#C9C9C9',
    text: '#F3F4F6',
    background: '#08152F',
    card: 'rgba(15, 23, 42, 0.65)'
  },
  typography: {
    titleFont: 'Cormorant Garamond',
    bodyFont: 'Inter',
    baseSize: '16px'
  },
  logo_url: '/images/logo.webp',
  favicon_url: '/favicon.ico'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: ThemeSettings }) {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme || DEFAULT_THEME);

  const applyTheme = (t: ThemeSettings) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', t.colors.primary);
    root.style.setProperty('--secondary-color', t.colors.secondary);
    root.style.setProperty('--accent-color', t.colors.accent);
    root.style.setProperty('--accent-hover', t.colors.accentHover);
    root.style.setProperty('--text-color', t.colors.text);
    root.style.setProperty('--background-color', t.colors.background);
    root.style.setProperty('--card-color', t.colors.card);
  };

  useEffect(() => {
    db.init();

    const settings = db.get('system_settings');
    const dbTheme = settings?.visual_theme;
    const saved = localStorage.getItem('cheotnun_theme');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const oldGold = ['#CFA573', '#D7B282', '#D4AF37', '#E2C974'];
        if (parsed.colors && oldGold.includes(parsed.colors.accent?.toUpperCase())) {
          parsed.colors.accent = '#C9C9C9';
          parsed.colors.accentHover = '#C9C9C9';
          localStorage.setItem('cheotnun_theme', JSON.stringify(parsed));
        }
        setTheme(parsed);
        applyTheme(parsed);
        return;
      } catch (e) {}
    }

    if (dbTheme) {
      const loadedTheme: ThemeSettings = {
        colors: {
          primary: dbTheme.colors?.primary || DEFAULT_THEME.colors.primary,
          secondary: dbTheme.colors?.secondary || DEFAULT_THEME.colors.secondary,
          accent: dbTheme.colors?.accent || DEFAULT_THEME.colors.accent,
          accentHover: dbTheme.colors?.accentHover || DEFAULT_THEME.colors.accentHover,
          text: dbTheme.colors?.text || DEFAULT_THEME.colors.text,
          background: dbTheme.colors?.background || DEFAULT_THEME.colors.background,
          card: dbTheme.colors?.card || DEFAULT_THEME.colors.card,
        },
        typography: dbTheme.typography || DEFAULT_THEME.typography,
        logo_url: dbTheme.logo_url || DEFAULT_THEME.logo_url,
        favicon_url: dbTheme.favicon_url || DEFAULT_THEME.favicon_url,
      };
      setTheme(loadedTheme);
      applyTheme(loadedTheme);
      return;
    }

    applyTheme(theme);
  }, []);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme((prev) => {
      const updated = {
        ...prev,
        ...newTheme,
        colors: { ...prev.colors, ...newTheme.colors },
        typography: { ...prev.typography, ...newTheme.typography }
      } as ThemeSettings;
      localStorage.setItem('cheotnun_theme', JSON.stringify(updated));

      const settings = db.get('system_settings');
      settings.visual_theme = {
        colors: updated.colors,
        typography: updated.typography,
        logo_url: updated.logo_url,
        favicon_url: updated.favicon_url,
      };
      db.save('system_settings', settings);

      applyTheme(updated);
      return updated;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
