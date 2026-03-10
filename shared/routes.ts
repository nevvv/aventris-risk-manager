import { z } from 'zod';
import { insertAssetSchema, assets } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  assets: {
    list: {
      method: 'GET' as const,
      path: '/api/assets' as const,
      responses: {
        200: z.array(z.custom<typeof assets.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/assets' as const,
      input: insertAssetSchema,
      responses: {
        201: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/assets/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: z.object({
          totalValue: z.number(),
          healthScore: z.number(),
          diversificationScore: z.number(),
          liquidityScore: z.number(),
          riskExposureScore: z.number(),
          composition: z.object({
            byAssetClass: z.record(z.number()),
            bySector: z.record(z.number()),
          }),
          liquidity: z.object({
            liquid: z.number(),
            illiquid: z.number(),
            ratio: z.number(),
          }),
          correlation: z.object({
            sp500: z.number(),
            nasdaq: z.number(),
          }),
          stressTests: z.array(z.object({
            scenario: z.string(),
            impactPercentage: z.number(),
            impactValue: z.number(),
            description: z.string(),
          })),
          insights: z.array(z.string()),
        }),
      }
    }
  },
  market: {
    search: {
      method: 'GET' as const,
      path: '/api/market/search' as const,
      // Uses ?q= query param
      responses: {
        200: z.array(z.object({
          symbol: z.string(),
          name: z.string(),
          type: z.string().optional(),
        }))
      }
    },
    quote: {
      method: 'GET' as const,
      path: '/api/market/quote' as const,
      // Uses ?symbol= query param
      responses: {
        200: z.object({
          symbol: z.string(),
          price: z.number(),
          name: z.string().optional(),
          sector: z.string().optional(),
          assetType: z.string().optional(),
        }),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
