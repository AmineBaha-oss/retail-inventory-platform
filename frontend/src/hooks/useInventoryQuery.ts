// Example usage of React Query with our API
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryApi, toApiError } from "../services/api";

export function useInventoryList() {
  return useQuery({
    queryKey: ["inventory", "list"],
    queryFn: async () => {
      const { data } = await InventoryApi.list();
      return data;
    },
    staleTime: 30_000,
    retry: 2,
  });
}

export function useUpdateQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number | string; quantity: number }) => {
      const { data } = await InventoryApi.updateQuantity(vars.id, vars.quantity);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err) => {
      const e = toApiError(err);
      console.error(e.message);
    },
  });
}

export function useInventoryByStore(storeId: string | number) {
  return useQuery({
    queryKey: ["inventory", "store", storeId],
    queryFn: async () => {
      const { data } = await InventoryApi.byStore(storeId);
      return data;
    },
    enabled: !!storeId,
    staleTime: 30_000,
  });
}

export function useLowStockInventory() {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      const { data } = await InventoryApi.lowStock();
      return data;
    },
    staleTime: 60_000, // Cache for 1 minute since this is likely a dashboard widget
  });
}

export function useCriticalInventory() {
  return useQuery({
    queryKey: ["inventory", "critical"],
    queryFn: async () => {
      const { data } = await InventoryApi.critical();
      return data;
    },
    staleTime: 60_000,
  });
}
