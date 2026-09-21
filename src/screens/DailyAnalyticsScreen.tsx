import React, { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../utils/i18n';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { formatCurrency } from '../utils/currency';
import { getDailySpendingPoints } from '../utils/calculations';
import { DailyBarChart } from '../components/charts/DailyBarChart';

export const DailyAnalyticsScreen: React.FC = () => {
  const { expenses, todayTotal } = useExpenses();
  const { settings, currency } = useSettings();
  const { t } = useTranslation();
  const now = new Date();
  
  const dailyBudget = settings.defaultDailyBudget || 0;
  const remaining = dailyBudget - todayTotal;
  const isOver = remaining < 0;
  
  const dailyPoints = useMemo(() => {
    return getDailySpendingPoints(expenses, now.getFullYear(), now.getMonth() + 1);
  }, [expenses, now]);

  const monthName = now.toLocaleDateString('en-US', { month: 'short' });

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-4 animate-fade-slide-up">
      {/* Daily Budget Status */}
      <div className="p-4 rounded-3xl glass-panel relative overflow-hidden">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
          {t('Today')} {now.toLocaleDateString()}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">
              Spent Today
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
              <AnimatedNumber value={todayTotal} currencyCode={currency.code} />
            </div>
          </div>

          <div className="text-right">
             <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">
              Daily Limit
            </div>
            <div className="text-lg font-bold text-neutral-600 dark:text-neutral-300 tabular-nums">
              {dailyBudget > 0 ? formatCurrency(dailyBudget, currency.code) : 'Not Set'}
            </div>
          </div>
        </div>

        {dailyBudget > 0 && (
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className={`text-xs font-bold ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
              {isOver ? t('Over Budget') : t('Left')}
            </span>
            <span className={`text-sm font-extrabold tabular-nums ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
              {formatCurrency(Math.abs(remaining), currency.code)}
            </span>
          </div>
        )}
      </div>

      {/* Daily Spending Chart for Current Month */}
      <div className="mt-2">
        <h3 className="text-xs font-bold text-neutral-900 dark:text-white mb-2 px-1">
          Daily Trends - {monthName}
        </h3>
        <DailyBarChart points={dailyPoints} monthName={monthName} />
      </div>
    </div>
  );
};
