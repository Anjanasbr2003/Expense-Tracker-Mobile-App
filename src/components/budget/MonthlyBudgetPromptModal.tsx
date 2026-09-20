import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../../context/SettingsContext';
import { Calendar, Target, Check } from 'lucide-react';
import { hapticSuccess, hapticLight } from '../../utils/haptics';

interface MonthlyBudgetPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyBudgetPromptModal: React.FC<MonthlyBudgetPromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    currency,
    currentMonthBudget,
    updateMonthBudget,
    dismissMonthlyBudgetPrompt,
  } = useSettings();

  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const yearNum = now.getFullYear();

  const defaultAmt = settings.defaultMonthlyBudget || currentMonthBudget || 50000;
  const [budgetInput, setBudgetInput] = useState<string>(
    (currentMonthBudget || defaultAmt).toString()
  );
  const [updateDefaultToo, setUpdateDefaultToo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentVal = parseFloat(budgetInput) || defaultAmt;

  const handleApplyPreset = (amt: number) => {
    hapticLight();
    setBudgetInput(Math.round(amt).toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetInput.replace(/,/g, ''));
    if (isNaN(parsed) || parsed <= 0) return;

    setIsSubmitting(true);
    try {
      await updateMonthBudget(parsed, now.getFullYear(), now.getMonth() + 1, updateDefaultToo);
      hapticSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update monthly budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDefault = async () => {
    setIsSubmitting(true);
    try {
      await updateMonthBudget(defaultAmt, now.getFullYear(), now.getMonth() + 1, false);
      hapticSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to use default budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    await dismissMonthlyBudgetPrompt();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030805]/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto overscroll-contain">
      <div className="w-full max-w-md my-auto max-h-[92vh] overflow-y-auto rounded-3xl glass-emerald-card border border-lime-400/35 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] animate-scale-check">
        {/* Header Branding & Calendar Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl p-[2.5px] bg-gradient-to-tr from-lime-400 via-emerald-400 to-teal-500 shadow-[0_0_24px_rgba(163,230,53,0.35)] transform hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[22px] bg-neutral-950 flex items-center justify-center border border-white/20 shadow-inner">
                <Calendar size={30} className="text-lime-300 drop-shadow-[0_2px_8px_rgba(163,230,53,0.5)]" strokeWidth={2.4} />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-lime-400 text-neutral-950 flex items-center justify-center shadow-md border-2 border-neutral-950">
              <Target size={14} strokeWidth={2.8} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/15 border border-lime-400/30 text-lime-400 text-[11px] font-bold tracking-wide mb-2 uppercase">
            <span>First Day of the Month</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Welcome to {monthName} {yearNum}
          </h2>
          <p className="text-xs text-neutral-600 dark:text-emerald-200/80 mt-1 max-w-xs leading-relaxed font-medium">
            What is your estimated spending budget for this month?
          </p>
        </div>

        {/* Baseline Reference Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium">Baseline Default Target:</span>
          </div>
          <span className="text-xs font-bold text-lime-300 tabular-nums">
            {currency.symbol} {defaultAmt.toLocaleString()}
          </span>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          {/* Estimated Budget Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-emerald-300/90">
                {monthName} Spending Target
              </label>
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                {currency.code}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-emerald-400 tabular-nums">
                {currency.symbol}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="50000"
                autoFocus
                className="w-full pl-12 pr-4 py-3 rounded-2xl glass-panel border border-lime-400/30 text-base font-bold text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 tabular-nums transition-all"
              />
            </div>

            {/* Quick Adjustment Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => handleApplyPreset(defaultAmt)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold tabular-nums cursor-pointer transition-all shrink-0 ${
                  currentVal === defaultAmt
                    ? 'bg-lime-400 text-black font-bold shadow-xs'
                    : 'glass-button text-neutral-300 hover:text-white'
                }`}
              >
                Same as Default
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(defaultAmt * 1.1)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold tabular-nums glass-button text-neutral-300 hover:text-white cursor-pointer shrink-0"
              >
                +10% ({currency.symbol} {Math.round(defaultAmt * 1.1).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(defaultAmt * 0.9)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold tabular-nums glass-button text-neutral-300 hover:text-white cursor-pointer shrink-0"
              >
                -10% ({currency.symbol} {Math.round(defaultAmt * 0.9).toLocaleString()})
              </button>
            </div>
          </div>

          {/* Toggle: Also set as default */}
          <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={updateDefaultToo}
              onChange={(e) => setUpdateDefaultToo(e.target.checked)}
              className="w-4 h-4 rounded border-lime-400/40 text-lime-500 focus:ring-lime-400 bg-neutral-900 cursor-pointer"
            />
            <span className="text-xs text-neutral-300 font-medium">
              Also set as my baseline budget for future months
            </span>
          </label>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-500 text-neutral-950 text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(163,230,53,0.4)] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Check size={18} strokeWidth={2.6} />
              <span>Update {monthName} Budget</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseDefault}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-xl glass-button text-xs font-semibold text-neutral-300 hover:text-white active:scale-95 transition-transform cursor-pointer"
              >
                Keep Default ({currency.symbol} {defaultAmt.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-xl glass-button text-xs font-semibold text-neutral-400 hover:text-neutral-200 active:scale-95 transition-transform cursor-pointer"
              >
                Decide Later
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
