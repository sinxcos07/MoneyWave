"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { FAB } from "./FAB";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const initializeData = useFinanceStore((state) => state.initializeData);
  const isLoading = useFinanceStore((state) => state.isLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeData();
  }, [initializeData]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/10">
            <span className="text-primary font-bold text-4xl">₹</span>
          </div>
          <p className="text-muted-foreground font-medium tracking-wide">Initializing MoneyWave...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full md:pl-[312px] pb-[90px] md:pb-0 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <FAB />
      <BottomNav />
    </div>
  );
}
