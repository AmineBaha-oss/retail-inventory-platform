import React, { useState, useEffect } from "react";
import {
  SimpleGrid,
  HStack,
  Button,
  VStack,
  Text,
  Box,
  Flex,
  Icon,
  Badge,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 135 },
  { month: "Mar", revenue: 48000, orders: 128 },
  { month: "Apr", revenue: 61000, orders: 155 },
  { month: "May", revenue: 58000, orders: 142 },
  { month: "Jun", revenue: 65000, orders: 168 },
];

const inventoryData = [
  { status: "In Stock", count: 65, color: "#10B981" },
  { status: "Low Stock", count: 20, color: "#F59E0B" },
  { status: "Out of Stock", count: 15, color: "#EF4444" },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    amount: 299.99,
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    amount: 149.5,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    amount: 89.99,
    status: "shipped",
    date: "2024-01-13",
  },
];

const atRiskItems = [
  {
    sku: "TSH-001",
    name: "Black T-Shirt (Small)",
    store: "Downtown",
    currentStock: 5,
    reorderPoint: 20,
    daysUntilStockout: 3,
  },
  {
    sku: "JKT-002",
    name: "Navy Jacket (Medium)",
    store: "Longueuil",
    currentStock: 3,
    reorderPoint: 15,
    daysUntilStockout: 2,
  },
  {
    sku: "SHP-003",
    name: "Brown Shoes (42)",
    store: "Plateau",
    currentStock: 8,
    reorderPoint: 25,
    daysUntilStockout: 5,
  },
];

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Export successful",
        description: "Dashboard data exported successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Data refreshed",
        description: "Dashboard data updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const orderColumns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge
          colorScheme={
            value === "completed"
              ? "success"
              : value === "pending"
              ? "warning"
              : "info"
          }
          variant="subtle"
        >
          {value.toUpperCase()}
        </Badge>
      ),
    },
    { key: "date", label: "Date" },
  ];

  const atRiskColumns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Product" },
    { key: "store", label: "Store" },
    { key: "currentStock", label: "Current Stock" },
    { key: "reorderPoint", label: "Reorder Point" },
    {
      key: "daysUntilStockout",
      label: "Days Until Stockout",
      render: (value: number) => (
        <Badge
          colorScheme={
            value <= 3 ? "error" : value <= 7 ? "warning" : "success"
          }
          variant="subtle"
        >
          {value} days
        </Badge>
      ),
    },
  ];

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your retail inventory performance"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiDownload} />}
              onClick={handleExport}
              isLoading={isLoading}
              _hover={{
                bg: "gray.700",
                borderColor: "brand.500",
                color: "brand.300",
              }}
            >
              Export Report
            </Button>
            <Button
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Refresh Data
            </Button>
          </HStack>
        }
      />

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Revenue"
          value="$328k"
          change={12.5}
          changeType="increase"
          icon={FiDollarSign}
          iconColor="success"
          description="Real-time data"
          status="success"
        />
        <StatCard
          title="Total Orders"
          value="0.9k"
          change={8.2}
          changeType="increase"
          icon={FiShoppingCart}
          iconColor="brand"
          description="All time"
          status="success"
        />
        <StatCard
          title="Stockout Rate"
          value="2.8%"
          change={2.1}
          changeType="decrease"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Items out of stock"
          status="warning"
        />
        <StatCard
          title="Customer Satisfaction"
          value="4.6/5"
          change={0.3}
          changeType="increase"
          icon={FiUsers}
          iconColor="success"
          description="Average rating"
          status="success"
        />
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Revenue & Orders Trend */}
        <SectionCard
          title="Monthly Revenue & Orders Trend"
          subtitle="Performance over the last 6 months"
          icon={FiTrendingUp}
        >
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        {/* Inventory Status Distribution */}
        <SectionCard
          title="Inventory Status Distribution"
          subtitle="Current stock levels across all products"
          icon={FiPackage}
        >
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </SimpleGrid>

      {/* Tables Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Recent Orders */}
        <SectionCard
          title="Recent Orders"
          subtitle="Latest customer orders"
          icon={FiShoppingCart}
          badge={{ text: "Live", colorScheme: "success" }}
        >
          <DataTable columns={orderColumns} data={recentOrders} maxH="300px" />
        </SectionCard>

        {/* At-Risk Items */}
        <SectionCard
          title="At-Risk Items"
          subtitle="Products requiring immediate attention"
          icon={FiAlertTriangle}
          badge={{ text: "Urgent", colorScheme: "error" }}
        >
          <DataTable columns={atRiskColumns} data={atRiskItems} maxH="300px" />
        </SectionCard>
      </SimpleGrid>
    </VStack>
  );
}
