import React, { useState } from 'react';
import { MonthlyAnalyticsScreen } from './MonthlyAnalyticsScreen';
import { YearlyAnalyticsScreen } from './YearlyAnalyticsScreen';

export const AnalyticsScreen: React.FC<{ onOpenAddExpense: () => void }> = ({
  onOpenAddExpense,
}) => {
  const [subTab, setSubTab] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Segmented Sub-Tab Switcher */}
      <div className="px-3.5 pt-2.5 pb-1 shrink-0">
        <div className="flex rounded-2xl glass-panel p-1">
          <button
            type="button"
            onClick={() => setSubTab('monthly')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'monthly'
                ? 'glass-button text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-300 active:scale-98'
            }`}
          >
            Monthly View
          </button>
          <button
            type="button"
            onClick={() => setSubTab('yearly')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'yearly'
                ? 'glass-button text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-300 active:scale-98'
            }`}
          >
            Yearly View
          </button>
        </div>
      </div>

      {/* View Container */}
      <div key={subTab} className="flex-1 flex flex-col overflow-y-auto animate-fade-slide-up">
        {subTab === 'monthly' ? (
          <MonthlyAnalyticsScreen onOpenAddExpense={onOpenAddExpense} />
        ) : (
          <YearlyAnalyticsScreen onOpenAddExpense={onOpenAddExpense} />
        )}
      </div>
    </div>
  );
};
