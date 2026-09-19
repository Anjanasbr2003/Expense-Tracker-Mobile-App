import { db } from './database';
import type { Expense } from '../types';

export function generateDemoExpenses(): Expense[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDate = now.getDate();

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const list: Expense[] = [];
  let idCounter = 1;

  const createItem = (
    daysOffset: number,
    amount: number,
    categoryId: string,
    note: string,
    paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Other',
    time: string = '12:30'
  ) => {
    const d = new Date(currentYear, currentMonth, currentDate - daysOffset);
    list.push({
      id: `demo-${idCounter++}`,
      amount,
      categoryId,
      date: formatDate(d),
      time,
      note,
      paymentMethod,
      createdAt: d.getTime(),
      updatedAt: d.getTime(),
      isDemo: true,
    });
  };

  // Today's expenses
  createItem(0, 850, 'cat-food', 'Lunch with colleagues', 'Cash', '13:15');
  createItem(0, 120, 'cat-transport', 'Bus fare to office', 'Cash', '08:30');
  createItem(0, 450, 'cat-food', 'Evening tea & snacks', 'Card', '17:10');

  // Yesterday's expenses
  createItem(1, 1500, 'cat-shopping', 'Household supplies', 'Card', '19:40');
  createItem(1, 650, 'cat-food', 'Dinner take-out', 'Cash', '20:15');
  createItem(1, 350, 'cat-transport', 'Taxi ride home', 'Card', '21:00');

  // Earlier this month
  createItem(3, 12000, 'cat-bills', 'Electricity & Water Bill', 'Bank Transfer', '10:00');
  createItem(5, 5400, 'cat-food', 'Supermarket groceries', 'Card', '16:20');
  createItem(7, 2800, 'cat-entertainment', 'Weekend cinema & popcorn', 'Card', '18:45');
  createItem(9, 4500, 'cat-bills', 'Fiber Internet bill', 'Bank Transfer', '11:30');
  createItem(12, 1250, 'cat-health', 'Pharmacy vitamins', 'Cash', '14:10');
  createItem(14, 8500, 'cat-shopping', 'New work shoes', 'Card', '15:30');
  createItem(16, 2200, 'cat-food', 'Brunch at cafe', 'Card', '11:45');
  createItem(18, 3000, 'cat-transport', 'Fuel for car', 'Card', '09:00');
  createItem(20, 6500, 'cat-education', 'Online programming course', 'Card', '14:00');

  // Last Month
  const createPastMonthItem = (
    monthOffset: number,
    day: number,
    amount: number,
    categoryId: string,
    note: string,
    paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Other'
  ) => {
    const d = new Date(currentYear, currentMonth - monthOffset, day);
    list.push({
      id: `demo-${idCounter++}`,
      amount,
      categoryId,
      date: formatDate(d),
      time: '14:00',
      note,
      paymentMethod,
      createdAt: d.getTime(),
      updatedAt: d.getTime(),
      isDemo: true,
    });
  };

  // 1 month ago
  createPastMonthItem(1, 5, 11500, 'cat-bills', 'Electricity Bill', 'Bank Transfer');
  createPastMonthItem(1, 8, 7200, 'cat-food', 'Monthly grocery restock', 'Card');
  createPastMonthItem(1, 14, 4500, 'cat-bills', 'Internet Bill', 'Bank Transfer');
  createPastMonthItem(1, 17, 18500, 'cat-travel', 'Train tickets & lodging', 'Card');
  createPastMonthItem(1, 22, 3500, 'cat-entertainment', 'Concert ticket', 'Card');
  createPastMonthItem(1, 25, 4200, 'cat-transport', 'Vehicle fuel', 'Card');

  // 2 months ago
  createPastMonthItem(2, 4, 12300, 'cat-bills', 'Utility bills', 'Bank Transfer');
  createPastMonthItem(2, 10, 8900, 'cat-food', 'Groceries', 'Card');
  createPastMonthItem(2, 15, 6000, 'cat-shopping', 'Clothes shopping', 'Card');
  createPastMonthItem(2, 20, 2400, 'cat-health', 'Dental checkup', 'Cash');

  // 3 months ago
  createPastMonthItem(3, 6, 11000, 'cat-bills', 'Electricity & Water', 'Bank Transfer');
  createPastMonthItem(3, 12, 6500, 'cat-food', 'Weekly groceries', 'Card');
  createPastMonthItem(3, 18, 15000, 'cat-education', 'Tuition semester fee', 'Bank Transfer');

  return list;
}

export async function loadDemoData(): Promise<number> {
  const demoExpenses = generateDemoExpenses();
  // Clear any existing demo items first to avoid duplication
  await clearDemoData();
  await db.expenses.bulkAdd(demoExpenses);
  return demoExpenses.length;
}

export async function clearDemoData(): Promise<number> {
  const demoItems = await db.expenses.filter((e) => e.isDemo === true).toArray();
  const ids = demoItems.map((e) => e.id);
  if (ids.length > 0) {
    await db.expenses.bulkDelete(ids);
  }
  return ids.length;
}

export async function countDemoData(): Promise<number> {
  return await db.expenses.filter((e) => e.isDemo === true).count();
}
