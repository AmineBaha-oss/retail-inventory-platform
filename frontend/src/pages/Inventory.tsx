import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  VStack,
  Text,
  Button,
  Badge,
  useToast,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Tooltip,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { inventoryAPI } from "../services/api";
import { Inventory as APIInventory } from "../types/api";

type UIInventory = {
  id: string;
  productName?: string;
  sku?: string;
  brand?: string;
  store?: string;
  storeCode?: string;
  onHand: number;
  reorderPoint?: number;
  maxStock?: number;
  status: string;
  value?: number;
  unitValue?: number;
  lastUpdated?: string;
  productId?: string;
  storeId?: string;
};

export default function Inventory() {
  const [inventory, setInventory] = useState<UIInventory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<{ storeId: string; productId: string; quantityOnHand: number; reorderPoint?: number; maxStockLevel?: number; costPerUnit?: number }>(
    { storeId: "", productId: "", quantityOnHand: 0, reorderPoint: 10, maxStockLevel: 100, costPerUnit: 0 }
  );

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const res = await inventoryAPI.getAll();
      const list: any = Array.isArray(res.data) ? res.data : (res.data as any).content ?? [];
      const ui: UIInventory[] = (list as APIInventory[]).map((i) => ({
        id: i.id,
        store: i.storeName,
        storeCode: i.storeCode,
        productName: i.productName,
        sku: i.productSku,
        onHand: i.quantityOnHand,
        reorderPoint: (i as any).reorderPoint ?? undefined,
        maxStock: (i as any).maxStockLevel ?? undefined,
        status: i.quantityOnHand <= 0 ? "Critical" : (i as any).reorderLevel ? (i.quantityOnHand <= (i as any).reorderLevel ? "Low" : "Healthy") : "Healthy",
        value: i.totalValue,
        unitValue: i.unitCost,
        lastUpdated: i.lastUpdated,
        productId: i.productId,
        storeId: i.storeId,
      }));
      setInventory(ui);
    } catch (error) {
      toast({ title: "Failed to load inventory", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleStoreFilter = (store: string) => {
    setStoreFilter(store);
  };

  const handleAddInventory = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ storeId: "", productId: "", quantityOnHand: 0, reorderPoint: 10, maxStockLevel: 100, costPerUnit: 0 });
    setIsModalOpen(true);
  };

  const handleEditInventory = (item: UIInventory) => {
    setIsEditing(true);
    setSelectedId(item.id);
    setForm({
      storeId: item.storeId || "",
      productId: item.productId || "",
      quantityOnHand: item.onHand,
      reorderPoint: item.reorderPoint,
      maxStockLevel: item.maxStock,
      costPerUnit: item.unitValue,
    });
    setIsModalOpen(true);
  };

  const handleDeleteInventory = async (item: UIInventory) => {
    try {
      await inventoryAPI.delete(item.id);
      setInventory((prev) => prev.filter((x) => x.id !== item.id));
      toast({ title: "Inventory deleted", status: "success" });
    } catch (_) {
      toast({ title: "Failed to delete inventory", status: "error" });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedId) {
        const updatePayload: any = {
          quantityOnHand: form.quantityOnHand,
          reorderPoint: form.reorderPoint,
          maxStockLevel: form.maxStockLevel,
          costPerUnit: form.costPerUnit,
        };
        const res = await inventoryAPI.update(selectedId, updatePayload);
        const i = res.data as any;
        setInventory((prev) => prev.map((x) => (x.id === selectedId ? {
          id: i.id,
          store: i.storeName,
          storeCode: i.storeCode,
          productName: i.productName,
          sku: i.productSku,
          onHand: i.quantityOnHand,
          reorderPoint: i.reorderPoint,
          maxStock: i.maxStockLevel,
          status: i.quantityOnHand <= 0 ? "Critical" : i.reorderPoint && i.quantityOnHand <= i.reorderPoint ? "Low" : "Healthy",
          value: i.totalValue,
          unitValue: i.costPerUnit,
          lastUpdated: i.recordedAt,
          productId: i.productId,
          storeId: i.storeId,
        } : x)));
        toast({ title: "Inventory updated", status: "success" });
      } else {
        const createPayload: any = {
          storeId: form.storeId,
          productId: form.productId,
          quantityOnHand: form.quantityOnHand,
          reorderPoint: form.reorderPoint,
          maxStockLevel: form.maxStockLevel,
          costPerUnit: form.costPerUnit,
        };
        const res = await inventoryAPI.create(createPayload);
        const i = res.data as any;
        const item: UIInventory = {
          id: i.id,
          store: i.storeName,
          storeCode: i.storeCode,
          productName: i.productName,
          sku: i.productSku,
          onHand: i.quantityOnHand,
          reorderPoint: i.reorderPoint,
          maxStock: i.maxStockLevel,
          status: i.quantityOnHand <= 0 ? "Critical" : i.reorderPoint && i.quantityOnHand <= i.reorderPoint ? "Low" : "Healthy",
          value: i.totalValue,
          unitValue: i.costPerUnit,
          lastUpdated: i.recordedAt,
          productId: i.productId,
          storeId: i.storeId,
        };
        setInventory((prev) => [item, ...prev]);
        toast({ title: "Inventory created", status: "success" });
      }
      setIsModalOpen(false);
    } catch (_) {
      toast({ title: "Save failed", status: "error" });
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesStore = storeFilter === "all" || item.store === storeFilter;

    return matchesSearch && matchesStatus && matchesStore;
  });

  const columns = [
    { key: "productName", label: "PRODUCT DETAILS" },
    { key: "store", label: "STORE" },
    { key: "onHand", label: "STOCK LEVELS" },
    { key: "status", label: "STATUS" },
    { key: "value", label: "VALUE" },
    { key: "lastUpdated", label: "LAST UPDATED" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Inventory">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditInventory(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Inventory">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeleteInventory(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Inventory"
        subtitle="Manage stock levels, track inventory value, and monitor reorder points"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={loadInventory}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleAddInventory}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Add Inventory
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Items"
          value="8"
          change={12.5}
          changeType="increase"
          icon={FiPackage}
          iconColor="brand"
          description="Real-time data"
          status="success"
        />
        <StatCard
          title="Low Stock"
          value="4"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Items needing attention"
          status="warning"
        />
        <StatCard
          title="Critical Stock"
          value="1"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="error"
          description="Items out of stock"
          status="error"
        />
        <StatCard
          title="Total Value"
          value="$0"
          change={0}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="brand"
          description="Inventory value"
          status="info"
        />
      </SimpleGrid>

      {/* Inventory Table */}
      <SectionCard
        title="Inventory Items"
        subtitle="Complete inventory overview with stock levels and status"
        icon={FiPackage}
      >
        <DataTable
          columns={columns}
          data={filteredInventory}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search inventory..."
          onSearch={handleSearch}
          filters={[
            {
              key: "status",
              label: "All Statuses",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "Healthy", label: "Healthy" },
                { value: "Low", label: "Low Stock" },
                { value: "Critical", label: "Critical" },
              ],
              onFilter: handleStatusFilter,
            },
            {
              key: "store",
              label: "All Stores",
              options: [
                { value: "all", label: "All Stores" },
                { value: "SoHo Flagship", label: "SoHo Flagship" },
                {
                  value: "Beverly Hills Premium",
                  label: "Beverly Hills Premium",
                },
                { value: "Magnificent Mile", label: "Magnificent Mile" },
              ],
              onFilter: handleStoreFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No inventory items found"
        />
      </SectionCard>

      {/* Create/Edit Inventory Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Inventory" : "Add Inventory"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Store ID</FormLabel>
                  <Input value={form.storeId} onChange={(e) => setForm((p) => ({ ...p, storeId: e.target.value }))} placeholder="Store UUID" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Product ID</FormLabel>
                  <Input value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))} placeholder="Product UUID" />
                </FormControl>
              </HStack>
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Quantity On Hand</FormLabel>
                  <Input type="number" value={form.quantityOnHand} onChange={(e) => setForm((p) => ({ ...p, quantityOnHand: parseFloat(e.target.value || "0") }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Reorder Point</FormLabel>
                  <Input type="number" value={form.reorderPoint ?? 0} onChange={(e) => setForm((p) => ({ ...p, reorderPoint: parseInt(e.target.value || "0") }))} />
                </FormControl>
              </HStack>
              <HStack>
                <FormControl>
                  <FormLabel>Max Stock Level</FormLabel>
                  <Input type="number" value={form.maxStockLevel ?? 0} onChange={(e) => setForm((p) => ({ ...p, maxStockLevel: parseInt(e.target.value || "0") }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Cost Per Unit</FormLabel>
                  <Input type="number" step="0.01" value={form.costPerUnit ?? 0} onChange={(e) => setForm((p) => ({ ...p, costPerUnit: parseFloat(e.target.value || "0") }))} />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit} disabled={!form.storeId || !form.productId || !form.quantityOnHand}>
              {isEditing ? "Save Changes" : "Create Inventory"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
