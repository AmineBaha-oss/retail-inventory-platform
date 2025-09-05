import { useState, useEffect, useCallback } from "react";
import { inventoryAPI } from "../services/api";
import { showError, showSuccess, handleApiError } from "../utils/errorHandler";

export interface InventoryItem {
  id: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  productId: string;
  productSku: string;
  productName: string;
  quantityOnHand: number;
  quantityOnOrder: number;
  quantityReserved: number;
  quantityAvailable: number;
  costPerUnit: number;
  reorderPoint: number;
  maxStockLevel: number;
  lastCountDate?: string;
  recordedAt: string;
  createdAt: string;
  adjustmentReason?: string;
  version: number;
}

export interface UseInventoryReturn {
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  updateQuantity: (
    id: string,
    quantity: number,
    reason?: string
  ) => Promise<void>;
  getLowStock: () => Promise<InventoryItem[]>;
  getCritical: () => Promise<InventoryItem[]>;
}

export function useInventory(): UseInventoryReturn {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryAPI.getAll();
      const data = response.data;

      // Handle pagination response
      if (data && typeof data === "object" && "content" in data) {
        // Spring Boot paginated response
        setInventory(data.content || []);
      } else if (Array.isArray(data)) {
        // Direct array response
        setInventory(data);
      } else {
        console.warn("Unexpected inventory data format:", data);
        setInventory([]);
      }
    } catch (err: any) {
      const apiError = handleApiError(err, "Failed to load inventory data");
      setError(apiError.message);

      // Don't show toast for initial load failures
      console.error("Inventory load error:", apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    await loadInventory();
    showSuccess("Inventory data refreshed successfully!");
  }, [loadInventory]);

  const updateQuantity = useCallback(
    async (id: string, quantity: number, reason?: string) => {
      try {
        setIsLoading(true);

        const requestBody: any = { quantity };
        if (reason) {
          requestBody.reason = reason;
        }

        const response = await inventoryAPI.updateQuantity(id, requestBody);

        // Update local state
        setInventory((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantityOnHand: quantity,
                  recordedAt: new Date().toISOString(),
                }
              : item
          )
        );

        showSuccess(`Inventory quantity updated to ${quantity}`);
        return response.data;
      } catch (err: any) {
        showError(err, "Failed to update inventory quantity");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getLowStock = useCallback(async (): Promise<InventoryItem[]> => {
    try {
      const response = await inventoryAPI.getLowStock();
      return response.data || [];
    } catch (err: any) {
      showError(err, "Failed to load low stock items");
      return [];
    }
  }, []);

  const getCritical = useCallback(async (): Promise<InventoryItem[]> => {
    try {
      const response = await inventoryAPI.getCritical();
      return response.data || [];
    } catch (err: any) {
      showError(err, "Failed to load critical stock items");
      return [];
    }
  }, []);

  // Load inventory on mount
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
    inventory,
    isLoading,
    error,
    refreshInventory,
    updateQuantity,
    getLowStock,
    getCritical,
  };
}
