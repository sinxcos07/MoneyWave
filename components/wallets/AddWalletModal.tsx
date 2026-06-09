"use client";

import { useState } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddWalletModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Bank Account");
  const [balance, setBalance] = useState("");
  const [notes, setNotes] = useState("");
  const addWallet = useFinanceStore(state => state.addWallet);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    await addWallet({
      name,
      type,
      initialBalance: parseFloat(balance),
      notes
    });
    setOpen(false);
    // Reset form
    setName("");
    setType("Bank Account");
    setBalance("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-2xl px-6 gap-2 shadow-lg shadow-primary/20" />}>
        <Plus className="w-4 h-4" /> Add Wallet
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-border/50 bg-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Add New Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. HDFC Salary" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl bg-background/50"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Wallet Type</Label>
            <Select value={type} onValueChange={(val) => setType(val || "")}>
              <SelectTrigger className="rounded-xl bg-background/50">
                <SelectValue placeholder="Select type">
                  {type || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Bank Account">Bank Account</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Initial Balance (₹)</Label>
            <Input 
              id="balance" 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={balance} 
              onChange={(e) => setBalance(e.target.value)}
              className="rounded-xl bg-background/50"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input 
              id="notes" 
              placeholder="Any details..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl bg-background/50"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl py-6 text-md font-semibold">
            Create Wallet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
