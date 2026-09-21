import React, { useState } from 'react';
import { MonthlyAnalyticsScreen } from './MonthlyAnalyticsScreen';
import { YearlyAnalyticsScreen } from './YearlyAnalyticsScreen';
import { DailyAnalyticsScreen } from './DailyAnalyticsScreen';
import { RateBreakdownView } from '../components/charts/RateBreakdownView';
import { useTranslation } from '../utils/i18n';

export const AnalyticsScreen: React.FC<{ onOpenAddExpense: () => void }> = ({
  onOpenAddExpense,
}) => {
  const [subTab, setSubTab] = useState<'daily' | 'breakdown' | 'monthly' | 'yearly'>('daily');
  const { t } = useTranslation();

  const getTabClass = (active: boolean) =>
    active
      ? 'glass-button-primary text-neutral-950 font-bold shadow-xs'
      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 active:scale-98 font-semibold';

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none">
      {/* Segmented Sub-Tab Switcher matching app design */}
      <div className="px-3.5 pt-2 pb-1 shrink-0">
        <div className="flex rounded-2xl glass-dock-floating p-1 gap-1 border border-lime-400/20">
          <button
            type="button"
            onClick={() => setSubTab('daily')}
            className={`flex-1 py-2 rounded-xl text-[11px] transition-all cursor-pointer ${getTabClass(
              subTab === 'daily'
            )}`}
          >
            {t('Daily')}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('breakdown')}
            className={`flex-1 py-2 rounded-xl text-[11px] transition-all cursor-pointer ${getTabClass(
              subTab === 'breakdown'
            )}`}
          >
            {t('Breakdown')}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('monthly')}
            className={`flex-1 py-2 rounded-xl text-[11px] transition-all cursor-pointer ${getTabClass(
              subTab === 'monthly'
            )}`}
          >
            {t('Monthly')}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('yearly')}
            className={`flex-1 py-2 rounded-xl text-[11px] transition-all cursor-pointer ${getTabClass(
              subTab === 'yearly'
            )}`}
          >
            {t('Yearly')}
          </button>
        </div>
      </div>

      {/* View Container */}
      <div key={subTab} className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-3.5 pt-1 animate-fade-slide-up">
        {subTab === 'daily' && <DailyAnalyticsScreen />}
        {subTab === 'breakdown' && <RateBreakdownView />}
        {subTab === 'monthly' && (
          <MonthlyAnalyticsScreen onOpenAddExpense={onOpenAddExpense} />
        )}
        {subTab === 'yearly' && (
          <YearlyAnalyticsScreen onOpenAddExpense={onOpenAddExpense} />
        )}
      </div>
    </div>
  );
};
