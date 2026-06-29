'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES } from '../config/themes';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const { themeColor, setThemeColor } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-white shadow-sm dark:bg-black">
      <Palette className="w-4 h-4 text-muted-foreground" />
      <select
        value={themeColor}
        onChange={(e) => setThemeColor(e.target.value as any)}
        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer border-none py-1"
      >
        {THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}
