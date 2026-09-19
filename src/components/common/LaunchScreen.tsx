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

    // Calibrated precisely to 1.5 seconds (1500ms) animation duration
    const totalDuration = prefersReducedMotion ? 200 : 1500;
    const fadeDuration = prefersReducedMotion ? 50 : 280;

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030805] dark:bg-[#030805] transition-opacity duration-300 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Radiant ambient emerald top wash matching reference UI */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.22)_0%,rgba(16,185,129,0.06)_45%,transparent_75%)] pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center">
        {/* Synchronized Financial Orbital Aura (1.5s expansion) */}
        <div className="absolute w-44 h-44 rounded-full border border-emerald-400/25 bg-emerald-500/10 animate-aura-pulse pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full border border-emerald-400/10 pointer-events-none" />

        {/* Central SpendWise Vault Emblem (1.5s fluid ease-out settle) */}
        <div className="relative w-22 h-22 rounded-3xl glass-panel border border-emerald-400/35 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.35)] animate-launch-logo">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-lime-400 via-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-900/40">
            <Wallet size={30} strokeWidth={2.4} />
          </div>

          {/* Micro sparkle financial accent */}
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center border border-lime-400/50 shadow-[0_0_12px_rgba(163,230,53,0.6)]">
            <Sparkles size={14} strokeWidth={2.4} />
          </div>
        </div>

        {/* App Title & Tagline */}
        <div className="mt-6 text-center animate-fade-slide-up stagger-2">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            SpendWise
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.9)]" />
          </h1>
          <p className="text-[11px] font-semibold text-emerald-400/80 mt-1 tracking-widest uppercase">
            Offline Personal Finance
          </p>
        </div>
      </div>
    </div>
  );
};
