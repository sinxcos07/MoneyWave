"use client";

import { useFinanceStore } from "@/stores/useFinanceStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Grid, MoreHorizontal } from "lucide-react";

export default function CategoriesPage() {
  const categories = useFinanceStore(state => state.categories);
  const transactions = useFinanceStore(state => state.transactions);

  // Calculate total spent per category (Expenses only for the pie chart)
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryData = categories
    .filter(c => c.type === 'expense')
    .map(c => {
      const amount = expenseTransactions
        .filter(t => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...c,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    })
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Analyze your spending distribution</p>
        </div>
      </header>

      {totalExpense === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Grid className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No expenses yet</h3>
          <p className="text-muted-foreground max-w-sm">Add some expense transactions to see your category breakdown.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart Card */}
          <div className="rounded-[32px] bg-card border border-border/50 p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-6">Spending Distribution</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List of Categories */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-2">Top Categories</h3>
            {categoryData.map((cat, i) => (
              <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                    <MoreHorizontal className="w-6 h-6" /> {/* Replace with actual icons dynamically if possible */}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{cat.name}</h4>
                    <p className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
