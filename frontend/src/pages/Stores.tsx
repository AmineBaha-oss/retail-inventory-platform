import React, { useMemo, useState } from "react";
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

type StoreStatus = "Active" | "Inactive";

type Store = {
  id: string;
  name: string;
  code: string;
  manager: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  timezone: string;
  totalProducts: number;
  totalValue: number;
  lastSync: string; // ISO or formatted string
  status: StoreStatus;
};

type NewStore = {
  name: string;
  code: string;
  manager: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  timezone: string;
};

// --- Demo data (replace with API later) ---
const initialStores: Store[] = [
  {
    id: `store_${Date.now() - 100000}`,
    name: "Downtown Boutique",
    code: "DT-001",
    manager: "Alice Martin",
    email: "alice@downtown.example",
    phone: "+1 (514) 555-1000",
    country: "Canada",
    city: "Montreal",
    address: "123 Sainte-Catherine St W, Montreal, QC",
    timezone: "America/Toronto",
    totalProducts: 1240,
    totalValue: 92500,
    lastSync: "2025-08-29 10:15",
    status: "Active",
  },
  {
    id: `store_${Date.now() - 50000}`,
    name: "Plateau Outlet",
    code: "PL-002",
    manager: "Benoit Chartrand",
    email: "benoit@plateau.example",
    phone: "+1 (514) 555-2000",
    country: "Canada",
    city: "Montreal",
    address: "456 Mont-Royal Ave E, Montreal, QC",
    timezone: "America/Toronto",
    totalProducts: 980,
    totalValue: 71200,
    lastSync: "2025-08-28 16:42",
    status: "Inactive",
  },
  {
    id: `store_${Date.now() - 25000}`,
    name: "Longueuil Showroom",
    code: "LG-003",
    manager: "Camille Roy",
    email: "camille@longueuil.example",
    phone: "+1 (450) 555-3000",
    country: "Canada",
    city: "Longueuil",
    address: "789 Rue Saint-Charles O, Longueuil, QC",
    timezone: "America/Toronto",
    totalProducts: 1520,
    totalValue: 110400,
    lastSync: "2025-08-29 09:05",
    status: "Active",
  },
];

const emptyNewStore: NewStore = {
  name: "",
  code: "",
  manager: "",
  email: "",
  phone: "",
  country: "Canada",
  city: "",
  address: "",
  timezone: "America/Toronto",
};

const Stores: React.FC = () => {
  // state
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StoreStatus>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState<NewStore>(emptyNewStore);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // derived metrics
  const avgProductsPerStore = useMemo(() => {
    if (!stores.length) return 0;
    return Math.round(
      stores.reduce((sum, s) => sum + s.totalProducts, 0) / stores.length
    );
  }, [stores]);

  const avgValuePerStore = useMemo(() => {
    if (!stores.length) return 0;
    return Math.round(
      stores.reduce((sum, s) => sum + s.totalValue, 0) / stores.length
    );
  }, [stores]);

  const outOfSyncCount = useMemo(
    () => stores.filter((s) => s.status === "Inactive").length,
    [stores]
  );

  // filtered list
  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stores.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.manager.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || s.status === statusFilter;
      const matchesCountry = !countryFilter || s.country === countryFilter;
      return matchesQuery && matchesStatus && matchesCountry;
    });
  }, [stores, search, statusFilter, countryFilter]);

  // handlers
  const handleInputChange = (field: keyof NewStore, value: string) => {
    setNewStore((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStore = () => {
    if (!newStore.name || !newStore.code) return;
    const created: Store = {
      id: `store_${Date.now()}`,
      name: newStore.name,
      code: newStore.code,
      manager: newStore.manager || "—",
      email: newStore.email || "—",
      phone: newStore.phone || "—",
      country: newStore.country || "Canada",
      city: newStore.city || "—",
      address: newStore.address || "—",
      timezone: newStore.timezone || "America/Toronto",
      totalProducts: 0,
      totalValue: 0,
      lastSync: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "Active",
    };
    setStores((prev) => [created, ...prev]);
    setNewStore(emptyNewStore);
    setIsModalOpen(false);
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    // You can implement a view modal here or navigate to a detailed view
    console.log("Viewing store:", store);
  };

  const handleSyncStore = async (store: Store) => {
    try {
      setIsLoading(true);
      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update last sync time
      setStores((prev) =>
        prev.map((s) =>
          s.id === store.id
            ? {
                ...s,
                lastSync: new Date()
                  .toISOString()
                  .slice(0, 16)
                  .replace("T", " "),
                status: "Active" as StoreStatus,
              }
            : s
        )
      );

      // Show success message
      alert(`Store ${store.name} synchronized successfully!`);
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Sync failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Stores"
        subtitle="Manage locations, sync status, and settings."
        actions={
          <Button colorScheme="brand" onClick={() => setIsModalOpen(true)}>
            Add Store
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
                Total Stores
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {stores.length}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" />1 new this year
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
                Avg Products / Store
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {avgProductsPerStore}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                Products per location
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
                Avg Inventory Value
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                ${avgValuePerStore.toLocaleString()}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                CAD per store
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
                Stores Out of Sync
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {outOfSyncCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                Last 24 hours
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters + Table */}
      <SectionCard title="Locations">
        <HStack
          spacing={4}
          align={{ base: "stretch", md: "center" }}
          flexWrap="wrap"
          mb={4}
        >
          <InputGroup maxW={{ base: "100%", md: "360px" }}>
            <Input
              placeholder="Search by name, code, city, manager..."
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
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | StoreStatus)
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <Select
            maxW={{ base: "100%", md: "220px" }}
            placeholder="Filter by country"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <option value="Canada">Canada</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Germany">Germany</option>
          </Select>

          <Box flex="1" />

          <Button colorScheme="brand" onClick={() => setIsModalOpen(true)}>
            Add Store
          </Button>
        </HStack>

        <Box
          overflowX="auto"
          border="1px solid"
          borderColor="border"
          borderRadius="lg"
        >
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} zIndex={1} bg="gray.700">
              <Tr>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Store
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Code
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Manager
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Email
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Phone
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Country
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  City
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Timezone
                </Th>
                <Th px={4} py={3} isNumeric color="white" fontWeight="600">
                  Total Products
                </Th>
                <Th px={4} py={3} isNumeric color="white" fontWeight="600">
                  Total Value
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Last Sync
                </Th>
                <Th px={4} py={3} color="white" fontWeight="600">
                  Status
                </Th>
                <Th
                  px={4}
                  py={3}
                  textAlign="right"
                  color="white"
                  fontWeight="600"
                >
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStores.map((store, idx) => (
                <Tr
                  key={store.id}
                  _odd={{ bg: "gray.800" }}
                  _hover={{ bg: "gray.700" }}
                >
                  <Td px={4} py={3}>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" color="white">
                        {store.name}
                      </Text>
                      <Text fontSize="sm" color="gray.200" noOfLines={1}>
                        {store.address}
                      </Text>
                    </VStack>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="sm" color="gray.100">
                      {store.code}
                    </Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="sm" color="gray.100">
                      {store.manager}
                    </Text>
                  </Td>
                  <Td px={4} py={3} maxW="220px">
                    <Text fontSize="sm" noOfLines={1} color="gray.100">
                      {store.email}
                    </Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="sm" color="gray.100">
                      {store.phone}
                    </Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="sm" color="gray.100">
                      {store.country}
                    </Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Text fontSize="sm" color="gray.100">
                      {store.city}
                    </Text>
                  </Td>
                  <Td px={4} py={3} maxW="140px">
                    <Text fontSize="sm" noOfLines={1} color="gray.100">
                      {store.timezone}
                    </Text>
                  </Td>
                  <Td px={4} py={3} isNumeric>
                    <Text color="gray.100">
                      {store.totalProducts.toLocaleString()}
                    </Text>
                  </Td>
                  <Td px={4} py={3} isNumeric>
                    <Text color="gray.100">
                      ${store.totalValue.toLocaleString()}
                    </Text>
                  </Td>
                  <Td px={4} py={3} maxW="140px">
                    <Text fontSize="sm" noOfLines={1} color="gray.100">
                      {store.lastSync}
                    </Text>
                  </Td>
                  <Td px={4} py={3}>
                    <Badge
                      colorScheme={store.status === "Active" ? "green" : "red"}
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {store.status}
                    </Badge>
                  </Td>
                  <Td px={4} py={3} textAlign="right">
                    <HStack justify="flex-end" spacing={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        minW="60px"
                        onClick={() => handleViewStore(store)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        minW="60px"
                        onClick={() => handleSyncStore(store)}
                        isLoading={isLoading}
                      >
                        Sync
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>

      {/* Add Store Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader borderBottom="1px" borderColor="border" pb={4}>
            Add New Store
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Store Name</FormLabel>
                  <Input
                    value={newStore.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter store name"
                    size="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Store Code</FormLabel>
                  <Input
                    value={newStore.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="Enter unique code"
                    size="md"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="medium">Manager</FormLabel>
                <Input
                  value={newStore.manager}
                  onChange={(e) => handleInputChange("manager", e.target.value)}
                  placeholder="Enter manager name"
                  size="md"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontWeight="medium">Email</FormLabel>
                  <Input
                    type="email"
                    value={newStore.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="name@company.com"
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Phone</FormLabel>
                  <Input
                    value={newStore.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 555-5555"
                    size="md"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="medium">Address</FormLabel>
                <Input
                  value={newStore.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  size="md"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">City</FormLabel>
                  <Input
                    value={newStore.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Country</FormLabel>
                  <Select
                    value={newStore.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
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

              <FormControl>
                <FormLabel fontWeight="medium">Timezone</FormLabel>
                <Select
                  value={newStore.timezone}
                  onChange={(e) =>
                    handleInputChange("timezone", e.target.value)
                  }
                  size="md"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Toronto">America/Toronto</option>
                  <option value="UTC">UTC</option>
                </Select>
              </FormControl>
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
            <Button colorScheme="brand" onClick={handleAddStore}>
              Add Store
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Stores;
