import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  HStack,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  InputGroup,
  InputRightElement,
  IconButton,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FiPlus, FiEdit3, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { useRef } from "react";
import PageHeader from "../components/ui/PageHeader";
import { FiPackage } from "react-icons/fi";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { inventoryAPI } from "../services/api";
import { showSuccess, showError, showInfo, debounce } from "../utils/helpers";
import { useLocation } from "react-router-dom";

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  store: string;
  quantity: number;
  reorderPoint: number;
  daysUntilStockout: number;
  status: "Healthy" | "Low" | "Critical";
  lastUpdated: string;
  forecastedDemand?: number;
  leadTime?: number;
};

// Demo data with more realistic inventory items
const initialInventory: InventoryItem[] = [
  {
    id: "1",
    sku: "TEE-Black-S",
    name: "Black T-Shirt (Small)",
    store: "Downtown",
    quantity: 45,
    reorderPoint: 20,
    daysUntilStockout: 12,
    status: "Healthy",
    lastUpdated: "2024-01-15",
    forecastedDemand: 3.2,
    leadTime: 14,
  },
  {
    id: "2",
    sku: "JKT-Navy-M",
    name: "Navy Jacket (Medium)",
    store: "Longueuil",
    quantity: 8,
    reorderPoint: 15,
    daysUntilStockout: 3,
    status: "Critical",
    lastUpdated: "2024-01-15",
    forecastedDemand: 2.1,
    leadTime: 21,
  },
  {
    id: "3",
    sku: "SHO-Brown-42",
    name: "Brown Shoes (42)",
    store: "Plateau",
    quantity: 0,
    reorderPoint: 10,
    daysUntilStockout: 0,
    status: "Critical",
    lastUpdated: "2024-01-15",
    forecastedDemand: 1.8,
    leadTime: 28,
  },
  {
    id: "4",
    sku: "PANT-Khaki-32",
    name: "Khaki Pants (32)",
    store: "Downtown",
    quantity: 22,
    reorderPoint: 25,
    daysUntilStockout: 8,
    status: "Low",
    lastUpdated: "2024-01-15",
    forecastedDemand: 2.8,
    leadTime: 18,
  },
  {
    id: "5",
    sku: "HAT-Red-L",
    name: "Red Baseball Cap (Large)",
    store: "Longueuil",
    quantity: 35,
    reorderPoint: 30,
    daysUntilStockout: 15,
    status: "Healthy",
    lastUpdated: "2024-01-15",
    forecastedDemand: 1.5,
    leadTime: 12,
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem>>({});
  const toast = useToast();
  const location = useLocation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Load inventory data from API
  useEffect(() => {
    loadInventoryData();
  }, []);

  // Get filters from navigation state (when coming from dashboard)
  useEffect(() => {
    if (location.state) {
      const {
        search: searchFilter,
        storeFilter: storeFilterState,
        statusFilter: statusFilterState,
      } = location.state;
      if (searchFilter) setSearch(searchFilter);
      if (storeFilterState) setStoreFilter(storeFilterState);
      if (statusFilterState) setStatusFilter(statusFilterState);
    }
  }, [location.state]);

  // Load inventory data from API
  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      const response = await inventoryAPI.getAll();

      // Transform API data to match our interface
      const transformedData: InventoryItem[] = response.data.map(
        (item: any) => ({
          id: item.id,
          sku: item.product_id || "N/A",
          name: `Product ${item.product_id}`,
          store: item.store_id || "Unknown Store",
          quantity: item.quantity_on_hand || 0,
          reorderPoint: item.reorder_point || 0,
          daysUntilStockout: Math.max(
            0,
            Math.floor((item.quantity_on_hand || 0) / 3)
          ), // Estimate
          status:
            (item.quantity_on_hand || 0) <= (item.reorder_point || 0)
              ? (item.quantity_on_hand || 0) === 0
                ? "Critical"
                : "Low"
              : "Healthy",
          lastUpdated: item.last_updated || new Date().toISOString(),
          forecastedDemand: 2.5, // Default estimate
          leadTime: 14, // Default estimate
        })
      );

      setInventory(transformedData);
    } catch (error) {
      console.error("Failed to load inventory data:", error);
      // Fallback to demo data if API fails
      setInventory(initialInventory);
      showError("Failed to load inventory data. Showing demo data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((searchTerm: string) => {
    setSearch(searchTerm);
  }, 300);

  const filteredInventory = inventory.filter(
    (item) =>
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase())) &&
      (storeFilter === "" || item.store === storeFilter) &&
      (statusFilter === "" || item.status === statusFilter)
  );

  const totalItems = inventory.length;
  const healthyCount = inventory.filter(
    (item) => item.status === "Healthy"
  ).length;
  const lowCount = inventory.filter((item) => item.status === "Low").length;
  const criticalCount = inventory.filter(
    (item) => item.status === "Critical"
  ).length;

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setStatusFilter("");
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingItem.id) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === editingItem.id ? { ...item, ...editingItem } : item
      )
    );

    showSuccess("Inventory item updated successfully!");
    setIsEditModalOpen(false);
    setEditingItem({});
  };

  // Handle delete item
  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!selectedItem) return;

    setInventory((prev) => prev.filter((item) => item.id !== selectedItem.id));
    showSuccess("Inventory item deleted successfully!");
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // Handle generate PO for critical items
  const handleGeneratePO = async (item: InventoryItem) => {
    try {
      setIsLoading(true);
      showInfo(`Generating purchase order for ${item.sku}...`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showSuccess(
        `Purchase order generated for ${item.sku}! Check Purchase Orders page.`
      );
    } catch (error) {
      showError("Failed to generate purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh inventory data
  const handleRefreshData = async () => {
    await loadInventoryData();
    showSuccess("Inventory data refreshed successfully!");
  };

  return (
    <>
      <PageHeader
        title="Inventory Management"
        subtitle="Monitor stock levels, identify at-risk items, and manage replenishment across all stores."
        icon={<FiPackage />}
        accentColor="var(--chakra-colors-orange-400)"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              isLoading={isLoading}
              loadingText="Refreshing..."
            >
              Refresh Data
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiPlus />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Add Item
            </Button>
          </HStack>
        }
      />

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Total Items
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {totalItems}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                Across all stores
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Healthy Stock
              </StatLabel>
              <StatNumber color="green.400" fontSize="2xl" fontWeight="bold">
                {healthyCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" /> Above reorder point
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Low Stock
              </StatLabel>
              <StatNumber color="orange.400" fontSize="2xl" fontWeight="bold">
                {lowCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="orange.300">
                Near reorder point
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Critical Stock
              </StatLabel>
              <StatNumber color="red.400" fontSize="2xl" fontWeight="bold">
                {criticalCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="red.300">
                Immediate action needed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Inventory Table */}
      <SectionCard title="Stock Levels">
        <HStack
          spacing={4}
          align={{ base: "stretch", md: "center" }}
          flexWrap="wrap"
          mb={4}
        >
          <InputGroup maxW={{ base: "100%", md: "360px" }}>
            <Input
              placeholder="Search by SKU, name, store..."
              defaultValue={search}
              onChange={handleSearch}
              bg="surfaceAlt"
            />
            <InputRightElement>
              <IconButton
                aria-label="search"
                icon={<SearchIcon />}
                size="sm"
                variant="ghost"
              />
            </InputRightElement>
          </InputGroup>

          <Select
            maxW={{ base: "100%", md: "180px" }}
            placeholder="Filter by store"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="Downtown">Downtown</option>
            <option value="Longueuil">Longueuil</option>
            <option value="Plateau">Plateau</option>
          </Select>

          <Select
            maxW={{ base: "100%", md: "180px" }}
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Healthy">Healthy</option>
            <option value="Low">Low</option>
            <option value="Critical">Critical</option>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            isDisabled={!search && !storeFilter && !statusFilter}
          >
            Clear Filters
          </Button>
        </HStack>

        <DataTable
          head={
            <Tr>
              <Th>SKU</Th>
              <Th>Name</Th>
              <Th>Store</Th>
              <Th isNumeric>Quantity</Th>
              <Th isNumeric>Reorder Point</Th>
              <Th isNumeric>Days Left</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          }
        >
          {filteredInventory.map((item) => (
            <Tr key={`${item.sku}-${item.store}`} _odd={{ bg: "gray.850" }}>
              <Td fontWeight="medium">{item.sku}</Td>
              <Td>{item.name}</Td>
              <Td>{item.store}</Td>
              <Td isNumeric fontWeight="semibold">
                {item.quantity}
              </Td>
              <Td isNumeric fontWeight="semibold">
                {item.reorderPoint}
              </Td>
              <Td isNumeric fontWeight="semibold">
                {item.daysUntilStockout}
              </Td>
              <Td>
                <Badge
                  colorScheme={
                    item.status === "Healthy"
                      ? "success"
                      : item.status === "Low"
                      ? "warning"
                      : "error"
                  }
                  variant="solid"
                >
                  {item.status}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    leftIcon={<FiEdit3 />}
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </Button>
                  {item.status === "Critical" && (
                    <Button
                      size="sm"
                      variant="solid"
                      colorScheme="red"
                      leftIcon={<FiAlertTriangle />}
                      onClick={() => handleGeneratePO(item)}
                      isLoading={isLoading}
                    >
                      Generate PO
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<FiTrash2 />}
                    onClick={() => handleDeleteItem(item)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </SectionCard>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">
            {editingItem.id ? "Edit Inventory Item" : "Add New Item"}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.200">SKU</FormLabel>
                <Input
                  value={editingItem.sku || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, sku: e.target.value })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Name</FormLabel>
                <Input
                  value={editingItem.name || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Store</FormLabel>
                <Select
                  value={editingItem.store || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, store: e.target.value })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                >
                  <option value="Downtown">Downtown</option>
                  <option value="Longueuil">Longueuil</option>
                  <option value="Plateau">Plateau</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Quantity</FormLabel>
                <Input
                  type="number"
                  value={editingItem.quantity || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Reorder Point</FormLabel>
                <Input
                  type="number"
                  value={editingItem.reorderPoint || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      reorderPoint: parseInt(e.target.value) || 0,
                    })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveEdit}>
              {editingItem.id ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg="gray.800"
            border="1px solid"
            borderColor="gray.700"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="gray.100">
              Delete Inventory Item
            </AlertDialogHeader>

            <AlertDialogBody color="gray.200">
              Are you sure you want to delete {selectedItem?.name} (
              {selectedItem?.sku})? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
