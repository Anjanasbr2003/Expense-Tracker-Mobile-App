import React, { useState, useEffect } from 'react';
import type { DailySpendingPoint } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../context/SettingsContext';

interface DailyBarChartProps {
  points: DailySpendingPoint[];
  monthName: string;
}

export const DailyBarChart: React.FC<DailyBarChartProps> = ({ points, monthName }) => {
  const { currency } = useSettings();
  const [selectedPoint, setSelectedPoint] = useState<DailySpendingPoint | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 30);
    return () => clearTimeout(timer);
  }, [points, monthName]);

  const maxAmount = Math.max(...points.map((p) => p.amount), 0);
  const totalMonthAmount = points.reduce((sum, p) => sum + p.amount, 0);

  if (totalMonthAmount === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-3.5 rounded-2xl animate-fade-slide-up">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Daily Spending ({monthName})
        </h4>

        {selectedPoint ? (
          <span className="text-[11px] font-semibold tabular-nums text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md animate-scale-check">
            Day {selectedPoint.day}: {formatCurrency(selectedPoint.amount, currency.code)}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-500">Tap bar to inspect</span>
        )}
      </div>

      {/* Chart Bars */}
      <div className="relative pt-4 pb-1">
        <div className="absolute bottom-5 left-0 right-0 h-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="flex items-end justify-between gap-1 h-28 px-0.5 overflow-x-auto">
          {points.map((pt, idx) => {
            const heightPercent = maxAmount > 0 ? (pt.amount / maxAmount) * 100 : 0;
            const isSelected = selectedPoint?.day === pt.day;

            let barColor = 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700';
            if (pt.isPeak) {
              barColor = 'bg-rose-500/80 hover:bg-rose-500';
            } else if (pt.amount > 0) {
              barColor = 'bg-emerald-500/80 hover:bg-emerald-500';
            }

            if (isSelected) {
              barColor = 'bg-emerald-500 ring-2 ring-emerald-400/50';
            }

            return (
              <div
                key={pt.day}
                onClick={() => setSelectedPoint(isSelected ? null : pt)}
                className="flex-1 min-w-[6px] max-w-[12px] flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div
                  className={`w-full rounded-t-xs ${barColor}`}
                  style={{
                    height: isLoaded && pt.amount > 0 ? `${Math.max(heightPercent, 6)}%` : '2px',
                    transition: 'height 420ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms',
                    transitionDelay: isLoaded ? `${Math.min(idx * 12, 320)}ms` : '0ms',
                  }}
                />

                <span
                  className={`text-[8px] mt-1.5 select-none ${
                    pt.isToday
                      ? 'font-bold text-emerald-400'
                      : 'text-neutral-500'
                  }`}
                >
                  {pt.day === 1 || pt.day % 5 === 0 || pt.day === points.length ? pt.day : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
