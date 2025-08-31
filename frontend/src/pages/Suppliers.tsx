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
import DataTable from "../components/ui/DataTable";

type Supplier = {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  status: "Active" | "Inactive" | "Pending";
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
};

// Demo data
const initialSuppliers: Supplier[] = [
  {
    id: "supplier_001",
    name: "TechCorp",
    category: "Electronics",
    contactPerson: "John Smith",
    email: "john@techcorp.com",
    phone: "+1 (514) 555-1000",
    country: "Canada",
    city: "Montreal",
    status: "Active",
    totalOrders: 45,
    totalValue: 125000,
    lastOrder: "2024-01-15",
  },
  {
    id: "supplier_002",
    name: "SupplyCo",
    category: "Apparel",
    contactPerson: "Sarah Johnson",
    email: "sarah@supplyco.com",
    phone: "+1 (514) 555-2000",
    country: "Canada",
    city: "Toronto",
    status: "Active",
    totalOrders: 32,
    totalValue: 89000,
    lastOrder: "2024-01-20",
  },
  {
    id: "supplier_003",
    name: "FashionHub",
    category: "Fashion",
    contactPerson: "Mike Chen",
    email: "mike@fashionhub.com",
    phone: "+1 (514) 555-3000",
    country: "Canada",
    city: "Vancouver",
    status: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "—",
  },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        supplier.city.toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === "" || supplier.category === categoryFilter) &&
      (statusFilter === "" || supplier.status === statusFilter)
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length;
  const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0);
  const totalValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0);

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.category) return;

    const created: Supplier = {
      id: `supplier_${Date.now()}`,
      name: newSupplier.name || "",
      category: newSupplier.category || "",
      contactPerson: newSupplier.contactPerson || "",
      email: newSupplier.email || "",
      phone: newSupplier.phone || "",
      country: newSupplier.country || "Canada",
      city: newSupplier.city || "",
      status: "Pending",
      totalOrders: 0,
      totalValue: 0,
      lastOrder: "—",
    };

    setSuppliers((prev) => [created, ...prev]);
    setNewSupplier({});
    setIsModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor relationships, performance metrics, and contact information."
        actions={
          <Button colorScheme="brand" onClick={() => setIsModalOpen(true)}>
            Add Supplier
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
                Total Suppliers
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {totalSuppliers}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" /> Active vendors
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
                Active Suppliers
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {activeSuppliers}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                Currently working
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
                Total Orders
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {totalOrders}
              </StatNumber>
              <StatHelpText fontSize="xs" color="blue.300">
                All time
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
                Total Value
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                ${(totalValue / 1000).toFixed(1)}k
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" /> This year
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Suppliers Table */}
      <SectionCard title="Vendor Directory">
        <HStack
          spacing={4}
          align={{ base: "stretch", md: "center" }}
          flexWrap="wrap"
          mb={4}
        >
          <InputGroup maxW={{ base: "100%", md: "360px" }}>
            <Input
              placeholder="Search by name, contact person, city..."
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
            maxW={{ base: "100%", md: "180px" }}
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Fashion">Fashion</option>
            <option value="Footwear">Footwear</option>
          </Select>

          <Select
            maxW={{ base: "100%", md: "180px" }}
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </Select>
        </HStack>

        <DataTable
          head={
            <Tr>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Contact Person</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th isNumeric>Orders</Th>
              <Th isNumeric>Total Value</Th>
              <Th>Last Order</Th>
            </Tr>
          }
        >
          {filteredSuppliers.map((supplier) => (
            <Tr key={supplier.id} _odd={{ bg: "gray.850" }}>
              <Td fontWeight="medium">{supplier.name}</Td>
              <Td>{supplier.category}</Td>
              <Td>{supplier.contactPerson}</Td>
              <Td>
                {supplier.city}, {supplier.country}
              </Td>
              <Td>
                <Badge
                  colorScheme={
                    supplier.status === "Active"
                      ? "success"
                      : supplier.status === "Pending"
                      ? "warning"
                      : "gray"
                  }
                  variant="solid"
                >
                  {supplier.status}
                </Badge>
              </Td>
              <Td isNumeric fontWeight="semibold">
                {supplier.totalOrders}
              </Td>
              <Td isNumeric fontWeight="semibold">
                ${supplier.totalValue.toLocaleString()}
              </Td>
              <Td>{supplier.lastOrder}</Td>
            </Tr>
          ))}
        </DataTable>
      </SectionCard>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader borderBottom="1px" borderColor="border" pb={4}>
            Add New Supplier
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Supplier Name</FormLabel>
                  <Input
                    value={newSupplier.name || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                    placeholder="Enter supplier name"
                    size="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Category</FormLabel>
                  <Select
                    value={newSupplier.category || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        category: e.target.value,
                      })
                    }
                    size="md"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="medium">Contact Person</FormLabel>
                <Input
                  value={newSupplier.contactPerson || ""}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      contactPerson: e.target.value,
                    })
                  }
                  placeholder="Enter contact person name"
                  size="md"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontWeight="medium">Email</FormLabel>
                  <Input
                    type="email"
                    value={newSupplier.email || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, email: e.target.value })
                    }
                    placeholder="contact@supplier.com"
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Phone</FormLabel>
                  <Input
                    value={newSupplier.phone || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, phone: e.target.value })
                    }
                    placeholder="+1 (555) 555-5555"
                    size="md"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontWeight="medium">City</FormLabel>
                  <Input
                    value={newSupplier.city || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, city: e.target.value })
                    }
                    placeholder="City"
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Country</FormLabel>
                  <Select
                    value={newSupplier.country || "Canada"}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        country: e.target.value,
                      })
                    }
                    size="md"
                  >
                    <option value="Canada">Canada</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                  </Select>
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
            <Button colorScheme="brand" onClick={handleAddSupplier}>
              Add Supplier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
