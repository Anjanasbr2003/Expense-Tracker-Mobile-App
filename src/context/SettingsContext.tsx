import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings, ThemeMode, CurrencyConfig } from '../types';
import { getCurrencyConfig } from '../utils/currency';
import { db, initializeDatabase } from '../db/database';

interface SettingsContextValue {
  settings: AppSettings;
  currency: CurrencyConfig;
  setCurrencyCode: (code: string) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setMonthlyBudget: (amount: number) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  completeOnboarding: (name: string, monthlyBudget: number, currencyCode?: string) => Promise<void>;
  isDark: boolean;
}

const defaultSettings: AppSettings = {
  currencyCode: 'LKR',
  theme: 'system',
  defaultMonthlyBudget: 60000,
  hasLoadedInitialData: false,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Check localStorage fallback for instant flash-free loading
    try {
      const saved = localStorage.getItem('spendwise_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultSettings;
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load persisted settings from Dexie on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initializeDatabase();
        const record = await db.settings.get('app_settings');
        if (record && record.value && mounted) {
          setSettings(record.value);
        }
      } catch (err) {
        console.error('Failed to load settings from DB:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateThemeState = () => {
      let darkActive = false;
      if (settings.theme === 'dark') {
        darkActive = true;
      } else if (settings.theme === 'light') {
        darkActive = false;
      } else {
        darkActive = mediaQuery.matches;
      }

      setIsDark(darkActive);
      if (darkActive) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateThemeState();
    mediaQuery.addEventListener('change', updateThemeState);
    return () => mediaQuery.removeEventListener('change', updateThemeState);
  }, [settings.theme]);

  // Helper to persist settings
  const persistSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('spendwise_settings', JSON.stringify(newSettings));
      await db.settings.put({ key: 'app_settings', value: newSettings });
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const setCurrencyCode = async (code: string) => {
    const updated = { ...settings, currencyCode: code };
    await persistSettings(updated);
  };

  const setTheme = async (theme: ThemeMode) => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let darkActive = false;
    if (theme === 'dark') darkActive = true;
    else if (theme === 'light') darkActive = false;
    else darkActive = mediaQuery.matches;

    if (darkActive) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setIsDark(darkActive);

    const updated = { ...settings, theme };
    await persistSettings(updated);
  };

  const setMonthlyBudget = async (amount: number) => {
    const updated = { ...settings, defaultMonthlyBudget: amount };
    await persistSettings(updated);
  };

  const setUserName = async (name: string) => {
    const updated = { ...settings, userName: name.trim() };
    await persistSettings(updated);
  };

  const completeOnboarding = async (name: string, monthlyBudget: number, currencyCode?: string) => {
    const updated: AppSettings = {
      ...settings,
      userName: name.trim(),
      defaultMonthlyBudget: monthlyBudget,
      currencyCode: currencyCode || settings.currencyCode,
      hasCompletedOnboarding: true,
    };
    await persistSettings(updated);
  };

  const currency = getCurrencyConfig(settings.currencyCode);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        currency,
        setCurrencyCode,
        setTheme,
        setMonthlyBudget,
        setUserName,
        completeOnboarding,
        isDark,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
