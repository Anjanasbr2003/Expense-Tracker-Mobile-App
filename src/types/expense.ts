export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string; // Hex color or Tailwind accent
  isDefault: boolean;
  createdAt: number;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm format
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
  updatedAt: number;
  isDemo?: boolean; // Clear flag to separate demo from real user data
}

export type ExpenseSortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface ExpenseFilter {
  searchQuery?: string;
  categoryId?: string | 'all';
  paymentMethod?: PaymentMethod | 'all';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  sortBy?: ExpenseSortOption;
}
