import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { ExpenseItem } from '../components/expense/ExpenseItem';
import { WaveSplineChart } from '../components/charts/WaveSplineChart';
import { SpendingFootprintCard } from '../components/charts/SpendingFootprintCard';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import type { Expense } from '../types';
import { Plus, ArrowRight, ChevronDown, Calendar } from 'lucide-react';

interface DashboardScreenProps {
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onNavigateToHistory: () => void;
}

type DashboardSubView = 'savings' | 'planner' | 'footprint';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenAddExpense,
  onEditExpense,
  onNavigateToHistory,
}) => {
  const { expenses, categories, todayTotal, thisMonthTotal, isLoading } = useExpenses();
  const { currency } = useSettings();
  const [activeSubView, setActiveSubView] = useState<DashboardSubView>('savings');

  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'short' });
  const yearNum = now.getFullYear();
  const recentExpenses = expenses.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col justify-between p-3.5 overflow-y-auto no-scrollbar select-none gap-3">
      {/* 1. Horizontal Capsule Filter Pills (matching reference UI) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
        <button
          type="button"
          onClick={() => setActiveSubView('savings')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0 ${
            activeSubView === 'savings'
              ? 'bg-[#153422] text-white border border-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.2)]'
              : 'glass-button text-neutral-600 dark:text-emerald-100/60 border border-transparent'
          }`}
        >
          Total Savings
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('footprint')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0 ${
            activeSubView === 'footprint'
              ? 'bg-[#153422] text-white border border-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.2)]'
              : 'glass-button text-neutral-600 dark:text-emerald-100/60 border border-transparent'
          }`}
        >
          Spending Footprint
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('planner')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0 ${
            activeSubView === 'planner'
              ? 'bg-[#153422] text-white border border-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.2)]'
              : 'glass-button text-neutral-600 dark:text-emerald-100/60 border border-transparent'
          }`}
        >
          Bill Planner
        </button>
      </div>

      {/* 2. Main Hero Card matching user's reference image */}
      {activeSubView === 'savings' && (
        <div className="p-4 rounded-3xl glass-emerald-card text-white relative animate-fade-slide-up">
          {/* Header Row: Title + Period Selector Pill */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Total Savings & Spending
              </h2>
              <p className="text-[10px] text-emerald-300/70 font-medium">
                01 {monthName} - End of Month
              </p>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-button text-[11px] font-semibold text-emerald-200 border border-lime-400/20">
              <Calendar size={11} />
              <span>{yearNum}</span>
              <ChevronDown size={12} />
            </div>
          </div>

          {/* Primary Amount & Delta Pill */}
          <div className="flex items-baseline justify-between mt-3 mb-1">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                <AnimatedNumber value={thisMonthTotal} currencyCode={currency.code} />
              </div>
              <div className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
                Today: <strong className="tabular-nums text-white font-bold"><AnimatedNumber value={todayTotal} currencyCode={currency.code} /></strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-lime-300 tabular-nums">
                +4.96%
              </span>
              <span className="block text-[9px] text-emerald-200/60 uppercase tracking-wider font-semibold">
                Current Month
              </span>
            </div>
          </div>

          {/* Dual Wave Spline Chart with diagonal hatch */}
          <WaveSplineChart currentTotal={thisMonthTotal} />
        </div>
      )}

      {activeSubView === 'footprint' && (
        <div className="animate-fade-slide-up">
          <SpendingFootprintCard totalSpent={thisMonthTotal} onSeeDetails={onNavigateToHistory} />
        </div>
      )}

      {activeSubView === 'planner' && (
        <div className="p-4 rounded-3xl glass-emerald-card text-white animate-fade-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Planned Recurring Bills</h3>
              <p className="text-[10px] text-emerald-300/70">Automatic detection from history</p>
            </div>
            <span className="text-xs font-bold text-lime-400">Active</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-lime-400/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-400/30">
                  ♫
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Spotify Music</span>
                  <span className="text-[10px] text-emerald-300/60">Recurring Monthly</span>
                </div>
              </div>
              <span className="text-xs font-bold text-white tabular-nums">Rs. 1,450.00</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-lime-400/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-400/30">
                  ⚡
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Electricity & Utilities</span>
                  <span className="text-[10px] text-emerald-300/60">Due in 12 Days</span>
                </div>
              </div>
              <span className="text-xs font-bold text-white tabular-nums">Rs. 6,800.00</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Fast Entry Quick Action Strip */}
      <button
        type="button"
        onClick={onOpenAddExpense}
        className="w-full py-2.5 px-4 rounded-2xl glass-button hover:border-lime-400/40 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg glass-button-primary text-black flex items-center justify-center">
            <Plus size={16} strokeWidth={2.6} />
          </div>
          <span className="text-xs font-bold tracking-tight">Record New Expense</span>
        </div>
        <span className="text-[11px] font-medium text-lime-600 dark:text-lime-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          <span>Fast entry</span>
          <ArrowRight size={12} />
        </span>
      </button>

      {/* 4. Bill Planner / Recent Transactions List */}
      <div className="flex-1 flex flex-col justify-end min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              Bill Planner / Recent Expenses
            </span>
            {expenses.length > 0 && (
              <span className="text-[10px] text-emerald-500 tabular-nums font-semibold">
                ({expenses.length})
              </span>
            )}
          </div>

          {expenses.length > 0 && (
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="text-[11px] font-semibold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-0.5 active:scale-95 transition-transform cursor-pointer"
            >
              <span>See Details</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {expenses.length === 0 && !isLoading ? (
          <div className="p-4 rounded-2xl glass-emerald-card text-center flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-white">
              No transactions logged yet
            </p>
            <p className="text-[10px] text-emerald-200/70 mt-0.5">
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
                  style={{ animationDelay: `${(idx + 1) * 35}ms` }}
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
