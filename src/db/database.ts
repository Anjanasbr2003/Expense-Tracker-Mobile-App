import Dexie, { type Table } from 'dexie';
import type { Expense, Category, MonthlyBudget, AppSettings } from '../types';
import { DEFAULT_CATEGORIES } from './initialData';

export interface SettingItem {
  key: string;
  value: any;
}

export class ExpenseTrackerDB extends Dexie {
  expenses!: Table<Expense, string>;
  categories!: Table<Category, string>;
  budgets!: Table<MonthlyBudget, string>;
  settings!: Table<SettingItem, string>;

  constructor() {
    super('ExpenseTrackerDB');

    this.version(1).stores({
      expenses: 'id, categoryId, date, paymentMethod, createdAt, isDemo',
      categories: 'id, name, isDefault, createdAt',
      budgets: 'id, year, month, [year+month]',
      settings: 'key',
    });
  }
}

export const db = new ExpenseTrackerDB();

// Initialize DB with defaults if needed
export async function initializeDatabase(): Promise<void> {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  } else {
    // Seamlessly backfill any new default categories for existing user databases
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db.categories.get(cat.id);
      if (!existing) {
        await db.categories.put(cat);
      }
    }
  }

  // Ensure initial settings record exists
  const existingSettings = await db.settings.get('app_settings');
  if (!existingSettings) {
    const defaultSettings: AppSettings = {
      currencyCode: 'LKR',
      theme: 'system',
      defaultMonthlyBudget: 50000,
      hasLoadedInitialData: true,
      hasCompletedOnboarding: false,
    };
    await db.settings.put({ key: 'app_settings', value: defaultSettings });
  }

  // Purge any legacy demo expenses so fresh deploys start 100% clean
  try {
    const demoItems = await db.expenses.filter((e) => e.isDemo === true).toArray();
    if (demoItems.length > 0) {
      await db.expenses.bulkDelete(demoItems.map((e) => e.id));
    }
  } catch (err) {
    console.error('Error purging demo records:', err);
  }
}
