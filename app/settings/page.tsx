"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </header>
      
      <div className="space-y-4 max-w-md">
        <h3 className="font-semibold text-lg">Appearance</h3>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')} 
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-secondary'}`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button 
            onClick={() => setTheme('dark')} 
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-secondary'}`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button 
            onClick={() => setTheme('system')} 
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-secondary'}`}
          >
            <Monitor className="w-6 h-6" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </div>
    </div>
  );
}
