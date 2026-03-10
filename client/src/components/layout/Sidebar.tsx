import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wallet, Activity, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Wallet, label: "Wealth Wallet", href: "/assets" },
  { icon: Activity, label: "Analytics", href: "/analytics" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col glass-panel sticky top-0 h-screen z-40">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Aegis.
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group",
                  isActive
                    ? "text-white bg-white/10"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-primary" : "")} />
                <span className="font-medium relative z-10">{item.label}</span>
                
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-white/50" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all group">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group mt-1">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
