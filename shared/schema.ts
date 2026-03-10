import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol"),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(), // 'stock', 'etf', 'crypto', 'cash', 'real_estate', 'private'
  value: numeric("value").notNull(), // total value of this asset position
  quantity: numeric("quantity").notNull(),
  sector: text("sector"), // e.g. Technology, Healthcare (optional)
});

export const insertAssetSchema = createInsertSchema(assets).omit({ id: true });

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
