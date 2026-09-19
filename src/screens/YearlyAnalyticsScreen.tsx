import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import {
  calculateYearTotal,
  calculateMonthlyAverage,
  calculateCategoryBreakdown,
  getMonthlySpendingPoints,
} from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart';
import { CategoryBreakdownView } from '../components/charts/CategoryBreakdownView';
import { EmptyState } from '../components/common/EmptyState';
import { ChevronLeft, ChevronRight, TrendingUp, CalendarDays, Award } from 'lucide-react';

import { AnimatedNumber } from '../components/common/AnimatedNumber';

export const YearlyAnalyticsScreen: React.FC<{ onOpenAddExpense: () => void }> = ({
  onOpenAddExpense,
}) => {
  const { expenses, categories } = useExpenses();
  const { currency } = useSettings();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [slideDirection, setSlideDirection] = useState<'prev' | 'next' | 'none'>('none');

  const handlePrevYear = () => {
    setSlideDirection('prev');
    setSelectedYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setSlideDirection('next');
    setSelectedYear((y) => y + 1);
  };

  const handleResetCurrentYear = () => {
    setSlideDirection('none');
    setSelectedYear(now.getFullYear());
  };

  const yearPrefix = `${selectedYear}-`;
  const yearExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(yearPrefix));
  }, [expenses, yearPrefix]);

  const yearTotal = useMemo(() => {
    return calculateYearTotal(expenses, selectedYear);
  }, [expenses, selectedYear]);

  const monthlyAverage = useMemo(() => {
    return calculateMonthlyAverage(expenses, selectedYear, now);
  }, [expenses, selectedYear, now]);

  const monthlyPoints = useMemo(() => {
    return getMonthlySpendingPoints(expenses, selectedYear);
  }, [expenses, selectedYear]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(yearExpenses, categories);
  }, [yearExpenses, categories]);

  const peakMonth = useMemo(() => {
    const sorted = [...monthlyPoints].filter((p) => p.amount > 0).sort((a, b) => b.amount - a.amount);
    return sorted[0] || null;
  }, [monthlyPoints]);

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3">
      {/* Year Switcher */}
      <div className="flex items-center justify-between glass-panel p-2 rounded-2xl">
        <button
          type="button"
          onClick={handlePrevYear}
          className="w-10 h-10 rounded-xl glass-button flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Previous Year"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center cursor-pointer px-2" onClick={handleResetCurrentYear} title="Current Year">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {selectedYear} Overview
          </h3>
          {selectedYear !== now.getFullYear() && (
            <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
              Tap for Current Year
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextYear}
          className="w-10 h-10 rounded-xl glass-button flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Next Year"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Year Data Feed with Directional Slide */}
      <div
        key={yearPrefix}
        className={
          slideDirection === 'next'
            ? 'animate-slide-in-right space-y-3'
            : slideDirection === 'prev'
            ? 'animate-slide-in-left space-y-3'
            : 'animate-fade-slide-up space-y-3'
        }
      >
        {yearTotal === 0 ? (
          <EmptyState
            title="No spending data for this period"
            description={`You have not logged any expenses in ${selectedYear}.`}
            actionText="Add Expense"
            onAction={onOpenAddExpense}
          />
        ) : (
          <>
            {/* Summary Figures Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Total Annual Spending */}
              <div className="p-3.5 rounded-2xl glass-panel">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Total Spent
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp size={13} />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold tabular-nums tracking-tight text-neutral-900 dark:text-white">
                  <AnimatedNumber value={yearTotal} currencyCode={currency.code} />
                </h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                  Full year {selectedYear}
                </p>
              </div>

              {/* Monthly Average */}
              <div className="p-3.5 rounded-2xl glass-panel">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Monthly Avg
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <CalendarDays size={13} />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold tabular-nums tracking-tight text-neutral-900 dark:text-white">
                  <AnimatedNumber value={monthlyAverage} currencyCode={currency.code} />
                </h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                  / month average
                </p>
              </div>
            </div>

            {/* Peak Month Callout */}
            {peakMonth && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Award size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-amber-200">
                      Highest: {peakMonth.monthName} ({formatCurrency(peakMonth.amount, currency.code)})
                    </p>
                    <p className="text-[10px] text-amber-400/80">
                      {peakMonth.count} records logged
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 12-Month Bar Chart */}
            <MonthlyBarChart points={monthlyPoints} year={selectedYear} />

            {/* Yearly Category Breakdown */}
            <CategoryBreakdownView
              breakdown={categoryBreakdown}
              title={`${selectedYear} Spending by Category`}
            />
          </>
        )}
      </div>
    </div>
  );
};
