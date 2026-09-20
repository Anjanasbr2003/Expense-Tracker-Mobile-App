import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { ShoppingBag, Coffee, CreditCard, ChevronRight } from 'lucide-react';

interface SpendingFootprintProps {
  totalSpent: number;
  onSeeDetails?: () => void;
}

export const SpendingFootprintCard: React.FC<SpendingFootprintProps> = ({
  totalSpent,
  onSeeDetails,
}) => {
  const { currency } = useSettings();
  const { expenses, categories } = useExpenses();

  // Dynamic 50/30/20 category bucket calculations based on current month's expenses
  const { essentialsPct, treatPct, financePct, essentialsAmount, treatAmount, financeAmount } =
    useMemo(() => {
      if (totalSpent <= 0 || expenses.length === 0) {
        return {
          essentialsPct: 0,
          treatPct: 0,
          financePct: 0,
          essentialsAmount: 0,
          treatAmount: 0,
          financeAmount: 0,
        };
      }

      const now = new Date();
      const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthExpenses = expenses.filter((e) => e.date && e.date.startsWith(currentMonthPrefix));

      const catMap = new Map<string, string>();
      categories.forEach((c) => catMap.set(c.id, c.name.toLowerCase()));

      let essentials = 0;
      let treats = 0;
      let finance = 0;

      for (const exp of monthExpenses) {
        const catName = catMap.get(exp.categoryId) || '';
        // Group into Essentials (Food, Transport, Bills, Health)
        if (
          catName.includes('food') ||
          catName.includes('transport') ||
          catName.includes('bill') ||
          catName.includes('health')
        ) {
          essentials += exp.amount;
        }
        // Group into Treats (Shopping, Entertainment, Travel)
        else if (
          catName.includes('shopping') ||
          catName.includes('entertain') ||
          catName.includes('travel')
        ) {
          treats += exp.amount;
        }
        // Group into Finance / Other
        else {
          finance += exp.amount;
        }
      }

      const total = essentials + treats + finance;
      if (total === 0) {
        return {
          essentialsPct: 0,
          treatPct: 0,
          financePct: 0,
          essentialsAmount: 0,
          treatAmount: 0,
          financeAmount: 0,
        };
      }

      const essentialsPct = Math.round((essentials / total) * 100);
      const treatPct = Math.round((treats / total) * 100);
      const financePct = Math.max(0, 100 - essentialsPct - treatPct);

      return {
        essentialsPct,
        treatPct,
        financePct,
        essentialsAmount: essentials,
        treatAmount: treats,
        financeAmount: finance,
      };
    }, [expenses, categories, totalSpent]);

  const hasExpenses = totalSpent > 0;

  return (
    <div className="p-4 rounded-3xl glass-emerald-card select-none relative overflow-hidden transition-colors">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Spending Footprint
          </h3>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-300/80 font-medium">
            This Month Overview
          </p>
        </div>

        {onSeeDetails && (
          <button
            type="button"
            onClick={onSeeDetails}
            className="w-7 h-7 rounded-full glass-button text-neutral-700 dark:text-emerald-200 hover:text-neutral-950 dark:hover:text-white flex items-center justify-center border border-lime-500/20 active:scale-95 transition-all cursor-pointer"
            title="See Details"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Main Metric & Legend Row */}
      <div className="flex items-end justify-between mt-2 mb-3">
        <div>
          <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            {formatCurrency(totalSpent, currency.code)}
          </span>
          <span className="block text-[11px] text-neutral-500 dark:text-emerald-300/75 font-medium">
            Total Spendings
          </span>
        </div>

        {/* Legend Dots */}
        <div className="flex flex-col gap-1 text-[10px] text-neutral-600 dark:text-emerald-200/90 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-lime-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span>Essentials</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-orange-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <span>Treat Yourself</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
            <span>Bills & Finance</span>
          </div>
        </div>
      </div>

      {/* Multi-segment Smooth Progress Bar */}
      <div className="w-full">
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-200/80 dark:bg-neutral-800/80 border border-neutral-300/60 dark:border-white/10 p-[1.5px] gap-0.5">
          {hasExpenses ? (
            <>
              {/* Segment 1: Essentials */}
              {essentialsPct > 0 && (
                <div
                  className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-lime-500 dark:from-emerald-400 dark:to-lime-400 transition-all duration-500"
                  style={{ width: `${essentialsPct}%` }}
                />
              )}
              {/* Segment 2: Treats */}
              {treatPct > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                  style={{ width: `${treatPct}%` }}
                />
              )}
              {/* Segment 3: Finance */}
              {financePct > 0 && (
                <div
                  className="h-full rounded-r-full bg-gradient-to-r from-sky-500 to-blue-500 dark:from-sky-400 dark:to-cyan-400 transition-all duration-500"
                  style={{ width: `${financePct}%` }}
                />
              )}
            </>
          ) : (
            <div className="h-full w-full rounded-full bg-neutral-300/50 dark:bg-neutral-700/50 transition-all" />
          )}
        </div>

        {/* Amount Sub-ticks */}
        <div className="flex justify-between px-0.5 mt-1 text-[9px] text-neutral-500 dark:text-emerald-200/60 font-mono">
          <span>{formatCurrency(0, currency.code)}</span>
          <span>{hasExpenses ? formatCurrency(essentialsAmount, currency.code) : 'Needs'}</span>
          <span>{hasExpenses ? formatCurrency(treatAmount, currency.code) : 'Wants'}</span>
          <span>{hasExpenses ? formatCurrency(financeAmount, currency.code) : 'Buffer'}</span>
        </div>
      </div>

      {/* 3 Rounded Metric Chips Below */}
      <div className="grid grid-cols-3 gap-2 mt-3.5">
        {/* Chip 1: Essentials */}
        <div className="p-2.5 rounded-2xl bg-neutral-100/90 dark:bg-black/30 border border-emerald-500/20 dark:border-lime-400/20 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 dark:bg-lime-400/15 text-emerald-600 dark:text-lime-400 flex items-center justify-center mb-1">
            <ShoppingBag size={14} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
            {essentialsPct}%
          </span>
          <span className="text-[9px] text-neutral-600 dark:text-emerald-200/70 font-medium leading-tight mt-0.5">
            Essentials
          </span>
        </div>

        {/* Chip 2: Treat Yourself */}
        <div className="p-2.5 rounded-2xl bg-neutral-100/90 dark:bg-black/30 border border-orange-500/20 dark:border-orange-400/20 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-1">
            <Coffee size={14} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
            {treatPct}%
          </span>
          <span className="text-[9px] text-neutral-600 dark:text-emerald-200/70 font-medium leading-tight mt-0.5">
            Treats
          </span>
        </div>

        {/* Chip 3: Finance & Repayments */}
        <div className="p-2.5 rounded-2xl bg-neutral-100/90 dark:bg-black/30 border border-sky-500/20 dark:border-sky-400/20 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1">
            <CreditCard size={14} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
            {financePct}%
          </span>
          <span className="text-[9px] text-neutral-600 dark:text-emerald-200/70 font-medium leading-tight mt-0.5">
            Finance
          </span>
        </div>
      </div>
    </div>
  );
};
