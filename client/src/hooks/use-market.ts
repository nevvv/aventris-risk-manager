import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMarketSearch(query: string) {
  return useQuery({
    queryKey: [api.market.search.path, query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await fetch(`${api.market.search.path}?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to search market");
      return api.market.search.responses[200].parse(await res.json());
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useMarketQuote(symbol: string | null) {
  return useQuery({
    queryKey: [api.market.quote.path, symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const res = await fetch(`${api.market.quote.path}?symbol=${encodeURIComponent(symbol)}`, {
        credentials: "include",
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch quote");
      return api.market.quote.responses[200].parse(await res.json());
    },
    enabled: !!symbol,
    staleTime: 1000 * 60, // 1 min
  });
}
