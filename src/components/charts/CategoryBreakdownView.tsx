import React, { useState, useEffect } from 'react';
import type { CategoryBreakdownItem } from '../../utils/calculations';
import { useSettings } from '../../context/SettingsContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface CategoryBreakdownViewProps {
  breakdown: CategoryBreakdownItem[];
  title?: string;
}

export const CategoryBreakdownView: React.FC<CategoryBreakdownViewProps> = ({
  breakdown,
  title = 'Category Breakdown',
}) => {
  const { currency } = useSettings();
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
  }, [breakdown]);

  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-3.5 rounded-2xl animate-fade-slide-up">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        {title}
      </h4>

      {/* Multi-segment distribution strip */}
      <div className="h-2 w-full rounded-full overflow-hidden flex mb-4 bg-neutral-200 dark:bg-neutral-800">
        {breakdown.map((item) => (
          <div
            key={item.categoryId}
            style={{
              width: isLoaded ? `${item.percentage}%` : '0%',
              backgroundColor: item.categoryColor,
              transition: 'width 550ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            title={`${item.categoryName}: ${item.percentage}%`}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-2.5">
        {breakdown.map((item, idx) => (
          <div key={item.categoryId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${item.categoryColor}18`,
                    color: item.categoryColor,
                  }}
                >
                  <CategoryIcon name={item.categoryIcon} size={12} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[11px] text-neutral-800 dark:text-neutral-200">
                    {item.categoryName}
                  </span>
                  <span className="text-[9px] text-neutral-500">
                    ({item.count})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 text-right text-xs">
                  <AnimatedNumber value={item.totalAmount} currencyCode={currency.code} />
                </span>
                <span className="text-[10px] tabular-nums font-semibold text-neutral-500 dark:text-neutral-400 min-w-[32px] text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Individual Progress Bar */}
            <div className="w-full h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: isLoaded ? `${item.percentage}%` : '0%',
                  backgroundColor: item.categoryColor,
                  transition: 'width 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${Math.min(idx * 30, 200)}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
