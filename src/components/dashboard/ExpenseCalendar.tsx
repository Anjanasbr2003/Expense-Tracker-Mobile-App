import React, { useState, useMemo } from 'react';
import type { Expense } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { getTodayDateString, getMonthName } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, CalendarDays } from 'lucide-react';
import { hapticLight } from '../../utils/haptics';
import { useTranslation } from '../../utils/i18n';

interface ExpenseCalendarProps {
  expenses: Expense[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  currencyCode: string;
}

interface CalendarDayCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasExpenses: boolean;
  totalSpent: number;
  expenseCount: number;
}

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({
  expenses,
  selectedDate,
  onSelectDate,
  currencyCode,
}) => {
  const { t } = useTranslation();
  const todayStr = useMemo(() => getTodayDateString(), []);
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [isWeekView, setIsWeekView] = useState<boolean>(false);

  // Fast O(1) map of date string -> daily aggregate metrics
  const dailyExpenseMap = useMemo(() => {
    const map: Record<string, { total: number; count: number; items: Expense[] }> = {};
    for (let i = 0; i < expenses.length; i++) {
      const exp = expenses[i];
      if (!map[exp.date]) {
        map[exp.date] = { total: 0, count: 0, items: [] };
      }
      map[exp.date].total += exp.amount;
      map[exp.date].count += 1;
      map[exp.date].items.push(exp);
    }
    return map;
  }, [expenses]);

  // Calculate total spent in the currently viewed month
  const monthTotal = useMemo(() => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const prefix = `${viewYear}-${mStr}-`;
    let sum = 0;
    for (let i = 0; i < expenses.length; i++) {
      if (expenses[i].date.startsWith(prefix)) {
        sum += expenses[i].amount;
      }
    }
    return sum;
  }, [expenses, viewYear, viewMonth]);

  // Construct calendar grid cells
  const cells = useMemo(() => {
    const result: CalendarDayCell[] = [];
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // 1. Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;
      const dayData = dailyExpenseMap[dateStr];

      result.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasExpenses: !!(dayData && dayData.count > 0),
        totalSpent: dayData?.total || 0,
        expenseCount: dayData?.count || 0,
      });
    }

    // 2. Days of current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${viewYear}-${mStr}-${dStr}`;
      const dayData = dailyExpenseMap[dateStr];

      result.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasExpenses: !!(dayData && dayData.count > 0),
        totalSpent: dayData?.total || 0,
        expenseCount: dayData?.count || 0,
      });
    }

    // 3. Trailing days from next month to complete 7-day row alignment
    const totalSoFar = result.length;
    const totalNeeded = totalSoFar % 7 === 0 ? totalSoFar : totalSoFar + (7 - (totalSoFar % 7));
    const trailingDaysCount = totalNeeded - totalSoFar;

    for (let day = 1; day <= trailingDaysCount; day++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;
      const dayData = dailyExpenseMap[dateStr];

      result.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasExpenses: !!(dayData && dayData.count > 0),
        totalSpent: dayData?.total || 0,
        expenseCount: dayData?.count || 0,
      });
    }

    return result;
  }, [viewYear, viewMonth, todayStr, selectedDate, dailyExpenseMap]);

  // Compute visible cells (all rows for month view, single row for week view)
  const visibleCells = useMemo(() => {
    if (!isWeekView) return cells;
    const activeIdx = cells.findIndex(
      (c) => c.isSelected || (selectedDate === null && c.isToday)
    );
    const targetIdx = activeIdx >= 0 ? activeIdx : cells.findIndex((c) => c.isCurrentMonth);
    const rowIndex = Math.floor(Math.max(0, targetIdx) / 7);
    return cells.slice(rowIndex * 7, (rowIndex + 1) * 7);
  }, [cells, isWeekView, selectedDate]);

  const handlePrevMonth = () => {
    hapticLight();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    hapticLight();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    hapticLight();
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(todayStr);
  };

  const handleDayClick = (cell: CalendarDayCell) => {
    hapticLight();
    if (!cell.isCurrentMonth) {
      const parts = cell.dateStr.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }

    if (selectedDate === cell.dateStr) {
      onSelectDate(null);
    } else {
      onSelectDate(cell.dateStr);
    }
  };

  const formatReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  const monthLabel = `${getMonthName(viewMonth + 1, false)} ${viewYear}`;
  const isViewingCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="p-3.5 rounded-3xl glass-emerald-card border border-lime-400/25 shadow-[0_8px_30px_rgba(0,0,0,0.12)] select-none">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center border border-lime-400/30">
            <CalendarIcon size={14} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-tight">
              {monthLabel}
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-300/80 font-semibold tabular-nums">
              {t('Spent:')} {formatCurrency(monthTotal, currencyCode)}
            </p>
          </div>
        </div>

        {/* Action Controls: Today Jump, Week/Month Toggle, Prev/Next Arrows */}
        <div className="flex items-center gap-1">
          {!isViewingCurrentMonth && (
            <button
              type="button"
              onClick={handleGoToToday}
              className="px-2 py-1 rounded-lg glass-button text-[10px] font-bold text-lime-600 dark:text-lime-300 hover:border-lime-400/50 active:scale-95 transition-all cursor-pointer"
              title="Jump to today"
            >
              {t('Today')}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsWeekView(!isWeekView);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 border ${
              isWeekView
                ? 'bg-lime-400/20 text-lime-400 border-lime-400/40'
                : 'glass-button text-neutral-600 dark:text-emerald-200/80 border-lime-400/20'
            }`}
          >
            {isWeekView ? 'Week' : t('Month')}
          </button>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg glass-button flex items-center justify-center text-neutral-700 dark:text-emerald-200 hover:text-neutral-900 dark:hover:text-white active:scale-90 transition-all cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft size={14} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg glass-button flex items-center justify-center text-neutral-700 dark:text-emerald-200 hover:text-neutral-900 dark:hover:text-white active:scale-90 transition-all cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Weekday Header Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
        {WEEKDAY_HEADERS.map((dayName, idx) => (
          <div
            key={dayName}
            className={`text-[11px] font-bold py-0.5 uppercase tracking-wider ${
              idx === 0 || idx === 6
                ? 'text-emerald-600/70 dark:text-emerald-400/50'
                : 'text-neutral-500 dark:text-emerald-200/60'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* 3. Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {visibleCells.map((cell) => {
          const { dateStr, dayNumber, isCurrentMonth, isToday, isSelected, hasExpenses } = cell;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(cell)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-tr from-lime-400 via-emerald-400 to-emerald-500 text-neutral-950 font-black shadow-[0_2px_14px_rgba(163,230,53,0.45)] scale-105 z-10'
                  : isToday
                  ? 'border border-lime-400/80 bg-lime-400/10 text-lime-600 dark:text-lime-300 font-extrabold shadow-[0_0_8px_rgba(163,230,53,0.2)]'
                  : isCurrentMonth
                  ? 'text-neutral-800 dark:text-neutral-100 font-semibold hover:bg-white/10 dark:hover:bg-white/5'
                  : 'text-neutral-400/40 dark:text-neutral-600 font-medium hover:text-neutral-400'
              }`}
              title={`${cell.dateStr}${hasExpenses ? ` · ${cell.expenseCount} expenses` : ''}`}
            >
              {/* Day Number */}
              <span className="text-xs leading-none tabular-nums">
                {dayNumber}
              </span>

              {/* Expense Indicator Dot */}
              <div className="h-1.5 flex items-center justify-center mt-1">
                {hasExpenses ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isSelected
                        ? 'bg-neutral-950'
                        : 'bg-lime-500 dark:bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.85)]'
                    }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Selected Day Info Strip (Displays when user clicks a date) */}
      {selectedDate && (
        <div className="mt-3 p-2.5 rounded-2xl bg-lime-400/10 dark:bg-lime-400/15 border border-lime-400/30 flex items-center justify-between text-xs animate-scale-check">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-lime-400 text-neutral-950 flex items-center justify-center font-bold shadow-xs">
              <CalendarDays size={14} strokeWidth={2.4} />
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white block leading-tight">
                {formatReadableDate(selectedDate)}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                {dailyExpenseMap[selectedDate]?.count || 0}{' '}
                {dailyExpenseMap[selectedDate]?.count === 1 ? 'expense' : 'expenses'} logged
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-neutral-900 dark:text-white tabular-nums text-xs">
              {formatCurrency(dailyExpenseMap[selectedDate]?.total || 0, currencyCode)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                hapticLight();
                onSelectDate(null);
              }}
              className="w-6 h-6 rounded-full bg-neutral-200/80 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="Clear date filter"
              aria-label="Clear date filter"
            >
              <X size={12} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
