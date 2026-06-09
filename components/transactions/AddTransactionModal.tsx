"use client";

import { useState } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export function AddTransactionModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const wallets = useFinanceStore(state => state.wallets);
  const categories = useFinanceStore(state => state.categories);
  const addTransaction = useFinanceStore(state => state.addTransaction);

  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !walletId || !date) return;

    await addTransaction({
      type,
      amount: parseFloat(amount),
      categoryId,
      walletId,
      date: new Date(date).getTime(),
      notes,
      paymentMethod
    });

    onOpenChange(false);
    setAmount("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-border/50 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">New Transaction</DialogTitle>
        </DialogHeader>
        
        <Tabs value={type} onValueChange={(v) => { setType(v as any); setCategoryId(""); }} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-background/50 p-1">
            <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-white">Expense</TabsTrigger>
            <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Income</TabsTrigger>
            <TabsTrigger value="transfer" className="rounded-lg">Transfer</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-medium">Amount (₹) <span className="text-destructive">*</span></Label>
            <Input 
              id="amount" 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl bg-background/50 text-2xl font-bold h-14"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">Category <span className="text-destructive">*</span></Label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")} required>
                <SelectTrigger className="rounded-xl bg-background/50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-48">
                  {filteredCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id!}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Wallet <span className="text-destructive">*</span></Label>
              <Select value={walletId} onValueChange={(val) => setWalletId(val || "")} required>
                <SelectTrigger className="rounded-xl bg-background/50">
                  <SelectValue placeholder="Select Wallet" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {wallets.map(w => (
                    <SelectItem key={w.id} value={w.id!}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">Date <span className="text-destructive">*</span></Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl bg-background/50"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || "")}>
                <SelectTrigger className="rounded-xl bg-background/50">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              placeholder="What was this for?" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl bg-background/50"
            />
          </div>
          
          <Button type="submit" className="w-full rounded-xl py-6 text-md font-semibold">
            Save Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
