import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  VStack,
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
  Spinner,
  Alert,
  AlertIcon,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { FiPackage } from "react-icons/fi";
import SectionCard from "../components/ui/SectionCard";
import { inventoryAPI } from "../services/api";
import {
  Inventory as APIInventory,
  InventoryCreateRequest,
} from "../types/api";

type InventoryStatus = "Healthy" | "Low" | "Critical";

// UI Inventory type extends API Inventory with computed fields
type UIInventory = APIInventory & {
  status: InventoryStatus;
  daysUntilStockout: number;
  forecastedDemand?: number;
  leadTime?: number;
};

type NewInventory = InventoryCreateRequest;

// Convert API Inventory to UI Inventory format
const formatInventoryForUI = (apiInventory: APIInventory): UIInventory => {
  const quantity = apiInventory.quantityOnHand || 0;
  const reorderLevel = apiInventory.reorderLevel || 10;

  let status: InventoryStatus = "Healthy";
  if (quantity <= 0) status = "Critical";
  else if (quantity <= reorderLevel) status = "Low";

  return {
    ...apiInventory,
    status,
    daysUntilStockout: quantity > 0 ? Math.floor(quantity / 2) : 0, // Simple estimation
    forecastedDemand: undefined, // TODO: Get from forecasting API
    leadTime: undefined, // TODO: Get from supplier API
  };
};

const emptyNewInventory: NewInventory = {
  storeId: "",
  productId: "",
  quantityOnHand: 0,
  reorderLevel: 10,
  maxStockLevel: 100,
  unitCost: 0,
};

// Demo data fallback
const initialInventory: UIInventory[] = [
  {
    id: "demo-1",
    storeId: "store-1",
    storeCode: "DT001",
    storeName: "Downtown",
    productId: "product-1",
    productSku: "TEE-Black-S",
    productName: "Black T-Shirt (Small)",
    quantityOnHand: 45,
    reservedQuantity: 5,
    reorderLevel: 20,
    maxStockLevel: 100,
    unitCost: 12.5,
    totalValue: 562.5,
    lastUpdated: "2024-01-20T10:30:00",
    status: "Healthy",
    daysUntilStockout: 22,
    forecastedDemand: 2,
    leadTime: 7,
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-20T10:30:00",
  },
];

const Inventory: React.FC = () => {
  // State
  const [inventory, setInventory] = useState<UIInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | InventoryStatus>("");
  const [storeFilter, setStoreFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInventory, setNewInventory] =
    useState<NewInventory>(emptyNewInventory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Load inventory from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryAPI.getAll();

      // The response is always paginated from Spring Boot
      let inventoryData: APIInventory[];
      if ("content" in response.data) {
        // Paginated response
        inventoryData = response.data.content;
      } else {
        // Non-paginated response (fallback)
        inventoryData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }

      const formattedInventory = inventoryData.map(formatInventoryForUI);
      setInventory(formattedInventory);

      toast({
        title: "Inventory loaded successfully",
        description: `Loaded ${formattedInventory.length} inventory items`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch inventory";
      setError(errorMessage);
      setInventory(initialInventory); // Fallback to demo data
      toast({
        title: "Error loading inventory",
        description: errorMessage + ". Showing demo data.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Computed values
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(
    (item: UIInventory) => item.status === "Low"
  ).length;
  const criticalItems = inventory.filter(
    (item: UIInventory) => item.status === "Critical"
  ).length;
  const totalValue = inventory.reduce(
    (sum: number, item: UIInventory) => sum + (item.totalValue || 0),
    0
  );

  // Filtering
  const filteredInventory = inventory.filter((item: UIInventory) => {
    const matchesSearch =
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.productSku?.toLowerCase().includes(search.toLowerCase()) ||
      item.storeName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    const matchesStore = storeFilter === "" || item.storeName === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  // Event handlers
  const handleInputChange = (
    field: keyof NewInventory,
    value: string | number
  ) => {
    setNewInventory((prev: NewInventory) => ({
      ...prev,
      [field]:
        typeof value === "string" &&
        field !== "storeId" &&
        field !== "productId"
          ? field === "quantityOnHand" ||
            field === "reorderLevel" ||
            field === "maxStockLevel" ||
            field === "unitCost"
            ? parseFloat(value) || 0
            : value
          : value,
    }));
  };

  const handleCreateInventory = async () => {
    try {
      setIsSubmitting(true);
      const response = await inventoryAPI.create(newInventory);
      const created: UIInventory = formatInventoryForUI(response.data);

      setInventory((prev: UIInventory[]) => [created, ...prev]);
      setNewInventory(emptyNewInventory);
      setIsModalOpen(false);

      toast({
        title: "Inventory created successfully",
        description: `${created.productName} inventory has been added`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create inventory";
      toast({
        title: "Error creating inventory",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unique stores for filter
  const uniqueStores = [
    ...new Set(
      inventory.map((item: UIInventory) => item.storeName).filter(Boolean)
    ),
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading inventory...</Text>
        </VStack>
      </Box>
    );
  }

  if (error && inventory.length === 0) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Failed to load inventory</Text>
            <Text fontSize="sm">{error}</Text>
            <Button size="sm" onClick={fetchInventory}>
              Retry
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Inventory Management"
        actions={
          <Button
            leftIcon={<FiPackage />}
            colorScheme="blue"
            onClick={() => setIsModalOpen(true)}
          >
            Add Inventory
          </Button>
        }
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Items</StatLabel>
              <StatNumber>{totalItems}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Real-time data
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Low Stock</StatLabel>
              <StatNumber>{lowStockItems}</StatNumber>
              <StatHelpText
                color={lowStockItems > 0 ? "orange.500" : "green.500"}
              >
                Items needing attention
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Critical Stock</StatLabel>
              <StatNumber>{criticalItems}</StatNumber>
              <StatHelpText color={criticalItems > 0 ? "red.500" : "green.500"}>
                Items out of stock
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Value</StatLabel>
              <StatNumber>${totalValue.toLocaleString()}</StatNumber>
              <StatHelpText>Inventory value</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Inventory Table */}
      <SectionCard title="Inventory Items">
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
              <InputRightElement>
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  size="sm"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>

            <Select
              placeholder="All Statuses"
              maxW="150px"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value as "" | InventoryStatus)
              }
            >
              <option value="Healthy">Healthy</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
            </Select>

            <Select
              placeholder="All Stores"
              maxW="150px"
              value={storeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStoreFilter(e.target.value)
              }
            >
              {uniqueStores.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </Select>

            <Button size="sm" onClick={fetchInventory}>
              Refresh
            </Button>
          </HStack>

          {/* Inventory Table */}
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Product Details</Th>
                <Th>Store</Th>
                <Th>Stock Levels</Th>
                <Th>Status</Th>
                <Th>Value</Th>
                <Th>Last Updated</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInventory.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    {inventory.length === 0
                      ? "No inventory items found. Add your first inventory item!"
                      : "No items match your filters."}
                  </Td>
                </Tr>
              ) : (
                filteredInventory.map((item: UIInventory) => (
                  <Tr key={item.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{item.productName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          SKU: {item.productSku}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{item.storeName}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {item.storeCode}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          On Hand: {item.quantityOnHand}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Reorder: {item.reorderLevel}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Max: {item.maxStockLevel}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          item.status === "Healthy"
                            ? "green"
                            : item.status === "Low"
                            ? "orange"
                            : "red"
                        }
                        variant="subtle"
                      >
                        {item.status}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          ${(item.totalValue || 0).toLocaleString()}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Unit: ${(item.unitCost || 0).toFixed(2)}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {item.lastUpdated
                          ? new Date(item.lastUpdated).toLocaleDateString()
                          : "—"}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </VStack>
      </SectionCard>

      {/* Create Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Inventory Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Store ID</FormLabel>
                  <Input
                    value={newInventory.storeId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("storeId", e.target.value)
                    }
                    placeholder="Store UUID"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Product ID</FormLabel>
                  <Input
                    value={newInventory.productId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("productId", e.target.value)
                    }
                    placeholder="Product UUID"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Quantity on Hand</FormLabel>
                  <Input
                    type="number"
                    value={newInventory.quantityOnHand}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("quantityOnHand", e.target.value)
                    }
                    placeholder="100"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Reorder Level</FormLabel>
                  <Input
                    type="number"
                    value={newInventory.reorderLevel}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("reorderLevel", e.target.value)
                    }
                    placeholder="20"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Max Stock Level</FormLabel>
                  <Input
                    type="number"
                    value={newInventory.maxStockLevel}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("maxStockLevel", e.target.value)
                    }
                    placeholder="500"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Unit Cost</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newInventory.unitCost}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("unitCost", e.target.value)
                    }
                    placeholder="25.50"
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateInventory}
              isLoading={isSubmitting}
              loadingText="Creating..."
              disabled={
                !newInventory.storeId ||
                !newInventory.productId ||
                !newInventory.quantityOnHand
              }
            >
              Create Inventory
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Inventory;
