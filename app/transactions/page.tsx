"use client";

import { useFinanceStore } from "@/stores/useFinanceStore";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TransactionsPage() {
  const transactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);
  const wallets = useFinanceStore(state => state.wallets);
  
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter(t => {
    const categoryMatch = categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(search.toLowerCase());
    const notesMatch = t.notes?.toLowerCase().includes(search.toLowerCase());
    return categoryMatch || notesMatch;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Your complete financial history</p>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search transactions..." 
          className="pl-10 rounded-xl bg-card border-border/50 h-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          filteredTransactions.map(t => {
            const category = categories.find(c => c.id === t.categoryId);
            const wallet = wallets.find(w => w.id === t.walletId);
            const isIncome = t.type === 'income';

            return (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-opacity-10 ${isIncome ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                    {isIncome ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{category?.name || 'Unknown'}</h4>
                    <p className="text-sm text-muted-foreground">{wallet?.name} • {format(t.date, "MMM d, yyyy")}</p>
                    {t.notes && <p className="text-xs text-muted-foreground mt-0.5">{t.notes}</p>}
                  </div>
                </div>
                <div className={`text-xl font-bold ${isIncome ? 'text-primary' : 'text-foreground'}`}>
                  {isIncome ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
