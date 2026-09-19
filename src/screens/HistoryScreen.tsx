import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import type { Expense, PaymentMethod, ExpenseSortOption } from '../types';
import { ExpenseItem } from '../components/expense/ExpenseItem';
import { EmptyState } from '../components/common/EmptyState';
import { SpendingFootprintCard } from '../components/charts/SpendingFootprintCard';
import { getDateGroupHeader } from '../utils/dateUtils';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

interface HistoryScreenProps {
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onRequestDelete: (expense: Expense) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onOpenAddExpense,
  onEditExpense,
  onRequestDelete,
}) => {
  const { expenses, categories, thisMonthTotal } = useExpenses();
  const { currency } = useSettings();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | 'all'>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'this_month' | 'last_month'>('all');
  const [sortBy, setSortBy] = useState<ExpenseSortOption>('newest');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.id, c.name.toLowerCase()));

    return expenses.filter((exp) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const catName = categoryMap.get(exp.categoryId) || '';
        const note = (exp.note || '').toLowerCase();
        const payment = exp.paymentMethod.toLowerCase();
        const amountStr = exp.amount.toString();

        const matches =
          note.includes(query) ||
          catName.includes(query) ||
          payment.includes(query) ||
          amountStr.includes(query);

        if (!matches) return false;
      }

      if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) {
        return false;
      }

      if (selectedPayment !== 'all' && exp.paymentMethod !== selectedPayment) {
        return false;
      }

      if (selectedTimeRange === 'this_month') {
        if (!exp.date.startsWith(currentMonthPrefix)) return false;
      } else if (selectedTimeRange === 'last_month') {
        if (!exp.date.startsWith(lastMonthPrefix)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.time || '').localeCompare(a.time || '') || b.createdAt - a.createdAt;
      }
      if (sortBy === 'oldest') {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '') || a.createdAt - b.createdAt;
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [expenses, categories, searchQuery, selectedCategory, selectedPayment, selectedTimeRange, sortBy]);

  // Group by date
  const groupedExpenses = useMemo(() => {
    const groups: { [dateStr: string]: { date: string; items: Expense[]; total: number } } = {};

    for (const exp of filteredExpenses) {
      if (!groups[exp.date]) {
        groups[exp.date] = { date: exp.date, items: [], total: 0 };
      }
      groups[exp.date].items.push(exp);
      groups[exp.date].total += exp.amount;
    }

    const dateOrder: string[] = [];
    for (const exp of filteredExpenses) {
      if (!dateOrder.includes(exp.date)) {
        dateOrder.push(exp.date);
      }
    }

    return dateOrder.map((dateKey) => groups[dateKey]);
  }, [filteredExpenses]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPayment !== 'all' ? 1 : 0) +
    (selectedTimeRange !== 'all' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPayment('all');
    setSelectedTimeRange('all');
    setSortBy('newest');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-3.5 space-y-3 select-none">
      {/* Spending Footprint Card at Top of Accounts (matching reference image) */}
      {!searchQuery && activeFiltersCount === 0 && (
        <div className="shrink-0 animate-fade-slide-up">
          <SpendingFootprintCard totalSpent={thisMonthTotal} />
        </div>
      )}

      {/* Search Bar & Filter Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1 flex items-center">
          <Search size={15} className="absolute left-3.5 text-emerald-400/80" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl glass-panel border border-lime-400/20 text-xs font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-hidden focus:border-lime-400/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-200 rounded-full cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative w-10 h-10 rounded-2xl glass-button flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
            showFilters || activeFiltersCount > 0
              ? 'border-lime-400/50 text-lime-400 bg-lime-400/15'
              : 'text-neutral-400'
          }`}
          title="Filters"
        >
          <SlidersHorizontal size={17} strokeWidth={2} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lime-400 text-black text-[10px] font-black flex items-center justify-center shadow-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Filter Tray */}
      {showFilters && (
        <div className="p-3.5 rounded-3xl glass-emerald-card space-y-3 shadow-xl animate-in fade-in duration-150 shrink-0">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
              Filters & Sorting
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Time Range */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/60 block mb-1.5">Period</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTimeRange(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedTimeRange === t.id
                      ? 'glass-button-primary text-black'
                      : 'glass-button text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/60 block mb-1.5">Category</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'glass-button-primary text-black'
                    : 'glass-button text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'glass-button-primary text-black'
                      : 'glass-button text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/60 block mb-1.5">Sort</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'newest', label: 'Newest Date' },
                { id: 'oldest', label: 'Oldest Date' },
                { id: 'highest', label: 'Highest Amount' },
                { id: 'lowest', label: 'Lowest Amount' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    sortBy === s.id
                      ? 'glass-button-primary text-black'
                      : 'glass-button text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grouped Expenses Feed */}
      {groupedExpenses.length === 0 ? (
        <EmptyState
          title={searchQuery || activeFiltersCount > 0 ? 'No matching expenses' : 'No expenses yet'}
          description={
            searchQuery || activeFiltersCount > 0
              ? 'Try changing your search terms or clearing active filters.'
              : 'Add your first expense to see your transaction timeline.'
          }
          actionText={searchQuery || activeFiltersCount > 0 ? 'Clear Filters' : 'Add Expense'}
          onAction={searchQuery || activeFiltersCount > 0 ? clearAllFilters : onOpenAddExpense}
        />
      ) : (
        <div className="space-y-3 pt-0.5">
          {groupedExpenses.map((group) => {
            const headerLabel = getDateGroupHeader(group.date);

            return (
              <div key={group.date} className="space-y-1.5 animate-fade-slide-up">
                {/* Date Header with Daily Subtotal */}
                <div className="flex items-center justify-between px-1 py-1 sticky top-0 bg-[#030805]/80 backdrop-blur-md z-10">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                    {headerLabel}
                  </h4>
                  <span className="text-xs font-semibold tabular-nums text-neutral-300">
                    <AnimatedNumber value={group.total} currencyCode={currency.code} />
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {group.items.map((item, idx) => {
                    const cat = categories.find((c) => c.id === item.categoryId);
                    return (
                      <div
                        key={item.id}
                        className="animate-fade-slide-up"
                        style={{ animationDelay: `${Math.min((idx + 1) * 35, 200)}ms` }}
                      >
                        <ExpenseItem
                          expense={item}
                          category={cat}
                          onEdit={onEditExpense}
                          onDelete={onRequestDelete}
                          showDate={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
