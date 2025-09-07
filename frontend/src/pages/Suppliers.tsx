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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { FiUsers } from "react-icons/fi";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { supplierAPI } from "../services/api";
import { Supplier as APISupplier, SupplierCreateRequest } from "../types/api";
import { showSuccess, showError } from "../utils/helpers";

type SupplierStatus = "Active" | "Inactive" | "Pending";

// UI Supplier type extends API Supplier with computed fields
type UISupplier = APISupplier & {
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
  status: SupplierStatus;
};

type NewSupplier = SupplierCreateRequest;

// Convert API Supplier to UI Supplier format
const formatSupplierForUI = (apiSupplier: APISupplier): UISupplier => ({
  ...apiSupplier,
  category: apiSupplier.category || "General",
  contactPerson: apiSupplier.contactPerson || "—",
  city: apiSupplier.city || "—",
  country: apiSupplier.country || "—",
  totalOrders: 0, // TODO: Get from purchase orders API
  totalValue: 0, // TODO: Get from purchase orders API
  lastOrder: apiSupplier.updatedAt
    ? new Date(apiSupplier.updatedAt).toLocaleDateString()
    : "—",
  status:
    apiSupplier.status === "ACTIVE"
      ? "Active"
      : apiSupplier.status === "SUSPENDED"
      ? "Inactive"
      : ("Inactive" as SupplierStatus),
  isActive: apiSupplier.status === "ACTIVE",
});

const emptyNewSupplier: NewSupplier = {
  code: "",
  name: "",
  category: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  isActive: true,
};

// Demo data for fallback
const initialSuppliers: UISupplier[] = [
  {
    id: "supplier_001",
    code: "DEMO001",
    name: "TechCorp",
    category: "Electronics",
    contactPerson: "John Smith",
    email: "john@techcorp.com",
    phone: "+1 (514) 555-1000",
    country: "Canada",
    city: "Montreal",
    address: "123 Tech St",
    isActive: true,
    status: "Active",
    totalOrders: 45,
    totalValue: 125000,
    lastOrder: "2024-01-15",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-15T00:00:00",
  },
  {
    id: "supplier_002",
    code: "DEMO002",
    name: "SupplyCo",
    category: "Apparel",
    contactPerson: "Sarah Johnson",
    email: "sarah@supplyco.com",
    phone: "+1 (514) 555-2000",
    country: "Canada",
    city: "Toronto",
    address: "456 Supply Ave",
    isActive: true,
    status: "Active",
    totalOrders: 32,
    totalValue: 89000,
    lastOrder: "2024-01-20",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-20T00:00:00",
  },
  {
    id: "supplier_003",
    code: "DEMO003",
    name: "FashionHub",
    category: "Fashion",
    contactPerson: "Mike Chen",
    email: "mike@fashionhub.com",
    phone: "+1 (514) 555-3000",
    country: "Canada",
    city: "Vancouver",
    address: "789 Fashion Blvd",
    isActive: false,
    status: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "—",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-08T00:00:00",
  },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<UISupplier[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<NewSupplier>>({});
  const [editingSupplier, setEditingSupplier] = useState<UISupplier | null>(
    null
  );
  const [deletingSupplier, setDeletingSupplier] = useState<UISupplier | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const cancelRef = useRef(null);
  const toast = useToast();

  // Load suppliers data from API
  useEffect(() => {
    loadSuppliersData();
  }, []);

  const loadSuppliersData = async () => {
    try {
      setIsLoading(true);
      const response = await supplierAPI.getAll();

      // Handle paginated response
      let suppliersData: APISupplier[];
      if ("content" in response.data) {
        // Paginated response
        suppliersData = response.data.content;
      } else {
        // Non-paginated response (fallback)
        suppliersData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }

      const transformedData = suppliersData.map(formatSupplierForUI);
      setSuppliers(transformedData);

      showSuccess(`Loaded ${transformedData.length} suppliers successfully`);
    } catch (error) {
      console.error("Failed to load suppliers data:", error);
      // Fallback to demo data if API fails
      setSuppliers(initialSuppliers);
      showError("Failed to load suppliers data. Showing demo data.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.code || !newSupplier.email) return;

    try {
      const createRequest: NewSupplier = {
        code: newSupplier.code || "",
        name: newSupplier.name || "",
        category: newSupplier.category,
        contactPerson: newSupplier.contactPerson,
        email: newSupplier.email || "",
        phone: newSupplier.phone || "",
        address: newSupplier.address,
        city: newSupplier.city,
        state: newSupplier.state,
        country: newSupplier.country || "Canada",
        isActive: newSupplier.isActive ?? true,
      };

      const response = await supplierAPI.create(createRequest);
      const created = formatSupplierForUI(response.data);

      setSuppliers((prev) => [created, ...prev]);
      setNewSupplier({});
      setIsModalOpen(false);

      showSuccess(`Supplier "${created.name}" created successfully`);
    } catch (error) {
      console.error("Failed to create supplier:", error);
      showError("Failed to create supplier. Please try again.");
    }
  };

  const handleEditSupplier = (supplier: UISupplier) => {
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleUpdateSupplier = async () => {
    if (!editingSupplier) return;

    try {
      setIsLoading(true);
      const updateRequest = {
        name: editingSupplier.name,
        category: editingSupplier.category,
        contactPerson: editingSupplier.contactPerson,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        address: editingSupplier.address,
        city: editingSupplier.city,
        state: editingSupplier.state,
        country: editingSupplier.country,
        isActive: editingSupplier.status === "Active",
      };

      const response = await supplierAPI.update(
        editingSupplier.id,
        updateRequest
      );
      const updated = formatSupplierForUI(response.data);

      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === updated.id ? updated : supplier
        )
      );
      setEditingSupplier(null);
      setIsEditModalOpen(false);

      toast({
        title: "Supplier updated successfully",
        description: `${updated.name} has been updated`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to update supplier:", error);
      toast({
        title: "Error updating supplier",
        description: "Failed to update supplier. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = (supplier: UISupplier) => {
    setDeletingSupplier(supplier);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    if (!deletingSupplier) return;

    try {
      setIsLoading(true);
      await supplierAPI.delete(deletingSupplier.id);

      setSuppliers((prev) =>
        prev.filter((supplier) => supplier.id !== deletingSupplier.id)
      );
      setDeletingSupplier(null);
      setIsDeleteAlertOpen(false);

      toast({
        title: "Supplier deleted successfully",
        description: `${deletingSupplier.name} has been removed`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      toast({
        title: "Error deleting supplier",
        description: "Failed to delete supplier. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor relationships, performance metrics, and contact information."
        icon={<FiUsers />}
        accentColor="var(--chakra-colors-purple-400)"
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
              <Th>Actions</Th>
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
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => handleEditSupplier(supplier)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleDeleteSupplier(supplier)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
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

      {/* Edit Supplier Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingSupplier && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Supplier Code</FormLabel>
                    <Input
                      value={editingSupplier.code}
                      isReadOnly
                      bg="gray.100"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Supplier Name</FormLabel>
                    <Input
                      value={editingSupplier.name}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          name: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={editingSupplier.category}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Category</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Sports & Recreation">
                        Sports & Recreation
                      </option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contact Person</FormLabel>
                    <Input
                      value={editingSupplier.contactPerson}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={editingSupplier.email}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          email: e.target.value,
                        })
                      }
                      type="email"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={editingSupplier.phone}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          phone: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={editingSupplier.address}
                    onChange={(e) =>
                      setEditingSupplier({
                        ...editingSupplier,
                        address: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <SimpleGrid columns={3} spacing={4}>
                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      value={editingSupplier.city}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          city: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={editingSupplier.state}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          state: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Country</FormLabel>
                    <Select
                      value={editingSupplier.country}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          country: e.target.value,
                        })
                      }
                    >
                      <option value="Canada">Canada</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Germany">Germany</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
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
              onClick={handleUpdateSupplier}
              isLoading={isLoading}
              loadingText="Updating..."
              disabled={!editingSupplier?.name || !editingSupplier?.email}
            >
              Update Supplier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Supplier
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deletingSupplier?.name}"? This
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
                onClick={confirmDeleteSupplier}
                isLoading={isLoading}
                loadingText="Deleting..."
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
