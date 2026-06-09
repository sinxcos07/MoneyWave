"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";

export function FAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 z-50 group"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
      </button>
      
      <AddTransactionModal open={open} onOpenChange={setOpen} />
    </>
  );
}
