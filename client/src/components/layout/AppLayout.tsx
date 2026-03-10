import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Activity } from "lucide-react";
import { Link } from "wouter";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel border-b p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-display font-bold">Aegis</h1>
          </div>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-white">Dash</Link>
            <Link href="/assets" className="hover:text-white">Assets</Link>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
