import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon } from 'lucide-react';
import { executeThemeTransition } from '../../utils/themeTransition';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, rightAction }) => {
  const { isDark, setTheme, settings } = useSettings();

  const handleToggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    executeThemeTransition(() => {
      if (settings.theme === 'dark') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    }, e);
  };

  return (
    <header className="px-4 pt-3 pb-2.5 flex items-center justify-between glass-panel border-x-0 border-t-0 rounded-none shrink-0 safe-top transition-colors duration-300 z-20">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium leading-none">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {rightAction}

        {/* Minimalist Live Offline Status Indicator */}
        <div
          className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-300 glass-button px-2.5 py-1 rounded-full"
          title="100% offline, persistent on device"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
          <span className="tracking-tight font-semibold">Offline</span>
        </div>

        {/* Tactile Fluid Theme Toggle Button (Apple Glass) */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-9 h-9 rounded-xl glass-button text-neutral-600 dark:text-neutral-300 active:scale-90 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {/* Sun Icon */}
            <Sun
              size={18}
              strokeWidth={1.9}
              className={`absolute transition-all duration-350 ease-out transform ${
                isDark
                  ? 'rotate-0 scale-100 opacity-100 text-amber-400'
                  : 'rotate-90 scale-0 opacity-0 text-amber-500 pointer-events-none'
              }`}
            />
            {/* Moon Icon */}
            <Moon
              size={18}
              strokeWidth={1.9}
              className={`absolute transition-all duration-350 ease-out transform ${
                isDark
                  ? '-rotate-90 scale-0 opacity-0 text-neutral-400 pointer-events-none'
                  : 'rotate-0 scale-100 opacity-100 text-neutral-700'
              }`}
            />
          </div>
        </button>
      </div>
    </header>
  );
};
