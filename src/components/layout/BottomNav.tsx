import React from 'react';
import { Home, ReceiptText, BarChart2, Settings, Plus } from 'lucide-react';

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
  return (
    <nav className="shrink-0 glass-dock safe-bottom z-30 select-none">
      <div className="flex items-center justify-around px-3 h-16 relative">
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`group flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-[0.96] duration-150 cursor-pointer ${
            activeTab === 'home'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium'
          }`}
          aria-label="Home Dashboard"
        >
          <div className={`transition-transform duration-200 ${activeTab === 'home' ? 'scale-[1.08]' : 'group-hover:scale-105'}`}>
            <Home size={21} strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
          {activeTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] mt-0.5 animate-scale-check" />
          )}
        </button>

        {/* History Tab */}
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`group flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-[0.96] duration-150 cursor-pointer ${
            activeTab === 'history'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium'
          }`}
          aria-label="Transaction History"
        >
          <div className={`transition-transform duration-200 ${activeTab === 'history' ? 'scale-[1.08]' : 'group-hover:scale-105'}`}>
            <ReceiptText size={21} strokeWidth={activeTab === 'history' ? 2.4 : 1.8} />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">History</span>
          {activeTab === 'history' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] mt-0.5 animate-scale-check" />
          )}
        </button>

        {/* Center Quick Add Action Button (Apple Glass Floating Orb) */}
        <div className="flex items-center justify-center px-1.5 -mt-2">
          <button
            type="button"
            onClick={onQuickAdd}
            className="w-13 h-13 rounded-2xl glass-button-primary text-black font-bold flex items-center justify-center active:scale-[0.96] active:ring-4 active:ring-emerald-500/30 transition-all duration-150 cursor-pointer shadow-lg"
            aria-label="Add Expense"
            title="Add Expense"
          >
            <Plus size={26} strokeWidth={2.6} />
          </button>
        </div>

        {/* Analytics Tab */}
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`group flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-[0.96] duration-150 cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium'
          }`}
          aria-label="Analytics"
        >
          <div className={`transition-transform duration-200 ${activeTab === 'analytics' ? 'scale-[1.08]' : 'group-hover:scale-105'}`}>
            <BarChart2 size={21} strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8} />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Analytics</span>
          {activeTab === 'analytics' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] mt-0.5 animate-scale-check" />
          )}
        </button>

        {/* Settings Tab */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`group flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-[0.96] duration-150 cursor-pointer ${
            activeTab === 'settings'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium'
          }`}
          aria-label="Settings"
        >
          <div className={`transition-transform duration-200 ${activeTab === 'settings' ? 'scale-[1.08]' : 'group-hover:scale-105'}`}>
            <Settings size={21} strokeWidth={activeTab === 'settings' ? 2.4 : 1.8} />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Settings</span>
          {activeTab === 'settings' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] mt-0.5 animate-scale-check" />
          )}
        </button>
      </div>
    </nav>
  );
};
