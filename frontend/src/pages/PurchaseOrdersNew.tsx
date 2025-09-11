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
  FiShoppingCart,
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
const purchaseOrdersData = [
  {
    id: "1",
    poNumber: "PO-2025-001",
    itemCount: 1,
    supplier: "Loft & Co",
    store: "SoHo Flagship",
    amount: 0,
    status: "PENDING APPROVAL",
    priority: "HIGH",
    orderDate: "2024-01-04",
  },
  {
    id: "2",
    poNumber: "PO-2025-002",
    itemCount: 1,
    supplier: "Vera Couture",
    store: "Beverly Hills Premium",
    amount: 0,
    status: "APPROVED",
    priority: "MEDIUM",
    orderDate: "2024-01-05",
  },
];

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState(purchaseOrdersData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const toast = useToast();

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPurchaseOrders(purchaseOrdersData);
      toast({
        title: "Purchase orders loaded successfully",
        description: `Loaded ${purchaseOrdersData.length} purchase orders`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error loading purchase orders",
        description: "Failed to load purchase orders data",
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

  const handleSupplierFilter = (supplier: string) => {
    setSupplierFilter(supplier);
  };

  const handleCreatePO = () => {
    toast({
      title: "Create Purchase Order",
      description: "Create PO functionality coming soon",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditPO = (po: any) => {
    toast({
      title: "Edit Purchase Order",
      description: `Edit ${po.poNumber} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeletePO = (po: any) => {
    toast({
      title: "Delete Purchase Order",
      description: `Delete ${po.poNumber} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      po.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSupplier =
      supplierFilter === "all" || po.supplier === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const columns = [
    { key: "poNumber", label: "PO DETAILS" },
    { key: "supplier", label: "SUPPLIER" },
    { key: "store", label: "STORE" },
    { key: "amount", label: "AMOUNT" },
    { key: "status", label: "STATUS" },
    { key: "priority", label: "PRIORITY" },
    { key: "orderDate", label: "ORDER DATE" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Purchase Order">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditPO(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Purchase Order">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeletePO(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage purchase orders, track supplier deliveries, and monitor order status"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={loadPurchaseOrders}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleCreatePO}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Create PO
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total POs"
          value="2"
          change={0}
          changeType="increase"
          icon={FiShoppingCart}
          iconColor="brand"
          description="Purchase orders"
          status="info"
        />
        <StatCard
          title="Pending Approval"
          value="1"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Awaiting approval"
          status="warning"
        />
        <StatCard
          title="Approved"
          value="1"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Ready for processing"
          status="success"
        />
        <StatCard
          title="Total Value"
          value="$0"
          change={0}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="brand"
          description="Order value"
          status="info"
        />
      </SimpleGrid>

      {/* Purchase Orders Table */}
      <SectionCard
        title="Purchase Orders"
        subtitle="Complete purchase order information with status and priority"
        icon={FiShoppingCart}
      >
        <DataTable
          columns={columns}
          data={filteredPOs}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search purchase orders..."
          onSearch={handleSearch}
          filters={[
            {
              key: "status",
              label: "All Statuses",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "PENDING APPROVAL", label: "Pending Approval" },
                { value: "APPROVED", label: "Approved" },
                { value: "IN TRANSIT", label: "In Transit" },
                { value: "DELIVERED", label: "Delivered" },
              ],
              onFilter: handleStatusFilter,
            },
            {
              key: "supplier",
              label: "All Suppliers",
              options: [
                { value: "all", label: "All Suppliers" },
                { value: "Loft & Co", label: "Loft & Co" },
                { value: "Vera Couture", label: "Vera Couture" },
                { value: "Urban Threads", label: "Urban Threads" },
              ],
              onFilter: handleSupplierFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No purchase orders found"
        />
      </SectionCard>
    </VStack>
  );
}
