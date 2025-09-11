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
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiShoppingCart,
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { purchaseOrderAPI, supplierAPI, storeAPI } from "../services/api";
import { PurchaseOrder as APIPO, Supplier, Store } from "../types/api";

// Mock data
const purchaseOrdersData = [
  {
    id: "1",
    poNumber: "PO-2025-001",
    itemCount: 1,
    supplier: "Loft & Co",
    store: "SoHo Flagship",
    amount: 0,
    status: "PENDING APPROVAL",
    priority: "HIGH",
    orderDate: "2024-01-04",
  },
  {
    id: "2",
    poNumber: "PO-2025-002",
    itemCount: 1,
    supplier: "Vera Couture",
    store: "Beverly Hills Premium",
    amount: 0,
    status: "APPROVED",
    priority: "MEDIUM",
    orderDate: "2024-01-05",
  },
];

type UIPurchaseOrder = {
  id: string;
  poNumber: string;
  supplier: string;
  supplierId?: string;
  store: string;
  storeId?: string;
  amount: number;
  status: string;
  priority?: string;
  orderDate?: string;
  itemCount?: number;
};

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<UIPurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [form, setForm] = useState<{ supplierId: string; storeId: string; status?: string; priority?: string; notes?: string }>({ supplierId: "", storeId: "", status: "DRAFT", priority: "MEDIUM", notes: "" });

  useEffect(() => {
    loadPurchaseOrders();
    (async () => {
      try {
        const [s, t] = await Promise.all([supplierAPI.getAll(), storeAPI.getAll()]);
        setSuppliers((Array.isArray(s.data) ? s.data : (s.data as any).content) || []);
        setStores((Array.isArray(t.data) ? t.data : (t.data as any).content) || []);
      } catch (_) {}
    })();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setIsLoading(true);
      const res = await purchaseOrderAPI.getAll();
      const data: any[] = Array.isArray(res.data) ? res.data : (res.data as any).content ?? [];
      const ui: UIPurchaseOrder[] = (data as APIPO[]).map((po) => ({
        id: po.id,
        poNumber: po.poNumber || "",
        supplier: (po as any).supplierName || "",
        supplierId: po.supplierId,
        store: (po as any).storeName || "",
        storeId: po.storeId,
        amount: po.totalAmount ?? 0,
        status: po.status,
        priority: (po as any).priority,
        orderDate: po.orderDate,
        itemCount: (po as any).itemCount,
      }));
      setPurchaseOrders(ui);
    } catch (error) {
      toast({ title: "Failed to load purchase orders", status: "error" });
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

  const handleSupplierFilter = (supplier: string) => {
    setSupplierFilter(supplier);
  };

  const handleCreatePO = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ supplierId: "", storeId: "", status: "DRAFT", priority: "MEDIUM", notes: "" });
    setIsModalOpen(true);
  };

  const handleEditPO = (po: any) => {
    setIsEditing(true);
    setSelectedId(po.id);
    setForm({ supplierId: po.supplierId || "", storeId: po.storeId || "", status: po.status, priority: po.priority, notes: "" });
    setIsModalOpen(true);
  };

  const handleDeletePO = async (po: any) => {
    if (!window.confirm(`Delete PO ${po.poNumber}?`)) return;
    try {
      await purchaseOrderAPI.delete(po.id);
      setPurchaseOrders((prev) => prev.filter((x) => x.id !== po.id));
      toast({ title: "Purchase order deleted", status: "success" });
    } catch (e) {
      toast({ title: "Failed to delete purchase order", status: "error" });
    }
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      po.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSupplier =
      supplierFilter === "all" || po.supplier === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const columns = [
    { key: "poNumber", label: "PO DETAILS" },
    { key: "supplier", label: "SUPPLIER" },
    { key: "store", label: "STORE" },
    { key: "amount", label: "AMOUNT" },
    { key: "status", label: "STATUS" },
    { key: "priority", label: "PRIORITY" },
    { key: "orderDate", label: "ORDER DATE" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Purchase Order">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditPO(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Purchase Order">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeletePO(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage purchase orders, track supplier deliveries, and monitor order status"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={loadPurchaseOrders}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleCreatePO}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Create PO
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total POs"
          value="2"
          change={0}
          changeType="increase"
          icon={FiShoppingCart}
          iconColor="brand"
          description="Purchase orders"
          status="info"
        />
        <StatCard
          title="Pending Approval"
          value="1"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Awaiting approval"
          status="warning"
        />
        <StatCard
          title="Approved"
          value="1"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Ready for processing"
          status="success"
        />
        <StatCard
          title="Total Value"
          value="$0"
          change={0}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="brand"
          description="Order value"
          status="info"
        />
      </SimpleGrid>

      {/* Purchase Orders Table */}
      <SectionCard
        title="Purchase Orders"
        subtitle="Complete purchase order information with status and priority"
        icon={FiShoppingCart}
      >
        <DataTable
          columns={columns}
          data={filteredPOs}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search purchase orders..."
          onSearch={handleSearch}
          filters={[
            {
              key: "status",
              label: "All Statuses",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "PENDING_APPROVAL", label: "Pending Approval" },
                { value: "APPROVED", label: "Approved" },
                { value: "IN_TRANSIT", label: "In Transit" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "DRAFT", label: "Draft" },
                { value: "PROCESSING", label: "Processing" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "REJECTED", label: "Rejected" },
              ],
              onFilter: handleStatusFilter,
            },
            {
              key: "supplier",
              label: "All Suppliers",
              options: [
                { value: "all", label: "All Suppliers" },
                { value: "Loft & Co", label: "Loft & Co" },
                { value: "Vera Couture", label: "Vera Couture" },
                { value: "Urban Threads", label: "Urban Threads" },
              ],
              onFilter: handleSupplierFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No purchase orders found"
        />
      </SectionCard>
      {/* Create/Edit Purchase Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Purchase Order" : "Create Purchase Order"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Supplier</FormLabel>
                  <Select value={form.supplierId} onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))} placeholder="Select supplier">
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Store</FormLabel>
                  <Select value={form.storeId} onChange={(e) => setForm((p) => ({ ...p, storeId: e.target.value }))} placeholder="Select store">
                    {stores.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
              <HStack>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={form.status || ""} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REJECTED">REJECTED</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select value={form.priority || ""} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </Select>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button colorScheme="brand" onClick={async () => {
              // reuse handler
              try {
                if (!form.storeId || !form.supplierId) { toast({ title: "Select store and supplier", status: "warning" }); return; }
                if (isEditing && selectedId) {
                  const res = await purchaseOrderAPI.update(selectedId, { status: form.status as any, priority: form.priority as any, notes: form.notes } as any);
                  const po = res.data as any;
                  setPurchaseOrders((prev) => prev.map((x) => (x.id === selectedId ? { id: po.id, poNumber: po.poNumber, supplier: po.supplierName, supplierId: po.supplierId, store: po.storeName, storeId: po.storeId, amount: po.totalAmount ?? 0, status: po.status, priority: po.priority, orderDate: po.orderDate, itemCount: po.itemCount } : x)));
                  toast({ title: "PO updated", status: "success" });
                } else {
                  const res = await purchaseOrderAPI.create({ supplierId: form.supplierId, storeId: form.storeId, status: form.status as any, priority: form.priority as any, notes: form.notes } as any);
                  const po = res.data as any;
                  setPurchaseOrders((prev) => [{ id: po.id, poNumber: po.poNumber, supplier: po.supplierName, supplierId: po.supplierId, store: po.storeName, storeId: po.storeId, amount: po.totalAmount ?? 0, status: po.status, priority: po.priority, orderDate: po.orderDate, itemCount: po.itemCount }, ...prev]);
                  toast({ title: "PO created", status: "success" });
                }
                setIsModalOpen(false);
              } catch (e) { toast({ title: "Save failed", status: "error" }); }
            }} disabled={!form.supplierId || !form.storeId}>{isEditing ? "Save Changes" : "Create PO"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
