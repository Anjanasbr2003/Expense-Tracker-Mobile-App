import type { Expense, Category } from '../types';
import { db } from '../db/database';
import { getTodayDateString } from './dateUtils';

export function exportExpensesToCSV(
  expenses: Expense[],
  categories: Category[],
  currencyCode: string = 'LKR'
): void {
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.id, c.name));

  const headers = ['Date', 'Time', 'Category', 'Amount', 'Currency', 'Payment Method', 'Note', 'ID'];
  const rows = expenses.map((e) => {
    const catName = categoryMap.get(e.categoryId) || 'Other';
    const noteEscaped = `"${(e.note || '').replace(/"/g, '""')}"`;
    return [
      e.date,
      e.time || '',
      `"${catName}"`,
      e.amount.toFixed(2),
      currencyCode,
      `"${e.paymentMethod}"`,
      noteEscaped,
      e.id,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `expenses-${getTodayDateString()}.csv`);
}

export async function exportAllDataToJSON(): Promise<void> {
  const expenses = await db.expenses.toArray();
  const categories = await db.categories.toArray();
  const budgets = await db.budgets.toArray();
  const settingsRecords = await db.settings.toArray();

  const backupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses,
    categories,
    budgets,
    settings: settingsRecords,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `expense-tracker-backup-${getTodayDateString()}.json`);
}

export async function importDataFromJSON(
  jsonString: string
): Promise<{ expensesCount: number; categoriesCount: number }> {
  const data = JSON.parse(jsonString);

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file format');
  }

  let expensesCount = 0;
  let categoriesCount = 0;

  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      if (cat.id && cat.name) {
        await db.categories.put(cat);
        categoriesCount++;
      }
    }
  }

  if (Array.isArray(data.expenses)) {
    for (const exp of data.expenses) {
      if (exp.id && typeof exp.amount === 'number' && exp.date) {
        await db.expenses.put(exp);
        expensesCount++;
      }
    }
  }

  if (Array.isArray(data.budgets)) {
    for (const b of data.budgets) {
      if (b.id) {
        await db.budgets.put(b);
      }
    }
  }

  if (Array.isArray(data.settings)) {
    for (const s of data.settings) {
      if (s.key) {
        await db.settings.put(s);
      }
    }
  }

  return { expensesCount, categoriesCount };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
