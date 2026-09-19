import React, { useState } from 'react';
import { MonthlyAnalyticsScreen } from './MonthlyAnalyticsScreen';
import { YearlyAnalyticsScreen } from './YearlyAnalyticsScreen';
import { RateBreakdownView } from '../components/charts/RateBreakdownView';

export const AnalyticsScreen: React.FC<{ onOpenAddExpense: () => void }> = ({
  onOpenAddExpense,
}) => {
  const [subTab, setSubTab] = useState<'breakdown' | 'monthly' | 'yearly'>('breakdown');

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none">
      {/* Segmented Sub-Tab Switcher matching reference UI */}
      <div className="px-3.5 pt-2 pb-1 shrink-0">
        <div className="flex rounded-2xl glass-dock-floating p-1 gap-1 border border-lime-400/20">
          <button
            type="button"
            onClick={() => setSubTab('breakdown')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'breakdown'
                ? 'bg-[#153422] text-white border border-lime-400/40 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-300 active:scale-98'
            }`}
          >
            Rate Tiers
          </button>
          <button
            type="button"
            onClick={() => setSubTab('monthly')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'monthly'
                ? 'bg-[#153422] text-white border border-lime-400/40 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-300 active:scale-98'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setSubTab('yearly')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'yearly'
                ? 'bg-[#153422] text-white border border-lime-400/40 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-300 active:scale-98'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* View Container */}
      <div key={subTab} className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-3.5 pt-1 animate-fade-slide-up">
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
