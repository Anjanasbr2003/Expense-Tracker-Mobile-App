import React from 'react';
import { Lightbulb, Percent, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';

interface RateBreakdownViewProps {
  savingsBalance?: number;
}

export const RateBreakdownView: React.FC<RateBreakdownViewProps> = ({
  savingsBalance = 8250,
}) => {
  const { currency } = useSettings();

  return (
    <div className="space-y-3.5 select-none animate-fade-slide-up">
      {/* 1. Main Card: Your Rate Breakdown (matching left phone of reference image) */}
      <div className="p-4 rounded-3xl glass-emerald-card text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">
              Your Rate Breakdown
            </h3>
            <p className="text-[10px] text-emerald-300/70 font-medium">
              Current Balance: {formatCurrency(savingsBalance, currency.code)}
            </p>
          </div>

          <div className="w-7 h-7 rounded-full glass-button text-lime-400 flex items-center justify-center border border-lime-400/30">
            <Percent size={14} />
          </div>
        </div>

        {/* Tier Rate Rows */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
              <span className="text-emerald-100/90">{formatCurrency(0, currency.code)} Up To {formatCurrency(100000, currency.code)}</span>
            </div>
            <span className="text-yellow-400 font-bold tabular-nums">4.85% P.A.</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
              <span className="text-emerald-100/90">{formatCurrency(100000, currency.code)} Up To {formatCurrency(250000, currency.code)}</span>
            </div>
            <span className="text-sky-400 font-bold tabular-nums">4.40% P.A.</span>
          </div>
        </div>

        {/* Visual Tier Step Graph with Diagonal Striped Shading */}
        <div className="w-full relative h-24 mb-2">
          <svg viewBox="0 0 320 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <pattern id="tierYellowHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#facc15" strokeWidth="1.2" opacity="0.4" />
              </pattern>
              <pattern id="tierBlueHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
              </pattern>
            </defs>

            {/* Tier 1 Box: 4.85% */}
            <rect x="10" y="15" width="140" height="50" fill="url(#tierYellowHatch)" stroke="#facc15" strokeWidth="1.5" rx="4" />
            <text x="20" y="32" fill="#facc15" fontSize="11" fontWeight="bold">4.85%</text>

            {/* Tier 2 Box: 4.40% */}
            <rect x="160" y="25" width="150" height="40" fill="url(#tierBlueHatch)" stroke="#38bdf8" strokeWidth="1.5" rx="4" />
            <text x="170" y="42" fill="#38bdf8" fontSize="11" fontWeight="bold">4.40%</text>
          </svg>

          {/* Sub-thresholds along X axis */}
          <div className="flex justify-between px-2 text-[9px] text-emerald-200/50 font-mono -mt-1">
            <span>{formatCurrency(0, currency.code)}</span>
            <span>{formatCurrency(100000, currency.code)}</span>
            <span>{formatCurrency(250000, currency.code)}</span>
          </div>
        </div>

        <p className="text-[10px] text-emerald-200/60 leading-relaxed mt-2 pt-2 border-t border-white/10">
          Bonus interest is calculated on your combined savings balance daily and paid monthly on balances up to {formatCurrency(250000, currency.code)} per customer.
        </p>
      </div>

      {/* 2. Understanding Tiers Card (matching reference UI) */}
      <div className="p-4 rounded-3xl glass-emerald-card text-white relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-lime-400/15 text-lime-400 flex items-center justify-center border border-lime-400/40">
            <Lightbulb size={15} strokeWidth={2.2} />
          </div>
          <h4 className="text-xs font-bold text-white tracking-tight">
            Understanding Tiers
          </h4>
        </div>

        <p className="text-[11px] text-emerald-100/75 leading-relaxed font-normal">
          Your savings up to and including {formatCurrency(100000, currency.code)} earn <strong className="text-yellow-400 font-bold">4.85% P.A.</strong> Your savings from {formatCurrency(100000.01, currency.code)} to {formatCurrency(250000, currency.code)} earn <strong className="text-sky-400 font-bold">4.40% P.A.</strong> Your savings over {formatCurrency(250000, currency.code)} earn the standard base rate.
        </p>

        <div className="mt-3 p-2.5 rounded-2xl bg-white/[0.04] border border-lime-400/20 flex items-center gap-2">
          <ShieldCheck size={16} className="text-lime-400 shrink-0" />
          <span className="text-[10px] font-semibold text-emerald-200">
            100% Offline calculation. Your data stays securely stored on this phone.
          </span>
        </div>
      </div>
    </div>
  );
};
