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
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'home'
              ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          aria-label="Home Dashboard"
        >
          <Home size={21} strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />
          <span className="text-[11px] mt-1 tracking-tight font-medium">Home</span>
        </button>

        {/* History Tab */}
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'history'
              ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          aria-label="Transaction History"
        >
          <ReceiptText size={21} strokeWidth={activeTab === 'history' ? 2.4 : 1.8} />
          <span className="text-[11px] mt-1 tracking-tight font-medium">History</span>
        </button>

        {/* Center Quick Add Action Button (Apple Glass Floating Orb) */}
        <div className="flex items-center justify-center px-1.5 -mt-2">
          <button
            type="button"
            onClick={onQuickAdd}
            className="w-13 h-13 rounded-2xl glass-button-primary text-black font-bold flex items-center justify-center active:scale-90 transition-all cursor-pointer"
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
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          aria-label="Analytics"
        >
          <BarChart2 size={21} strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8} />
          <span className="text-[11px] mt-1 tracking-tight font-medium">Analytics</span>
        </button>

        {/* Settings Tab */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'settings'
              ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
          aria-label="Settings"
        >
          <Settings size={21} strokeWidth={activeTab === 'settings' ? 2.4 : 1.8} />
          <span className="text-[11px] mt-1 tracking-tight font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
};
