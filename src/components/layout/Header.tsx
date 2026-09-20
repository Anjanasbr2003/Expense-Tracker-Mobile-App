import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon } from 'lucide-react';
import { executeThemeTransition } from '../../utils/themeTransition';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onAvatarClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightAction,
  onAvatarClick,
}) => {
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
  const userName = settings.userName?.trim() || 'Friend';
  const userInitials = settings.userName?.trim()
    ? settings.userName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SW';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="px-4 pt-3.5 pb-2 flex items-center justify-between shrink-0 safe-top z-20 select-none">
      {isHome ? (
        /* Home Header: Refined Frosted Avatar + Personalized Greeting */
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAvatarClick}
            className="group relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-lime-400 via-emerald-400 to-teal-500 shadow-[0_0_16px_rgba(163,230,53,0.25)] active:scale-95 transition-transform cursor-pointer"
            title="Profile & Settings"
            aria-label="View Profile and Settings"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 dark:bg-black flex items-center justify-center text-lime-300 font-extrabold text-xs tracking-wider border border-white/20 group-hover:border-lime-400/60 transition-colors shadow-inner">
              <span>{userInitials}</span>
            </div>
          </button>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400/80 tracking-wide leading-tight">
              {getGreeting()},
            </span>
            <span className="text-base font-extrabold text-neutral-900 dark:text-white leading-tight tracking-tight truncate max-w-[170px]">
              {userName}
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

        {/* Circular Fluid Theme Toggle Button (Frosted Glass) */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center border border-lime-400/25 dark:border-white/10 hover:border-lime-400/50 text-neutral-700 dark:text-emerald-200 shadow-sm active:scale-90 transition-all cursor-pointer overflow-hidden"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {/* Sun Icon */}
            <Sun
              size={18}
              strokeWidth={2.2}
              className={`absolute transition-all duration-300 ease-out transform ${
                isDark
                  ? 'rotate-0 scale-100 opacity-100 text-lime-400'
                  : 'rotate-90 scale-0 opacity-0 text-amber-500 pointer-events-none'
              }`}
            />
            {/* Moon Icon */}
            <Moon
              size={18}
              strokeWidth={2.2}
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
