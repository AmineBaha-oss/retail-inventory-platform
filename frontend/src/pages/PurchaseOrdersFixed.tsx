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
import { FiShoppingCart } from "react-icons/fi";
import SectionCard from "../components/ui/SectionCard";
import { purchaseOrderAPI, supplierAPI, storeAPI } from "../services/api";
import {
  PurchaseOrder as APIPurchaseOrder,
  PurchaseOrderCreateRequest,
  Supplier,
  Store,
} from "../types/api";

// UI PurchaseOrder type extends API PurchaseOrder
type UIPurchaseOrder = APIPurchaseOrder;
type NewPurchaseOrder = PurchaseOrderCreateRequest;

const emptyNewPurchaseOrder: NewPurchaseOrder = {
  poNumber: "",
  supplierId: "",
  storeId: "",
  status: "DRAFT",
  taxAmount: 0,
  shippingAmount: 0,
  priority: "MEDIUM",
  notes: "",
};

// Demo data fallback
const initialPurchaseOrders: UIPurchaseOrder[] = [
  {
    id: "demo-1",
    poNumber: "PO-DEMO-001",
    supplierId: "supplier-1",
    supplierName: "Demo Supplier",
    storeId: "store-1",
    storeName: "Demo Store",
    status: "PENDING_APPROVAL",
    totalAmount: 1250.0,
    taxAmount: 125.0,
    shippingAmount: 25.0,
    orderDate: "2024-01-15",
    priority: "HIGH",
    notes: "Demo purchase order",
    itemCount: 5,
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-15T00:00:00",
  },
];

const PurchaseOrders: React.FC = () => {
  // State
  const [purchaseOrders, setPurchaseOrders] = useState<UIPurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPurchaseOrder, setNewPurchaseOrder] = useState<NewPurchaseOrder>(
    emptyNewPurchaseOrder
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Load purchase orders from API
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseOrderAPI.getAll();

      // Handle different response formats
      let purchaseOrdersData: APIPurchaseOrder[];
      if (Array.isArray(response.data)) {
        purchaseOrdersData = response.data;
      } else if (response.data && "content" in response.data) {
        purchaseOrdersData = (response.data as any).content;
      } else if (response.data && "value" in response.data) {
        // Special case for purchase orders API
        purchaseOrdersData = (response.data as any).value;
      } else {
        purchaseOrdersData = [];
      }

      setPurchaseOrders(purchaseOrdersData);

      toast({
        title: "Purchase orders loaded successfully",
        description: `Loaded ${purchaseOrdersData.length} purchase orders`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch purchase orders";
      setError(errorMessage);
      setPurchaseOrders(initialPurchaseOrders); // Fallback to demo data
      toast({
        title: "Error loading purchase orders",
        description: errorMessage + ". Showing demo data.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers and stores for dropdowns
  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      let suppliersData: Supplier[];
      if ("content" in response.data) {
        suppliersData = response.data.content;
      } else {
        suppliersData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }
      setSuppliers(suppliersData);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await storeAPI.getAll();
      let storesData: Store[];
      if ("content" in response.data) {
        storesData = response.data.content;
      } else {
        storesData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }
      setStores(storesData);
    } catch (err) {
      console.error("Failed to load stores:", err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchStores();
  }, []);

  // Computed values
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter(
    (po: UIPurchaseOrder) => po.status === "PENDING_APPROVAL"
  ).length;
  const approvedPOs = purchaseOrders.filter(
    (po: UIPurchaseOrder) => po.status === "APPROVED"
  ).length;
  const totalValue = purchaseOrders.reduce(
    (sum: number, po: UIPurchaseOrder) => sum + (po.totalAmount || 0),
    0
  );

  // Filtering
  const filteredPurchaseOrders = purchaseOrders.filter(
    (po: UIPurchaseOrder) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        (po.supplierName?.toLowerCase().includes(search.toLowerCase()) ??
          false) ||
        (po.storeName?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "" || po.status === statusFilter;
      const matchesSupplier =
        supplierFilter === "" || po.supplierName === supplierFilter;
      return matchesSearch && matchesStatus && matchesSupplier;
    }
  );

  // Event handlers
  const handleInputChange = (
    field: keyof NewPurchaseOrder,
    value: string | number
  ) => {
    setNewPurchaseOrder((prev: NewPurchaseOrder) => ({
      ...prev,
      [field]:
        typeof value === "string" &&
        (field === "taxAmount" || field === "shippingAmount")
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleCreatePurchaseOrder = async () => {
    try {
      setIsSubmitting(true);
      const response = await purchaseOrderAPI.create(newPurchaseOrder);
      const created: UIPurchaseOrder = response.data;

      setPurchaseOrders((prev: UIPurchaseOrder[]) => [created, ...prev]);
      setNewPurchaseOrder(emptyNewPurchaseOrder);
      setIsModalOpen(false);

      toast({
        title: "Purchase order created successfully",
        description: `PO ${created.poNumber} has been created`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create purchase order";
      toast({
        title: "Error creating purchase order",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unique suppliers for filter
  const uniqueSuppliers = [
    ...new Set(
      purchaseOrders
        .map((po: UIPurchaseOrder) => po.supplierName)
        .filter(Boolean)
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
          <Text>Loading purchase orders...</Text>
        </VStack>
      </Box>
    );
  }

  if (error && purchaseOrders.length === 0) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Failed to load purchase orders</Text>
            <Text fontSize="sm">{error}</Text>
            <Button size="sm" onClick={fetchPurchaseOrders}>
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
        title="Purchase Order Management"
        actions={
          <Button
            leftIcon={<FiShoppingCart />}
            colorScheme="blue"
            onClick={() => setIsModalOpen(true)}
          >
            Create PO
          </Button>
        }
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total POs</StatLabel>
              <StatNumber>{totalPOs}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Purchase orders
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending Approval</StatLabel>
              <StatNumber>{pendingPOs}</StatNumber>
              <StatHelpText color="orange.500">Awaiting approval</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Approved</StatLabel>
              <StatNumber>{approvedPOs}</StatNumber>
              <StatHelpText color="green.500">
                Ready for processing
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Value</StatLabel>
              <StatNumber>${totalValue.toLocaleString()}</StatNumber>
              <StatHelpText>Order value</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Purchase Orders Table */}
      <SectionCard title="Purchase Orders">
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <Input
                placeholder="Search purchase orders..."
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
              maxW="180px"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </Select>

            <Select
              placeholder="All Suppliers"
              maxW="150px"
              value={supplierFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSupplierFilter(e.target.value)
              }
            >
              {uniqueSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </Select>

            <Button size="sm" onClick={fetchPurchaseOrders}>
              Refresh
            </Button>
          </HStack>

          {/* Purchase Orders Table */}
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>PO Details</Th>
                <Th>Supplier</Th>
                <Th>Store</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Order Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPurchaseOrders.length === 0 ? (
                <Tr>
                  <Td colSpan={8} textAlign="center" py={8}>
                    {purchaseOrders.length === 0
                      ? "No purchase orders found. Create your first PO!"
                      : "No purchase orders match your filters."}
                  </Td>
                </Tr>
              ) : (
                filteredPurchaseOrders.map((po: UIPurchaseOrder) => (
                  <Tr key={po.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{po.poNumber}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {po.itemCount || 0} items
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{po.supplierName || "—"}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{po.storeName || "—"}</Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          ${(po.totalAmount || 0).toLocaleString()}
                        </Text>
                        {po.taxAmount && (
                          <Text fontSize="xs" color="gray.500">
                            Tax: ${po.taxAmount.toFixed(2)}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          po.status === "APPROVED"
                            ? "green"
                            : po.status === "PENDING_APPROVAL"
                            ? "orange"
                            : po.status === "DELIVERED"
                            ? "blue"
                            : po.status === "CANCELLED" ||
                              po.status === "REJECTED"
                            ? "red"
                            : "gray"
                        }
                        variant="subtle"
                      >
                        {po.status?.replace("_", " ")}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          po.priority === "CRITICAL"
                            ? "red"
                            : po.priority === "HIGH"
                            ? "orange"
                            : po.priority === "MEDIUM"
                            ? "blue"
                            : "gray"
                        }
                        size="sm"
                      >
                        {po.priority}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {po.orderDate
                          ? new Date(po.orderDate).toLocaleDateString()
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

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Purchase Order</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>PO Number</FormLabel>
                <Input
                  value={newPurchaseOrder.poNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("poNumber", e.target.value)
                  }
                  placeholder="PO-2025-001"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Supplier</FormLabel>
                  {suppliers.length > 0 ? (
                    <Select
                      value={newPurchaseOrder.supplierId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleInputChange("supplierId", e.target.value)
                      }
                      placeholder="Select supplier"
                    >
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={newPurchaseOrder.supplierId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("supplierId", e.target.value)
                      }
                      placeholder="Supplier ID"
                    />
                  )}
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Store</FormLabel>
                  {stores.length > 0 ? (
                    <Select
                      value={newPurchaseOrder.storeId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleInputChange("storeId", e.target.value)
                      }
                      placeholder="Select store"
                    >
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={newPurchaseOrder.storeId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("storeId", e.target.value)
                      }
                      placeholder="Store ID"
                    />
                  )}
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Tax Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPurchaseOrder.taxAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("taxAmount", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Shipping Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPurchaseOrder.shippingAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("shippingAmount", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={newPurchaseOrder.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleInputChange("priority", e.target.value)
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={newPurchaseOrder.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleInputChange("status", e.target.value)
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  value={newPurchaseOrder.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("notes", e.target.value)
                  }
                  placeholder="Additional notes..."
                />
              </FormControl>
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
              onClick={handleCreatePurchaseOrder}
              isLoading={isSubmitting}
              loadingText="Creating..."
              disabled={
                !newPurchaseOrder.poNumber ||
                !newPurchaseOrder.supplierId ||
                !newPurchaseOrder.storeId
              }
            >
              Create PO
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PurchaseOrders;
