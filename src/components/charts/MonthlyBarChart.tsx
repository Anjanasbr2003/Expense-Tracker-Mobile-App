import React, { useState } from 'react';
import type { MonthlySpendingPoint } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../context/SettingsContext';

interface MonthlyBarChartProps {
  points: MonthlySpendingPoint[];
  year: number;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ points, year }) => {
  const { currency } = useSettings();
  const [selectedPoint, setSelectedPoint] = useState<MonthlySpendingPoint | null>(null);

  const maxAmount = Math.max(...points.map((p) => p.amount), 0);
  const totalYearAmount = points.reduce((sum, p) => sum + p.amount, 0);

  if (totalYearAmount === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-3.5 rounded-2xl">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Monthly Spending ({year})
        </h4>

        {selectedPoint ? (
          <span className="text-[11px] font-semibold tabular-nums text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            {selectedPoint.monthName}: {formatCurrency(selectedPoint.amount, currency.code)}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-500">Tap month to inspect</span>
        )}
      </div>

      <div className="relative pt-4 pb-1">
        <div className="absolute bottom-5 left-0 right-0 h-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="flex items-end justify-between gap-1.5 h-28 px-0.5">
          {points.map((pt) => {
            const heightPercent = maxAmount > 0 ? (pt.amount / maxAmount) * 100 : 0;
            const isSelected = selectedPoint?.month === pt.month;

            let barColor = 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700';
            if (pt.isPeak && pt.amount > 0) {
              barColor = 'bg-rose-500/80 hover:bg-rose-500';
            } else if (pt.amount > 0) {
              barColor = 'bg-emerald-500/80 hover:bg-emerald-500';
            }

            if (isSelected) {
              barColor = 'bg-emerald-500 ring-2 ring-emerald-400/50';
            }

            return (
              <div
                key={pt.month}
                onClick={() => setSelectedPoint(isSelected ? null : pt)}
                className="flex-1 min-w-[14px] flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div
                  className={`w-full rounded-t-xs transition-all duration-200 ${barColor}`}
                  style={{
                    height: pt.amount > 0 ? `${Math.max(heightPercent, 6)}%` : '2px',
                  }}
                />

                <span
                  className={`text-[9px] mt-1.5 select-none ${
                    pt.isCurrentMonth
                      ? 'font-bold text-emerald-400'
                      : 'text-neutral-500'
                  }`}
                >
                  {pt.monthShort}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
