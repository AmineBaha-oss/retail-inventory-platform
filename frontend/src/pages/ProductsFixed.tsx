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
import { productAPI, supplierAPI } from "../services/api";
import {
  Product as APIProduct,
  ProductCreateRequest,
  Supplier,
} from "../types/api";

type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

// UI Product type extends API Product with computed fields
type UIProduct = APIProduct & {
  stock: number;
  stockStatus: ProductStatus;
};

type NewProduct = ProductCreateRequest;

// Convert API Product to UI Product format
const formatProductForUI = (apiProduct: APIProduct): UIProduct => {
  // TODO: Get stock from inventory API
  const stock = Math.floor(Math.random() * 100); // Mock stock for now
  let stockStatus: ProductStatus = "Out of Stock";

  if (stock > 50) stockStatus = "In Stock";
  else if (stock > 0) stockStatus = "Low Stock";

  return {
    ...apiProduct,
    stock,
    stockStatus,
  };
};

const emptyNewProduct: NewProduct = {
  sku: "",
  name: "",
  category: "",
  subcategory: "",
  brand: "",
  description: "",
  unitCost: 0,
  unitPrice: 0,
  casePackSize: 1,
  supplierId: "",
  status: "ACTIVE",
};

// Demo data fallback
const initialProducts: UIProduct[] = [
  {
    id: "demo-1",
    sku: "TEE-Black-S",
    name: "Black T-Shirt (Small)",
    category: "Apparel",
    unitCost: 15.99,
    unitPrice: 29.99,
    casePackSize: 1,
    supplierId: "supplier-1",
    supplierName: "Fashion Corp",
    status: "ACTIVE",
    stock: 45,
    stockStatus: "In Stock",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-15T00:00:00",
  },
];

const Products: React.FC = () => {
  // State
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>(emptyNewProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Load products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getAll();

      // Handle both paginated and non-paginated responses
      let productsData: APIProduct[];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && "content" in response.data) {
        productsData = (response.data as any).content;
      } else {
        productsData = [response.data];
      }

      const formattedProducts = productsData.map(formatProductForUI);
      setProducts(formattedProducts);

      toast({
        title: "Products loaded successfully",
        description: `Loaded ${formattedProducts.length} products`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch products";
      setError(errorMessage);
      setProducts(initialProducts); // Fallback to demo data
      toast({
        title: "Error loading products",
        description: errorMessage + ". Showing demo data.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers for dropdown
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
      // Continue without suppliers - user can enter supplier ID manually
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  // Computed values
  const totalProducts = products.length;
  const inStockCount = products.filter(
    (p: UIProduct) => p.stockStatus === "In Stock"
  ).length;
  const lowStockCount = products.filter(
    (p: UIProduct) => p.stockStatus === "Low Stock"
  ).length;
  const outOfStockCount = products.filter(
    (p: UIProduct) => p.stockStatus === "Out of Stock"
  ).length;

  // Filtering
  const filteredProducts = products.filter((product: UIProduct) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (product.category?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCategory =
      categoryFilter === "" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Event handlers
  const handleInputChange = (
    field: keyof NewProduct,
    value: string | number
  ) => {
    setNewProduct((prev: NewProduct) => ({
      ...prev,
      [field]:
        typeof value === "string" &&
        (field === "unitCost" ||
          field === "unitPrice" ||
          field === "casePackSize")
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleCreateProduct = async () => {
    try {
      setIsSubmitting(true);
      const response = await productAPI.create(newProduct);
      const created: UIProduct = formatProductForUI(response.data);

      setProducts((prev: UIProduct[]) => [created, ...prev]);
      setNewProduct(emptyNewProduct);
      setIsModalOpen(false);

      toast({
        title: "Product created successfully",
        description: `${created.name} has been added`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create product";
      toast({
        title: "Error creating product",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unique categories for filter
  const uniqueCategories = [
    ...new Set(products.map((p: UIProduct) => p.category).filter(Boolean)),
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
          <Text>Loading products...</Text>
        </VStack>
      </Box>
    );
  }

  if (error && products.length === 0) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Failed to load products</Text>
            <Text fontSize="sm">{error}</Text>
            <Button size="sm" onClick={fetchProducts}>
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
        title="Product Management"
        actions={
          <Button
            leftIcon={<FiPackage />}
            colorScheme="blue"
            onClick={() => setIsModalOpen(true)}
          >
            Add Product
          </Button>
        }
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Products</StatLabel>
              <StatNumber>{totalProducts}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Product catalog
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>In Stock</StatLabel>
              <StatNumber>{inStockCount}</StatNumber>
              <StatHelpText color="green.500">Available items</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Low Stock</StatLabel>
              <StatNumber>{lowStockCount}</StatNumber>
              <StatHelpText color="orange.500">Need restocking</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Out of Stock</StatLabel>
              <StatNumber>{outOfStockCount}</StatNumber>
              <StatHelpText color="red.500">Unavailable items</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Products Table */}
      <SectionCard title="Product Catalog">
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <Input
                placeholder="Search products..."
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
              placeholder="All Categories"
              maxW="150px"
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCategoryFilter(e.target.value)
              }
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <Select
              placeholder="All Status"
              maxW="150px"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONTINUED">Discontinued</option>
            </Select>

            <Button size="sm" onClick={fetchProducts}>
              Refresh
            </Button>
          </HStack>

          {/* Products Table */}
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Product Details</Th>
                <Th>Category</Th>
                <Th>Pricing</Th>
                <Th>Supplier</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    {products.length === 0
                      ? "No products found. Add your first product!"
                      : "No products match your filters."}
                  </Td>
                </Tr>
              ) : (
                filteredProducts.map((product: UIProduct) => (
                  <Tr key={product.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{product.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          SKU: {product.sku}
                        </Text>
                        {product.brand && (
                          <Text fontSize="xs" color="gray.500">
                            Brand: {product.brand}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{product.category}</Text>
                        {product.subcategory && (
                          <Text fontSize="xs" color="gray.500">
                            {product.subcategory}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          Sale: ${product.unitPrice?.toFixed(2)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Cost: ${product.unitCost?.toFixed(2)}
                        </Text>
                        {product.casePackSize && product.casePackSize > 1 && (
                          <Text fontSize="xs" color="gray.500">
                            Pack: {product.casePackSize}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{product.supplierName || "—"}</Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{product.stock} units</Text>
                        <Badge
                          colorScheme={
                            product.stockStatus === "In Stock"
                              ? "green"
                              : product.stockStatus === "Low Stock"
                              ? "orange"
                              : "red"
                          }
                          size="sm"
                        >
                          {product.stockStatus}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          product.status === "ACTIVE" ? "green" : "red"
                        }
                        variant="subtle"
                      >
                        {product.status}
                      </Badge>
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

      {/* Create Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>SKU</FormLabel>
                  <Input
                    value={newProduct.sku}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("sku", e.target.value)
                    }
                    placeholder="PROD-001"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    value={newProduct.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("name", e.target.value)
                    }
                    placeholder="Black T-Shirt"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Input
                    value={newProduct.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("category", e.target.value)
                    }
                    placeholder="Apparel"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Brand</FormLabel>
                  <Input
                    value={newProduct.brand}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("brand", e.target.value)
                    }
                    placeholder="Brand Name"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={newProduct.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Product description"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Unit Cost</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.unitCost}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("unitCost", e.target.value)
                    }
                    placeholder="25.50"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Unit Price</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.unitPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("unitPrice", e.target.value)
                    }
                    placeholder="39.99"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Supplier</FormLabel>
                  {suppliers.length > 0 ? (
                    <Select
                      value={newProduct.supplierId}
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
                      value={newProduct.supplierId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("supplierId", e.target.value)
                      }
                      placeholder="Supplier ID"
                    />
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Case Pack Size</FormLabel>
                  <Input
                    type="number"
                    value={newProduct.casePackSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("casePackSize", e.target.value)
                    }
                    placeholder="1"
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
              onClick={handleCreateProduct}
              isLoading={isSubmitting}
              loadingText="Creating..."
              disabled={
                !newProduct.sku || !newProduct.name || !newProduct.supplierId
              }
            >
              Create Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Products;
