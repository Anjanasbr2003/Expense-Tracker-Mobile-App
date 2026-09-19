import React from 'react';
import type { CategoryBreakdownItem } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../context/SettingsContext';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryBreakdownViewProps {
  breakdown: CategoryBreakdownItem[];
  title?: string;
}

export const CategoryBreakdownView: React.FC<CategoryBreakdownViewProps> = ({
  breakdown,
  title = 'Category Breakdown',
}) => {
  const { currency } = useSettings();

  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-3.5 rounded-2xl">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        {title}
      </h4>

      {/* Multi-segment distribution strip */}
      <div className="h-2 w-full rounded-full overflow-hidden flex mb-4 bg-neutral-200 dark:bg-neutral-800">
        {breakdown.map((item) => (
          <div
            key={item.categoryId}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.categoryColor,
            }}
            title={`${item.categoryName}: ${item.percentage}%`}
            className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-2.5">
        {breakdown.map((item) => (
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
                  {formatCurrency(item.totalAmount, currency.code)}
                </span>
                <span className="text-[10px] tabular-nums font-semibold text-neutral-500 dark:text-neutral-400 min-w-[32px] text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Individual Progress Bar */}
            <div className="w-full h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.categoryColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
