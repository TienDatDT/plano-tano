export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeColor = 'default' | 'matcha' | 'rose' | 'gold';

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
}

export const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'matcha', label: 'Matcha' },
  { id: 'rose', label: 'Rose' },
  { id: 'gold', label: 'Gold' }
] as const;
