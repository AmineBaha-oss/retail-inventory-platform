import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  HStack,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
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
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { supplierAPI } from "../services/api";
import { Supplier as APISupplier, SupplierCreateRequest, SupplierUpdateRequest } from "../types/api";

type UISupplier = APISupplier & { location?: string; statusText?: string };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<UISupplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SupplierCreateRequest & SupplierUpdateRequest & { code?: string }>>({
    name: "",
    category: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    leadTimeDays: 7,
    status: undefined,
  });

  const CATEGORY_OPTIONS = [
    "Premium Apparel",
    "Designer Wear",
    "Casual Wear",
    "Accessories",
  ];
  const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await supplierAPI.getAll();
      const list: APISupplier[] = Array.isArray(res.data) ? res.data : (res.data as any).content ?? [];
      const ui = (list as APISupplier[]).map((s) => ({
        ...s,
        location: [s.city, s.country].filter(Boolean).join(", "),
        statusText: s.status ?? "Active",
      }));
      setSuppliers(ui);
    } catch (error) {
      toast({ title: "Failed to load suppliers", status: "error" });
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

  const handleAddSupplier = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ name: "", category: "", contactPerson: "", email: "", phone: "", country: "", city: "", address: "", leadTimeDays: 7, status: undefined });
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: UISupplier) => {
    setIsEditing(true);
    setSelectedId(supplier.id);
    setForm({
      name: supplier.name,
      category: supplier.category,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      country: supplier.country,
      city: supplier.city,
      address: supplier.address,
      leadTimeDays: supplier.leadTimeDays,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (supplier: UISupplier) => {
    if (!window.confirm(`Delete supplier ${supplier.name}?`)) return;
    try {
      await supplierAPI.delete(supplier.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
      toast({ title: "Supplier deleted", status: "success" });
    } catch (_) {
      toast({ title: "Failed to delete supplier", status: "error" });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedId) {
        const update: SupplierUpdateRequest = {
          name: form.name,
          category: form.category,
          contactPerson: form.contactPerson,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
          address: form.address,
          leadTimeDays: form.leadTimeDays,
          status: form.status as any,
        };
        const res = await supplierAPI.update(selectedId, update);
        const s = res.data as APISupplier;
        setSuppliers((prev) => prev.map((x) => (x.id === selectedId ? { ...s, location: [s.city, s.country].filter(Boolean).join(", "), statusText: s.status ?? "Active" } : x)));
        toast({ title: "Supplier updated", status: "success" });
      } else {
        // Auto-generate code from name
        const base = (form.name || "SUP").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        const suffix = String(Date.now()).slice(-4);
        const code = `${base.substring(0, 4)}-${suffix}`;
        const create: SupplierCreateRequest = {
          code,
          name: form.name || "",
          category: form.category,
          contactPerson: form.contactPerson,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
          address: form.address,
          leadTimeDays: form.leadTimeDays,
        } as SupplierCreateRequest;
        const res = await supplierAPI.create(create);
        const s = res.data as APISupplier;
        setSuppliers((prev) => [{ ...s, location: [s.city, s.country].filter(Boolean).join(", "), statusText: s.status ?? "Active" }, ...prev]);
        toast({ title: "Supplier created", status: "success" });
      }
      setIsModalOpen(false);
    } catch (_) {
      toast({ title: "Save failed", status: "error" });
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (supplier.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (supplier.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || (supplier.statusText || "").toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    { key: "name", label: "NAME" },
    { key: "category", label: "CATEGORY" },
    { key: "contactPerson", label: "CONTACT PERSON" },
    { key: "location", label: "LOCATION" },
    { 
      key: "statusText", 
      label: "STATUS",
      render: (value: string) => (
        <Badge
          colorScheme={value === "Active" ? "success" : "error"}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
        >
          {value}
        </Badge>
      )
    },
    { key: "orders", label: "ORDERS" },
    { key: "totalValue", label: "TOTAL VALUE" },
    { key: "lastOrder", label: "LAST ORDER" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Supplier">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditSupplier(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Supplier">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeleteSupplier(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor relationships, performance metrics, and contact information"
        actions={
          <HStack spacing={3}>
            <Button variant="outline" size="md" leftIcon={<Icon as={FiRefreshCw} />} onClick={loadSuppliers} isLoading={isLoading}>Refresh</Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleAddSupplier}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Add Supplier
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Suppliers"
          value="6"
          change={12.5}
          changeType="increase"
          icon={FiUsers}
          iconColor="brand"
          description="Active vendors"
          status="success"
        />
        <StatCard
          title="Active Suppliers"
          value="5"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Currently working"
          status="success"
        />
        <StatCard
          title="Total Orders"
          value="0"
          change={0}
          changeType="increase"
          icon={FiShoppingCart}
          iconColor="brand"
          description="All time"
          status="info"
        />
        <StatCard
          title="Total Value"
          value="$0.0k"
          change={0}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="success"
          description="This year"
          status="success"
        />
      </SimpleGrid>

      {/* Suppliers Table */}
      <SectionCard
        title="Vendor Directory"
        subtitle="Complete list of suppliers and their information"
        icon={FiUsers}
      >
        <DataTable
          columns={columns}
          data={filteredSuppliers}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search by name, contact person, city..."
          onSearch={handleSearch}
          filters={[
            {
              key: "category",
              label: "Filter by category",
              options: [
                { value: "all", label: "All Categories" },
                ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
              ],
              onFilter: handleCategoryFilter,
            },
            {
              key: "status",
              label: "Filter by status",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Suspended", label: "Suspended" },
              ],
              onFilter: handleStatusFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No suppliers found"
        />
      </SectionCard>

      {/* Create/Edit Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Supplier" : "Add Supplier"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={form.name || ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select value={form.category || ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Select category">
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Contact Person</FormLabel>
                  <Input value={form.contactPerson || ""} onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))} />
                </FormControl>
              </HStack>
              {isEditing && (
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={(form.status as any) || ""} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))} placeholder="Select status">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </FormControl>
              )}
              <HStack>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={form.email || ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input value={form.phone || ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
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
            <Button colorScheme="brand" onClick={handleSubmit} disabled={!form.name}>
              {isEditing ? "Save Changes" : "Create Supplier"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
