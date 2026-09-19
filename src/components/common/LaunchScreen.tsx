import React, { useEffect, useState } from 'react';
import { Wallet, Sparkles } from 'lucide-react';

interface LaunchScreenProps {
  onComplete: () => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const totalDuration = prefersReducedMotion ? 200 : 1250;
    const fadeDuration = prefersReducedMotion ? 50 : 250;

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, fadeDuration);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black transition-opacity duration-300 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Subtle Financial Orbital Aura */}
        <div className="absolute w-36 h-36 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-aura-pulse pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full border border-emerald-500/10 pointer-events-none" />

        {/* Central SpendWise Emblem */}
        <div className="relative w-20 h-20 rounded-3xl glass-panel border border-emerald-500/30 flex items-center justify-center shadow-[0_0_32px_rgba(16,185,129,0.25)] animate-launch-logo">
          <div className="w-13 h-13 rounded-2xl glass-button-primary flex items-center justify-center text-black shadow-md">
            <Wallet size={28} strokeWidth={2.4} />
          </div>

          {/* Micro sparkle financial accent */}
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
            <Sparkles size={13} strokeWidth={2.2} />
          </div>
        </div>

        {/* App Title & Purpose */}
        <div className="mt-5 text-center animate-fade-slide-up stagger-2">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            SpendWise
          </h1>
          <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 tracking-wider uppercase">
            Offline Personal Finance
          </p>
        </div>
      </div>
    </div>
  );
};
