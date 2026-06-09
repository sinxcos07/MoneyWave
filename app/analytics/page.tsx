"use client";

import { useFinanceStore } from "@/stores/useFinanceStore";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AnalyticsPage() {
  const wallets = useFinanceStore(state => state.wallets);
  const transactions = useFinanceStore(state => state.transactions);

  // Wallet wise spending
  const walletSpending = wallets.map(w => {
    const spent = transactions
      .filter(t => t.walletId === w.id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: w.name, spent };
  }).filter(w => w.spent > 0);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your finances</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-[32px] bg-card border border-border/50 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Wallet Wise Spending</h3>
          <div className="h-64">
            {walletSpending.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={walletSpending}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: 'var(--secondary)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--card)', color: 'var(--card-foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--primary)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Bar dataKey="spent" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No spending data available across wallets.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
