import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon, LayoutGrid } from 'lucide-react';
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

  const isHome = title === 'SpendWise' || title === 'Dashboard';

  return (
    <header className="px-4 pt-3.5 pb-2.5 flex items-center justify-between shrink-0 safe-top z-20 select-none">
      {isHome ? (
        /* Home Header: Avatar + "Welcome Jhon Snow" from reference UI */
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-lime-400/80 to-emerald-500/40 shadow-[0_0_12px_rgba(163,230,53,0.3)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center text-lime-300 font-bold text-xs border border-white/20">
              <span className="tracking-tight">JS</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-400 ring-2 ring-[#030805]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-emerald-200/70 dark:text-emerald-100/60 leading-tight">
              Welcome
            </span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              Jhon Snow
            </span>
          </div>
        </div>
      ) : (
        /* Sub-screen Header: Crisp Title & Subtitle */
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-300/70 font-medium leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {rightAction}

        {/* Minimalist Live Offline Status Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300/90 glass-button px-2.5 py-1 rounded-full border border-lime-400/20"
          title="100% offline, persistent on device"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.9)]" />
          <span className="tracking-tight">Offline</span>
        </div>

        {/* Circular Grid/Menu Action Button (from reference UI) */}
        <div
          className="w-9 h-9 rounded-full glass-button text-neutral-600 dark:text-emerald-200 flex items-center justify-center border border-lime-400/25 shadow-sm"
          title="Overview Widgets"
        >
          <LayoutGrid size={17} strokeWidth={2} />
        </div>

        {/* Circular Fluid Theme Toggle Button (Apple Glass) */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-9 h-9 rounded-full glass-button text-neutral-600 dark:text-emerald-200 active:scale-90 transition-all cursor-pointer flex items-center justify-center border border-lime-400/25 shadow-sm overflow-hidden"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {/* Sun Icon */}
            <Sun
              size={17}
              strokeWidth={2}
              className={`absolute transition-all duration-300 ease-out transform ${
                isDark
                  ? 'rotate-0 scale-100 opacity-100 text-lime-400'
                  : 'rotate-90 scale-0 opacity-0 text-amber-500 pointer-events-none'
              }`}
            />
            {/* Moon Icon */}
            <Moon
              size={17}
              strokeWidth={2}
              className={`absolute transition-all duration-300 ease-out transform ${
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
