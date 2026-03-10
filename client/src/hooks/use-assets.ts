import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAsset } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAssets() {
  return useQuery({
    queryKey: [api.assets.list.path],
    queryFn: async () => {
      const res = await fetch(api.assets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch assets");
      return api.assets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAsset) => {
      const res = await fetch(api.assets.create.path, {
        method: api.assets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create asset");
      }
      return api.assets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      toast({
        title: "Asset Added",
        description: "Your portfolio has been updated.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assets.delete.path, { id });
      const res = await fetch(url, {
        method: api.assets.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete asset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      toast({
        title: "Asset Removed",
        description: "The asset was successfully deleted.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
