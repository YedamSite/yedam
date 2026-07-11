'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
    accent: '#CFA573',
    accentHover: '#D7B282',
    text: '#F3F4F6',
    background: '#08152F',
    card: 'rgba(15, 23, 42, 0.65)'
  },
  typography: {
    titleFont: 'Cormorant Garamond',
    bodyFont: 'Inter',
    baseSize: '16px'
  },
  logo_url: '/logo-yedam.png',
  favicon_url: '/favicon.ico'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: ThemeSettings }) {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme || DEFAULT_THEME);

  // Apply CSS variables to root element
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
    // Try to load custom theme from localStorage first if client side
    const saved = localStorage.getItem('yedam_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
        applyTheme(parsed);
      } catch (e) {
        applyTheme(theme);
      }
    } else {
      applyTheme(theme);
    }
  }, []);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme((prev) => {
      const updated = {
        ...prev,
        ...newTheme,
        colors: { ...prev.colors, ...newTheme.colors },
        typography: { ...prev.typography, ...newTheme.typography }
      } as ThemeSettings;
      localStorage.setItem('yedam_theme', JSON.stringify(updated));
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
