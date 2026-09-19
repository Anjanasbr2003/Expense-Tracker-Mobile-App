import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Expense, Category } from '../types';
import { db, initializeDatabase } from '../db/database';
import { loadDemoData, clearDemoData, countDemoData } from '../db/demoData';
import { calculateTodayTotal, calculateMonthTotal, calculateYearTotal } from '../utils/calculations';

interface ExpenseContextValue {
  expenses: Expense[];
  categories: Category[];
  isLoading: boolean;
  demoCount: number;
  todayTotal: number;
  thisMonthTotal: number;
  thisYearTotal: number;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  loadDemo: () => Promise<number>;
  clearDemo: () => Promise<number>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [demoCount, setDemoCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      await initializeDatabase();
      const allExpenses = await db.expenses.toArray();
      // Sort newest first by default
      allExpenses.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.time || '').localeCompare(a.time || '') || b.createdAt - a.createdAt;
      });

      const allCategories = await db.categories.toArray();
      const dCount = await countDemoData();

      setExpenses(allExpenses);
      setCategories(allCategories);
      setDemoCount(dCount);
    } catch (error) {
      console.error('Failed to load expenses/categories from IndexedDB:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addExpense = async (
    data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Expense> => {
    const now = Date.now();
    const newExpense: Expense = {
      ...data,
      id: `exp-${now}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    await db.expenses.add(newExpense);
    await refreshData();
    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>): Promise<void> => {
    const existing = await db.expenses.get(id);
    if (!existing) {
      throw new Error(`Expense with id ${id} not found`);
    }

    const updated: Expense = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.expenses.put(updated);
    await refreshData();
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await db.expenses.delete(id);
    await refreshData();
  };

  const addCategory = async (
    categoryData: Omit<Category, 'id' | 'createdAt'>
  ): Promise<Category> => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-custom-${Date.now()}`,
      createdAt: Date.now(),
    };

    await db.categories.add(newCategory);
    await refreshData();
    return newCategory;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const cat = await db.categories.get(id);
    if (cat?.isDefault) {
      throw new Error('Default categories cannot be deleted');
    }
    await db.categories.delete(id);
    await refreshData();
  };

  const loadDemo = async (): Promise<number> => {
    const count = await loadDemoData();
    await refreshData();
    return count;
  };

  const clearDemo = async (): Promise<number> => {
    const count = await clearDemoData();
    await refreshData();
    return count;
  };

  const clearAllData = async (): Promise<void> => {
    await db.expenses.clear();
    await refreshData();
  };

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  // Compute live dashboard totals
  const todayTotal = useMemo(() => {
    return calculateTodayTotal(expenses);
  }, [expenses]);

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return calculateMonthTotal(expenses, now.getFullYear(), now.getMonth() + 1);
  }, [expenses]);

  const thisYearTotal = useMemo(() => {
    const now = new Date();
    return calculateYearTotal(expenses, now.getFullYear());
  }, [expenses]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        isLoading,
        demoCount,
        todayTotal,
        thisMonthTotal,
        thisYearTotal,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        deleteCategory,
        loadDemo,
        clearDemo,
        clearAllData,
        refreshData,
        getCategoryById,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export function useExpenses(): ExpenseContextValue {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
