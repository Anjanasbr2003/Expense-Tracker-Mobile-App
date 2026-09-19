import React, { useRef } from 'react';
import { Home, ReceiptText, BarChart2, Settings, Plus } from 'lucide-react';
import { useLiquidGlassPhysics } from '../../hooks/useLiquidGlassPhysics';
import { LiquidGlassCapsule } from './LiquidGlassCapsule';

export type TabType = 'home' | 'history' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dedicated refs for dynamic bounding rect tracking
  const homeRef = useRef<HTMLButtonElement | null>(null);
  const historyRef = useRef<HTMLButtonElement | null>(null);
  const analyticsRef = useRef<HTMLButtonElement | null>(null);
  const settingsRef = useRef<HTMLButtonElement | null>(null);

  const tabRefs: Record<TabType, React.RefObject<HTMLButtonElement | null>> = {
    home: homeRef,
    history: historyRef,
    analytics: analyticsRef,
    settings: settingsRef,
  };

  // Spring-damper physics engine with velocity deformation
  const physics = useLiquidGlassPhysics(activeTab, tabRefs, containerRef);

  return (
    <nav className="shrink-0 px-3 pb-2 pt-1 z-30 select-none safe-bottom">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between px-2 h-16 rounded-3xl glass-dock-floating border border-lime-400/25 dark:border-lime-400/20 shadow-xl overflow-visible"
      >
        {/* Continuous Liquid Glass Travelling Capsule */}
        <LiquidGlassCapsule physics={physics} />

        {/* 1. Home Tab */}
        <button
          ref={homeRef}
          type="button"
          onClick={() => onTabChange('home')}
          className={`relative z-20 flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 cursor-pointer transition-colors duration-200 ${
            activeTab === 'home'
              ? 'text-neutral-900 dark:text-lime-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-emerald-100/60 dark:hover:text-white font-medium'
          }`}
          aria-label="Home Dashboard"
        >
          <div
            className={`transition-all duration-200 transform ${
              activeTab === 'home' ? 'scale-110 -translate-y-0.5' : 'scale-95'
            }`}
          >
            <Home size={21} strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* 2. Accounts / History Tab */}
        <button
          ref={historyRef}
          type="button"
          onClick={() => onTabChange('history')}
          className={`relative z-20 flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 cursor-pointer transition-colors duration-200 ${
            activeTab === 'history'
              ? 'text-neutral-900 dark:text-lime-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-emerald-100/60 dark:hover:text-white font-medium'
          }`}
          aria-label="Accounts and History"
        >
          <div
            className={`transition-all duration-200 transform ${
              activeTab === 'history' ? 'scale-110 -translate-y-0.5' : 'scale-95'
            }`}
          >
            <ReceiptText size={21} strokeWidth={activeTab === 'history' ? 2.4 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">History</span>
        </button>

        {/* Center Quick Add Action Button (Apple Glass Floating Orb) */}
        <div className="relative z-30 flex items-center justify-center px-1 -mt-3">
          <button
            type="button"
            onClick={onQuickAdd}
            className="w-13 h-13 rounded-2xl glass-button-primary text-black font-black flex items-center justify-center active:scale-90 active:ring-4 active:ring-lime-400/40 transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-950/40"
            aria-label="Add Expense"
            title="Add Expense"
          >
            <Plus size={26} strokeWidth={2.8} />
          </button>
        </div>

        {/* 3. Analytics / Spending Footprint Tab */}
        <button
          ref={analyticsRef}
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`relative z-20 flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 cursor-pointer transition-colors duration-200 ${
            activeTab === 'analytics'
              ? 'text-neutral-900 dark:text-lime-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-emerald-100/60 dark:hover:text-white font-medium'
          }`}
          aria-label="Analytics"
        >
          <div
            className={`transition-all duration-200 transform ${
              activeTab === 'analytics' ? 'scale-110 -translate-y-0.5' : 'scale-95'
            }`}
          >
            <BarChart2 size={21} strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Analytics</span>
        </button>

        {/* 4. Settings / Profile Tab */}
        <button
          ref={settingsRef}
          type="button"
          onClick={() => onTabChange('settings')}
          className={`relative z-20 flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 cursor-pointer transition-colors duration-200 ${
            activeTab === 'settings'
              ? 'text-neutral-900 dark:text-lime-300 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-emerald-100/60 dark:hover:text-white font-medium'
          }`}
          aria-label="Settings"
        >
          <div
            className={`transition-all duration-200 transform ${
              activeTab === 'settings' ? 'scale-110 -translate-y-0.5' : 'scale-95'
            }`}
          >
            <Settings size={21} strokeWidth={activeTab === 'settings' ? 2.4 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
