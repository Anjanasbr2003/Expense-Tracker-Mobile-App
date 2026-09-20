export type ThemeMode = 'system' | 'light' | 'dark';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
  decimalDigits: number;
}

export interface AppSettings {
  currencyCode: string;
  theme: ThemeMode;
  defaultMonthlyBudget?: number;
  hasLoadedInitialData: boolean;
  userName?: string;
  hasCompletedOnboarding?: boolean;
  lastBudgetPromptMonth?: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  LKR: {
    code: 'LKR',
    symbol: 'Rs.',
    name: 'Sri Lankan Rupee',
    position: 'prefix',
    decimalDigits: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'prefix',
    decimalDigits: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'prefix',
    decimalDigits: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'prefix',
    decimalDigits: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    position: 'prefix',
    decimalDigits: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    position: 'prefix',
    decimalDigits: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    position: 'prefix',
    decimalDigits: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    position: 'prefix',
    decimalDigits: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    position: 'prefix',
    decimalDigits: 2,
  },
};
