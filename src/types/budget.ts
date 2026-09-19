export interface MonthlyBudget {
  id: string; // `${year}-${String(month).padStart(2, '0')}` or UUID
  year: number;
  month: number; // 1 to 12
  amount: number;
  updatedAt: number;
}
