import type { Expense, Category } from '../types';
import { getTodayDateString, getDaysInMonth, getMonthName } from './dateUtils';

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  percentage: number;
  count: number;
}

export interface DailySpendingPoint {
  day: number; // 1 to 31
  date: string; // YYYY-MM-DD
  amount: number;
  count: number;
  isToday: boolean;
  isPeak: boolean;
}

export interface MonthlySpendingPoint {
  month: number; // 1 to 12
  monthName: string;
  monthShort: string;
  amount: number;
  count: number;
  isCurrentMonth: boolean;
  isPeak: boolean;
}

export interface BudgetStatus {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearBudget: boolean; // >= 80%
}

/**
 * Calculates total spent today.
 */
export function calculateTodayTotal(expenses: Expense[], targetTodayStr?: string): number {
  const todayStr = targetTodayStr || getTodayDateString();
  return expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

/**
 * Calculates total spent in a specific month and year.
 * month is 1-indexed (1 = January, 12 = December).
 */
export function calculateMonthTotal(expenses: Expense[], year: number, month: number): number {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
  return expenses
    .filter((e) => e.date && e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

/**
 * Calculates total spent in a specific calendar year.
 */
export function calculateYearTotal(expenses: Expense[], year: number): number {
  const yearPrefix = `${year}-`;
  return expenses
    .filter((e) => e.date && e.date.startsWith(yearPrefix))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

/**
 * Calculates daily average spending for a month.
 * If viewing the current month, uses elapsed days up to today.
 * If viewing a past month, uses all days in that month.
 * If viewing a future month, returns 0.
 */
export function calculateDailyAverage(
  expenses: Expense[],
  year: number,
  month: number,
  currentDate: Date = new Date()
): number {
  const total = calculateMonthTotal(expenses, year, month);
  if (total <= 0) return 0;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  let days = getDaysInMonth(year, month);
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return 0;
  }
  if (year === currentYear && month === currentMonth) {
    days = Math.max(1, currentDay);
  }

  const avg = total / days;
  return isNaN(avg) || !isFinite(avg) ? 0 : Math.round(avg * 100) / 100;
}

/**
 * Calculates average monthly spending across a year.
 * Divides by months elapsed so far in current year, or 12 for past years.
 */
export function calculateMonthlyAverage(
  expenses: Expense[],
  year: number,
  currentDate: Date = new Date()
): number {
  const total = calculateYearTotal(expenses, year);
  if (total <= 0) return 0;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let monthsCount = 12;
  if (year > currentYear) {
    return 0;
  }
  if (year === currentYear) {
    monthsCount = Math.max(1, currentMonth);
  }

  const avg = total / monthsCount;
  return isNaN(avg) || !isFinite(avg) ? 0 : Math.round(avg * 100) / 100;
}

/**
 * Computes category breakdown for a given list of expenses.
 * Sorted from highest spending to lowest.
 */
export function calculateCategoryBreakdown(
  expenses: Expense[],
  categories: Category[]
): CategoryBreakdownItem[] {
  if (!expenses || expenses.length === 0) return [];

  const categoryMap = new Map<string, Category>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat);
  }

  const totalsMap = new Map<string, { amount: number; count: number }>();
  let totalAll = 0;

  for (const exp of expenses) {
    const amt = exp.amount || 0;
    totalAll += amt;
    const existing = totalsMap.get(exp.categoryId) || { amount: 0, count: 0 };
    totalsMap.set(exp.categoryId, {
      amount: existing.amount + amt,
      count: existing.count + 1,
    });
  }

  const result: CategoryBreakdownItem[] = [];
  totalsMap.forEach((val, catId) => {
    const cat = categoryMap.get(catId);
    const catName = cat ? cat.name : 'Other';
    const catIcon = cat ? cat.icon : 'MoreHorizontal';
    const catColor = cat ? cat.color : '#64748b';

    const percentage = totalAll > 0 ? (val.amount / totalAll) * 100 : 0;

    result.push({
      categoryId: catId,
      categoryName: catName,
      categoryIcon: catIcon,
      categoryColor: catColor,
      totalAmount: Math.round(val.amount * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      count: val.count,
    });
  });

  // Sort descending by amount
  result.sort((a, b) => b.totalAmount - a.totalAmount);
  return result;
}

/**
 * Generates daily spending data points for each day of the month (1..N).
 */
export function getDailySpendingPoints(
  expenses: Expense[],
  year: number,
  month: number
): DailySpendingPoint[] {
  const daysInMonth = getDaysInMonth(year, month);
  const todayStr = getTodayDateString();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const dayMap = new Map<number, { amount: number; count: number }>();
  for (let d = 1; d <= daysInMonth; d++) {
    dayMap.set(d, { amount: 0, count: 0 });
  }

  for (const exp of expenses) {
    if (exp.date && exp.date.startsWith(monthStr)) {
      const parts = exp.date.split('-');
      const dayNum = parseInt(parts[2], 10);
      if (dayMap.has(dayNum)) {
        const item = dayMap.get(dayNum)!;
        item.amount += exp.amount || 0;
        item.count += 1;
      }
    }
  }

  let maxAmount = 0;
  dayMap.forEach((val) => {
    if (val.amount > maxAmount) maxAmount = val.amount;
  });

  const points: DailySpendingPoint[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const data = dayMap.get(d)!;
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    points.push({
      day: d,
      date: dateStr,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
      isToday: dateStr === todayStr,
      isPeak: maxAmount > 0 && data.amount === maxAmount,
    });
  }

  return points;
}

/**
 * Generates monthly spending points for all 12 months in a given year.
 */
export function getMonthlySpendingPoints(
  expenses: Expense[],
  year: number
): MonthlySpendingPoint[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const points: MonthlySpendingPoint[] = [];
  let maxAmount = 0;

  for (let m = 1; m <= 12; m++) {
    const total = calculateMonthTotal(expenses, year, m);
    if (total > maxAmount) maxAmount = total;

    const count = expenses.filter((e) =>
      e.date && e.date.startsWith(`${year}-${String(m).padStart(2, '0')}`)
    ).length;

    points.push({
      month: m,
      monthName: getMonthName(m),
      monthShort: getMonthName(m, true),
      amount: Math.round(total * 100) / 100,
      count,
      isCurrentMonth: year === currentYear && m === currentMonth,
      isPeak: false,
    });
  }

  // Mark peak month
  if (maxAmount > 0) {
    for (const p of points) {
      if (p.amount === maxAmount) {
        p.isPeak = true;
      }
    }
  }

  return points;
}

/**
 * Calculates budget status
 */
export function calculateBudgetStatus(spent: number, budgetAmount: number): BudgetStatus {
  if (budgetAmount <= 0) {
    return {
      budgetAmount: 0,
      spentAmount: spent,
      remainingAmount: 0,
      percentageUsed: 0,
      isOverBudget: false,
      isNearBudget: false,
    };
  }

  const remaining = budgetAmount - spent;
  const percentage = (spent / budgetAmount) * 100;

  return {
    budgetAmount,
    spentAmount: spent,
    remainingAmount: Math.round(remaining * 100) / 100,
    percentageUsed: Math.min(Math.round(percentage * 10) / 10, 100),
    isOverBudget: spent > budgetAmount,
    isNearBudget: percentage >= 80 && spent <= budgetAmount,
  };
}
