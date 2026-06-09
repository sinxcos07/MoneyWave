"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft, Wallet, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-card/90 backdrop-blur-xl border-t border-border/50 z-40 pb-safe">
      <div className="flex items-center justify-around h-full px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={cn(
                "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300",
                isActive ? "bg-primary/10" : "group-hover:bg-secondary/50"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-active:scale-90",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
