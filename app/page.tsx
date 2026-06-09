"use client";

import { useFinanceStore } from "@/stores/useFinanceStore";
import { motion } from "framer-motion";

export default function Dashboard() {
  const profile = useFinanceStore(state => state.profile);
  const wallets = useFinanceStore(state => state.wallets);
  
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.currentBalance, 0);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good Evening, {profile?.name || 'User'} 👋</h1>
          <p className="text-muted-foreground">Here is your financial overview</p>
        </div>
      </header>

      {/* Hero Balance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary to-emerald-600 p-8 text-primary-foreground shadow-2xl shadow-primary/20"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <p className="text-primary-foreground/80 font-medium mb-1">Total Balance</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter">
              ₹{totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Income This Month</p>
              <p className="text-xl font-semibold">₹0</p>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Expense This Month</p>
              <p className="text-xl font-semibold">₹0</p>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Savings</p>
              <p className="text-xl font-semibold">₹0</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions / Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placeholder for charts/recent transactions */}
        <div className="h-64 rounded-[24px] bg-card border border-border shadow-sm p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Recent Transactions</p>
        </div>
        <div className="h-64 rounded-[24px] bg-card border border-border shadow-sm p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Spending Analytics</p>
        </div>
      </div>
    </div>
  );
}
