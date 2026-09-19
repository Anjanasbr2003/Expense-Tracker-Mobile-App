import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { calculateBudgetStatus } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { Target, AlertCircle, Edit3, Check, X } from 'lucide-react';

import { AnimatedNumber } from '../common/AnimatedNumber';

interface BudgetCardProps {
  spentAmount: number;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ spentAmount }) => {
  const { settings, currency, setMonthlyBudget } = useSettings();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [budgetString, setBudgetString] = useState<string>(
    (settings.defaultMonthlyBudget || 0).toString()
  );

  const budgetAmount = settings.defaultMonthlyBudget || 0;
  const status = calculateBudgetStatus(spentAmount, budgetAmount);

  const handleSaveBudget = async () => {
    const parsed = parseFloat(budgetString);
    if (!isNaN(parsed) && parsed >= 0) {
      await setMonthlyBudget(parsed);
    }
    setIsEditing(false);
  };

  // If no budget is set and not editing, show a subtle setup invitation
  if (budgetAmount <= 0 && !isEditing) {
    return (
      <div className="p-3.5 rounded-2xl glass-panel border-dashed flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl glass-button text-neutral-500 dark:text-neutral-400 flex items-center justify-center">
            <Target size={16} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200">
              Set Monthly Budget
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Keep monthly spending on track
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setBudgetString('60000');
            setIsEditing(true);
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold glass-button hover:border-emerald-500/40 text-neutral-900 dark:text-neutral-200 active:scale-95 transition-all cursor-pointer"
        >
          Configure
        </button>
      </div>
    );
  }

  // Inline Quick Editing
  if (isEditing) {
    return (
      <div className="p-3.5 rounded-2xl glass-panel border-emerald-500/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Monthly Limit
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveBudget}
              className="p-1.5 text-emerald-500 glass-button rounded-lg active:scale-90 transition-all cursor-pointer"
              title="Save"
            >
              <Check size={16} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-neutral-400 glass-button rounded-lg active:scale-90 transition-all cursor-pointer"
              title="Cancel"
            >
              <X size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2">
          <span className="text-xs font-bold text-neutral-400 mr-2">{currency.symbol}</span>
          <input
            type="number"
            min="0"
            step="100"
            value={budgetString}
            onChange={(e) => setBudgetString(e.target.value)}
            className="w-full text-xs font-bold tabular-nums text-neutral-900 dark:text-white bg-transparent outline-hidden"
            autoFocus
          />
        </div>
      </div>
    );
  }

  // Status-aware colors
  let progressColor = 'bg-emerald-500';
  let badgeStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (status.isOverBudget) {
    progressColor = 'bg-rose-500';
    badgeStyle = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (status.isNearBudget) {
    progressColor = 'bg-amber-400';
    badgeStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="p-3.5 rounded-2xl glass-panel flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Monthly Target
          </span>
          <button
            type="button"
            onClick={() => {
              setBudgetString(budgetAmount.toString());
              setIsEditing(true);
            }}
            className="p-1 rounded-md glass-button text-neutral-400 hover:text-neutral-200 transition-colors active:scale-90 cursor-pointer"
            title="Edit Budget"
          >
            <Edit3 size={11} />
          </button>
        </div>

        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border tabular-nums ${badgeStyle}`}>
          {status.isOverBudget ? 'Exceeded' : `${status.percentageUsed}% used`}
        </span>
      </div>

      {/* Figures Row */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-xs font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
          <AnimatedNumber value={status.spentAmount} currencyCode={currency.code} />
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal ml-1">
            / {formatCurrency(status.budgetAmount, currency.code)}
          </span>
        </div>

        <div className="text-[11px] font-medium tabular-nums">
          <span
            className={
              status.isOverBudget
                ? 'text-rose-500 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400'
            }
          >
            {status.isOverBudget ? (
              <>
                +<AnimatedNumber value={Math.abs(status.remainingAmount)} currencyCode={currency.code} /> over
              </>
            ) : (
              <>
                <AnimatedNumber value={status.remainingAmount} currencyCode={currency.code} /> left
              </>
            )}
          </span>
        </div>
      </div>

      {/* Hairline Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
        />
      </div>

      {status.isNearBudget && !status.isOverBudget && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-500 font-medium">
          <AlertCircle size={11} />
          <span>Used {status.percentageUsed}% of limit</span>
        </div>
      )}
    </div>
  );
};
