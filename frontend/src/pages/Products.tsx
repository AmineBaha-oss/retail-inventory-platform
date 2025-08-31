import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import FiltersBar from "../components/ui/FiltersBar";
import DataTable from "../components/ui/DataTable";

type Product = {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

// Demo data
const initialProducts: Product[] = [
  {
    sku: "TEE-Black-S",
    name: "Black T-Shirt (Small)",
    category: "Apparel",
    price: 29.99,
    stock: 45,
    status: "In Stock",
  },
  {
    sku: "JKT-Navy-M",
    name: "Navy Jacket (Medium)",
    category: "Apparel",
    price: 89.99,
    stock: 12,
    status: "Low Stock",
  },
  {
    sku: "SHO-Brown-42",
    name: "Brown Shoes (42)",
    category: "Footwear",
    price: 129.99,
    stock: 0,
    status: "Out of Stock",
  },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.status === "In Stock").length;
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = products.filter(
    (p) => p.status === "Out of Stock"
  ).length;

  const handleAddProduct = () => {
    if (!newProduct.sku || !newProduct.name || !newProduct.category) return;

    const created: Product = {
      sku: newProduct.sku || "",
      name: newProduct.name || "",
      category: newProduct.category || "",
      price: newProduct.price || 0,
      stock: newProduct.stock || 0,
      status:
        (newProduct.stock || 0) > 10
          ? "In Stock"
          : (newProduct.stock || 0) > 0
          ? "Low Stock"
          : "Out of Stock",
    };

    setProducts((prev) => [created, ...prev]);
    setNewProduct({});
    setIsModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, inventory levels, and pricing across all stores."
        actions={
          <Button colorScheme="brand" onClick={() => setIsModalOpen(true)}>
            Add Product
          </Button>
        }
      />

      {/* Summary KPIs */}
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
                Total Products
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {totalProducts}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" /> Active catalog
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
                In Stock
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {inStockCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                Available for sale
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
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {lowStockCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="orange.300">
                Reorder needed
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
                Out of Stock
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {outOfStockCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="red.300">
                Immediate action
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Products Table */}
      <SectionCard title="Product Catalog">
        <FiltersBar>
          <InputGroup maxW={{ base: "100%", md: "360px" }}>
            <Input
              placeholder="Search by SKU, name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            maxW={{ base: "100%", md: "220px" }}
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="Apparel">Apparel</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </Select>
          <Button variant="outline">Export</Button>
        </FiltersBar>

        <DataTable
          head={
            <Tr>
              <Th>SKU</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th isNumeric>Price</Th>
              <Th isNumeric>Stock</Th>
              <Th>Status</Th>
            </Tr>
          }
        >
          {filteredProducts.map((p) => (
            <Tr key={p.sku} _odd={{ bg: "gray.850" }}>
              <Td fontWeight="medium">{p.sku}</Td>
              <Td>{p.name}</Td>
              <Td>{p.category}</Td>
              <Td isNumeric fontWeight="semibold">
                ${p.price}
              </Td>
              <Td isNumeric fontWeight="semibold">
                {p.stock}
              </Td>
              <Td>
                <Badge
                  colorScheme={
                    p.status === "In Stock"
                      ? "success"
                      : p.status === "Low Stock"
                      ? "warning"
                      : "error"
                  }
                  variant="solid"
                >
                  {p.status}
                </Badge>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </SectionCard>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader borderBottom="1px" borderColor="border" pb={4}>
            Add New Product
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">SKU</FormLabel>
                  <Input
                    value={newProduct.sku || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    placeholder="Enter SKU"
                    size="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Category</FormLabel>
                  <Select
                    value={newProduct.category || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    size="md"
                  >
                    <option value="">Select category</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">Product Name</FormLabel>
                <Input
                  value={newProduct.name || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  size="md"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Price ($)</FormLabel>
                  <Input
                    type="number"
                    value={newProduct.price || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    size="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Initial Stock</FormLabel>
                  <Input
                    type="number"
                    value={newProduct.stock || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    size="md"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor="border" pt={4}>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleAddProduct}>
              Add Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
