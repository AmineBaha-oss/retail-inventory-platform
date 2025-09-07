import React, { useState, useEffect, useMemo } from "react";
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
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { FiMapPin } from "react-icons/fi";
import SectionCard from "../components/ui/SectionCard";
import { storeAPI } from "../services/api";
import { Store, StoreCreateRequest } from "../types/api";

type StoreStatus = "Active" | "Inactive";

// Convert backend Store to frontend format
const formatStoreForUI = (store: Store) => ({
  ...store,
  manager: store.manager || "—",
  totalProducts: 0, // We'll calculate this later or get from another endpoint
  totalValue: 0, // We'll calculate this later or get from another endpoint
  lastSync: store.updatedAt ? new Date(store.updatedAt).toLocaleString() : "—",
  status: store.isActive
    ? ("Active" as StoreStatus)
    : ("Inactive" as StoreStatus),
  timezone: "America/Toronto", // Default for now
});

const emptyNewStore: StoreCreateRequest = {
  name: "",
  code: "",
  manager: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Canada",
  isActive: true,
};

const StoresNew: React.FC = () => {
  // State
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StoreStatus>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [newStore, setNewStore] = useState<StoreCreateRequest>(emptyNewStore);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch stores from API
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeAPI.getAll();

      // Handle both paginated and non-paginated responses
      let storesData: Store[];
      if (Array.isArray(response.data)) {
        storesData = response.data;
      } else if (response.data && "content" in response.data) {
        storesData = (response.data as any).content || [];
      } else {
        storesData = [];
      }

      const formattedStores = storesData.map(formatStoreForUI);
      setStores(formattedStores);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch stores";
      setError(errorMessage);
      toast({
        title: "Error loading stores",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Create store
  const handleCreateStore = async () => {
    if (!newStore.name || !newStore.code) {
      toast({
        title: "Validation Error",
        description: "Name and code are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await storeAPI.create(newStore);
      const createdStore = formatStoreForUI(response.data);
      setStores((prev) => [...prev, createdStore]);

      toast({
        title: "Store created",
        description: `${newStore.name} has been created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setNewStore(emptyNewStore);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create store";
      toast({
        title: "Error creating store",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Filtered stores
  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stores.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.manager && s.manager.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || s.status === statusFilter;
      const matchesCountry = !countryFilter || s.country === countryFilter;
      return matchesQuery && matchesStatus && matchesCountry;
    });
  }, [stores, search, statusFilter, countryFilter]);

  // Metrics
  const activeStores = stores.filter((s) => s.status === "Active").length;
  const totalStores = stores.length;

  return (
    <Box>
      <PageHeader
        title="Store Management"
        subtitle="Manage your retail locations and monitor store performance across your network"
        actions={
          <Button colorScheme="blue" onClick={onOpen}>
            Add Store
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
          <Button ml={4} size="sm" onClick={fetchStores}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Stores</StatLabel>
              <StatNumber>{totalStores}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Active locations
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Stores</StatLabel>
              <StatNumber>{activeStores}</StatNumber>
              <StatHelpText>Currently operational</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Status</StatLabel>
              <StatNumber>
                {loading ? <Spinner size="sm" /> : "Online"}
              </StatNumber>
              <StatHelpText>System status</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Data Source</StatLabel>
              <StatNumber>API</StatNumber>
              <StatHelpText>Live data from backend</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Box mb={6}>
        <SectionCard title="Store Directory">
          <HStack spacing={4} mb={6}>
            <InputGroup maxW="300px">
              <Input
                placeholder="Search stores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputRightElement>
                <SearchIcon color="gray.400" />
              </InputRightElement>
            </InputGroup>

            <Select
              placeholder="All statuses"
              maxW="150px"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | StoreStatus)
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <Select
              placeholder="All countries"
              maxW="150px"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="Canada">Canada</option>
              <option value="USA">USA</option>
            </Select>
          </HStack>

          {loading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" />
              <Text mt={2}>Loading stores...</Text>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Store</Th>
                  <Th>Location</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th>Updated</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredStores.map((store) => (
                  <Tr key={store.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{store.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {store.code}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text>
                          {store.city}, {store.state}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {store.country}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{store.email}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {store.phone}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          store.status === "Active" ? "green" : "red"
                        }
                      >
                        {store.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{store.lastSync}</Text>
                    </Td>
                  </Tr>
                ))}
                {filteredStores.length === 0 && !loading && (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <Text color="gray.500">
                        {stores.length === 0
                          ? "No stores found. Add your first store!"
                          : "No stores match your filters."}
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </SectionCard>
      </Box>

      {/* Add Store Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Store</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Store Name</FormLabel>
                <Input
                  value={newStore.name}
                  onChange={(e) =>
                    setNewStore((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter store name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Store Code</FormLabel>
                <Input
                  value={newStore.code}
                  onChange={(e) =>
                    setNewStore((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="Enter store code"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={newStore.email}
                  onChange={(e) =>
                    setNewStore((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter email"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={newStore.phone}
                  onChange={(e) =>
                    setNewStore((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter phone"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  value={newStore.address}
                  onChange={(e) =>
                    setNewStore((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter address"
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={newStore.city}
                    onChange={(e) =>
                      setNewStore((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="City"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Input
                    value={newStore.state}
                    onChange={(e) =>
                      setNewStore((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder="State"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Zip Code</FormLabel>
                  <Input
                    value={newStore.zipCode}
                    onChange={(e) =>
                      setNewStore((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    placeholder="Zip code"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Select
                    value={newStore.country}
                    onChange={(e) =>
                      setNewStore((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                  >
                    <option value="Canada">Canada</option>
                    <option value="USA">USA</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateStore}
              isLoading={loading}
            >
              Create Store
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StoresNew;
