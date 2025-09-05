import { useState, useEffect, useCallback } from "react";
import { supplierAPI } from "../services/api";
import { showError, showSuccess, handleApiError } from "../utils/errorHandler";

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  leadTimeDays: number;
  leadTimeVarianceDays?: number;
  minOrderQuantity?: number;
  minOrderValue?: number;
  paymentTerms?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  code: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  leadTimeDays?: number;
  minOrderQuantity?: number;
  paymentTerms?: string;
}

export interface UseSupplierReturn {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  refreshSuppliers: () => Promise<void>;
  createSupplier: (supplier: CreateSupplierRequest) => Promise<Supplier>;
  updateSupplier: (
    id: string,
    supplier: Partial<CreateSupplierRequest>
  ) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Promise<Supplier | null>;
}

export function useSuppliers(): UseSupplierReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await supplierAPI.getAll();
      const data = response.data;

      // Handle pagination response
      if (data && typeof data === "object" && "content" in data) {
        // Spring Boot paginated response
        setSuppliers(data.content || []);
      } else if (Array.isArray(data)) {
        // Direct array response
        setSuppliers(data);
      } else {
        console.warn("Unexpected supplier data format:", data);
        setSuppliers([]);
      }
    } catch (err: any) {
      const apiError = handleApiError(err, "Failed to load suppliers");
      setError(apiError.message);
      console.error("Suppliers load error:", apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSuppliers = useCallback(async () => {
    await loadSuppliers();
    showSuccess("Suppliers data refreshed successfully!");
  }, [loadSuppliers]);

  const createSupplier = useCallback(
    async (supplierData: CreateSupplierRequest): Promise<Supplier> => {
      try {
        setIsLoading(true);

        const response = await supplierAPI.create(supplierData);
        const newSupplier = response.data;

        // Update local state
        setSuppliers((prev) => [newSupplier, ...prev]);

        showSuccess(`Supplier "${supplierData.name}" created successfully!`);
        return newSupplier;
      } catch (err: any) {
        showError(err, "Failed to create supplier");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateSupplier = useCallback(
    async (
      id: string,
      supplierData: Partial<CreateSupplierRequest>
    ): Promise<Supplier> => {
      try {
        setIsLoading(true);

        const response = await supplierAPI.update(id, supplierData);
        const updatedSupplier = response.data;

        // Update local state
        setSuppliers((prev) =>
          prev.map((supplier) =>
            supplier.id === id ? updatedSupplier : supplier
          )
        );

        showSuccess(`Supplier "${updatedSupplier.name}" updated successfully!`);
        return updatedSupplier;
      } catch (err: any) {
        showError(err, "Failed to update supplier");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteSupplier = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true);

        const supplier = suppliers.find((s) => s.id === id);
        await supplierAPI.delete(id);

        // Update local state
        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));

        showSuccess(
          `Supplier "${supplier?.name || "Unknown"}" deleted successfully!`
        );
      } catch (err: any) {
        showError(err, "Failed to delete supplier");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [suppliers]
  );

  const getSupplierById = useCallback(
    async (id: string): Promise<Supplier | null> => {
      try {
        const response = await supplierAPI.getById(id);
        return response.data;
      } catch (err: any) {
        showError(err, "Failed to load supplier details");
        return null;
      }
    },
    []
  );

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    isLoading,
    error,
    refreshSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  };
}
