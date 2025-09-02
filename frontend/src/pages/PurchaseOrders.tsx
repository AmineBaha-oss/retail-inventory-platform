import React, { useState, useEffect, useRef } from "react";
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
  Button,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiTruck,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { purchaseOrderAPI } from "../services/api";
import {
  showSuccess,
  showError,
  showInfo,
  formatCurrency,
  formatDate,
} from "../utils/helpers";

type PurchaseOrderStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Processing"
  | "In Transit"
  | "Delivered"
  | "Cancelled"
  | "Rejected";

type PurchaseOrderItem = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  leadTime: number;
};

type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplier: string;
  store: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  items: PurchaseOrderItem[];
  createdAt: string;
  expectedDelivery: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
};

// Demo data
const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    supplier: "TechCorp",
    store: "Downtown",
    status: "In Transit",
    totalAmount: 2450.0,
    items: [
      {
        id: "1",
        sku: "TEE-Black-S",
        name: "Black T-Shirt (Small)",
        quantity: 100,
        unitPrice: 12.5,
        totalPrice: 1250.0,
        supplier: "TechCorp",
        leadTime: 14,
      },
      {
        id: "2",
        sku: "JKT-Navy-M",
        name: "Navy Jacket (Medium)",
        quantity: 50,
        unitPrice: 24.0,
        totalPrice: 1200.0,
        supplier: "TechCorp",
        leadTime: 21,
      },
    ],
    createdAt: "2024-01-10",
    expectedDelivery: "2024-01-25",
    approvedBy: "John Manager",
    approvedAt: "2024-01-10",
    notes: "Standard replenishment order",
    priority: "Medium",
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    supplier: "SupplyCo",
    store: "Longueuil",
    status: "Processing",
    totalAmount: 1800.0,
    items: [
      {
        id: "3",
        sku: "SHO-Brown-42",
        name: "Brown Shoes (42)",
        quantity: 30,
        unitPrice: 60.0,
        totalPrice: 1800.0,
        supplier: "SupplyCo",
        leadTime: 28,
      },
    ],
    createdAt: "2024-01-12",
    expectedDelivery: "2024-02-10",
    approvedBy: "Sarah Buyer",
    approvedAt: "2024-01-12",
    notes: "Urgent restock for popular size",
    priority: "High",
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    supplier: "FashionHub",
    store: "Plateau",
    status: "Pending Approval",
    totalAmount: 3200.0,
    items: [
      {
        id: "4",
        sku: "PANT-Khaki-32",
        name: "Khaki Pants (32)",
        quantity: 80,
        unitPrice: 40.0,
        totalPrice: 3200.0,
        supplier: "FashionHub",
        leadTime: 18,
      },
    ],
    createdAt: "2024-01-15",
    expectedDelivery: "2024-02-03",
    notes: "Seasonal collection restock",
    priority: "Medium",
  },
];

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    initialPurchaseOrders
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<Partial<PurchaseOrder>>({});
  const [activeTab, setActiveTab] = useState("all");
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Filter POs by status
  const filteredPOs = purchaseOrders.filter((po) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return po.status === "Pending Approval";
    if (activeTab === "approved") return po.status === "Approved";
    if (activeTab === "in-transit") return po.status === "In Transit";
    if (activeTab === "delivered") return po.status === "Delivered";
    return true;
  });

  // Calculate stats
  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter((po) => po.status === "Pending Approval")
      .length,
    approved: purchaseOrders.filter((po) => po.status === "Approved").length,
    inTransit: purchaseOrders.filter((po) => po.status === "In Transit").length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
  };

  // Handle create new PO
  const handleCreatePO = () => {
    setEditingPO({});
    setIsModalOpen(true);
  };

  // Handle edit PO
  const handleEditPO = (po: PurchaseOrder) => {
    setEditingPO(po);
    setIsModalOpen(true);
  };

  // Handle view PO details
  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsViewModalOpen(true);
  };

  // Handle save PO
  const handleSavePO = () => {
    if (editingPO.id) {
      // Update existing PO
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === editingPO.id ? { ...po, ...editingPO } : po
        )
      );
      showSuccess("Purchase order updated successfully!");
    } else {
      // Create new PO
      const newPO: PurchaseOrder = {
        id: Date.now().toString(),
        poNumber: `PO-${new Date().getFullYear()}-${String(
          purchaseOrders.length + 1
        ).padStart(3, "0")}`,
        supplier: editingPO.supplier || "",
        store: editingPO.store || "",
        status: "Draft",
        totalAmount: editingPO.totalAmount || 0,
        items: editingPO.items || [],
        createdAt: new Date().toISOString().split("T")[0],
        expectedDelivery: editingPO.expectedDelivery || "",
        notes: editingPO.notes || "",
        priority: editingPO.priority || "Medium",
      };
      setPurchaseOrders((prev) => [newPO, ...prev]);
      showSuccess("Purchase order created successfully!");
    }
    setIsModalOpen(false);
    setEditingPO({});
  };

  // Handle delete PO
  const handleDeletePO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!selectedPO) return;
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== selectedPO.id));
    showSuccess("Purchase order deleted successfully!");
    setIsDeleteDialogOpen(false);
    setSelectedPO(null);
  };

  // Handle approve PO
  const handleApprovePO = async (po: PurchaseOrder) => {
    try {
      setIsLoading(true);
      showInfo(`Approving purchase order ${po.poNumber}...`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPurchaseOrders((prev) =>
        prev.map((p) =>
          p.id === po.id
            ? {
                ...p,
                status: "Approved" as PurchaseOrderStatus,
                approvedBy: "Current User",
                approvedAt: new Date().toISOString().split("T")[0],
              }
            : p
        )
      );

      showSuccess(`Purchase order ${po.poNumber} approved successfully!`);
    } catch (error) {
      showError("Failed to approve purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject PO
  const handleRejectPO = async (po: PurchaseOrder) => {
    try {
      setIsLoading(true);
      showInfo(`Rejecting purchase order ${po.poNumber}...`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPurchaseOrders((prev) =>
        prev.map((p) =>
          p.id === po.id
            ? { ...p, status: "Rejected" as PurchaseOrderStatus }
            : p
        )
      );

      showSuccess(`Purchase order ${po.poNumber} rejected successfully!`);
    } catch (error) {
      showError("Failed to reject purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export POs
  const handleExportPOs = async () => {
    try {
      setIsLoading(true);
      showInfo("Exporting purchase orders...");

      // Create CSV content
      const csvContent = `PO Number,Supplier,Store,Status,Total Amount,Expected Delivery,Priority
${purchaseOrders
  .map(
    (po) =>
      `${po.poNumber},${po.supplier},${po.store},${po.status},${po.totalAmount},${po.expectedDelivery},${po.priority}`
  )
  .join("\n")}`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `purchase-orders-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("Purchase orders exported successfully!");
    } catch (error) {
      showError("Failed to export purchase orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      showInfo("Refreshing purchase order data...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess("Purchase order data refreshed successfully!");
    } catch (error) {
      showError("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage purchase orders, approvals, and track supplier deliveries across all stores."
        icon={<FiTruck />}
        accentColor="var(--chakra-colors-blue-400)"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleExportPOs}
              isLoading={isLoading}
              loadingText="Exporting..."
            >
              Export POs
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiRefreshCw />}
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
              onClick={handleCreatePO}
            >
              Create PO
            </Button>
          </HStack>
        }
      />

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={6}>
        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Total POs
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {stats.total}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                All time
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Pending Approval
              </StatLabel>
              <StatNumber color="orange.400" fontSize="2xl" fontWeight="bold">
                {stats.pending}
              </StatNumber>
              <StatHelpText fontSize="xs" color="orange.300">
                <StatArrow type="decrease" /> Awaiting review
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Approved
              </StatLabel>
              <StatNumber color="green.400" fontSize="2xl" fontWeight="bold">
                {stats.approved}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                Ready to process
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                In Transit
              </StatLabel>
              <StatNumber color="blue.400" fontSize="2xl" fontWeight="bold">
                {stats.inTransit}
              </StatNumber>
              <StatHelpText fontSize="xs" color="blue.300">
                On the way
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Total Value
              </StatLabel>
              <StatNumber color="purple.400" fontSize="2xl" fontWeight="bold">
                {formatCurrency(stats.totalValue)}
              </StatNumber>
              <StatHelpText fontSize="xs" color="purple.300">
                Combined value
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Purchase Orders Table */}
      <SectionCard title="Purchase Orders">
        <Tabs
          index={[
            "all",
            "pending",
            "approved",
            "in-transit",
            "delivered",
          ].indexOf(activeTab)}
          onChange={(index) => {
            const tabs = [
              "all",
              "pending",
              "approved",
              "in-transit",
              "delivered",
            ];
            setActiveTab(tabs[index]);
          }}
          mb={4}
        >
          <TabList>
            <Tab>All ({stats.total})</Tab>
            <Tab>Pending ({stats.pending})</Tab>
            <Tab>Approved ({stats.approved})</Tab>
            <Tab>In Transit ({stats.inTransit})</Tab>
            <Tab>Delivered</Tab>
          </TabList>
        </Tabs>

        <DataTable
          head={
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Store</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Expected Delivery</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          }
        >
          {filteredPOs.map((po) => (
            <tr
              key={po.id}
              style={{
                backgroundColor:
                  parseInt(po.id) % 2 === 0 ? "#1a202c" : "transparent",
              }}
            >
              <td style={{ fontWeight: "medium" }}>{po.poNumber}</td>
              <td>{po.supplier}</td>
              <td>{po.store}</td>
              <td>
                <Badge
                  colorScheme={
                    po.status === "Delivered"
                      ? "success"
                      : po.status === "In Transit"
                      ? "blue"
                      : po.status === "Approved"
                      ? "green"
                      : po.status === "Pending Approval"
                      ? "orange"
                      : po.status === "Rejected"
                      ? "red"
                      : "gray"
                  }
                  variant="solid"
                >
                  {po.status}
                </Badge>
              </td>
              <td style={{ fontWeight: "semibold" }}>
                {formatCurrency(po.totalAmount)}
              </td>
              <td>{formatDate(po.expectedDelivery)}</td>
              <td>
                <Badge
                  colorScheme={
                    po.priority === "Critical"
                      ? "red"
                      : po.priority === "High"
                      ? "orange"
                      : po.priority === "Medium"
                      ? "yellow"
                      : "green"
                  }
                  variant="solid"
                >
                  {po.priority}
                </Badge>
              </td>
              <td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    leftIcon={<FiEye />}
                    onClick={() => handleViewPO(po)}
                  >
                    View
                  </Button>
                  {po.status === "Draft" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<FiEdit3 />}
                      onClick={() => handleEditPO(po)}
                    >
                      Edit
                    </Button>
                  )}
                  {po.status === "Pending Approval" && (
                    <>
                      <Button
                        size="sm"
                        variant="solid"
                        colorScheme="green"
                        leftIcon={<FiCheck />}
                        onClick={() => handleApprovePO(po)}
                        isLoading={isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="solid"
                        colorScheme="red"
                        leftIcon={<FiX />}
                        onClick={() => handleRejectPO(po)}
                        isLoading={isLoading}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {po.status === "Draft" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<FiTrash2 />}
                      onClick={() => handleDeletePO(po)}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>

      {/* PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">
            {editingPO.id ? "Edit Purchase Order" : "Create Purchase Order"}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.200">Supplier</FormLabel>
                <Input
                  value={editingPO.supplier || ""}
                  onChange={(e) =>
                    setEditingPO({ ...editingPO, supplier: e.target.value })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Store</FormLabel>
                <Select
                  value={editingPO.store || ""}
                  onChange={(e) =>
                    setEditingPO({ ...editingPO, store: e.target.value })
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
                <FormLabel color="gray.200">Expected Delivery</FormLabel>
                <Input
                  type="date"
                  value={editingPO.expectedDelivery || ""}
                  onChange={(e) =>
                    setEditingPO({
                      ...editingPO,
                      expectedDelivery: e.target.value,
                    })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Priority</FormLabel>
                <Select
                  value={editingPO.priority || "Medium"}
                  onChange={(e) =>
                    setEditingPO({
                      ...editingPO,
                      priority: e.target.value as any,
                    })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Notes</FormLabel>
                <Textarea
                  value={editingPO.notes || ""}
                  onChange={(e) =>
                    setEditingPO({ ...editingPO, notes: e.target.value })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  rows={3}
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
            <Button colorScheme="brand" onClick={handleSavePO}>
              {editingPO.id ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View PO Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">
            View Purchase Order: {selectedPO?.poNumber}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            {selectedPO && (
              <VStack spacing={6} align="stretch">
                {/* PO Header Info */}
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      PO Number
                    </Text>
                    <Text color="gray.100" fontSize="md">
                      {selectedPO.poNumber}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Status
                    </Text>
                    <Badge
                      colorScheme={
                        selectedPO.status === "Approved"
                          ? "green"
                          : selectedPO.status === "Pending Approval"
                          ? "yellow"
                          : selectedPO.status === "In Transit"
                          ? "blue"
                          : selectedPO.status === "Delivered"
                          ? "green"
                          : "gray"
                      }
                      variant="solid"
                    >
                      {selectedPO.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Supplier
                    </Text>
                    <Text color="gray.100" fontSize="md">
                      {selectedPO.supplier}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Store
                    </Text>
                    <Text color="gray.100" fontSize="md">
                      {selectedPO.store}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Created Date
                    </Text>
                    <Text color="gray.100" fontSize="md">
                      {selectedPO.createdAt}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Expected Delivery
                    </Text>
                    <Text color="gray.100" fontSize="md">
                      {selectedPO.expectedDelivery || "Not specified"}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Priority
                    </Text>
                    <Badge
                      colorScheme={
                        selectedPO.priority === "Critical"
                          ? "red"
                          : selectedPO.priority === "High"
                          ? "orange"
                          : selectedPO.priority === "Medium"
                          ? "yellow"
                          : "gray"
                      }
                      variant="solid"
                    >
                      {selectedPO.priority}
                    </Badge>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Total Amount
                    </Text>
                    <Text color="gray.100" fontSize="md" fontWeight="bold">
                      ${selectedPO.totalAmount.toLocaleString()}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* PO Items */}
                <Box>
                  <Text
                    color="gray.400"
                    fontSize="sm"
                    fontWeight="medium"
                    mb={3}
                  >
                    Items
                  </Text>
                  <Box
                    border="1px solid"
                    borderColor="gray.700"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th color="gray.300">SKU</Th>
                          <Th color="gray.300">Name</Th>
                          <Th color="gray.300" isNumeric>
                            Quantity
                          </Th>
                          <Th color="gray.300" isNumeric>
                            Unit Price
                          </Th>
                          <Th color="gray.300" isNumeric>
                            Total
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedPO.items.map((item, index) => (
                          <Tr key={index} _odd={{ bg: "gray.800" }}>
                            <Td color="gray.200">{item.sku}</Td>
                            <Td color="gray.200">{item.name}</Td>
                            <Td color="gray.200" isNumeric>
                              {item.quantity}
                            </Td>
                            <Td color="gray.200" isNumeric>
                              ${item.unitPrice}
                            </Td>
                            <Td color="gray.200" isNumeric>
                              ${item.totalPrice}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>

                {/* Notes */}
                {selectedPO.notes && (
                  <Box>
                    <Text
                      color="gray.400"
                      fontSize="sm"
                      fontWeight="medium"
                      mb={2}
                    >
                      Notes
                    </Text>
                    <Text
                      color="gray.200"
                      fontSize="md"
                      p={3}
                      bg="gray.700"
                      borderRadius="md"
                    >
                      {selectedPO.notes}
                    </Text>
                  </Box>
                )}

                {/* Approval Info */}
                {selectedPO.approvedBy && (
                  <Box>
                    <Text
                      color="gray.400"
                      fontSize="sm"
                      fontWeight="medium"
                      mb={2}
                    >
                      Approval Details
                    </Text>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text color="gray.400" fontSize="sm">
                          Approved By
                        </Text>
                        <Text color="gray.200">{selectedPO.approvedBy}</Text>
                      </Box>
                      <Box>
                        <Text color="gray.400" fontSize="sm">
                          Approved At
                        </Text>
                        <Text color="gray.200">{selectedPO.approvedAt}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
              Close
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
              Delete Purchase Order
            </AlertDialogHeader>

            <AlertDialogBody color="gray.200">
              Are you sure you want to delete purchase order{" "}
              {selectedPO?.poNumber}? This action cannot be undone.
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
