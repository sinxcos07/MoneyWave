import Dexie, { Table } from 'dexie';

export interface Profile {
  id?: number;
  name: string;
  themePreference: 'dark' | 'light' | 'system';
  currency: string;
}

export interface Wallet {
  id?: string;
  name: string;
  type: string; // Cash, UPI, Bank Account
  initialBalance: number;
  currentBalance: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: string;
  walletId: string;
  date: number; // Unix timestamp
  notes?: string;
  paymentMethod: string; // Cash, UPI, Card
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Budget {
  id?: string;
  categoryId: string;
  amount: number;
  month: number; // 0-11
  year: number;
}

export interface RecurringTransaction {
  id?: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: string;
  walletId: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  nextDueDate: number; // timestamp
  reminderDaysBefore: number;
  createdAt: number;
}

export interface AppNotification {
  id?: string;
  type: 'upcoming_recurring' | 'budget_warning' | 'budget_exceeded' | 'low_balance' | 'recurring_created';
  message: string;
  isRead: boolean;
  createdAt: number;
}

export class MoneyWaveDB extends Dexie {
  profile!: Table<Profile, number>;
  wallets!: Table<Wallet, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  recurringTransactions!: Table<RecurringTransaction, string>;
  notifications!: Table<AppNotification, string>;

  constructor() {
    super('MoneyWaveDB');
    this.version(1).stores({
      profile: '++id',
      wallets: 'id, name, type',
      transactions: 'id, type, categoryId, walletId, date',
      categories: 'id, type',
      budgets: 'id, categoryId, month, year',
      recurringTransactions: 'id, nextDueDate',
      notifications: 'id, type, isRead'
    });
  }
}

export const db = new MoneyWaveDB();
