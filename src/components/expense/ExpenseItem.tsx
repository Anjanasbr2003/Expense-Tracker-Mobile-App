import React from 'react';
import type { Expense, Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDateTime } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';
import { CreditCard, Banknote, Building, HelpCircle, Trash2 } from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  onEdit: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  showDate?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  category,
  onEdit,
  onDelete,
  showDate = true,
}) => {
  const { currency } = useSettings();

  const categoryName = category?.name || 'Other';
  const categoryIcon = category?.icon || 'MoreHorizontal';
  const categoryColor = category?.color || '#64748b';

  const getPaymentIcon = () => {
    switch (expense.paymentMethod) {
      case 'Cash':
        return <Banknote size={11} className="text-emerald-500" />;
      case 'Card':
        return <CreditCard size={11} className="text-blue-400" />;
      case 'Bank Transfer':
        return <Building size={11} className="text-indigo-400" />;
      default:
        return <HelpCircle size={11} className="text-neutral-500" />;
    }
  };

  return (
    <div
      onClick={() => onEdit(expense)}
      className="group flex items-center justify-between p-2.5 rounded-2xl glass-button active:scale-[0.98] transition-all cursor-pointer select-none"
    >
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
          style={{
            backgroundColor: `${categoryColor}22`,
            color: categoryColor,
          }}
        >
          <CategoryIcon name={categoryIcon} size={15} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-200 truncate">
              {categoryName}
            </span>
            {expense.isDemo && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Demo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-none">
            {expense.note ? (
              <span className="truncate max-w-[130px] text-neutral-600 dark:text-neutral-300 font-medium">
                {expense.note}
              </span>
            ) : null}

            {expense.note && showDate && <span>•</span>}

            {showDate && (
              <span className="shrink-0 font-normal">
                {formatRelativeDateTime(expense.date, expense.time)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Tabular Amount & Method */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <div className="flex flex-col items-end">
          <span className="font-bold text-xs tabular-nums text-neutral-900 dark:text-neutral-100 tracking-tight">
            -{formatCurrency(expense.amount, currency.code)}
          </span>

          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-neutral-500 dark:text-neutral-400 font-medium">
            {getPaymentIcon()}
            <span>{expense.paymentMethod}</span>
          </div>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense);
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg active:scale-90"
            title="Delete Expense"
            aria-label="Delete Expense"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
