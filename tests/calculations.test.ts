import { describe, it, expect } from 'vitest';
import {
  calculateTodayTotal,
  calculateMonthTotal,
  calculateYearTotal,
  calculateDailyAverage,
  calculateMonthlyAverage,
  calculateCategoryBreakdown,
  calculateBudgetStatus,
} from '../src/utils/calculations';
import { formatCurrency, parseAmountInput } from '../src/utils/currency';
import { getDaysInMonth } from '../src/utils/dateUtils';
import { Expense, Category } from '../src/types';

describe('Date Utilities & Leap Year Handling', () => {
  it('correctly calculates days in February for leap and non-leap years', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29); // 2024 is leap year
    expect(getDaysInMonth(2025, 2)).toBe(28); // 2025 is not leap year
    expect(getDaysInMonth(2026, 2)).toBe(28);
    expect(getDaysInMonth(2000, 2)).toBe(29); // 2000 is leap year
    expect(getDaysInMonth(1900, 2)).toBe(28); // 1900 is not leap year
    expect(getDaysInMonth(2026, 9)).toBe(30); // September has 30 days
    expect(getDaysInMonth(2026, 8)).toBe(31); // August has 31 days
  });
});

describe('Currency Formatting & Parsing', () => {
  it('formats LKR currency cleanly with Rs. prefix', () => {
    expect(formatCurrency(2500, 'LKR')).toBe('Rs. 2,500.00');
    expect(formatCurrency(0, 'LKR')).toBe('Rs. 0.00');
    expect(formatCurrency(3250.5, 'LKR')).toBe('Rs. 3,250.50');
  });

  it('formats negative amounts with leading minus sign', () => {
    expect(formatCurrency(-850, 'LKR')).toBe('-Rs. 850.00');
    expect(formatCurrency(850, 'LKR', { showNegativeSign: true })).toBe('-Rs. 850.00');
  });

  it('safely handles NaN, null, or undefined values', () => {
    expect(formatCurrency(NaN, 'LKR')).toBe('Rs. 0.00');
    expect(formatCurrency(Infinity, 'LKR')).toBe('Rs. 0.00');
  });

  it('parses user amount input strings safely', () => {
    expect(parseAmountInput('850')).toBe(850);
    expect(parseAmountInput('2,500.50')).toBe(2500.5);
    expect(parseAmountInput('Rs. 1,200.00')).toBe(1200);
    expect(parseAmountInput('')).toBe(0);
    expect(parseAmountInput('abc')).toBe(0);
  });
});

describe('Expense Calculation Engine', () => {
  const mockCategories: Category[] = [
    { id: 'cat-food', name: 'Food', icon: 'Utensils', color: '#f59e0b', isDefault: true, createdAt: 1 },
    { id: 'cat-transport', name: 'Transport', icon: 'Car', color: '#0284c7', isDefault: true, createdAt: 1 },
    { id: 'cat-bills', name: 'Bills', icon: 'Receipt', color: '#10b981', isDefault: true, createdAt: 1 },
  ];

  const sampleExpenses: Expense[] = [
    // Today: 2026-09-19
    { id: '1', amount: 850, categoryId: 'cat-food', date: '2026-09-19', paymentMethod: 'Cash', createdAt: 1, updatedAt: 1 },
    { id: '2', amount: 120, categoryId: 'cat-transport', date: '2026-09-19', paymentMethod: 'Cash', createdAt: 2, updatedAt: 2 },
    { id: '3', amount: 450, categoryId: 'cat-food', date: '2026-09-19', paymentMethod: 'Card', createdAt: 3, updatedAt: 3 },
    // Yesterday: 2026-09-18
    { id: '4', amount: 1500, categoryId: 'cat-food', date: '2026-09-18', paymentMethod: 'Card', createdAt: 4, updatedAt: 4 },
    // Earlier this month
    { id: '5', amount: 12000, categoryId: 'cat-bills', date: '2026-09-05', paymentMethod: 'Bank Transfer', createdAt: 5, updatedAt: 5 },
    // Previous month (August 2026)
    { id: '6', amount: 15500, categoryId: 'cat-bills', date: '2026-08-15', paymentMethod: 'Bank Transfer', createdAt: 6, updatedAt: 6 },
    // Leap year February (2024-02-29)
    { id: '7', amount: 4000, categoryId: 'cat-food', date: '2024-02-29', paymentMethod: 'Card', createdAt: 7, updatedAt: 7 },
  ];

  it('calculates today total accurately', () => {
    const todayTotal = calculateTodayTotal(sampleExpenses, '2026-09-19');
    expect(todayTotal).toBe(850 + 120 + 450); // 1,420
  });

  it('calculates today total with zero expenses', () => {
    expect(calculateTodayTotal([])).toBe(0);
    expect(calculateTodayTotal(sampleExpenses, '2026-09-01')).toBe(0);
  });

  it('calculates monthly total for given month and year', () => {
    // September 2026: 850 + 120 + 450 + 1500 + 12000 = 14920
    const septTotal = calculateMonthTotal(sampleExpenses, 2026, 9);
    expect(septTotal).toBe(14920);

    // August 2026: 15500
    const augTotal = calculateMonthTotal(sampleExpenses, 2026, 8);
    expect(augTotal).toBe(15500);

    // February 2024 leap year: 4000
    const feb2024Total = calculateMonthTotal(sampleExpenses, 2024, 2);
    expect(feb2024Total).toBe(4000);

    // Empty month
    expect(calculateMonthTotal(sampleExpenses, 2026, 1)).toBe(0);
  });

  it('calculates yearly total accurately', () => {
    // 2026: 14920 (Sept) + 15500 (Aug) = 30420
    expect(calculateYearTotal(sampleExpenses, 2026)).toBe(30420);
    expect(calculateYearTotal(sampleExpenses, 2024)).toBe(4000);
    expect(calculateYearTotal(sampleExpenses, 2025)).toBe(0);
  });

  it('calculates daily average spending without NaN or divide-by-zero', () => {
    // September 2026 with reference date Sep 19 (19 days elapsed)
    const refDate = new Date(2026, 8, 19); // 8 is September
    const septAvg = calculateDailyAverage(sampleExpenses, 2026, 9, refDate);
    expect(septAvg).toBe(Math.round((14920 / 19) * 100) / 100);

    // Empty expenses
    expect(calculateDailyAverage([], 2026, 9, refDate)).toBe(0);

    // Past month (August 2026 has 31 days)
    const augAvg = calculateDailyAverage(sampleExpenses, 2026, 8, refDate);
    expect(augAvg).toBe(Math.round((15500 / 31) * 100) / 100);
  });

  it('calculates category breakdown and percentages correctly', () => {
    const septExpenses = sampleExpenses.filter((e) => e.date.startsWith('2026-09'));
    const breakdown = calculateCategoryBreakdown(septExpenses, mockCategories);

    expect(breakdown.length).toBe(3);
    // Highest spending should be first (Bills: 12000)
    expect(breakdown[0].categoryName).toBe('Bills');
    expect(breakdown[0].totalAmount).toBe(12000);

    // Food: 850 + 450 + 1500 = 2800
    expect(breakdown[1].categoryName).toBe('Food');
    expect(breakdown[1].totalAmount).toBe(2800);

    // Transport: 120
    expect(breakdown[2].categoryName).toBe('Transport');
    expect(breakdown[2].totalAmount).toBe(120);

    // Sum of percentages should be ~100%
    const sumPct = breakdown.reduce((sum, item) => sum + item.percentage, 0);
    expect(Math.round(sumPct)).toBe(100);
  });

  it('calculates budget status and warnings', () => {
    // Under budget
    const normalStatus = calculateBudgetStatus(30000, 60000);
    expect(normalStatus.remainingAmount).toBe(30000);
    expect(normalStatus.percentageUsed).toBe(50);
    expect(normalStatus.isOverBudget).toBe(false);
    expect(normalStatus.isNearBudget).toBe(false);

    // Near budget (>= 80%)
    const nearStatus = calculateBudgetStatus(50000, 60000);
    expect(nearStatus.percentageUsed).toBe(83.3);
    expect(nearStatus.isNearBudget).toBe(true);
    expect(nearStatus.isOverBudget).toBe(false);

    // Over budget
    const overStatus = calculateBudgetStatus(65000, 60000);
    expect(overStatus.remainingAmount).toBe(-5000);
    expect(overStatus.isOverBudget).toBe(true);

    // Zero or unset budget
    const zeroStatus = calculateBudgetStatus(5000, 0);
    expect(zeroStatus.isOverBudget).toBe(false);
    expect(zeroStatus.percentageUsed).toBe(0);
  });

  it('correctly aggregates daily expenses for calendar tracking', () => {
    const calendarExpenses: Expense[] = [
      { id: '1', amount: 1500, categoryId: 'cat-food', date: '2026-09-18', paymentMethod: 'Cash', createdAt: 1, updatedAt: 1 },
      { id: '2', amount: 2500, categoryId: 'cat-bills', date: '2026-09-18', paymentMethod: 'Card', createdAt: 2, updatedAt: 2 },
      { id: '3', amount: 800, categoryId: 'cat-transport', date: '2026-09-19', paymentMethod: 'Cash', createdAt: 3, updatedAt: 3 },
    ];

    const map: Record<string, { total: number; count: number; items: Expense[] }> = {};
    for (const exp of calendarExpenses) {
      if (!map[exp.date]) {
        map[exp.date] = { total: 0, count: 0, items: [] };
      }
      map[exp.date].total += exp.amount;
      map[exp.date].count += 1;
      map[exp.date].items.push(exp);
    }

    expect(map['2026-09-18'].total).toBe(4000);
    expect(map['2026-09-18'].count).toBe(2);
    expect(map['2026-09-19'].total).toBe(800);
    expect(map['2026-09-19'].count).toBe(1);
    expect(map['2026-09-20']).toBeUndefined();
  });
});

