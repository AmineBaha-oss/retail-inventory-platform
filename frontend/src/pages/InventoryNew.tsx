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
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Tooltip,
  IconButton,
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

// Mock data
const inventoryData = [
  {
    id: "1",
    productName: "Tailored Power Blazer",
    sku: "LOFT-BLZ-001",
    brand: "Loft",
    store: "SoHo Flagship",
    storeCode: "NYC001",
    onHand: 15,
    reorderPoint: 20,
    maxStock: 25,
    status: "Healthy",
    value: 0,
    unitValue: 0,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    productName: "Silk Wrap Blouse",
    sku: "LOFT-TOP-001",
    brand: "Loft",
    store: "SoHo Flagship",
    storeCode: "NYC001",
    onHand: 8,
    reorderPoint: 15,
    maxStock: 30,
    status: "Low",
    value: 0,
    unitValue: 0,
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    productName: "Midnight Gala Dress",
    sku: "VERA-DRS-001",
    brand: "Vera",
    store: "SoHo Flagship",
    storeCode: "NYC001",
    onHand: 45,
    reorderPoint: 20,
    maxStock: 50,
    status: "Low",
    value: 0,
    unitValue: 0,
    lastUpdated: "2024-01-13",
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState(inventoryData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const toast = useToast();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInventory(inventoryData);
      toast({
        title: "Inventory loaded successfully",
        description: `Loaded ${inventoryData.length} inventory items`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error loading inventory",
        description: "Failed to load inventory data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
    toast({
      title: "Add Inventory",
      description: "Add inventory functionality coming soon",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditInventory = (item: any) => {
    toast({
      title: "Edit Inventory",
      description: `Edit ${item.productName} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteInventory = (item: any) => {
    toast({
      title: "Delete Inventory",
      description: `Delete ${item.productName} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
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
    </VStack>
  );
}
