import { useAnalytics } from "@/hooks/use-assets"; // Adjust imports below
import { useAnalytics as useDashAnalytics } from "@/hooks/use-analytics";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Wallet, Activity, ShieldAlert, Zap, AlertTriangle, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Link } from "wouter";
import { motion } from "framer-motion";

const COLORS = ['#00b4d8', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Dashboard() {
  const { data: analytics, isLoading, error } = useDashAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout>
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Analytics Unavailable</h2>
          <p className="text-muted-foreground">Add some assets to your wallet to generate a wealth score.</p>
        </div>
      </AppLayout>
    );
  }

  const assetClassData = Object.entries(analytics.composition.byAssetClass).map(([name, value]) => ({ name, value }));
  const sectorData = Object.entries(analytics.composition.bySector).map(([name, value]) => ({ name, value }));

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 md:gap-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Portfolio Overview</h1>
            <p className="text-muted-foreground">Your real-time wealth health and analytics.</p>
          </div>
          <Link href="/assets">
            <button className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Manage Assets
            </button>
          </Link>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <MetricCard
            title="Aegis Wealth Score"
            value={analytics.healthScore.toFixed(0)}
            subtitle="Out of 100"
            icon={<Activity className="w-6 h-6" />}
            glow
            className="md:col-span-1"
          />
          <MetricCard
            title="Total Net Worth"
            value={`$${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<Wallet className="w-6 h-6" />}
          />
          <MetricCard
            title="Liquidity Ratio"
            value={`${(analytics.liquidity.ratio * 100).toFixed(1)}%`}
            subtitle="Highly Liquid Assets"
            icon={<Zap className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Asset Allocation */}
          <div className="glass-card p-6 rounded-2xl flex flex-col h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6 font-display">Asset Allocation</h3>
            <div className="flex-1 min-h-0 relative">
              {assetClassData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetClassData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {assetClassData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: number) => `$${val.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </div>

          {/* Sector Distribution */}
          <div className="glass-card p-6 rounded-2xl flex flex-col h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6 font-display">Sector Distribution</h3>
            <div className="flex-1 min-h-0 relative">
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {sectorData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: number) => `$${val.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No sector data</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Stress Tests & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning" />
              Stress Test Scenarios
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analytics.stressTests.map((test, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={test.scenario} 
                  className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{test.scenario}</span>
                    <span className="text-destructive font-mono bg-destructive/10 px-2 py-0.5 rounded text-sm">
                      {test.impactPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                  <div className="text-lg font-display text-white border-t border-white/10 pt-2">
                    Impact: -${test.impactValue.toLocaleString()}
                  </div>
                </motion.div>
              ))}
              {analytics.stressTests.length === 0 && (
                <div className="col-span-full text-muted-foreground text-center py-8">Not enough data to run stress tests</div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Risk Insights
            </h3>
            <div className="flex-1 flex flex-col gap-3">
              {analytics.insights.map((insight, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-white/5 rounded-lg border-l-2 border-primary">
                  <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80">{insight}</p>
                </div>
              ))}
              {analytics.insights.length === 0 && (
                <div className="text-muted-foreground text-center py-8 m-auto">Portfolio optimally balanced</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
