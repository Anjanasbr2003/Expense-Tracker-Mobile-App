import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { ExpenseItem } from '../components/expense/ExpenseItem';
import { BudgetCard } from '../components/budget/BudgetCard';
import type { Expense } from '../types';
import { Plus, ArrowRight, TrendingUp } from 'lucide-react';

import { AnimatedNumber } from '../components/common/AnimatedNumber';

interface DashboardScreenProps {
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onNavigateToHistory: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenAddExpense,
  onEditExpense,
  onNavigateToHistory,
}) => {
  const { expenses, categories, todayTotal, thisMonthTotal, isLoading } = useExpenses();
  const { currency } = useSettings();

  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'short' });
  const recentExpenses = expenses.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col justify-between p-3.5 overflow-hidden select-none">
      {/* Top Section: Overview & Budget */}
      <div className="space-y-2.5">
        {/* 1. Month Hero Spending Card (Apple Glass Panel) */}
        <div className="p-3.5 rounded-2xl glass-panel flex items-center justify-between animate-fade-slide-up">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {monthName} Spending
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              <AnimatedNumber value={thisMonthTotal} currencyCode={currency.code} />
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span>Today: <strong className="tabular-nums text-neutral-900 dark:text-neutral-200 font-semibold"><AnimatedNumber value={todayTotal} currencyCode={currency.code} /></strong></span>
              <span>•</span>
              <span>{expenses.length} records</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="w-10 h-10 rounded-2xl glass-button text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={20} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* 2. Compact Monthly Budget Strip */}
        <div className="animate-fade-slide-up stagger-1">
          <BudgetCard spentAmount={thisMonthTotal} />
        </div>

        {/* 3. Big User-Friendly Apple Glass Action Button */}
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="w-full py-3 px-4 rounded-2xl glass-button hover:border-emerald-500/40 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-between active:scale-[0.97] transition-all cursor-pointer group animate-fade-slide-up stagger-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg glass-button-primary text-black flex items-center justify-center">
              <Plus size={16} strokeWidth={2.6} />
            </div>
            <span className="text-xs font-bold tracking-tight">Record New Expense</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Fast entry</span>
            <ArrowRight size={12} />
          </span>
        </button>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="pt-2 flex-1 flex flex-col justify-end min-h-0 animate-fade-slide-up stagger-3">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Recent Transactions
            </span>
            {expenses.length > 0 && (
              <span className="text-[10px] text-neutral-500 tabular-nums font-semibold">
                ({expenses.length})
              </span>
            )}
          </div>

          {expenses.length > 0 && (
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-0.5 active:scale-95 transition-transform cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {/* Expense Rows or Empty State */}
        {expenses.length === 0 && !isLoading ? (
          <div className="p-4 rounded-2xl glass-panel text-center flex flex-col items-center justify-center animate-fade-slide-up">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              No transactions logged yet
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Tap above to add your first expense or load demo data in Settings.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentExpenses.map((exp, idx) => {
              const category = categories.find((c) => c.id === exp.categoryId);
              return (
                <div
                  key={exp.id}
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${(idx + 1) * 40}ms` }}
                >
                  <ExpenseItem
                    expense={exp}
                    category={category}
                    onEdit={onEditExpense}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
