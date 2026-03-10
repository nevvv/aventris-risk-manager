import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import yahooFinance from "yahoo-finance2";

const TOP_EQUITIES = [
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "BRK-B", "AVGO", "V",
  "JPM", "UNH", "LLY", "MA", "JNJ", "HD", "PG", "XOM", "COST", "MRK", "ABBV", 
  "CRM", "ASML", "PEP", "BAC", "KO", "WMT", "TMO", "MCD", "CSCO", "ABT", "ACN", 
  "NFLX", "AMD", "ORCL", "LIN", "NKE", "CMCSA", "DHR", "INTC", "TXN", "VZ", 
  "NEE", "QCOM", "PFE", "PM", "RTX", "HON", "IBM"
];

const TOP_CRYPTO = [
  "BTC-USD", "ETH-USD", "USDT-USD", "BNB-USD", "SOL-USD", "XRP-USD",
  "USDC-USD", "ADA-USD", "AVAX-USD", "DOGE-USD", "DOT-USD", "TRX-USD", 
  "LINK-USD", "MATIC-USD", "SHIB-USD"
];

const ALLOWED_SYMBOLS = [...TOP_EQUITIES, ...TOP_CRYPTO];

async function seedDatabase() {
  const existingAssets = await storage.getAssets();
  if (existingAssets.length === 0) {
    await storage.createAsset({
      symbol: "AAPL",
      name: "Apple Inc.",
      assetType: "stock",
      value: "15000",
      quantity: "85",
      sector: "Technology"
    });
    await storage.createAsset({
      symbol: "BTC-USD",
      name: "Bitcoin",
      assetType: "crypto",
      value: "8000",
      quantity: "0.12",
      sector: "Cryptocurrency"
    });
    await storage.createAsset({
      symbol: "",
      name: "High Yield Savings",
      assetType: "cash",
      value: "12000",
      quantity: "1",
      sector: "Cash"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed database with mock data if empty
  seedDatabase().catch(console.error);
  
  app.get(api.assets.list.path, async (req, res) => {
    const allAssets = await storage.getAssets();
    res.status(200).json(allAssets);
  });

  app.post(api.assets.create.path, async (req, res) => {
    try {
      const input = api.assets.create.input.parse(req.body);
      const newAsset = await storage.createAsset(input);
      res.status(201).json(newAsset);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.assets.delete.path, async (req, res) => {
    try {
      await storage.deleteAsset(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.market.search.path, async (req, res) => {
    const query = req.query.q?.toString().toLowerCase();
    if (!query) return res.json([]);
    
    try {
      const results = await yahooFinance.search(query);
      const filtered = results.quotes
        .filter(q => q.symbol && (ALLOWED_SYMBOLS.includes(q.symbol) || q.quoteType === "CRYPTOCURRENCY" || q.quoteType === "EQUITY"))
        .slice(0, 10)
        .map(q => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          type: q.quoteType === "CRYPTOCURRENCY" ? "crypto" : "stock",
        }));
      res.json(filtered);
    } catch (err) {
      console.error("Search failed:", err);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get(api.market.quote.path, async (req, res) => {
    const symbol = req.query.symbol?.toString();
    if (!symbol) return res.status(400).json({ message: "Symbol required" });
    try {
      const quote = await yahooFinance.quote(symbol);
      res.json({
        symbol: quote.symbol,
        price: quote.regularMarketPrice || 0,
        name: quote.shortName || quote.longName || quote.symbol,
        sector: quote.sector || (quote.quoteType === "CRYPTOCURRENCY" ? "Cryptocurrency" : "General"),
        assetType: quote.quoteType === "CRYPTOCURRENCY" ? "crypto" : "stock",
      });
    } catch (err) {
      console.error("Quote failed:", err);
      res.status(404).json({ message: "Quote not found" });
    }
  });

  app.get(api.analytics.get.path, async (req, res) => {
    try {
      const allAssets = await storage.getAssets();
      
      let totalValue = 0;
      let liquidValue = 0;
      let illiquidValue = 0;
      let techExposure = 0;
      const byAssetClass: Record<string, number> = {};
      const bySector: Record<string, number> = {};

      for (const asset of allAssets) {
        const val = Number(asset.value) || 0;
        totalValue += val;
        
        const aClass = asset.assetType || 'unknown';
        byAssetClass[aClass] = (byAssetClass[aClass] || 0) + val;
        
        if (['stock', 'etf', 'crypto', 'cash'].includes(aClass)) {
          liquidValue += val;
        } else {
          illiquidValue += val;
        }
        
        const sector = asset.sector || 'Uncategorized';
        bySector[sector] = (bySector[sector] || 0) + val;
        
        if (sector.toLowerCase().includes('technology')) {
          techExposure += val;
        }
      }
      
      const liquidityRatio = totalValue > 0 ? liquidValue / totalValue : 0;
      const numAssetClasses = Object.keys(byAssetClass).length;
      const maxSectorConcentration = Object.values(bySector).length > 0 
        ? Math.max(...Object.values(bySector)) / (totalValue || 1) 
        : 1;

      let diversificationScore = totalValue === 0 ? 0 : 
        (1 - maxSectorConcentration) * 100 * (numAssetClasses > 1 ? 1 : 0.6);
      if (numAssetClasses > 2) diversificationScore += 10;
      diversificationScore = Math.round(Math.min(100, Math.max(0, diversificationScore)));
      
      const liquidityScore = Math.round(Math.min(100, Math.max(0, liquidityRatio * 100)));
      
      const cryptoExposure = (byAssetClass['crypto'] || 0) / (totalValue || 1);
      const riskExposureScore = Math.round(Math.min(100, (cryptoExposure * 150) + (techExposure / (totalValue || 1) * 80)));
      
      const healthScore = totalValue === 0 ? 0 :
        Math.round((diversificationScore + liquidityScore + (100 - riskExposureScore)) / 3);

      const insights = [];
      if (maxSectorConcentration > 0.5) {
        insights.push("You appear diversified by number of assets, but most holdings belong to the same market sector.");
      }
      if (techExposure / (totalValue || 1) > 0.4) {
        insights.push("Your portfolio has strong exposure to technology growth stocks.");
        insights.push("Your wealth structure may experience higher volatility during technology sector downturns.");
      }
      if (cryptoExposure > 0.3) {
        insights.push("High cryptocurrency allocation increases overall portfolio volatility.");
      }
      if (insights.length === 0 && totalValue > 0) {
        insights.push("Your portfolio structure shows good balance and moderate risk exposure.");
      }
      if (totalValue === 0) {
        insights.push("Add assets to your wealth wallet to see insights.");
      }

      const stressTechImpact = -30 * (techExposure / (totalValue || 1));
      const stressCryptoImpact = -40 * cryptoExposure;

      res.status(200).json({
        totalValue,
        healthScore,
        diversificationScore,
        liquidityScore,
        riskExposureScore,
        composition: {
          byAssetClass,
          bySector,
        },
        liquidity: {
          liquid: liquidValue,
          illiquid: illiquidValue,
          ratio: liquidityRatio,
        },
        correlation: {
          sp500: 0.85, 
          nasdaq: 0.92,
        },
        stressTests: [
          {
            scenario: "Global Market Crash",
            impactPercentage: -20,
            impactValue: totalValue * -0.20,
            description: "Equities drop 20%, crypto drops 30%",
          },
          {
            scenario: "Technology Sector Crash",
            impactPercentage: stressTechImpact,
            impactValue: (stressTechImpact / 100) * totalValue,
            description: "Tech stocks decline 30%",
          },
          {
            scenario: "Crypto Market Crash",
            impactPercentage: stressCryptoImpact,
            impactValue: (stressCryptoImpact / 100) * totalValue,
            description: "Cryptocurrencies decline 40%",
          }
        ],
        insights,
      });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ message: "Analytics calculation failed" });
    }
  });

  return httpServer;
}
