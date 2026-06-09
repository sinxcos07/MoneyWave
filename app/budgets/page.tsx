"use client";

import { Target } from "lucide-react";

export default function BudgetsPage() {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground">Set spending limits and track progress</p>
      </header>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Target className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-sm">Advanced budget management will be available in the next update.</p>
      </div>
    </div>
  );
}
