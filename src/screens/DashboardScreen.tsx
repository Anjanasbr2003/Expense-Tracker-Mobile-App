import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { ExpenseItem } from '../components/expense/ExpenseItem';
import { WaveSplineChart } from '../components/charts/WaveSplineChart';
import { SpendingFootprintCard } from '../components/charts/SpendingFootprintCard';
import { ExpenseCalendar } from '../components/dashboard/ExpenseCalendar';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { formatCurrency } from '../utils/currency';
import { hapticLight } from '../utils/haptics';
import type { Expense } from '../types';
import { Plus, ArrowRight, ChevronDown, Calendar, Receipt, Wallet, PieChart, CalendarClock, X } from 'lucide-react';

interface DashboardScreenProps {
  onOpenAddExpense: (date?: string) => void;
  onEditExpense: (expense: Expense) => void;
  onNavigateToHistory: () => void;
}

type DashboardSubView = 'savings' | 'calendar' | 'footprint' | 'planner';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenAddExpense,
  onEditExpense,
  onNavigateToHistory,
}) => {
  const { expenses, categories, todayTotal, thisMonthTotal, isLoading } = useExpenses();
  const { currency } = useSettings();
  const [activeSubView, setActiveSubView] = useState<DashboardSubView>('savings');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'short' });
  const yearNum = now.getFullYear();
  const recentExpenses = expenses.slice(0, 3);

  // Filter expenses for selected calendar day
  const selectedDayExpenses = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate]);

  const selectedDayTotal = useMemo(() => {
    return selectedDayExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [selectedDayExpenses]);

  const formatReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return dateStr;
  };

  const billExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const cat = categories.find((c) => c.id === e.categoryId);
        const catName = (cat?.name || '').toLowerCase();
        const note = (e.note || '').toLowerCase();
        return (
          catName.includes('bill') ||
          note.includes('bill') ||
          note.includes('utility') ||
          note.includes('rent') ||
          note.includes('subscription')
        );
      })
      .slice(0, 3);
  }, [expenses, categories]);

  return (
    <div className="flex-1 flex flex-col justify-between p-3.5 overflow-y-auto no-scrollbar select-none gap-3">
      {/* 1. Fluid Liquid Glass Segmented Control Track */}
      <div className="p-1 rounded-2xl glass-panel border border-lime-400/20 dark:border-white/[0.08] backdrop-blur-xl flex items-center gap-1 shrink-0 bg-neutral-200/50 dark:bg-black/40 shadow-xs">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setActiveSubView('savings');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            activeSubView === 'savings'
              ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-500 text-neutral-950 shadow-[0_2px_12px_rgba(163,230,53,0.35)]'
              : 'text-neutral-600 dark:text-emerald-100/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/5'
          }`}
        >
          <Wallet size={13} strokeWidth={activeSubView === 'savings' ? 2.6 : 2} className="shrink-0" />
          <span className="truncate">Savings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            hapticLight();
            setActiveSubView('calendar');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            activeSubView === 'calendar'
              ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-500 text-neutral-950 shadow-[0_2px_12px_rgba(163,230,53,0.35)]'
              : 'text-neutral-600 dark:text-emerald-100/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar size={13} strokeWidth={activeSubView === 'calendar' ? 2.6 : 2} className="shrink-0" />
          <span className="truncate">Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            hapticLight();
            setActiveSubView('footprint');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            activeSubView === 'footprint'
              ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-500 text-neutral-950 shadow-[0_2px_12px_rgba(163,230,53,0.35)]'
              : 'text-neutral-600 dark:text-emerald-100/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/5'
          }`}
        >
          <PieChart size={13} strokeWidth={activeSubView === 'footprint' ? 2.6 : 2} className="shrink-0" />
          <span className="truncate">Footprint</span>
        </button>

        <button
          type="button"
          onClick={() => {
            hapticLight();
            setActiveSubView('planner');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            activeSubView === 'planner'
              ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-500 text-neutral-950 shadow-[0_2px_12px_rgba(163,230,53,0.35)]'
              : 'text-neutral-600 dark:text-emerald-100/70 hover:text-neutral-900 dark:hover:text-white hover:bg-white/5'
          }`}
        >
          <CalendarClock size={13} strokeWidth={activeSubView === 'planner' ? 2.6 : 2} className="shrink-0" />
          <span className="truncate">Bills</span>
        </button>
      </div>

      {/* 2. Main Hero Subview Content */}
      {activeSubView === 'savings' && (
        <div className="p-4 rounded-3xl glass-emerald-card relative animate-fade-slide-up transition-colors">
          {/* Header Row: Title + Period Selector Pill */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                Total Savings & Spending
              </h2>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-300/70 font-medium">
                01 {monthName} - End of Month
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                hapticLight();
                setActiveSubView('calendar');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-button text-[11px] font-semibold text-neutral-700 dark:text-emerald-200 border border-lime-400/20 active:scale-95 transition-transform cursor-pointer"
              title="Open Calendar View"
            >
              <Calendar size={11} />
              <span>{yearNum}</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Primary Amount & Delta Pill */}
          <div className="flex items-baseline justify-between mt-3 mb-1">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
                <AnimatedNumber value={thisMonthTotal} currencyCode={currency.code} />
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-emerald-200/80 font-medium mt-0.5">
                Today:{' '}
                <strong className="tabular-nums text-neutral-900 dark:text-white font-bold">
                  <AnimatedNumber value={todayTotal} currencyCode={currency.code} />
                </strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600 dark:text-lime-300 tabular-nums">
                +4.96%
              </span>
              <span className="block text-[9px] text-neutral-500 dark:text-emerald-200/60 uppercase tracking-wider font-semibold">
                Current Month
              </span>
            </div>
          </div>

          {/* Dual Wave Spline Chart */}
          <WaveSplineChart currentTotal={thisMonthTotal} />
        </div>
      )}

      {activeSubView === 'footprint' && (
        <div className="animate-fade-slide-up">
          <SpendingFootprintCard totalSpent={thisMonthTotal} onSeeDetails={onNavigateToHistory} />
        </div>
      )}

      {activeSubView === 'planner' && (
        <div className="p-4 rounded-3xl glass-emerald-card animate-fade-slide-up transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Planned Recurring Bills</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-300/70 font-medium">
                Automatic detection from your history
              </p>
            </div>
            {billExpenses.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-lime-400">Active</span>
            )}
          </div>

          {billExpenses.length === 0 ? (
            <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-lime-400/15 text-center flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                No recurring bills recorded yet
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-emerald-200/70 mt-0.5">
                Log utilities, rent, or subscriptions under Bills to track them here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {billExpenses.map((bill) => {
                const cat = categories.find((c) => c.id === bill.categoryId);
                return (
                  <div
                    key={bill.id}
                    className="p-2.5 rounded-2xl bg-neutral-100/90 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-lime-400/15 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border"
                        style={{
                          backgroundColor: `${cat?.color || '#10b981'}20`,
                          color: cat?.color || '#10b981',
                          borderColor: `${cat?.color || '#10b981'}40`,
                        }}
                      >
                        <Receipt size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          {bill.note || cat?.name || 'Bill'}
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-emerald-300/60 font-medium">
                          {bill.date} · {bill.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
                      {formatCurrency(bill.amount, currency.code)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Fast Entry Quick Action Strip */}
      <button
        type="button"
        onClick={() => onOpenAddExpense(selectedDate || undefined)}
        className="w-full py-2.5 px-4 rounded-2xl glass-button hover:border-lime-400/40 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg glass-button-primary text-black flex items-center justify-center">
            <Plus size={16} strokeWidth={2.6} />
          </div>
          <span className="text-xs font-bold tracking-tight">
            {selectedDate ? `Record Expense for ${formatReadableDate(selectedDate)}` : 'Record New Expense'}
          </span>
        </div>
        <span className="text-[11px] font-medium text-lime-600 dark:text-lime-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          <span>Fast entry</span>
          <ArrowRight size={12} />
        </span>
      </button>

      {/* 4. Interactive Expense Calendar */}
      <div className="shrink-0">
        <ExpenseCalendar
          expenses={expenses}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          currencyCode={currency.code}
        />
      </div>

      {/* 5. Daily Filtered or Recent Transactions List */}
      <div className="flex-1 flex flex-col justify-end min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            {selectedDate ? (
              <>
                <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                  Expenses on {formatReadableDate(selectedDate)}
                </span>
                <span className="text-[10px] text-lime-600 dark:text-lime-400 tabular-nums font-bold">
                  ({selectedDayExpenses.length})
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Recent Expenses
                </span>
                {expenses.length > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 tabular-nums font-semibold">
                    ({expenses.length})
                  </span>
                )}
              </>
            )}
          </div>

          {selectedDate ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-lime-600 dark:text-lime-400 tabular-nums">
                {formatCurrency(selectedDayTotal, currency.code)}
              </span>
              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setSelectedDate(null);
                }}
                className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:text-emerald-300/80 dark:hover:text-white flex items-center gap-0.5 active:scale-95 transition-transform cursor-pointer"
              >
                <span>Show All</span>
                <X size={12} strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            expenses.length > 0 && (
              <button
                type="button"
                onClick={onNavigateToHistory}
                className="text-[11px] font-semibold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-0.5 active:scale-95 transition-transform cursor-pointer"
              >
                <span>See Details</span>
                <ArrowRight size={12} />
              </button>
            )
          )}
        </div>

        {selectedDate ? (
          /* Selected Day Filtered List */
          selectedDayExpenses.length === 0 ? (
            <div className="p-4 rounded-2xl glass-emerald-card text-center flex flex-col items-center justify-center border border-lime-400/20">
              <Calendar className="w-8 h-8 text-lime-400/60 mb-1" />
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                No expenses on {formatReadableDate(selectedDate)}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-emerald-200/70 mt-0.5 mb-2.5">
                Track your spending for this day by logging an expense.
              </p>
              <button
                type="button"
                onClick={() => onOpenAddExpense(selectedDate)}
                className="py-1.5 px-3.5 rounded-xl glass-button-primary text-neutral-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.6} />
                <span>Add Expense for {formatReadableDate(selectedDate)}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {selectedDayExpenses.map((exp, idx) => {
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

              <button
                type="button"
                onClick={() => onOpenAddExpense(selectedDate)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-lime-400/40 hover:border-lime-400/70 text-lime-600 dark:text-lime-400 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer bg-lime-400/5 mt-1"
              >
                <Plus size={13} strokeWidth={2.6} />
                <span>Log another expense on this day</span>
              </button>
            </div>
          )
        ) : (
          /* Normal Recent Expenses List */
          expenses.length === 0 && !isLoading ? (
            <div className="p-4 rounded-2xl glass-emerald-card text-center flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                No transactions logged yet
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-emerald-200/70 mt-0.5">
                Tap above to record your first expense and start tracking.
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
          )
        )}
      </div>
    </div>
  );
};
