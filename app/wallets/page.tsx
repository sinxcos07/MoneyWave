"use client";

import { useFinanceStore } from "@/stores/useFinanceStore";
import { AddWalletModal } from "@/components/wallets/AddWalletModal";
import { DeleteWalletModal } from "@/components/wallets/DeleteWalletModal";
import { motion } from "framer-motion";
import { Landmark, Smartphone, Banknote, Wallet } from "lucide-react";

export default function WalletsPage() {
  const wallets = useFinanceStore(state => state.wallets);
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.currentBalance, 0);

  const getWalletIcon = (type: string) => {
    switch(type) {
      case 'Bank Account': return <Landmark className="w-6 h-6" />;
      case 'UPI': return <Smartphone className="w-6 h-6" />;
      case 'Cash': return <Banknote className="w-6 h-6" />;
      default: return <Landmark className="w-6 h-6" />;
    }
  };

  const getWalletGradient = (index: number) => {
    const gradients = [
      "from-primary to-emerald-600 text-primary-foreground", // Emerald
      "from-blue-500 to-indigo-600 text-white", // Blue
      "from-purple-500 to-fuchsia-600 text-white", // Purple
      "from-orange-400 to-red-500 text-white", // Orange
      "from-zinc-700 to-zinc-900 text-white", // Dark
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">Manage your accounts and balances</p>
        </div>
        <AddWalletModal />
      </header>

      {/* Summary */}
      <div className="rounded-[24px] bg-card border border-border p-6 shadow-sm">
        <p className="text-muted-foreground text-sm font-medium">Total Balance Across All Wallets</p>
        <h2 className="text-4xl font-bold mt-2 tracking-tight">
          ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      {/* Wallet Grid */}
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Wallet className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No wallets yet</h3>
          <p className="text-muted-foreground max-w-sm">Create your first wallet to start tracking your income and expenses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wallets.map((wallet, index) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-[28px] p-6 shadow-xl bg-gradient-to-br ${getWalletGradient(index)}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{wallet.name}</h3>
                      <p className="text-white/70 text-sm">{wallet.type}</p>
                    </div>
                  </div>
                  <DeleteWalletModal walletId={wallet.id!} />
                </div>

                <div>
                  <p className="text-white/80 text-sm mb-1">Current Balance</p>
                  <h4 className="text-3xl font-bold tracking-tight">
                    ₹{wallet.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
