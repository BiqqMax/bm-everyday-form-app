'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type ThemeState = {
  theme: Theme;
  persist: boolean;
};

const STORAGE_KEY = 'theme';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
}

function getInitialState(): ThemeState {
  if (typeof window === 'undefined') {
    return {
      theme: 'light',
      persist: false,
    };
  }

  const storedTheme = getStoredTheme();

  return {
    theme: storedTheme ?? getSystemTheme(),
    persist: storedTheme !== null,
  };
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(getInitialState);

  useEffect(() => {
    applyTheme(state.theme);

    if (typeof window === 'undefined' || !state.persist) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, state.theme);
  }, [state.theme, state.persist]);

  useEffect(() => {
    if (state.persist || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setState((currentState) =>
        currentState.persist ? currentState : { ...currentState, theme: event.matches ? 'dark' : 'light' },
      );
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [state.persist]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setState({
      theme: nextTheme,
      persist: true,
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setState((currentState) => ({
      theme: currentState.theme === 'dark' ? 'light' : 'dark',
      persist: true,
    }));
  }, []);

  const value = useMemo(
    () => ({
      theme: state.theme,
      setTheme,
      toggleTheme,
    }),
    [state.theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
