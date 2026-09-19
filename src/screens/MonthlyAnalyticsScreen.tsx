import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import {
  calculateMonthTotal,
  calculateDailyAverage,
  calculateCategoryBreakdown,
  getDailySpendingPoints,
} from '../utils/calculations';
import { getMonthName } from '../utils/dateUtils';
import { DailyBarChart } from '../components/charts/DailyBarChart';
import { CategoryBreakdownView } from '../components/charts/CategoryBreakdownView';
import { EmptyState } from '../components/common/EmptyState';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-react';

import { AnimatedNumber } from '../components/common/AnimatedNumber';

export const MonthlyAnalyticsScreen: React.FC<{ onOpenAddExpense: () => void }> = ({
  onOpenAddExpense,
}) => {
  const { expenses, categories } = useExpenses();
  const { currency } = useSettings();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [slideDirection, setSlideDirection] = useState<'prev' | 'next' | 'none'>('none');

  const handlePrevMonth = () => {
    setSlideDirection('prev');
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSlideDirection('next');
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleResetToCurrent = () => {
    setSlideDirection('none');
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(monthPrefix));
  }, [expenses, monthPrefix]);

  const monthTotal = useMemo(() => {
    return calculateMonthTotal(expenses, selectedYear, selectedMonth);
  }, [expenses, selectedYear, selectedMonth]);

  const dailyAverage = useMemo(() => {
    return calculateDailyAverage(expenses, selectedYear, selectedMonth, now);
  }, [expenses, selectedYear, selectedMonth, now]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(monthExpenses, categories);
  }, [monthExpenses, categories]);

  const dailyPoints = useMemo(() => {
    return getDailySpendingPoints(expenses, selectedYear, selectedMonth);
  }, [expenses, selectedYear, selectedMonth]);

  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  const monthName = getMonthName(selectedMonth);

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between glass-panel p-2 rounded-2xl">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-xl glass-button flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Previous Month"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center cursor-pointer px-2" onClick={handleResetToCurrent} title="Current Month">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {monthName} {selectedYear}
          </h3>
          {!isCurrentMonth && (
            <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
              Tap for Current Month
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-xl glass-button flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month Data Feed with Directional Slide */}
      <div
        key={monthPrefix}
        className={
          slideDirection === 'next'
            ? 'animate-slide-in-right space-y-3'
            : slideDirection === 'prev'
            ? 'animate-slide-in-left space-y-3'
            : 'animate-fade-slide-up space-y-3'
        }
      >
        {monthTotal === 0 ? (
          <EmptyState
            title="No spending data for this period"
            description={`You have not logged any expenses in ${monthName} ${selectedYear}.`}
            actionText="Add Expense"
            onAction={onOpenAddExpense}
          />
        ) : (
          <>
            {/* Summary Figures Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Total Spending */}
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
                  <AnimatedNumber value={monthTotal} currencyCode={currency.code} />
                </h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                  {monthExpenses.length} transactions
                </p>
              </div>

              {/* Daily Average */}
              <div className="p-3.5 rounded-2xl glass-panel">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Daily Average
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Calendar size={13} />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold tabular-nums tracking-tight text-neutral-900 dark:text-white">
                  <AnimatedNumber value={dailyAverage} currencyCode={currency.code} />
                </h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                  / day in {monthName.slice(0, 3)}
                </p>
              </div>
            </div>

            {/* Daily Spending Bar Chart */}
            <DailyBarChart points={dailyPoints} monthName={monthName} />

            {/* Category Breakdown */}
            <CategoryBreakdownView
              breakdown={categoryBreakdown}
              title={`${monthName} Spending by Category`}
            />
          </>
        )}
      </div>
    </div>
  );
};
