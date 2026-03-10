import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssets, useDeleteAsset } from "@/hooks/use-assets";
import { AddAssetModal } from "@/components/assets/AddAssetModal";
import { Plus, Trash2, TrendingUp, Building, Bitcoin, DollarSign, AlertCircle, FileX } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Assets() {
  const { data: assets, isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'stock': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'real_estate': return <Building className="w-4 h-4 text-orange-400" />;
      case 'crypto': return <Bitcoin className="w-4 h-4 text-yellow-400" />;
      case 'cash': return <DollarSign className="w-4 h-4 text-green-400" />;
      default: return <TrendingUp className="w-4 h-4 text-primary" />;
    }
  };

  const totalValue = assets?.reduce((sum, asset) => sum + parseFloat(asset.value as string), 0) || 0;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 md:gap-8 h-full pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Wealth Wallet</h1>
            <p className="text-muted-foreground">Manage your positions and real-world assets.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Asset
          </button>
        </div>

        <div className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden border border-white/5 relative">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <h2 className="font-display font-semibold text-xl">Current Holdings</h2>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total Assets Value</div>
              <div className="font-display font-bold text-xl text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : assets && assets.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] text-xs uppercase text-muted-foreground sticky top-0 backdrop-blur-md z-10 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Asset Name</th>
                    <th className="px-6 py-4 font-medium hidden md:table-cell">Type</th>
                    <th className="px-6 py-4 font-medium text-right">Quantity</th>
                    <th className="px-6 py-4 font-medium text-right">Total Value</th>
                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assets.map((asset, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={asset.id} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            {getAssetIcon(asset.assetType)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {asset.symbol ? (
                                <>
                                  {asset.symbol}
                                  <span className="text-xs font-normal text-muted-foreground line-clamp-1 hidden sm:inline">{asset.name}</span>
                                </>
                              ) : (
                                asset.name
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{asset.sector || 'Uncategorized'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground capitalize border border-white/5">
                          {asset.assetType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-white/80">
                        {parseFloat(asset.quantity as string).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-display font-bold text-white">
                          ${parseFloat(asset.value as string).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if(confirm("Are you sure you want to remove this asset?")) {
                              deleteAsset.mutate(asset.id);
                            }
                          }}
                          disabled={deleteAsset.isPending}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors inline-flex justify-center disabled:opacity-50"
                          title="Remove Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <FileX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No assets found</h3>
                <p className="text-muted-foreground max-w-sm">
                  Your wallet is currently empty. Add your first asset to start tracking your wealth score.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-6 px-6 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  Add Asset Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </AppLayout>
  );
}
