"use client";

import { useFinanceStore } from "@/stores/useFinanceStore";
import { motion } from "framer-motion";
import { startOfMonth, format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const profile = useFinanceStore(state => state.profile);
  const wallets = useFinanceStore(state => state.wallets);
  const transactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);
  
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.currentBalance, 0);

  const currentMonthStart = startOfMonth(new Date()).getTime();
  const currentMonthTransactions = transactions.filter(t => t.date >= currentMonthStart);
  const incomeThisMonth = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenseThisMonth = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savingsThisMonth = incomeThisMonth - expenseThisMonth;

  // Simple daily spending trend for the chart
  const dailyData = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const day = format(t.date, "dd MMM");
      if (!acc[day]) acc[day] = 0;
      acc[day] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.keys(dailyData).map(day => ({
    name: day,
    amount: dailyData[day]
  })).reverse();

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

          <div className="flex flex-wrap items-center gap-6 md:gap-12 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Income This Month</p>
              <p className="text-xl font-semibold">₹{incomeThisMonth.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Expense This Month</p>
              <p className="text-xl font-semibold">₹{expenseThisMonth.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm mb-1">Savings</p>
              <p className="text-xl font-semibold">₹{savingsThisMonth.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Chart */}
        <div className="lg:col-span-2 rounded-[24px] bg-card border border-border/50 p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Spending Trend</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
                    itemStyle={{ color: 'var(--expense)' }}
                    formatter={(value: any) => [`₹${Number(value)}`, 'Spent']}
                  />
                  <Line type="monotone" dataKey="amount" stroke="var(--expense)" strokeWidth={3} dot={{r: 4, fill: 'var(--expense)', strokeWidth: 0}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data to show trend.</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-[24px] bg-card border border-border/50 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Recent</h3>
            <Link href="/transactions" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {transactions.slice(0, 4).map(t => {
              const category = categories.find(c => c.id === t.categoryId);
              const isIncome = t.type === 'income';

              return (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 ${isIncome ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                      {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium leading-none mb-1">{category?.name || 'Unknown'}</h4>
                      <p className="text-xs text-muted-foreground">{format(t.date, "MMM d")}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${isIncome ? 'text-primary' : 'text-foreground'}`}>
                    {isIncome ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
            
            {transactions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No recent transactions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
