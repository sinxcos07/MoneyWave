"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  PieChart, 
  Target, 
  Grid, 
  Repeat, 
  Bell, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Budgets", href: "/budgets", icon: Target },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[280px] h-[calc(100vh-2rem)] fixed left-4 top-4 bg-card/80 backdrop-blur-xl border border-border/50 rounded-[32px] shadow-2xl z-40 p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <span className="font-bold text-xl">₹</span>
        </div>
        <span className="font-bold text-xl tracking-tight">MoneyWave</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
