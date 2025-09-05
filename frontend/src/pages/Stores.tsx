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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { FiMapPin } from "react-icons/fi";
import SectionCard from "../components/ui/SectionCard";
import { storeAPI } from "../services/api";
import { Store as APIStore, StoreCreateRequest } from "../types/api";

type StoreStatus = "Active" | "Inactive";

// UI Store type extends API Store with computed fields
type UIStore = APIStore & {
  totalProducts: number;
  totalValue: number;
  lastSync: string;
  status: StoreStatus;
};

type NewStore = StoreCreateRequest;

// Convert API Store to UI Store format
const formatStoreForUI = (apiStore: APIStore): UIStore => ({
  ...apiStore,
  manager: apiStore.manager || "—",
  totalProducts: 0, // TODO: Get from inventory API
  totalValue: 0,    // TODO: Get from inventory API  
  lastSync: apiStore.updatedAt ? new Date(apiStore.updatedAt).toLocaleString() : "—",
  status: apiStore.isActive ? "Active" : "Inactive" as StoreStatus,
});

const emptyNewStore: NewStore = {
  code: "",
  name: "",
  manager: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  isActive: true,
};

const Stores: React.FC = () => {
  // State
  const [stores, setStores] = useState<UIStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StoreStatus>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [newStore, setNewStore] = useState<NewStore>(emptyNewStore);
  const [editingStore, setEditingStore] = useState<UIStore | null>(null);
  const [deletingStore, setDeletingStore] = useState<UIStore | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelRef = useRef(null);
  const toast = useToast();

  // Load stores from API
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeAPI.getAll();
      
      // The response is always paginated from Spring Boot
      let storesData: APIStore[];
      if ('content' in response.data) {
        // Paginated response
        storesData = response.data.content;
      } else {
        // Non-paginated response (fallback)
        storesData = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      const formattedStores = storesData.map(formatStoreForUI);
      setStores(formattedStores);
      
      toast({
        title: 'Stores loaded successfully',
        description: `Loaded ${formattedStores.length} stores`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch stores';
      setError(errorMessage);
      toast({
        title: 'Error loading stores',
        description: errorMessage,
        status: 'error',
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

  // Computed values
  const totalStores = stores.length;
  const activeStores = stores.filter((s: UIStore) => s.status === "Active").length;
  const avgProducts = stores.length > 0 
    ? Math.round(stores.reduce((sum: number, s: UIStore) => sum + s.totalProducts, 0) / stores.length)
    : 0;
  const avgValue = stores.length > 0
    ? stores.reduce((sum: number, s: UIStore) => sum + s.totalValue, 0) / stores.length
    : 0;

  // Filtering
  const filteredStores = stores.filter((s: UIStore) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                         s.code.toLowerCase().includes(search.toLowerCase()) ||
                         s.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || s.status === statusFilter;
    const matchesCountry = countryFilter === "" || s.country === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  // Event handlers
  const handleInputChange = (field: keyof NewStore, value: string | boolean) => {
    setNewStore((prev: NewStore) => ({ ...prev, [field]: value }));
  };

  const handleCreateStore = async () => {
    try {
      setIsSubmitting(true);
      const response = await storeAPI.create(newStore);
      const created: UIStore = formatStoreForUI(response.data);

      setStores((prev: UIStore[]) => [created, ...prev]);
      setNewStore(emptyNewStore);
      setIsModalOpen(false);
      
      toast({
        title: 'Store created successfully',
        description: `${created.name} has been added`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create store';
      toast({
        title: 'Error creating store',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStore = (store: UIStore) => {
    setEditingStore(store);
    setIsEditModalOpen(true);
  };

  const handleUpdateStore = async () => {
    if (!editingStore) return;

    try {
      setIsSubmitting(true);
      const updateRequest = {
        name: editingStore.name,
        manager: editingStore.manager,
        email: editingStore.email,
        phone: editingStore.phone,
        address: editingStore.address,
        city: editingStore.city,
        state: editingStore.state,
        zipCode: editingStore.zipCode,
        country: editingStore.country,
        isActive: editingStore.isActive,
      };

      const response = await storeAPI.update(editingStore.id, updateRequest);
      const updated: UIStore = formatStoreForUI(response.data);

      setStores((prev: UIStore[]) => 
        prev.map(store => store.id === updated.id ? updated : store)
      );
      setEditingStore(null);
      setIsEditModalOpen(false);

      toast({
        title: 'Store updated successfully',
        description: `${updated.name} has been updated`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update store';
      toast({
        title: 'Error updating store',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = (store: UIStore) => {
    setDeletingStore(store);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteStore = async () => {
    if (!deletingStore) return;

    try {
      setIsSubmitting(true);
      await storeAPI.delete(deletingStore.id);

      setStores((prev: UIStore[]) => 
        prev.filter(store => store.id !== deletingStore.id)
      );
      setDeletingStore(null);
      setIsDeleteAlertOpen(false);

      toast({
        title: 'Store deleted successfully',
        description: `${deletingStore.name} has been deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete store';
      toast({
        title: 'Error deleting store',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unique countries for filter
  const uniqueCountries = [...new Set(stores.map((s: UIStore) => s.country))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading stores...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Failed to load stores</Text>
            <Text fontSize="sm">{error}</Text>
            <Button size="sm" onClick={fetchStores}>
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
        title="Store Management"
        actions={
          <Button
            leftIcon={<FiMapPin />}
            colorScheme="blue"
            onClick={() => setIsModalOpen(true)}
          >
            Add Store
          </Button>
        }
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Stores</StatLabel>
              <StatNumber>{totalStores}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Real-time data
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Stores</StatLabel>
              <StatNumber>{activeStores}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Currently operational
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg Products</StatLabel>
              <StatNumber>{avgProducts}</StatNumber>
              <StatHelpText>
                Per store
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg Store Value</StatLabel>
              <StatNumber>${avgValue.toLocaleString()}</StatNumber>
              <StatHelpText>
                Inventory value
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <SectionCard title="Store Directory">
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <Input
                placeholder="Search stores..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
              placeholder="All Statuses"
              maxW="150px"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as "" | StoreStatus)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <Select
              placeholder="All Countries"
              maxW="150px"
              value={countryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCountryFilter(e.target.value)}
            >
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>

            <Button size="sm" onClick={fetchStores}>
              Refresh
            </Button>
          </HStack>

          {/* Stores Table */}
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Store Details</Th>
                <Th>Location</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th>Stats</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStores.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    {stores.length === 0 ? 'No stores found. Create your first store!' : 'No stores match your filters.'}
                  </Td>
                </Tr>
              ) : (
                filteredStores.map((store: UIStore) => (
                  <Tr key={store.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{store.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {store.code}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Manager: {store.manager}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{store.city}, {store.state}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {store.country}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {store.address}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{store.email}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {store.phone}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={store.isActive ? "green" : "red"}
                        variant="subtle"
                      >
                        {store.status}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{store.totalProducts} products</Text>
                        <Text fontSize="sm" color="gray.600">
                          ${store.totalValue.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Sync: {store.lastSync}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost" onClick={() => handleEditStore(store)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="red"
                          onClick={() => handleDeleteStore(store)}
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

      {/* Create Store Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Store</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Store Code</FormLabel>
                  <Input
                    value={newStore.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("code", e.target.value)}
                    placeholder="ST001"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Store Name</FormLabel>
                  <Input
                    value={newStore.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                    placeholder="Downtown Location"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Manager</FormLabel>
                <Input
                  value={newStore.manager || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("manager", e.target.value)}
                  placeholder="John Doe"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={newStore.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                    placeholder="store@example.com"
                    type="email"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={newStore.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  value={newStore.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={newStore.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("city", e.target.value)}
                    placeholder="New York"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Input
                    value={newStore.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("state", e.target.value)}
                    placeholder="NY"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Zip Code</FormLabel>
                  <Input
                    value={newStore.zipCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("zipCode", e.target.value)}
                    placeholder="10001"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Country</FormLabel>
                <Input
                  value={newStore.country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("country", e.target.value)}
                  placeholder="United States"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateStore}
              isLoading={isSubmitting}
              loadingText="Creating..."
              disabled={!newStore.code || !newStore.name || !newStore.email || !newStore.city || !newStore.country}
            >
              Create Store
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Store Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Store</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingStore && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Store Code</FormLabel>
                    <Input
                      value={editingStore.code}
                      isReadOnly
                      bg="gray.100"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Store Name</FormLabel>
                    <Input
                      value={editingStore.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setEditingStore({...editingStore, name: e.target.value})
                      }
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Manager</FormLabel>
                  <Input
                    value={editingStore.manager || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setEditingStore({...editingStore, manager: e.target.value})
                    }
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={editingStore.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setEditingStore({...editingStore, email: e.target.value})
                      }
                      type="email"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={editingStore.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setEditingStore({...editingStore, phone: e.target.value})
                      }
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={editingStore.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setEditingStore({...editingStore, address: e.target.value})
                    }
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input
                      value={editingStore.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setEditingStore({...editingStore, city: e.target.value})
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={editingStore.state}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setEditingStore({...editingStore, state: e.target.value})
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Zip Code</FormLabel>
                    <Input
                      value={editingStore.zipCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setEditingStore({...editingStore, zipCode: e.target.value})
                      }
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Country</FormLabel>
                  <Input
                    value={editingStore.country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setEditingStore({...editingStore, country: e.target.value})
                    }
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateStore}
              isLoading={isSubmitting}
              loadingText="Updating..."
              disabled={!editingStore?.name || !editingStore?.email || !editingStore?.city || !editingStore?.country}
            >
              Update Store
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
              Delete Store
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deletingStore?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDeleteStore}
                isLoading={isSubmitting}
                loadingText="Deleting..."
                ml={3}
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

export default Stores;
