import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  resolvedTheme: 'light',
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'theme';

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'dark';
}

function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  const resolved = mode === 'system' ? getSystemPreference() : mode;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.style.colorScheme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const m = getStoredMode();
    return m === 'system' ? getSystemPreference() : m;
  });

  useEffect(() => {
    const resolved = applyTheme(mode);
    setResolvedTheme(resolved);
  }, [mode]);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = applyTheme('system');
      setResolvedTheme(resolved);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
