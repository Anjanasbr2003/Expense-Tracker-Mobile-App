import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings, ThemeMode, CurrencyConfig } from '../types';
import { getCurrencyConfig } from '../utils/currency';
import { db, initializeDatabase } from '../db/database';

interface SettingsContextValue {
  settings: AppSettings;
  currency: CurrencyConfig;
  currentMonthBudget: number;
  setCurrencyCode: (code: string) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setMonthlyBudget: (amount: number) => Promise<void>;
  updateMonthBudget: (
    amount: number,
    targetYear?: number,
    targetMonth?: number,
    setAsDefault?: boolean
  ) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setDailyBudget: (amount: number) => Promise<void>;
  setWeeklyBudget: (amount: number) => Promise<void>;
  setLanguage: (lang: 'en' | 'si') => Promise<void>;
  completeOnboarding: (name: string, monthlyBudget: number, currencyCode?: string) => Promise<void>;
  completeWalkthrough: () => Promise<void>;
  shouldPromptMonthlyBudget: boolean;
  dismissMonthlyBudgetPrompt: () => Promise<void>;
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

  const [currentMonthBudget, setCurrentMonthBudget] = useState<number>(
    settings.defaultMonthlyBudget || 60000
  );

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load persisted settings & active month budget from Dexie on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initializeDatabase();
        const record = await db.settings.get('app_settings');
        if (record && record.value && mounted) {
          setSettings(record.value);
        }

        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const budgetRecord = await db.budgets.get(currentMonthKey);

        if (budgetRecord && budgetRecord.amount > 0 && mounted) {
          setCurrentMonthBudget(budgetRecord.amount);
        } else {
          const fallback =
            record?.value?.defaultMonthlyBudget || settings.defaultMonthlyBudget || 60000;
          if (mounted) {
            setCurrentMonthBudget(fallback);
          }
          if (record?.value?.hasCompletedOnboarding) {
            await db.budgets.put({
              id: currentMonthKey,
              year: now.getFullYear(),
              month: now.getMonth() + 1,
              amount: fallback,
              updatedAt: Date.now(),
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings/budgets from DB:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Update lang attribute on HTML element
  useEffect(() => {
    document.documentElement.lang = settings.language || 'en';
  }, [settings.language]);

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
        root.style.backgroundColor = '#030805';
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.backgroundColor = '#f8fafc';
        root.style.colorScheme = 'light';
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
      root.style.backgroundColor = '#030805';
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
      root.style.colorScheme = 'light';
    }
    setIsDark(darkActive);

    const updated = { ...settings, theme };
    await persistSettings(updated);
  };

  const setMonthlyBudget = async (amount: number) => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const updated = { ...settings, defaultMonthlyBudget: amount };
    await persistSettings(updated);
    await db.budgets.put({
      id: currentMonthKey,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      amount,
      updatedAt: Date.now(),
    });
    setCurrentMonthBudget(amount);
  };

  const updateMonthBudget = async (
    amount: number,
    targetYear?: number,
    targetMonth?: number,
    setAsDefault?: boolean
  ) => {
    const now = new Date();
    const y = targetYear ?? now.getFullYear();
    const m = targetMonth ?? now.getMonth() + 1;
    const monthKey = `${y}-${String(m).padStart(2, '0')}`;

    await db.budgets.put({
      id: monthKey,
      year: y,
      month: m,
      amount,
      updatedAt: Date.now(),
    });

    const isCurrentMonth = y === now.getFullYear() && m === now.getMonth() + 1;
    if (isCurrentMonth) {
      setCurrentMonthBudget(amount);
    }

    const updated: AppSettings = {
      ...settings,
      lastBudgetPromptMonth: monthKey,
      ...(setAsDefault ? { defaultMonthlyBudget: amount } : {}),
    };
    await persistSettings(updated);
  };

  const setUserName = async (name: string) => {
    const updated = { ...settings, userName: name.trim() };
    await persistSettings(updated);
  };

  const setDailyBudget = async (amount: number) => {
    const updated = { ...settings, defaultDailyBudget: amount };
    await persistSettings(updated);
  };

  const setWeeklyBudget = async (amount: number) => {
    const updated = { ...settings, defaultWeeklyBudget: amount };
    await persistSettings(updated);
  };

  const setLanguage = async (lang: 'en' | 'si') => {
    const updated = { ...settings, language: lang };
    await persistSettings(updated);
  };

  const completeOnboarding = async (name: string, monthlyBudget: number, currencyCode?: string) => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const updated: AppSettings = {
      ...settings,
      userName: name.trim(),
      defaultMonthlyBudget: monthlyBudget,
      currencyCode: currencyCode || settings.currencyCode,
      hasCompletedOnboarding: true,
      lastBudgetPromptMonth: currentMonthKey,
    };
    await persistSettings(updated);

    // Save as this month's budget in Dexie
    await db.budgets.put({
      id: currentMonthKey,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      amount: monthlyBudget,
      updatedAt: Date.now(),
    });
    setCurrentMonthBudget(monthlyBudget);
  };

  const completeWalkthrough = async () => {
    const updated = { ...settings, hasCompletedWalkthrough: true };
    await persistSettings(updated);
  };

  // Should prompt user on the 1st day of every month (or first launch of a new month) if not yet answered for this month
  const shouldPromptMonthlyBudget = Boolean(
    settings.hasCompletedOnboarding &&
      (() => {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        // If already prompted or budget confirmed for this month, do not prompt again
        if (settings.lastBudgetPromptMonth === currentMonthKey) {
          return false;
        }
        return true;
      })()
  );

  const dismissMonthlyBudgetPrompt = async () => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const updated = { ...settings, lastBudgetPromptMonth: currentMonthKey };
    await persistSettings(updated);
  };

  const currency = getCurrencyConfig(settings.currencyCode);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        currency,
        currentMonthBudget,
        setCurrencyCode,
        setTheme,
        setMonthlyBudget,
        updateMonthBudget,
        setUserName,
        setDailyBudget,
        setWeeklyBudget,
        setLanguage,
        completeOnboarding,
        completeWalkthrough,
        shouldPromptMonthlyBudget,
        dismissMonthlyBudgetPrompt,
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
