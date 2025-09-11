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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Tooltip,
  IconButton,
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
import { storeAPI } from "../services/api";
import { Store as APIStore, StoreCreateRequest, StoreUpdateRequest } from "../types/api";

type UIStore = APIStore & { location?: string; statusText?: string };

export default function Stores() {
  const [stores, setStores] = useState<UIStore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<StoreCreateRequest & StoreUpdateRequest & { code: string }>>({
    code: "",
    name: "",
    manager: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    timezone: "UTC",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const response = await storeAPI.getAll();
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as any).content ?? [];
      const ui = (data as APIStore[]).map((s) => ({
        ...s,
        location: [s.city, s.country].filter(Boolean).join(", "),
        statusText: (s as any).status ?? (s.isActive ? "Active" : "Inactive"),
      }));
      setStores(ui);
    } catch (error) {
      toast({ title: "Failed to load stores", status: "error" });
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
    setIsEditing(false);
    setSelectedId(null);
    setForm({ code: "", name: "", manager: "", email: "", phone: "", address: "", city: "", country: "", timezone: "UTC" });
    setIsModalOpen(true);
  };

  const handleEditStore = (store: UIStore) => {
    setIsEditing(true);
    setSelectedId(store.id);
    setForm({
      code: store.code,
      name: store.name,
      manager: store.manager,
      email: store.email,
      phone: store.phone,
      address: store.address,
      city: store.city,
      country: store.country,
      timezone: store.timezone || "UTC",
    });
    setIsModalOpen(true);
  };

  const handleDeleteStore = async (store: UIStore) => {
    try {
      setSubmitting(true);
      await storeAPI.delete(store.id);
      setStores((prev) => prev.filter((s) => s.id !== store.id));
      toast({ title: "Store deleted", status: "success" });
    } catch (e) {
      toast({ title: "Failed to delete store", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (isEditing && selectedId) {
        const update: StoreUpdateRequest = {
          name: form.name,
          manager: form.manager,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: form.country,
          timezone: form.timezone,
        };
        const res = await storeAPI.update(selectedId, update);
        const updated = res.data as APIStore;
        setStores((prev) => prev.map((s) => (s.id === selectedId ? { ...updated, location: [updated.city, updated.country].filter(Boolean).join(", "), statusText: (updated as any).status ?? (updated.isActive ? "Active" : "Inactive") } : s)));
        toast({ title: "Store updated", status: "success" });
      } else {
        const create: StoreCreateRequest = {
          code: form.code || "",
          name: form.name || "",
          manager: form.manager,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: form.country,
          timezone: form.timezone,
        } as StoreCreateRequest;
        const res = await storeAPI.create(create);
        const created = res.data as APIStore;
        setStores((prev) => [{ ...created, location: [created.city, created.country].filter(Boolean).join(", "), statusText: (created as any).status ?? (created.isActive ? "Active" : "Inactive") }, ...prev]);
        toast({ title: "Store created", status: "success" });
      }
      setIsModalOpen(false);
    } catch (e) {
      toast({ title: "Save failed", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.manager || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (store.statusText || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesCountry =
      countryFilter === "all" || (store.location || "").includes(countryFilter);

    return matchesSearch && matchesStatus && matchesCountry;
  });

  const columns = [
    { key: "name", label: "STORE DETAILS" },
    { key: "location", label: "LOCATION" },
    { key: "phone", label: "CONTACT" },
    { key: "statusText", label: "STATUS" },
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

      {/* Create/Edit Store Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Store" : "Add Store"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {!isEditing && (
                <FormControl isRequired>
                  <FormLabel>Code</FormLabel>
                  <Input value={form.code || ""} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="NYC001" />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={form.name || ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Manager</FormLabel>
                  <Input value={form.manager || ""} onChange={(e) => setForm((p) => ({ ...p, manager: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={form.email || ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </FormControl>
              </HStack>
              <HStack>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input value={form.phone || ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Timezone</FormLabel>
                  <Select value={form.timezone || "UTC"} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                  </Select>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input value={form.address || ""} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input value={form.city || ""} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input value={form.country || ""} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit} isLoading={submitting} disabled={!form.name || (!isEditing && !form.code)}>
              {isEditing ? "Save Changes" : "Create Store"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
