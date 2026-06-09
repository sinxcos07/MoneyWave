"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { db } from "@/db";
import { 
  Moon, Sun, Monitor, Download, Upload, ShieldAlert, CheckCircle2, AlertCircle, Info, User, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const profile = useFinanceStore(state => state.profile);
  const wallets = useFinanceStore(state => state.wallets);
  const transactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);
  const updateProfileName = useFinanceStore(state => state.updateProfileName);
  const importBackup = useFinanceStore(state => state.importBackup);
  const resetData = useFinanceStore(state => state.resetData);

  const [name, setName] = useState("");
  const [importStatus, setImportStatus] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [pendingImportData, setPendingImportData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name === 'User' ? '' : profile.name);
    }
  }, [profile]);

  const getInitials = (name: string) => {
    if (!name || name === "User") return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(profile?.name || "");

  const handleSaveProfile = () => {
    updateProfileName(name.trim() || 'User');
  };

  const handleExportJson = async () => {
    const [profileData, walletsData, transactionsData, categoriesData, budgetsData, recurringData, notificationsData] = await Promise.all([
      db.profile.toArray(),
      db.wallets.toArray(),
      db.transactions.toArray(),
      db.categories.toArray(),
      db.budgets.toArray(),
      db.recurringTransactions.toArray(),
      db.notifications.toArray()
    ]);

    const backupData = {
      profile: profileData,
      wallets: walletsData,
      transactions: transactionsData,
      categories: categoriesData,
      budgets: budgetsData,
      recurringTransactions: recurringData,
      notifications: notificationsData
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moneywave-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Notes'];
    const rows = transactions.map(t => {
      const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Unknown';
      const dateStr = new Date(t.date).toLocaleDateString();
      return [
        dateStr,
        t.type,
        categoryName,
        walletName,
        t.amount.toString(),
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moneywave-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.wallets || !data.transactions || !data.categories) {
          throw new Error("Invalid structure");
        }
        setPendingImportData(data);
      } catch (err) {
        setImportStatus({ message: "Invalid backup file format.", type: 'error' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmImport = async () => {
    if (!pendingImportData) return;
    const success = await importBackup(pendingImportData);
    if (success) {
      setImportStatus({ message: "Backup restored successfully!", type: 'success' });
    } else {
      setImportStatus({ message: "Failed to restore backup.", type: 'error' });
    }
    setPendingImportData(null);
  };

  const handleReset = async () => {
    await resetData();
  };

  return (
    <div className="space-y-8 pb-20 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and data</p>
      </header>

      {/* Profile Section */}
      <section className="rounded-[32px] bg-card border border-border/50 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-primary-foreground shadow-lg text-2xl font-bold shrink-0">
            {initials || <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {profile?.name && profile.name !== 'User' ? `Good Evening, ${profile.name} 👋` : 'Good Evening 👋'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Personalize your experience</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">User Name</Label>
            <div className="flex gap-3">
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-12 bg-background/50"
                placeholder="Enter your name"
              />
              <Button onClick={handleSaveProfile} className="h-12 rounded-xl px-6">Save</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="rounded-[32px] bg-card border border-border/50 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2"><Sun className="w-5 h-5 text-primary" /> Appearance</h3>
          <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')} 
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 hover:bg-secondary'}`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button 
            onClick={() => setTheme('dark')} 
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 hover:bg-secondary'}`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button 
            onClick={() => setTheme('system')} 
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 hover:bg-secondary'}`}
          >
            <Monitor className="w-6 h-6" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="rounded-[32px] bg-card border border-border/50 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2"><HardDrive className="w-5 h-5 text-primary" /> Data Management</h3>
          <p className="text-sm text-muted-foreground">Export or restore your financial data</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border/50 flex flex-col">
            <h4 className="font-medium flex items-center gap-2"><Download className="w-4 h-4 text-emerald-500" /> Export JSON</h4>
            <p className="text-xs text-muted-foreground flex-1">Download a complete JSON backup of your profile, wallets, and transactions.</p>
            <Button variant="outline" onClick={handleExportJson} className="w-full rounded-xl mt-2">Export Backup (.json)</Button>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border/50 flex flex-col">
            <h4 className="font-medium flex items-center gap-2"><Download className="w-4 h-4 text-blue-500" /> Export CSV</h4>
            <p className="text-xs text-muted-foreground flex-1">Export your transactions into a spreadsheet-compatible CSV file.</p>
            <Button variant="outline" onClick={handleExportCsv} className="w-full rounded-xl mt-2">Export Transactions (.csv)</Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <h4 className="font-medium mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-orange-500" /> Import Backup</h4>
          <p className="text-sm text-muted-foreground mb-4">Restore your data from a previously exported JSON backup file.</p>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden" 
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="rounded-xl w-full sm:w-auto">
            Upload Backup File
          </Button>

          {importStatus && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-xl flex items-center gap-3 text-sm ${importStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
              {importStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {importStatus.message}
            </motion.div>
          )}

          <AlertDialog open={!!pendingImportData} onOpenChange={(open) => !open && setPendingImportData(null)}>
            <AlertDialogContent className="rounded-[32px] sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Restore Backup Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to restore data from this backup? <strong>This will overwrite and replace all your existing wallets, categories, and transactions.</strong> This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmImport} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Confirm Restore</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-[32px] bg-destructive/5 border border-destructive/20 p-6 md:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> Danger Zone</h3>
          <p className="text-sm text-destructive/80 mt-1">Irreversible actions for your account data</p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" className="w-full sm:w-auto rounded-xl">Reset MoneyWave</Button>} />
          <AlertDialogContent className="rounded-[32px] border-destructive/20 bg-card/95 backdrop-blur-xl sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Reset All Data?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you absolutely sure you want to reset MoneyWave? <strong>This will permanently delete all your local data</strong> including wallets, transactions, profiles, and custom categories. The application will return to a pristine state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, Delete Everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* About Section */}
      <section className="rounded-[32px] bg-gradient-to-br from-card to-secondary/20 border border-border/50 p-6 md:p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">MoneyWave</h3>
        <p className="text-primary font-medium text-sm mt-1 mb-6">Offline-first personal finance manager</p>
        
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
          MoneyWave helps you track income, expenses, wallets, and analytics while keeping your data completely on your device.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {['Next.js', 'TypeScript', 'IndexedDB', 'Dexie', 'Tailwind CSS'].map(tech => (
            <span key={tech} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {tech}
            </span>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground font-medium">v1.0.0</p>
      </section>
    </div>
  );
}
