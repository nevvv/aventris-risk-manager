import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAssetSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMarketSearch, useMarketQuote } from "@/hooks/use-market";
import { useCreateAsset } from "@/hooks/use-assets";
import { Search, Loader2, DollarSign, Building, Wallet, Bitcoin, AlertCircle } from "lucide-react";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

const ASSET_TYPES = [
  { id: 'stock', label: 'Stock', icon: Building },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
  { id: 'cash', label: 'Cash', icon: DollarSign },
  { id: 'real_estate', label: 'Real Estate', icon: Building },
  { id: 'etf', label: 'ETF', icon: Wallet },
];

const formSchema = insertAssetSchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
  value: z.string().min(1, "Value is required"),
});

type FormData = z.infer<typeof formSchema>;

export function AddAssetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'market' | 'manual'>('market');
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearching } = useMarketSearch(debouncedQuery);
  const { data: quote, isLoading: isQuoting } = useMarketQuote(selectedSymbol);
  
  const createAsset = useCreateAsset();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: null,
      assetType: "stock",
      quantity: "",
      value: "",
      sector: null,
    },
  });

  // Watch for auto-calculation
  const quantity = form.watch("quantity");
  const priceRef = quote?.price;

  useEffect(() => {
    if (mode === 'market' && quantity && priceRef) {
      const q = parseFloat(quantity);
      if (!isNaN(q)) {
        form.setValue("value", (q * priceRef).toFixed(2));
      }
    }
  }, [quantity, priceRef, mode, form]);

  useEffect(() => {
    if (quote) {
      form.setValue("name", quote.name || quote.symbol);
      form.setValue("symbol", quote.symbol);
      form.setValue("assetType", quote.assetType || "stock");
      if (quote.sector) form.setValue("sector", quote.sector);
    }
  }, [quote, form]);

  const onSubmit = (data: FormData) => {
    // Convert string quantities and values to numbers for API submission
    createAsset.mutate({
      name: data.name,
      symbol: data.symbol || undefined,
      assetType: data.assetType,
      quantity: data.quantity, // Keep as string, API schema handles it
      value: data.value, // Keep as string, API schema handles it
      sector: data.sector || null,
    }, {
      onSuccess: () => {
        form.reset();
        setSearchQuery("");
        setSelectedSymbol(null);
        onClose();
      }
    });
  };

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-card border-white/10 bg-card/95 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Add Asset</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Include a new holding in your portfolio to update your wealth score.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 p-1 bg-white/5 rounded-lg mb-4">
          <button
            type="button"
            className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", mode === 'market' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
            onClick={() => { setMode('market'); form.reset(); setSelectedSymbol(null); }}
          >
            Market Asset
          </button>
          <button
            type="button"
            className={cn("flex-1 py-2 text-sm font-medium rounded-md transition-all", mode === 'manual' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
            onClick={() => { setMode('manual'); form.reset(); setSelectedSymbol(null); }}
          >
            Manual Asset
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'market' && !selectedSymbol && (
            <div className="relative">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Search Ticker</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g., AAPL, TSLA, BTC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults && searchResults.length > 0 && searchQuery && (
                <div className="absolute z-50 mt-2 w-full bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto hide-scrollbar">
                  {searchResults.map((res) => (
                    <button
                      key={res.symbol}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                      onClick={() => handleSelectSymbol(res.symbol)}
                    >
                      <div>
                        <span className="font-bold text-white block">{res.symbol}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{res.name}</span>
                      </div>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-muted-foreground">{res.type || 'Equity'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'market' && selectedSymbol && isQuoting && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {mode === 'market' && selectedSymbol && quote && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">{quote.symbol}</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{quote.assetType || 'Stock'}</span>
                </div>
                <p className="text-sm text-muted-foreground">{quote.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="text-xl font-display font-bold text-white">${quote.price.toFixed(2)}</p>
              </div>
            </div>
          )}

          {(mode === 'manual' || (mode === 'market' && selectedSymbol && quote)) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {mode === 'manual' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Asset Name</label>
                    <input
                      {...form.register("name")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="e.g., Primary Residence"
                    />
                    {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Asset Type</label>
                    <select
                      {...form.register("assetType")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      {ASSET_TYPES.map(t => <option key={t.id} value={t.id} className="bg-card text-white">{t.label}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    {...form.register("quantity")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                    placeholder="0.00"
                  />
                  {form.formState.errors.quantity && <p className="text-destructive text-xs mt-1">{form.formState.errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Total Value ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...form.register("value")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                    placeholder="0.00"
                    readOnly={mode === 'market'} // Auto-calculated for market assets
                  />
                  {form.formState.errors.value && <p className="text-destructive text-xs mt-1">{form.formState.errors.value.message}</p>}
                </div>
              </div>

              {mode === 'manual' && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Sector (Optional)</label>
                  <input
                    {...form.register("sector")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g., Real Estate"
                  />
                </div>
              )}
              
              {mode === 'market' && selectedSymbol && (
                 <button
                   type="button"
                   onClick={() => setSelectedSymbol(null)}
                   className="text-xs text-muted-foreground hover:text-white underline"
                 >
                   Change Selection
                 </button>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAsset.isPending || (mode === 'market' && !selectedSymbol)}
              className="px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,180,216,0.3)] hover:shadow-[0_0_25px_rgba(0,180,216,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {createAsset.isPending ? "Adding..." : "Add Asset"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
