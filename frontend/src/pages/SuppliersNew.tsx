import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  HStack,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";

// Mock data
const suppliersData = [
  {
    id: "1",
    name: "Loft & Co",
    category: "Premium Apparel",
    contactPerson: "Isabella Martinez",
    location: "New York, USA",
    status: "Active",
    orders: 0,
    totalValue: 0,
    lastOrder: "9/7/2025",
  },
  {
    id: "2",
    name: "Vera Couture",
    category: "Designer Wear",
    contactPerson: "Alessandro Rossi",
    location: "Paris, France",
    status: "Active",
    orders: 0,
    totalValue: 0,
    lastOrder: "9/7/2025",
  },
  {
    id: "3",
    name: "Urban Threads",
    category: "Casual Wear",
    contactPerson: "Zoe Thompson",
    location: "Los Angeles, USA",
    status: "Active",
    orders: 0,
    totalValue: 0,
    lastOrder: "9/7/2025",
  },
  {
    id: "4",
    name: "Luna Accessories",
    category: "Accessories",
    contactPerson: "Sophie Laurent",
    location: "Milan, Italy",
    status: "Active",
    orders: 0,
    totalValue: 0,
    lastOrder: "9/7/2025",
  },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(suppliersData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuppliers(suppliersData);
      toast({
        title: "Suppliers loaded successfully",
        description: `Loaded ${suppliersData.length} suppliers`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error loading suppliers",
        description: "Failed to load suppliers data",
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

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleAddSupplier = () => {
    toast({
      title: "Add Supplier",
      description: "Add supplier functionality coming soon",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditSupplier = (supplier: any) => {
    toast({
      title: "Edit Supplier",
      description: `Edit ${supplier.name} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteSupplier = (supplier: any) => {
    toast({
      title: "Delete Supplier",
      description: `Delete ${supplier.name} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || supplier.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      supplier.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    { key: "name", label: "NAME" },
    { key: "category", label: "CATEGORY" },
    { key: "contactPerson", label: "CONTACT PERSON" },
    { key: "location", label: "LOCATION" },
    {
      key: "status",
      label: "STATUS",
      render: (value: string) => (
        <Badge
          colorScheme={value === "Active" ? "success" : "error"}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
        >
          {value}
        </Badge>
      ),
    },
    { key: "orders", label: "ORDERS" },
    { key: "totalValue", label: "TOTAL VALUE" },
    { key: "lastOrder", label: "LAST ORDER" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Supplier">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditSupplier(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Supplier">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeleteSupplier(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor relationships, performance metrics, and contact information"
        actions={
          <Button
            leftIcon={<Icon as={FiPlus} />}
            onClick={handleAddSupplier}
            bg="brand.500"
            color="white"
            _hover={{
              bg: "brand.600",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
            }}
          >
            Add Supplier
          </Button>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Suppliers"
          value="6"
          change={12.5}
          changeType="increase"
          icon={FiUsers}
          iconColor="brand"
          description="Active vendors"
          status="success"
        />
        <StatCard
          title="Active Suppliers"
          value="5"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Currently working"
          status="success"
        />
        <StatCard
          title="Total Orders"
          value="0"
          change={0}
          changeType="increase"
          icon={FiShoppingCart}
          iconColor="brand"
          description="All time"
          status="info"
        />
        <StatCard
          title="Total Value"
          value="$0.0k"
          change={0}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="success"
          description="This year"
          status="success"
        />
      </SimpleGrid>

      {/* Suppliers Table */}
      <SectionCard
        title="Vendor Directory"
        subtitle="Complete list of suppliers and their information"
        icon={FiUsers}
      >
        <DataTable
          columns={columns}
          data={filteredSuppliers}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search by name, contact person, city..."
          onSearch={handleSearch}
          filters={[
            {
              key: "category",
              label: "Filter by category",
              options: [
                { value: "all", label: "All Categories" },
                { value: "Premium Apparel", label: "Premium Apparel" },
                { value: "Designer Wear", label: "Designer Wear" },
                { value: "Casual Wear", label: "Casual Wear" },
                { value: "Accessories", label: "Accessories" },
              ],
              onFilter: handleCategoryFilter,
            },
            {
              key: "status",
              label: "Filter by status",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Suspended", label: "Suspended" },
              ],
              onFilter: handleStatusFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No suppliers found"
        />
      </SectionCard>
    </VStack>
  );
}
