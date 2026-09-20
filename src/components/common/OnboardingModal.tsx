import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { SUPPORTED_CURRENCIES } from '../../types';
import { User, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { settings, completeOnboarding } = useSettings();

  const [name, setName] = useState<string>('');
  const [budgetStr, setBudgetStr] = useState<string>('50000');
  const [currencyCode, setCurrencyCode] = useState<string>(settings.currencyCode || 'LKR');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCurrency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.LKR;

  // Preset quick budgets in user's currency
  const presets = [25000, 50000, 100000, 250000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const parsedBudget = parseFloat(budgetStr.replace(/,/g, ''));
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setError('Please enter a valid monthly budget cap');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding(name.trim(), parsedBudget, currencyCode);
      onComplete();
    } catch (err) {
      console.error(err);
      setError('Failed to save settings. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030805]/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto overscroll-contain">
      <div className="w-full max-w-md my-auto max-h-[92vh] overflow-y-auto rounded-3xl glass-emerald-card border border-lime-400/35 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] animate-scale-check">
        {/* Header Branding & SpendWise Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-18 h-18 rounded-3xl p-[2.5px] bg-gradient-to-tr from-lime-400 via-emerald-400 to-teal-500 shadow-[0_0_28px_rgba(163,230,53,0.35)] transform hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[22px] bg-neutral-950 flex items-center justify-center border border-white/20 shadow-inner">
                <Wallet size={34} className="text-lime-300 drop-shadow-[0_2px_8px_rgba(163,230,53,0.5)]" strokeWidth={2.4} />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Welcome to SpendWise
          </h2>
          <p className="text-xs text-neutral-600 dark:text-emerald-200/80 mt-1 max-w-xs leading-relaxed font-medium">
            Let's set up your profile and monthly money cap to get you started.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input 1: User Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-emerald-300/90 mb-1.5">
              What should we call you?
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-emerald-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Anjana"
                maxLength={30}
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-panel border border-lime-400/25 text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all"
              />
            </div>
          </div>

          {/* Input 2: Monthly Money Cap */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-emerald-300/90">
                Monthly Spending Cap
              </label>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                Your target budget limit
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-emerald-500 tabular-nums">
                {selectedCurrency.symbol}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={budgetStr}
                onChange={(e) => {
                  setBudgetStr(e.target.value);
                  if (error) setError('');
                }}
                placeholder="50000"
                className="w-full pl-12 pr-4 py-3 rounded-2xl glass-panel border border-lime-400/25 text-sm font-bold text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 tabular-nums transition-all"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setBudgetStr(amt.toString());
                    if (error) setError('');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold tabular-nums cursor-pointer transition-all ${
                    budgetStr === amt.toString()
                      ? 'bg-lime-400 text-black font-bold shadow-xs'
                      : 'glass-button text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {selectedCurrency.symbol} {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-emerald-300/90 mb-1.5">
              Primary Currency
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrencyCode(c.code)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    currencyCode === c.code
                      ? 'bg-emerald-500 text-white dark:bg-lime-400 dark:text-black shadow-xs'
                      : 'glass-button text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <span>{c.code}</span>
                  <span className="text-[10px] opacity-75 font-normal">({c.symbol})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl glass-button-primary text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all shadow-lg shadow-emerald-950/30 mt-2"
          >
            <span>{isSubmitting ? 'Personalizing...' : 'Get Started'}</span>
            <ArrowRight size={17} strokeWidth={2.8} />
          </button>
        </form>

        {/* Offline Privacy Guarantee */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-neutral-500 dark:text-emerald-200/60 font-medium text-center">
          <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
          <span>100% offline. Your data stays securely on this device.</span>
        </div>
      </div>
    </div>
  );
};
