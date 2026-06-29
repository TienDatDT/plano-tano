'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeColor } from '../config/themes';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('app-theme-color') as ThemeColor;
    if (savedTheme) {
      setThemeColor(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (themeColor === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeColor);
    }
    localStorage.setItem('app-theme-color', themeColor);
  }, [themeColor, mounted]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
