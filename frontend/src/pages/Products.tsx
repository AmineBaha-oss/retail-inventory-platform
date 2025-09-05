import React, { useState, useEffect, useRef } from "react";
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>(emptyNewProduct);
  const [editingProduct, setEditingProduct] = useState<UIProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<UIProduct | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelRef = useRef(null);
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

  const handleEditProduct = (product: UIProduct) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      const updateRequest = {
        sku: editingProduct.sku,
        name: editingProduct.name,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory,
        brand: editingProduct.brand,
        description: editingProduct.description,
        unitCost: editingProduct.unitCost,
        unitPrice: editingProduct.unitPrice,
        casePackSize: editingProduct.casePackSize,
        supplierId: editingProduct.supplierId,
        status: editingProduct.status,
      };

      const response = await productAPI.update(
        editingProduct.id,
        updateRequest
      );
      const updated: UIProduct = formatProductForUI(response.data);

      setProducts((prev: UIProduct[]) =>
        prev.map((product) => (product.id === updated.id ? updated : product))
      );
      setEditingProduct(null);
      setIsEditModalOpen(false);

      toast({
        title: "Product updated successfully",
        description: `${updated.name} has been updated`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product";
      toast({
        title: "Error updating product",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product: UIProduct) => {
    setDeletingProduct(product);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      setIsSubmitting(true);
      await productAPI.delete(deletingProduct.id);

      setProducts((prev: UIProduct[]) =>
        prev.filter((product) => product.id !== deletingProduct.id)
      );
      setDeletingProduct(null);
      setIsDeleteAlertOpen(false);

      toast({
        title: "Product deleted successfully",
        description: `${deletingProduct.name} has been deleted`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete product";
      toast({
        title: "Error deleting product",
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
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          Delete
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

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingProduct && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>SKU</FormLabel>
                    <Input
                      value={editingProduct.sku}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          sku: e.target.value,
                        })
                      }
                      placeholder="PROD-001"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Product Name</FormLabel>
                    <Input
                      value={editingProduct.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Product name"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Input
                      value={editingProduct.category}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                      placeholder="Category"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Subcategory</FormLabel>
                    <Input
                      value={editingProduct.subcategory || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          subcategory: e.target.value,
                        })
                      }
                      placeholder="Subcategory"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Brand</FormLabel>
                    <Input
                      value={editingProduct.brand || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          brand: e.target.value,
                        })
                      }
                      placeholder="Brand"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      value={editingProduct.supplierId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          supplierId: e.target.value,
                        })
                      }
                      placeholder="Select supplier"
                    >
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input
                    value={editingProduct.description || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Product description"
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Unit Cost ($)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.unitCost}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          unitCost: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Unit Price ($)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.unitPrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Case Pack Size</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={editingProduct.casePackSize}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingProduct({
                          ...editingProduct,
                          casePackSize: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={editingProduct.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setEditingProduct({
                        ...editingProduct,
                        status: e.target.value as "ACTIVE" | "INACTIVE",
                      })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateProduct}
              isLoading={isSubmitting}
              loadingText="Updating..."
              disabled={
                !editingProduct?.sku ||
                !editingProduct?.name ||
                !editingProduct?.supplierId
              }
            >
              Update Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Product Alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Product
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{deletingProduct?.name}"? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteProduct}
                ml={3}
                isLoading={isSubmitting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Products;
