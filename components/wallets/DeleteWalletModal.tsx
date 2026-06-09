"use client";

import { useState } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export function DeleteWalletModal({ walletId }: { walletId: string }) {
  const [open, setOpen] = useState(false);
  const wallets = useFinanceStore(state => state.wallets);
  const transactions = useFinanceStore(state => state.transactions);
  const deleteWallet = useFinanceStore(state => state.deleteWallet);

  const wallet = wallets.find(w => w.id === walletId);
  const walletTransactions = transactions.filter(t => t.walletId === walletId);
  const otherWallets = wallets.filter(w => w.id !== walletId);

  const [deleteOption, setDeleteOption] = useState<"delete_all" | "move">("delete_all");
  const [fallbackWalletId, setFallbackWalletId] = useState("");

  if (!wallet) return null;

  const handleDelete = async () => {
    if (deleteOption === "move" && !fallbackWalletId) return;

    await deleteWallet(walletId, deleteOption === "move" ? fallbackWalletId : undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="w-8 h-8 rounded-full hover:bg-destructive/30 text-white/80 hover:text-white flex items-center justify-center transition-colors z-20"><Trash2 className="w-4 h-4" /></button>} />
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-border/50 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-destructive">Delete Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete <strong>{wallet.name}</strong>?
          </p>
          
          {walletTransactions.length > 0 && (
            <div className="space-y-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
              <p className="text-sm font-medium text-destructive">
                This wallet contains {walletTransactions.length} transactions.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="deleteOption" 
                    value="delete_all"
                    checked={deleteOption === "delete_all"}
                    onChange={() => setDeleteOption("delete_all")}
                    className="mt-1 accent-destructive"
                  />
                  <div>
                    <p className="font-medium">Delete all transactions</p>
                    <p className="text-xs text-muted-foreground">Transactions will be permanently removed.</p>
                  </div>
                </label>
                
                {otherWallets.length > 0 && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="deleteOption" 
                      value="move"
                      checked={deleteOption === "move"}
                      onChange={() => setDeleteOption("move")}
                      className="mt-1 accent-primary"
                    />
                    <div className="w-full">
                      <p className="font-medium">Move transactions</p>
                      {deleteOption === "move" && (
                        <div className="mt-3 w-full">
                          <Select value={fallbackWalletId} onValueChange={(val) => setFallbackWalletId(val || "")}>
                            <SelectTrigger className="rounded-xl bg-background/50 border-destructive/20">
                              <SelectValue placeholder="Select destination wallet" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {otherWallets.map(w => (
                                <SelectItem key={w.id} value={w.id!}>{w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDelete} disabled={deleteOption === 'move' && !fallbackWalletId && walletTransactions.length > 0}>
              Delete Wallet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
