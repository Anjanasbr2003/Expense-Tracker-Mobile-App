import React, { useMemo } from 'react';
import { Lightbulb, Target, PieChart, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currency';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface RateBreakdownViewProps {
  savingsBalance?: number;
}

export const RateBreakdownView: React.FC<RateBreakdownViewProps> = () => {
  const { currency, settings, currentMonthBudget } = useSettings();
  const { expenses, categories, thisMonthTotal } = useExpenses();

  const monthlyBudget = currentMonthBudget || settings.defaultMonthlyBudget || 60000;

  // Compute breakdown and category insights
  const {
    needsAmount,
    wantsAmount,
    savingsAmount,
    needsPct,
    wantsPct,
    savingsPct,
    topCategory,
    budgetRemaining,
    budgetUsagePct,
  } = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter((e) => e.date && e.date.startsWith(monthPrefix));

    const catMap = new Map<string, { name: string; color: string }>();
    const catTotals = new Map<string, number>();
    categories.forEach((c) => {
      catMap.set(c.id, { name: c.name, color: c.color });
      catTotals.set(c.id, 0);
    });

    let needs = 0;
    let wants = 0;
    let other = 0;

    for (const exp of monthExpenses) {
      const cat = catMap.get(exp.categoryId);
      const name = (cat?.name || '').toLowerCase();

      catTotals.set(exp.categoryId, (catTotals.get(exp.categoryId) || 0) + exp.amount);

      if (
        name.includes('food') ||
        name.includes('transport') ||
        name.includes('bill') ||
        name.includes('health')
      ) {
        needs += exp.amount;
      } else if (
        name.includes('shopping') ||
        name.includes('entertain') ||
        name.includes('travel')
      ) {
        wants += exp.amount;
      } else {
        other += exp.amount;
      }
    }

    // Top spending category
    let topCatId = '';
    let topCatTotal = 0;
    catTotals.forEach((val, id) => {
      if (val > topCatTotal) {
        topCatTotal = val;
        topCatId = id;
      }
    });

    const topCatObj = topCatId ? catMap.get(topCatId) : null;
    const topCategory = topCatObj ? { name: topCatObj.name, amount: topCatTotal, color: topCatObj.color } : null;

    const total = needs + wants + other;
    const needsPct = total > 0 ? Math.round((needs / total) * 100) : 0;
    const wantsPct = total > 0 ? Math.round((wants / total) * 100) : 0;
    const savingsPct = total > 0 ? Math.max(0, 100 - needsPct - wantsPct) : 0;

    const budgetRemaining = Math.max(0, monthlyBudget - thisMonthTotal);
    const budgetUsagePct = Math.min(100, Math.round((thisMonthTotal / (monthlyBudget || 1)) * 100));

    return {
      needsAmount: needs,
      wantsAmount: wants,
      savingsAmount: other,
      needsPct,
      wantsPct,
      savingsPct,
      topCategory,
      budgetRemaining,
      budgetUsagePct,
    };
  }, [expenses, categories, thisMonthTotal, monthlyBudget]);

  return (
    <div className="space-y-3.5 select-none animate-fade-slide-up">
      {/* 1. Main Card: Spending Allocation & 50/30/20 Insights */}
      <div className="p-4 rounded-3xl glass-emerald-card relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              Spending Distribution
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-300/80 font-medium">
              50 / 30 / 20 Budget Guidelines
            </p>
          </div>

          <div className="w-8 h-8 rounded-full glass-button text-emerald-600 dark:text-lime-400 flex items-center justify-center border border-lime-500/20">
            <PieChart size={16} />
          </div>
        </div>

        {/* Tier Distribution Rows */}
        <div className="space-y-2.5 mb-4">
          {/* Needs / Essentials */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 dark:bg-lime-400 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                <span className="text-neutral-700 dark:text-emerald-100/90 font-medium">
                  Needs & Essentials (Target: 50%)
                </span>
              </div>
              <span className="text-neutral-900 dark:text-white font-bold tabular-nums">
                {needsPct}% · {formatCurrency(needsAmount, currency.code)}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 dark:from-emerald-400 dark:to-lime-400 transition-all duration-500"
                style={{ width: `${needsPct}%` }}
              />
            </div>
          </div>

          {/* Wants / Treats */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 dark:bg-orange-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                <span className="text-neutral-700 dark:text-emerald-100/90 font-medium">
                  Wants & Lifestyle (Target: 30%)
                </span>
              </div>
              <span className="text-neutral-900 dark:text-white font-bold tabular-nums">
                {wantsPct}% · {formatCurrency(wantsAmount, currency.code)}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                style={{ width: `${wantsPct}%` }}
              />
            </div>
          </div>

          {/* Savings / Buffer */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 dark:bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.4)]" />
                <span className="text-neutral-700 dark:text-emerald-100/90 font-medium">
                  Other & Discretionary (Target: 20%)
                </span>
              </div>
              <span className="text-neutral-900 dark:text-white font-bold tabular-nums">
                {savingsPct}% · {formatCurrency(savingsAmount, currency.code)}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 dark:from-sky-400 dark:to-cyan-400 transition-all duration-500"
                style={{ width: `${savingsPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Health Meter */}
        <div className="pt-3 border-t border-neutral-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-emerald-200/70">
              Monthly Budget Progress
            </span>
            <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
              <AnimatedNumber value={thisMonthTotal} currencyCode={currency.code} /> / {formatCurrency(monthlyBudget, currency.code)}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-neutral-200/80 dark:bg-neutral-800 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePct > 90
                  ? 'bg-gradient-to-r from-rose-500 to-red-500'
                  : budgetUsagePct > 70
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-emerald-500 to-lime-400'
              }`}
              style={{ width: `${budgetUsagePct}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-1.5 text-[10px] text-neutral-500 dark:text-emerald-200/60 font-medium">
            <span>{budgetUsagePct}% utilized</span>
            <span>{formatCurrency(budgetRemaining, currency.code)} remaining</span>
          </div>
        </div>
      </div>

      {/* 2. Top Spending Highlights & Smart Insights */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Top Expense Driver */}
        <div className="p-3.5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Top Category
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-lime-400 flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
            {topCategory ? topCategory.name : 'No expenses'}
          </h4>
          <p className="text-[11px] font-semibold tabular-nums text-neutral-600 dark:text-emerald-300/80 mt-0.5">
            {topCategory ? formatCurrency(topCategory.amount, currency.code) : '—'}
          </p>
        </div>

        {/* Budget Status */}
        <div className="p-3.5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Budget Status
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 dark:text-sky-400 flex items-center justify-center">
              <Target size={13} />
            </div>
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
            {budgetUsagePct > 100
              ? 'Over Budget'
              : budgetUsagePct > 80
              ? 'Near Limit'
              : 'On Track'}
          </h4>
          <p className="text-[11px] font-semibold text-neutral-600 dark:text-emerald-300/80 mt-0.5">
            {budgetUsagePct}% of limit
          </p>
        </div>
      </div>

      {/* 3. Understanding Your Footprint Card */}
      <div className="p-4 rounded-3xl glass-emerald-card relative transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 dark:bg-lime-400/15 text-emerald-600 dark:text-lime-400 flex items-center justify-center border border-emerald-500/30 dark:border-lime-400/40">
            <Lightbulb size={15} strokeWidth={2.2} />
          </div>
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-tight">
            How 50/30/20 Works
          </h4>
        </div>

        <p className="text-[11px] text-neutral-600 dark:text-emerald-100/75 leading-relaxed font-normal">
          Financial experts recommend allocating <strong className="text-emerald-600 dark:text-lime-300 font-bold">50%</strong> of income to needs (rent, groceries, utilities), <strong className="text-amber-600 dark:text-orange-400 font-bold">30%</strong> to wants (dining, fun), and keeping <strong className="text-sky-600 dark:text-sky-400 font-bold">20%</strong> for savings and debt reduction.
        </p>

        <div className="mt-3 p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-lime-400/20 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 dark:text-lime-400 shrink-0" />
          <span className="text-[10px] font-semibold text-neutral-700 dark:text-emerald-200">
            100% Offline calculation. Your financial data never leaves your device.
          </span>
        </div>
      </div>
    </div>
  );
};
