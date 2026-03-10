import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  glow?: boolean;
}

export function MetricCard({ title, value, subtitle, icon, trend, className, glow }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl p-6 overflow-hidden group",
        glow ? "glass-card border-glow" : "glass-card",
        className
      )}
    >
      {/* Decorative gradient blob */}
      {glow && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[50px] group-hover:bg-primary/30 transition-all duration-700" />
      )}
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <h3 className="text-muted-foreground font-medium flex items-center gap-2">
          {title}
        </h3>
        {icon && <div className="text-white/40 group-hover:text-primary transition-colors duration-300">{icon}</div>}
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-white mb-2">
          {value}
        </div>
        
        <div className="flex items-center gap-3 mt-4">
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md",
              trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </div>
          )}
          {subtitle && (
            <div className="text-sm text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
