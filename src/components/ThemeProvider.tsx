import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, settingsAPI } from '../services/api';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light';
  });
  const [isDark, setIsDark] = useState(false);

  // Removed useEffect that was just syncing from localStorage on mount

  useEffect(() => {
    let cancelled = false;

    const syncFromBackend = async () => {
      if (!getAuthToken()) return;

      try {
        const settings = await settingsAPI.get();
        const backendTheme = settings?.theme as 'light' | 'dark' | 'system' | undefined;

        if (!cancelled && backendTheme && ['light', 'dark', 'system'].includes(backendTheme)) {
          setThemeState(backendTheme);
          localStorage.setItem('theme', backendTheme);
        }
      } catch {
        // Ignore settings sync errors; keep local theme.
      }
    };

    syncFromBackend();

    const handleTokenChanged = () => {
      syncFromBackend();
    };

    window.addEventListener('auth:token-changed', handleTokenChanged);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:token-changed', handleTokenChanged);
    };
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;

      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else {
        // system
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (getAuthToken()) {
      settingsAPI.update({ theme: newTheme }).catch(() => {
        // Ignore remote update errors; keep local theme.
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
