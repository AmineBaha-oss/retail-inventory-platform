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
  FiHome,
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
const storesData = [
  {
    id: "1",
    name: "SoHo Flagship",
    code: "NYC001",
    manager: "Emma Rodriguez",
    location: "USA",
    address: "123 Spring St, New York, NY 10012",
    phone: "+1-212-555-0100",
    email: "soho@modernboutique.com",
    status: "Active",
    productCount: 5,
    totalValue: 0,
    lastSync: "2024-01-15 06:54:51",
  },
  {
    id: "2",
    name: "Beverly Hills Premium",
    code: "LA001",
    manager: "James Chen",
    location: "Beverly Hills, US",
    address: "456 Rodeo Dr, Beverly Hills, CA 90210",
    phone: "+1-310-555-0200",
    email: "beverlyhills@modernboutique.com",
    status: "Active",
    productCount: 3,
    totalValue: 0,
    lastSync: "2024-01-15 06:54:51",
  },
  {
    id: "3",
    name: "Magnificent Mile",
    code: "CHI001",
    manager: "Sarah Johnson",
    location: "663 N Michigan, US",
    address: "663 N Michigan Ave, Chicago, IL 60611",
    phone: "+1-312-555-0300",
    email: "chicago@modernboutique.com",
    status: "Active",
    productCount: 0,
    totalValue: 0,
    lastSync: "2024-01-15 06:54:51",
  },
];

export default function Stores() {
  const [stores, setStores] = useState(storesData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const toast = useToast();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStores(storesData);
      toast({
        title: "Stores loaded successfully",
        description: `Loaded ${storesData.length} stores`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error loading stores",
        description: "Failed to load stores data",
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

  const handleCountryFilter = (country: string) => {
    setCountryFilter(country);
  };

  const handleAddStore = () => {
    toast({
      title: "Add Store",
      description: "Add store functionality coming soon",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditStore = (store: any) => {
    toast({
      title: "Edit Store",
      description: `Edit ${store.name} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteStore = (store: any) => {
    toast({
      title: "Delete Store",
      description: `Delete ${store.name} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      store.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCountry =
      countryFilter === "all" || store.location.includes(countryFilter);

    return matchesSearch && matchesStatus && matchesCountry;
  });

  const columns = [
    { key: "name", label: "STORE DETAILS" },
    { key: "location", label: "LOCATION" },
    { key: "phone", label: "CONTACT" },
    { key: "status", label: "STATUS" },
    { key: "productCount", label: "STATS" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Store">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditStore(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Store">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeleteStore(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Stores"
        subtitle="Manage store locations, contact information, and performance metrics"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={loadStores}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleAddStore}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Add Store
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Stores"
          value="7"
          change={0}
          changeType="increase"
          icon={FiHome}
          iconColor="brand"
          description="Real-time data"
          status="info"
        />
        <StatCard
          title="Active Stores"
          value="6"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Currently operational"
          status="success"
        />
        <StatCard
          title="Avg Products"
          value="1"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Per store"
          status="warning"
        />
        <StatCard
          title="Avg Store Value"
          value="$0"
          change={0}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="brand"
          description="Inventory value"
          status="info"
        />
      </SimpleGrid>

      {/* Stores Table */}
      <SectionCard
        title="Store Directory"
        subtitle="Complete store information with contact details and performance"
        icon={FiHome}
      >
        <DataTable
          columns={columns}
          data={filteredStores}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search stores..."
          onSearch={handleSearch}
          filters={[
            {
              key: "status",
              label: "All Statuses",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Maintenance", label: "Maintenance" },
              ],
              onFilter: handleStatusFilter,
            },
            {
              key: "country",
              label: "All Countries",
              options: [
                { value: "all", label: "All Countries" },
                { value: "USA", label: "USA" },
                { value: "US", label: "US" },
                { value: "Canada", label: "Canada" },
              ],
              onFilter: handleCountryFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No stores found"
        />
      </SectionCard>
    </VStack>
  );
}
