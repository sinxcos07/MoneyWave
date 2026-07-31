"use client";

import { useState, useMemo } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Sector
} from "recharts";
import { 
  startOfMonth, 
  startOfYear, 
  subDays, 
  format 
} from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  Calendar, 
  Wallet as WalletIcon, 
  X, 
  Grid,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal
} from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Framer motion animation variants for premium enter transitions
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export default function AnalyticsPage() {
  const wallets = useFinanceStore(state => state.wallets);
  const transactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);

  // Filter States
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"all-time" | "this-month" | "last-30-days" | "this-year">("this-month");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // 1. Filter Transactions based on Wallet and Date Range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Wallet Filter
      if (selectedWalletId !== "all" && t.walletId !== selectedWalletId) {
        return false;
      }
      
      // Date Range Filter
      const now = new Date();
      if (dateRange === "this-month") {
        const monthStart = startOfMonth(now).getTime();
        if (t.date < monthStart) return false;
      } else if (dateRange === "last-30-days") {
        const thirtyDaysAgo = subDays(now, 30).getTime();
        if (t.date < thirtyDaysAgo) return false;
      } else if (dateRange === "this-year") {
        const yearStart = startOfYear(now).getTime();
        if (t.date < yearStart) return false;
      }
      
      return true;
    });
  }, [transactions, selectedWalletId, dateRange]);

  // 2. Calculate Total Expenses
  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // 3. Wallet wise spending (Respecting all currently selected filters)
  const walletSpending = useMemo(() => {
    // If a specific wallet is selected, we only show that wallet's spending
    const targets = selectedWalletId === "all" 
      ? wallets 
      : wallets.filter(w => w.id === selectedWalletId);

    return targets.map(w => {
      const spent = filteredTransactions
        .filter(t => t.walletId === w.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: w.name, spent };
    }).filter(w => w.spent > 0);
  }, [wallets, filteredTransactions, selectedWalletId]);

  // 4. Category Wise Spending (Expenses only, sorted highest to lowest)
  const categorySpending = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    // Group by categoryId
    const grouped = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Count transactions per category
    const counts = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(grouped).map(catId => {
      const cat = categories.find(c => c.id === catId);
      const amount = grouped[catId];
      const count = counts[catId];
      return {
        id: catId,
        name: cat?.name || "Other",
        icon: cat?.icon || "MoreHorizontal",
        color: cat?.color || "#64748B",
        amount,
        count,
        average: count > 0 ? amount / count : 0,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, totalExpenses]);

  // Derived active index for Recharts Pie from selectedCategoryId
  const activePieIndex = useMemo(() => {
    if (selectedCategoryId === null) return null;
    const idx = categorySpending.findIndex(c => c.id === selectedCategoryId);
    return idx !== -1 ? idx : null;
  }, [categorySpending, selectedCategoryId]);

  // 5. Calculate summary cards
  const summary = useMemo(() => {
    if (categorySpending.length === 0) {
      return {
        highest: { name: "N/A", amount: 0, percentage: 0 },
        lowest: { name: "N/A", amount: 0 },
        totalCategoriesCount: 0
      };
    }
    
    const highest = categorySpending[0];
    const lowest = categorySpending[categorySpending.length - 1];
    
    return {
      highest: {
        name: highest.name,
        amount: highest.amount,
        percentage: highest.percentage
      },
      lowest: {
        name: lowest.name,
        amount: lowest.amount
      },
      totalCategoriesCount: categorySpending.length
    };
  }, [categorySpending]);

  // 6. Interactive category transaction list
  const displayedTransactions = useMemo(() => {
    return filteredTransactions.filter(t => {
      if (t.type !== 'expense') return false;
      if (selectedCategoryId && t.categoryId !== selectedCategoryId) return false;
      return true;
    });
  }, [filteredTransactions, selectedCategoryId]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(prev => prev === categoryId ? null : categoryId);
  };

  // Recharts Custom Active Slice Shape (enlarged when selected via click/tap)
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={6}
        />
      </g>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Filters */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your finances</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-2xl px-4 py-2.5 shadow-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as any);
                setSelectedCategoryId(null); // Reset category filter on filter change
              }}
              className="bg-transparent text-sm font-semibold focus:outline-none border-none cursor-pointer pr-1"
            >
              <option value="this-month">This Month</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="this-year">This Year</option>
              <option value="all-time">All Time</option>
            </select>
          </div>

          {/* Wallet Selector */}
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-2xl px-4 py-2.5 shadow-sm">
            <WalletIcon className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedWalletId}
              onChange={(e) => {
                setSelectedWalletId(e.target.value);
                setSelectedCategoryId(null); // Reset category filter on filter change
              }}
              className="bg-transparent text-sm font-semibold focus:outline-none border-none cursor-pointer pr-1"
            >
              <option value="all">All Wallets</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {totalExpenses > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Summary Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Highest Spending Category */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-[24px] bg-card border border-border/50 p-6 shadow-sm flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Highest Spending Category</span>
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold tracking-tight">
                  ₹{summary.highest.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/10">
                    {summary.highest.name}
                  </span>
                  {summary.highest.percentage > 0 && (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {summary.highest.percentage.toFixed(0)}% of total
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Lowest Spending Category */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-[24px] bg-card border border-border/50 p-6 shadow-sm flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Lowest Spending Category</span>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold tracking-tight">
                  ₹{summary.lowest.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10">
                    {summary.lowest.name}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Total Expense Categories */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-[24px] bg-card border border-border/50 p-6 shadow-sm flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Expense Categories</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold tracking-tight text-indigo-500">
                  {summary.totalCategoriesCount}
                </h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-1">
                  Active categories in selected range
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Charts Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wallet Wise Spending Chart */}
            <div className="rounded-[32px] bg-card border border-border/50 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Wallet Wise Spending</h3>
                <p className="text-xs text-muted-foreground mb-6">Total expenses grouped by wallet</p>
              </div>
              <div className="h-72 flex items-center justify-center">
                {walletSpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={walletSpending}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dx={-10} />
                      <RechartsTooltip 
                        cursor={{fill: 'var(--secondary)', opacity: 0.4}}
                        contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'var(--card)', color: 'var(--card-foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--primary)' }}
                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                      />
                      <Bar dataKey="spent" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No wallet spending matches current filters.
                  </div>
                )}
              </div>
            </div>

            {/* Spending by Category Doughnut Chart */}
            <div 
              onPointerDown={() => setSelectedCategoryId(null)}
              className="rounded-[32px] bg-card border border-border/50 p-8 shadow-sm flex flex-col justify-between"
            >
              <div onPointerDown={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-1">Spending by Category</h3>
                <p className="text-xs text-muted-foreground mb-4">Tap a slice or legend card to view details</p>
              </div>
              
              {/* Doughnut Chart Canvas */}
              <div 
                className="relative h-60 w-full flex items-center justify-center"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      {...({
                        activeIndex: activePieIndex !== null ? activePieIndex : undefined,
                        activeShape: renderActiveShape,
                        data: categorySpending,
                        cx: "50%",
                        cy: "50%",
                        innerRadius: 68,
                        outerRadius: 92,
                        paddingAngle: 3,
                        dataKey: "amount",
                        stroke: "none",
                        cornerRadius: 6,
                        className: "cursor-pointer",
                        isAnimationActive: false
                      } as any)}
                      onClick={(_data: any, index: number, e: React.MouseEvent) => {
                        e.stopPropagation();
                        const clickedCategory = categorySpending[index];
                        if (clickedCategory) {
                          handleCategoryClick(clickedCategory.id);
                        }
                      }}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className={cn(
                            "transition-opacity duration-300 cursor-pointer", 
                            selectedCategoryId && selectedCategoryId !== entry.id ? "opacity-40" : "opacity-100"
                          )}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Clickable transparent center area — deselects on tap */}
                <div 
                  className="absolute rounded-full cursor-pointer"
                  style={{ width: 136, height: 136 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (selectedCategoryId !== null) {
                      setSelectedCategoryId(null);
                    }
                  }}
                />

                {/* Centered Content: Default Total Expenses or Category Details Card */}
                <div className="absolute z-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <AnimatePresence mode="wait">
                    {selectedCategoryId === null ? (
                      <motion.div
                        key="total-expenses"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl font-extrabold tracking-tight text-foreground">
                          ₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                          Total Expenses
                        </span>
                      </motion.div>
                    ) : (() => {
                      const activeCat = categorySpending.find(c => c.id === selectedCategoryId);
                      if (!activeCat) return null;
                      return (
                        <motion.div 
                          key={`category-${selectedCategoryId}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center justify-center bg-card/90 border border-border/40 rounded-2xl p-2.5 shadow-lg backdrop-blur-md min-w-[130px] max-w-[140px]"
                        >
                          <div 
                            className="w-7 h-7 rounded-xl flex items-center justify-center mb-1" 
                            style={{ backgroundColor: `${activeCat.color}15`, color: activeCat.color }}
                          >
                            <CategoryIcon name={activeCat.icon} className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-[11px] truncate max-w-[120px] text-foreground mb-0.5">
                            {activeCat.name}
                          </span>
                          <span className="text-xs font-extrabold text-foreground">
                            ₹{activeCat.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                            {activeCat.percentage.toFixed(0)}% • {activeCat.count} {activeCat.count === 1 ? 'Tx' : 'Txs'}
                          </span>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </div>

              {/* Styled Interactive Legend */}
              <div 
                className="grid grid-cols-2 gap-2 mt-4 max-h-36 overflow-y-auto pr-1 custom-scrollbar"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {categorySpending.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(cat.id);
                      }}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-300",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                          : "border-border/30 hover:border-border hover:bg-secondary/40",
                        selectedCategoryId && !isSelected ? "opacity-50" : "opacity-100"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-xs truncate text-foreground">{cat.name}</span>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-bold text-xs block text-foreground">
                          ₹{cat.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[9px] text-muted-foreground block font-medium">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Category Breakdown Card */}
          <motion.div variants={itemVariants} className="rounded-[24px] bg-card border border-border/50 p-6 shadow-sm overflow-hidden">
            <div>
              <h3 className="font-semibold text-lg">Category Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-6">Detailed cost distribution per active category</p>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    <th className="pb-3 text-left">Category</th>
                    <th className="pb-3 text-right">Total Spent</th>
                    <th className="pb-3 text-right">Transactions</th>
                    <th className="pb-3 text-right">Average Spend</th>
                    <th className="pb-3 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {categorySpending.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <tr 
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={cn(
                          "group cursor-pointer transition-colors duration-200",
                          isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/30",
                          selectedCategoryId && !isSelected ? "opacity-50" : "opacity-100"
                        )}
                      >
                        <td className="py-3 flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" 
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} className="w-4.5 h-4.5" />
                          </div>
                          <span className="font-semibold text-foreground">{cat.name}</span>
                        </td>
                        <td className="py-3 text-right font-bold text-foreground">
                          ₹{cat.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right text-muted-foreground font-medium">
                          {cat.count} {cat.count === 1 ? 'Tx' : 'Txs'}
                        </td>
                        <td className="py-3 text-right text-muted-foreground font-medium">
                          ₹{cat.average.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 text-right font-bold text-foreground">
                          {cat.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Interactive Transactions Details List */}
          <motion.div variants={itemVariants} className="rounded-[24px] bg-card border border-border/50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg">Transaction Details</h3>
                <p className="text-xs text-muted-foreground">Expenses matching current filters</p>
              </div>
              
              <AnimatePresence>
                {selectedCategoryId && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 self-start sm:self-auto"
                  >
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1.5 border border-primary/20">
                      Category: {categories.find(c => c.id === selectedCategoryId)?.name}
                      <button 
                        onClick={() => setSelectedCategoryId(null)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                    <button 
                      onClick={() => setSelectedCategoryId(null)}
                      className="text-xs text-muted-foreground hover:text-foreground font-bold transition-colors cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {displayedTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No transactions found for this category.
                </div>
              ) : (
                displayedTransactions.map((t) => {
                  const category = categories.find(c => c.id === t.categoryId);
                  const wallet = wallets.find(w => w.id === t.walletId);

                  return (
                    <div 
                      key={t.id} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/20 hover:bg-secondary/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ 
                            backgroundColor: category ? `${category.color}15` : 'var(--muted)', 
                            color: category ? category.color : 'var(--muted-foreground)' 
                          }}
                        >
                          {category ? (
                            <CategoryIcon name={category.icon} className="w-5 h-5" />
                          ) : (
                            <MoreHorizontal className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm leading-none mb-1 text-foreground">
                            {category?.name || 'Unknown'}
                          </h4>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            {wallet?.name} • {format(t.date, "MMM d, yyyy")}
                          </p>
                          {t.notes && <p className="text-[11px] text-muted-foreground mt-1 bg-secondary/30 px-2 py-0.5 rounded-md inline-block">{t.notes}</p>}
                        </div>
                      </div>
                      <div className="font-bold text-foreground text-base shrink-0">
                        -₹{t.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-[32px] bg-card border border-border/50 p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm"
        >
          <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
            <Grid className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">No expense data available</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            There are no expense transactions recorded matching your selected filters. Adjust filters above or add a new expense transaction.
          </p>
        </motion.div>
      )}
    </div>
  );
}
