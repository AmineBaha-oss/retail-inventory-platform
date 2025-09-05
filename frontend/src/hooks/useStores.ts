import { useState, useEffect, useCallback } from "react";
import { storeAPI } from "../services/api";
import { Store, StoreCreateRequest, StoreUpdateRequest } from "../types/api";
import { showSuccess, showError } from "../utils/helpers";

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all stores
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeAPI.getAll();

      // Handle paginated response
      const storesData = response.data.content || response.data;
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch stores";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new store
  const createStore = useCallback(async (storeData: StoreCreateRequest) => {
    try {
      setLoading(true);
      const response = await storeAPI.create(storeData);
      const newStore = response.data;

      setStores((prev) => [...prev, newStore]);
      showSuccess("Store created successfully");
      return newStore;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create store";
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a store
  const updateStore = useCallback(
    async (id: string, storeData: StoreUpdateRequest) => {
      try {
        setLoading(true);
        const response = await storeAPI.update(id, storeData);
        const updatedStore = response.data;

        setStores((prev) =>
          prev.map((store) => (store.id === id ? updatedStore : store))
        );
        showSuccess("Store updated successfully");
        return updatedStore;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update store";
        setError(errorMessage);
        showError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a store
  const deleteStore = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await storeAPI.delete(id);

      setStores((prev) => prev.filter((store) => store.id !== id));
      showSuccess("Store deleted successfully");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete store";
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get store by ID
  const getStoreById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await storeAPI.getById(id);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch store";
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    getStoreById,
    clearError: () => setError(null),
  };
};
