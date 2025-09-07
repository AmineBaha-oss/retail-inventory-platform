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
  FiGrid,
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
const productsData = [
  {
    id: "1",
    name: "Tailored Power Blazer",
    sku: "LOFT-BLZ-001",
    brand: "Loft",
    category: "OUTERWEAR",
    subcategory: "BLAZERS",
    salePrice: 295.0,
    costPrice: 85.0,
    packSize: 6,
    supplier: "Loft & Co",
    stock: 95,
    stockStatus: "In Stock",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Silk Wrap Blouse",
    sku: "LOFT-TOP-001",
    brand: "Loft",
    category: "TOPS",
    subcategory: "BLOUSES",
    salePrice: 165.0,
    costPrice: 45.0,
    packSize: 1,
    supplier: "Loft & Co",
    stock: 13,
    stockStatus: "Low Stock",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Wide Leg Trousers",
    sku: "LOFT-PNT-001",
    brand: "Loft",
    category: "BOTTOMS",
    subcategory: "PANTS",
    salePrice: 125.0,
    costPrice: 35.0,
    packSize: 1,
    supplier: "Loft & Co",
    stock: 49,
    stockStatus: "Low Stock",
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Midnight Gala Dress",
    sku: "VERA-DRS-001",
    brand: "Vera",
    category: "DRESSES",
    subcategory: "EVENING",
    salePrice: 450.0,
    costPrice: 120.0,
    packSize: 1,
    supplier: "Vera Couture",
    stock: 8,
    stockStatus: "Low Stock",
    status: "ACTIVE",
  },
];

export default function Products() {
  const [products, setProducts] = useState(productsData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProducts(productsData);
      toast({
        title: "Products loaded successfully",
        description: `Loaded ${productsData.length} products`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error loading products",
        description: "Failed to load products data",
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

  const handleAddProduct = () => {
    toast({
      title: "Add Product",
      description: "Add product functionality coming soon",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditProduct = (product: any) => {
    toast({
      title: "Edit Product",
      description: `Edit ${product.name} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteProduct = (product: any) => {
    toast({
      title: "Delete Product",
      description: `Delete ${product.name} functionality coming soon`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      product.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    { key: "name", label: "PRODUCT DETAILS" },
    { key: "category", label: "CATEGORY" },
    { key: "salePrice", label: "PRICING" },
    { key: "supplier", label: "SUPPLIER" },
    { key: "stock", label: "STOCK" },
    { key: "status", label: "STATUS" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Product">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditProduct(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Product">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeleteProduct(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, pricing, and inventory levels"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={loadProducts}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleAddProduct}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Add Product
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Products"
          value="13"
          change={12.5}
          changeType="increase"
          icon={FiGrid}
          iconColor="brand"
          description="Product catalog"
          status="success"
        />
        <StatCard
          title="In Stock"
          value="4"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Available items"
          status="success"
        />
        <StatCard
          title="Low Stock"
          value="9"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Need restocking"
          status="warning"
        />
        <StatCard
          title="Out of Stock"
          value="0"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="error"
          description="Unavailable items"
          status="error"
        />
      </SimpleGrid>

      {/* Products Table */}
      <SectionCard
        title="Product Catalog"
        subtitle="Complete product information with pricing and stock levels"
        icon={FiGrid}
      >
        <DataTable
          columns={columns}
          data={filteredProducts}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search products..."
          onSearch={handleSearch}
          filters={[
            {
              key: "category",
              label: "All Categories",
              options: [
                { value: "all", label: "All Categories" },
                { value: "OUTERWEAR", label: "Outerwear" },
                { value: "TOPS", label: "Tops" },
                { value: "BOTTOMS", label: "Bottoms" },
                { value: "DRESSES", label: "Dresses" },
              ],
              onFilter: handleCategoryFilter,
            },
            {
              key: "status",
              label: "All Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "DISCONTINUED", label: "Discontinued" },
              ],
              onFilter: handleStatusFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No products found"
        />
      </SectionCard>
    </VStack>
  );
}
