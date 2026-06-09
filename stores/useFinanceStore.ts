import { create } from 'zustand';
import { db, Profile, Wallet, Category, Transaction, Budget, RecurringTransaction } from '@/db';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Expenses
  { name: 'Food', type: 'expense', icon: 'Utensils', color: '#FF5A5F', isDefault: true },
  { name: 'Transport', type: 'expense', icon: 'Car', color: '#F59E0B', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#8B5CF6', isDefault: true },
  { name: 'Rent', type: 'expense', icon: 'Home', color: '#3B82F6', isDefault: true },
  { name: 'Bills', type: 'expense', icon: 'Receipt', color: '#6366F1', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#EC4899', isDefault: true },
  { name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#10B981', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#F97316', isDefault: true },
  { name: 'Subscriptions', type: 'expense', icon: 'Repeat', color: '#14B8A6', isDefault: true },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: '#0EA5E9', isDefault: true },
  { name: 'Investments', type: 'expense', icon: 'TrendingUp', color: '#22C55E', isDefault: true },
  { name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', isDefault: true },
  // Incomes
  { name: 'Salary', type: 'income', icon: 'Banknote', color: '#00C896', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3B82F6', isDefault: true },
  { name: 'Business', type: 'income', icon: 'Building', color: '#8B5CF6', isDefault: true },
  { name: 'Bonus', type: 'income', icon: 'Gift', color: '#F59E0B', isDefault: true },
  { name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#22C55E', isDefault: true },
  { name: 'Gifts', type: 'income', icon: 'Gift', color: '#EC4899', isDefault: true },
  { name: 'Other', type: 'income', icon: 'MoreHorizontal', color: '#64748B', isDefault: true },
];

interface FinanceState {
  profile: Profile | null;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  isLoading: boolean;
  
  initializeData: () => Promise<void>;
  refreshData: () => Promise<void>;
  addWallet: (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'>) => Promise<void>;
  deleteWallet: (id: string, fallbackWalletId?: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  profile: null,
  wallets: [],
  categories: [],
  transactions: [],
  budgets: [],
  recurring: [],
  isLoading: true,

  initializeData: async () => {
    set({ isLoading: true });
    try {
      let profile = await db.profile.get(1);
      if (!profile) {
        profile = { name: 'User', themePreference: 'dark', currency: 'INR' };
        await db.profile.add(profile as Profile);
      }
      
      const categoriesCount = await db.categories.count();
      if (categoriesCount === 0) {
        const toAdd = DEFAULT_CATEGORIES.map(c => ({
          ...c,
          id: crypto.randomUUID()
        }));
        await db.categories.bulkAdd(toAdd);
      }

      await get().refreshData();
    } catch (error) {
      console.error("Failed to initialize DB data:", error);
      set({ isLoading: false });
    }
  },

  refreshData: async () => {
    const [profile, wallets, categories, transactions, budgets, recurring] = await Promise.all([
      db.profile.get(1),
      db.wallets.toArray(),
      db.categories.toArray(),
      db.transactions.orderBy('date').reverse().toArray(),
      db.budgets.toArray(),
      db.recurringTransactions.toArray()
    ]);
    set({ profile, wallets, categories, transactions, budgets, recurring, isLoading: false });
  },

  addWallet: async (walletData: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: crypto.randomUUID(),
      currentBalance: walletData.initialBalance,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.wallets.add(newWallet);
    await get().refreshData();
  },
  
  deleteWallet: async (id: string, fallbackWalletId?: string) => {
    const walletTransactions = await db.transactions.where('walletId').equals(id).toArray();
    
    if (fallbackWalletId && fallbackWalletId !== id) {
      const fallbackWallet = await db.wallets.get(fallbackWalletId);
      if (fallbackWallet) {
        for (const t of walletTransactions) {
          await db.transactions.update(t.id!, { walletId: fallbackWalletId });
        }
        
        const updatedFallbackTransactions = await db.transactions.where('walletId').equals(fallbackWalletId).toArray();
        let newBalance = fallbackWallet.initialBalance;
        for (const t of updatedFallbackTransactions) {
          if (t.type === 'income') newBalance += t.amount;
          if (t.type === 'expense') newBalance -= t.amount;
        }
        await db.wallets.update(fallbackWalletId, { currentBalance: newBalance });
      }
    } else {
      const txIds = walletTransactions.map(t => t.id!).filter(Boolean) as string[];
      await db.transactions.bulkDelete(txIds);
    }

    await db.wallets.delete(id);
    await get().refreshData();
  },

  addTransaction: async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Update Wallet Balance
    const wallet = await db.wallets.get(data.walletId);
    if (wallet) {
      let newBalance = wallet.currentBalance;
      if (data.type === 'income') newBalance += data.amount;
      if (data.type === 'expense') newBalance -= data.amount;
      // Transfer logic would require destination wallet, omitting for simplified V1 or handled differently
      await db.wallets.update(wallet.id!, { currentBalance: newBalance });
    }

    await db.transactions.add(newTransaction);
    await get().refreshData();
  },

  deleteTransaction: async (id: string) => {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;

    // Reverse Wallet Balance
    const wallet = await db.wallets.get(transaction.walletId);
    if (wallet) {
      let newBalance = wallet.currentBalance;
      if (transaction.type === 'income') newBalance -= transaction.amount;
      if (transaction.type === 'expense') newBalance += transaction.amount;
      await db.wallets.update(wallet.id!, { currentBalance: newBalance });
    }

    await db.transactions.delete(id);
    await get().refreshData();
  }
}));
