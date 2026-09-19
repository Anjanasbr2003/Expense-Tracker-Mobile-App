import React from 'react';
import { useSettings } from '../../context/SettingsContext';
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

  // Three core spending breakdown buckets inspired by 50/30/20 rule
  const essentialsPct = 48;
  const treatPct = 22;
  const financePct = 30;

  const essentialsAmount = Math.round(totalSpent * (essentialsPct / 100));
  const treatAmount = Math.round(totalSpent * (treatPct / 100));
  const financeAmount = totalSpent - essentialsAmount - treatAmount;

  return (
    <div className="p-4 rounded-3xl glass-emerald-card text-white select-none relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white">
            Spending Footprint
          </h3>
          <p className="text-[10px] text-emerald-300/70 font-medium">
            This Month Overview
          </p>
        </div>

        {onSeeDetails && (
          <button
            type="button"
            onClick={onSeeDetails}
            className="w-7 h-7 rounded-full glass-button text-emerald-200 hover:text-white flex items-center justify-center border border-lime-400/20 active:scale-95 transition-all cursor-pointer"
            title="See Details"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Main Metric & Legend Row */}
      <div className="flex items-end justify-between mt-2 mb-3">
        <div>
          <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
            {formatCurrency(totalSpent, currency.code)}
          </span>
          <span className="block text-[11px] text-emerald-300/75 font-medium">
            Total Spendings
          </span>
        </div>

        {/* Legend Dots matching reference UI */}
        <div className="flex flex-col gap-1 text-[10px] text-emerald-200/80 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
            <span>Essentials</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
            <span>Treat Yourself</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
            <span>Bills & Finance</span>
          </div>
        </div>
      </div>

      {/* Multi-segment Striped Progress Bar */}
      <div className="w-full">
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/40 border border-white/10 p-[1px] gap-0.5">
          {/* Segment 1: Lime Striped */}
          <div
            className="h-full rounded-l-full striped-pattern-lime transition-all duration-500"
            style={{ width: `${essentialsPct}%` }}
          />
          {/* Segment 2: Orange Striped */}
          <div
            className="h-full striped-pattern-orange transition-all duration-500"
            style={{ width: `${treatPct}%` }}
          />
          {/* Segment 3: Cyan Striped */}
          <div
            className="h-full rounded-r-full striped-pattern-cyan transition-all duration-500"
            style={{ width: `${financePct}%` }}
          />
        </div>

        {/* Amount Sub-ticks */}
        <div className="flex justify-between px-0.5 mt-1 text-[9px] text-emerald-200/50 font-mono">
          <span>{formatCurrency(0, currency.code)}</span>
          <span>{formatCurrency(essentialsAmount, currency.code)}</span>
          <span>{formatCurrency(treatAmount, currency.code)}</span>
          <span>{formatCurrency(financeAmount, currency.code)}</span>
        </div>
      </div>

      {/* 3 Rounded Glass Metric Chips Below */}
      <div className="grid grid-cols-3 gap-2 mt-3.5">
        {/* Chip 1: Essentials */}
        <div className="p-2.5 rounded-2xl bg-white/[0.05] dark:bg-black/30 border border-lime-400/20 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-lime-400/15 text-lime-400 flex items-center justify-center mb-1">
            <ShoppingBag size={14} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-white tabular-nums">{essentialsPct}%</span>
          <span className="text-[9px] text-emerald-200/70 font-medium leading-tight mt-0.5">
            Essentials
          </span>
        </div>

        {/* Chip 2: Treat Yourself */}
        <div className="p-2.5 rounded-2xl bg-white/[0.05] dark:bg-black/30 border border-orange-400/20 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-orange-400/15 text-orange-400 flex items-center justify-center mb-1">
            <Coffee size={14} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-white tabular-nums">{treatPct}%</span>
          <span className="text-[9px] text-emerald-200/70 font-medium leading-tight mt-0.5">
            Treats
          </span>
        </div>

        {/* Chip 3: Finance & Repayments */}
        <div className="p-2.5 rounded-2xl bg-white/[0.05] dark:bg-black/30 border border-sky-400/20 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-sky-400/15 text-sky-400 flex items-center justify-center mb-1">
            <CreditCard size={14} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-white tabular-nums">{financePct}%</span>
          <span className="text-[9px] text-emerald-200/70 font-medium leading-tight mt-0.5">
            Finance
          </span>
        </div>
      </div>
    </div>
  );
};
