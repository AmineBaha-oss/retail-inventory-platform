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
  FiGrid,
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { productAPI, supplierAPI } from "../services/api";
import { Product as APIProduct, ProductCreateRequest, ProductUpdateRequest, Supplier } from "../types/api";

type UIProduct = {
  id: string;
  name: string;
  sku?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  salePrice?: number;
  costPrice?: number;
  packSize?: number;
  supplier?: string;
  stock?: number;
  stockStatus?: string;
  status: string;
};

export default function Products() {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProductCreateRequest & ProductUpdateRequest>>({
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productAPI.getAll();
      const data: APIProduct[] = Array.isArray(res.data) ? res.data : (res.data as any).content ?? [];
      const ui: UIProduct[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        salePrice: p.unitPrice,
        costPrice: p.unitCost,
        packSize: p.casePackSize,
        supplier: p.supplierName,
        stock: undefined,
        stockStatus: undefined,
        status: p.status,
      }));
      setProducts(ui);
    } catch (error) {
      toast({ title: "Failed to load products", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await supplierAPI.getAll();
      const list = (res.data as any).content ?? res.data ?? [];
      setSuppliers(Array.isArray(list) ? list : []);
    } catch (_) {}
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await productAPI.getCategories();
        const arr = Array.isArray(res.data) ? res.data : res.data ?? [];
        setCategories(arr as string[]);
      } catch (_) {}
    };
    loadCategories();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleAddProduct = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ name: "", category: "", subcategory: "", brand: "", description: "", unitCost: 0, unitPrice: 0, casePackSize: 1, supplierId: "", status: "ACTIVE" });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: UIProduct) => {
    setIsEditing(true);
    setSelectedId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      unitCost: product.costPrice,
      unitPrice: product.salePrice,
      casePackSize: product.packSize,
      supplierId: suppliers.find((s) => s.name === product.supplier)?.id || "",
      status: product.status as any,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product: UIProduct) => {
    if (!window.confirm(`Delete product ${product.name}?`)) return;
    try {
      await productAPI.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast({ title: "Product deleted", status: "success" });
    } catch (e) {
      toast({ title: "Failed to delete product", status: "error" });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedId) {
        const update: ProductUpdateRequest = {
          name: form.name,
          category: form.category,
          subcategory: form.subcategory,
          brand: form.brand,
          description: form.description,
          unitCost: form.unitCost,
          unitPrice: form.unitPrice,
          casePackSize: form.casePackSize,
          supplierId: form.supplierId,
          status: form.status as any,
        };
        const res = await productAPI.update(selectedId, update);
        const p = res.data as APIProduct;
        setProducts((prev) => prev.map((x) => (x.id === selectedId ? { id: p.id, name: p.name, sku: p.sku, brand: p.brand, category: p.category, subcategory: p.subcategory, salePrice: p.unitPrice, costPrice: p.unitCost, packSize: p.casePackSize, supplier: p.supplierName, status: p.status } : x)));
        toast({ title: "Product updated", status: "success" });
      } else {
        const create: ProductCreateRequest = {
          sku: form.sku || undefined,
          name: form.name || "",
          category: form.category,
          subcategory: form.subcategory,
          brand: form.brand,
          description: form.description,
          unitCost: form.unitCost,
          unitPrice: form.unitPrice,
          casePackSize: form.casePackSize,
          supplierId: form.supplierId || "",
          status: form.status as any,
        };
        const res = await productAPI.create(create);
        const p = res.data as APIProduct;
        setProducts((prev) => [{ id: p.id, name: p.name, sku: p.sku, brand: p.brand, category: p.category, subcategory: p.subcategory, salePrice: p.unitPrice, costPrice: p.unitCost, packSize: p.casePackSize, supplier: p.supplierName, status: p.status }, ...prev]);
        toast({ title: "Product created", status: "success" });
      }
      setIsModalOpen(false);
    } catch (e) {
      toast({ title: "Save failed", status: "error" });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (product.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    { key: "name", label: "PRODUCT DETAILS" },
    { key: "category", label: "CATEGORY" },
    { key: "salePrice", label: "PRICING" },
    { key: "supplier", label: "SUPPLIER" },
    { key: "stock", label: "STOCK" },
    { key: "status", label: "STATUS" },
  ];

  const actions = (row: any) => (
    <HStack spacing={1}>
      <Tooltip label="Edit Product">
        <IconButton
          aria-label="Edit"
          icon={<Icon as={FiEdit} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "brand.400", bg: "brand.50" }}
          onClick={() => handleEditProduct(row)}
        />
      </Tooltip>
      <Tooltip label="Delete Product">
        <IconButton
          aria-label="Delete"
          icon={<Icon as={FiTrash2} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "error.400", bg: "error.50" }}
          onClick={() => handleDeleteProduct(row)}
        />
      </Tooltip>
    </HStack>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, pricing, and inventory levels"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={loadProducts}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleAddProduct}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Add Product
            </Button>
          </HStack>
        }
      />

      {/* Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Products"
          value="13"
          change={12.5}
          changeType="increase"
          icon={FiGrid}
          iconColor="brand"
          description="Product catalog"
          status="success"
        />
        <StatCard
          title="In Stock"
          value="4"
          change={0}
          changeType="increase"
          icon={FiTrendingUp}
          iconColor="success"
          description="Available items"
          status="success"
        />
        <StatCard
          title="Low Stock"
          value="9"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Need restocking"
          status="warning"
        />
        <StatCard
          title="Out of Stock"
          value="0"
          change={0}
          changeType="increase"
          icon={FiAlertTriangle}
          iconColor="error"
          description="Unavailable items"
          status="error"
        />
      </SimpleGrid>

      {/* Products Table */}
      <SectionCard
        title="Product Catalog"
        subtitle="Complete product information with pricing and stock levels"
        icon={FiGrid}
      >
        <DataTable
          columns={columns}
          data={filteredProducts}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search products..."
          onSearch={handleSearch}
          filters={[
            {
              key: "category",
              label: "All Categories",
              options: [
                { value: "all", label: "All Categories" },
                ...categories.map((c) => ({ value: c, label: c })),
              ],
              onFilter: handleCategoryFilter,
            },
            {
              key: "status",
              label: "All Status",
              options: [
                { value: "all", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "DISCONTINUED", label: "Discontinued" },
              ],
              onFilter: handleStatusFilter,
            },
          ]}
          actions={actions}
          emptyMessage="No products found"
        />
      </SectionCard>
      {/* Create/Edit Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Product" : "Add Product"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {isEditing && (
                <HStack>
                  <FormControl>
                    <FormLabel>SKU</FormLabel>
                    <Input value={(form as any).sku || ""} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value as any }))} />
                  </FormControl>
                </HStack>
              )}
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={form.name || ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </FormControl>
              </HStack>
              <HStack>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select value={form.category || ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Select category">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Subcategory</FormLabel>
                  <Input value={form.subcategory || ""} onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))} />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Brand</FormLabel>
                <Input value={form.brand || ""} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Unit Cost</FormLabel>
                  <Input type="number" step="0.01" value={form.unitCost ?? 0} onChange={(e) => setForm((p) => ({ ...p, unitCost: parseFloat(e.target.value) }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Unit Price</FormLabel>
                  <Input type="number" step="0.01" value={form.unitPrice ?? 0} onChange={(e) => setForm((p) => ({ ...p, unitPrice: parseFloat(e.target.value) }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Case Pack Size</FormLabel>
                  <Input type="number" value={form.casePackSize ?? 1} onChange={(e) => setForm((p) => ({ ...p, casePackSize: parseInt(e.target.value || "0") }))} />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Supplier</FormLabel>
                <Select value={form.supplierId || ""} onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}>
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit} disabled={!form.name || !form.supplierId}>
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
