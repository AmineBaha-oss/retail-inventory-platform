import React, { useMemo, useState, useEffect } from "react";
import {
  SimpleGrid,
  HStack,
  Button,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Text,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  FiHome,
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiDownload,
  FiRefreshCw,
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
import { dashboardAPI, exportAPI } from "../services/api";
import {
  showSuccess,
  showError,
  showInfo,
  formatCurrency,
  formatPercentage,
} from "../utils/helpers";
import { useNavigate } from "react-router-dom";

// Chart data
const monthlyRevenueData = [
  { month: "Jan", revenue: 45000, orders: 120, customers: 85 },
  { month: "Feb", revenue: 52000, orders: 135, customers: 92 },
  { month: "Mar", revenue: 48000, orders: 128, customers: 88 },
  { month: "Apr", revenue: 61000, orders: 156, customers: 105 },
  { month: "May", revenue: 55000, orders: 142, customers: 98 },
  { month: "Jun", revenue: 67000, orders: 168, customers: 115 },
];

const inventoryStatusData = [
  { name: "In Stock", value: 65, color: "#48BB78" },
  { name: "Low Stock", value: 20, color: "#ED8936" },
  { name: "Out of Stock", value: 15, color: "#E53E3E" },
];

const storePerformanceData = [
  { store: "Downtown", sales: 25000, growth: 12, efficiency: 85 },
  { store: "Longueuil", sales: 18000, growth: 8, efficiency: 78 },
  { store: "Plateau", sales: 22000, growth: 15, efficiency: 92 },
  { store: "West Island", sales: 16000, growth: 5, efficiency: 72 },
  { store: "Laval", sales: 19000, growth: 10, efficiency: 80 },
];

const weeklyTrendsData = [
  { week: "Week 1", sales: 12000, inventory: 85, stockouts: 3 },
  { week: "Week 2", sales: 13500, inventory: 78, stockouts: 2 },
  { week: "Week 3", sales: 11800, inventory: 82, stockouts: 4 },
  { week: "Week 4", sales: 14200, inventory: 75, stockouts: 1 },
  { week: "Week 5", sales: 12800, inventory: 80, stockouts: 2 },
];

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // KPIs data
  const kpis = useMemo(
    () => ({
      totalRevenue: 328000,
      totalOrders: 851,
      averageOrderValue: 385.5,
      stockoutRate: 2.8,
      holdingCost: 12500,
      customerSatisfaction: 4.6,
      inventoryTurnover: 6.2,
      forecastAccuracy: 87.5,
    }),
    []
  );

  // At-risk items
  const atRiskItems = useMemo(
    () => [
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
      {
        sku: "PNT-004",
        name: "Khaki Pants (32)",
        store: "Downtown",
        currentStock: 12,
        reorderPoint: 30,
        daysUntilStockout: 7,
      },
    ],
    []
  );

  // Open purchase orders
  const openPOs = useMemo(
    () => [
      {
        po: "PO-2024-001",
        supplier: "TechCorp",
        eta: "2024-02-15",
        status: "In Transit",
        lines: 12,
      },
      {
        po: "PO-2024-002",
        supplier: "SupplyCo",
        eta: "2024-02-20",
        status: "Processing",
        lines: 8,
      },
    ],
    []
  );

  const handleExportReport = async () => {
    try {
      setIsLoading(true);
      showInfo("Generating report...");

      // For now, create a demo CSV export
      const csvContent = `Dashboard Report,${new Date().toLocaleDateString()}
Total Revenue,${kpis.totalRevenue}
Total Orders,${kpis.totalOrders}
Average Order Value,${kpis.averageOrderValue}
Stockout Rate,${kpis.stockoutRate}
Holding Cost,${kpis.holdingCost}`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("Report exported successfully!");
    } catch (error) {
      showError("Failed to export report");
      console.error("Export error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      showInfo("Refreshing data...");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would call the dashboard API here
      // const kpiData = await dashboardAPI.getKPIs();
      // const atRiskData = await dashboardAPI.getAtRiskItems();
      // const openPOsData = await dashboardAPI.getOpenPOs();

      showSuccess("Data refreshed successfully!");
    } catch (error) {
      showError("Failed to refresh data");
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetails = (sku: string, store: string) => {
    showInfo(`Viewing details for ${sku} at ${store}`);
    // Navigate to inventory page with filters
    navigate("/inventory", {
      state: {
        search: sku,
        storeFilter: store,
        statusFilter: "Critical",
      },
    });
  };

  const handleViewPO = (poNumber: string) => {
    showInfo(`Viewing purchase order ${poNumber}`);
    navigate("/purchase-orders", {
      state: {
        search: poNumber,
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your retail inventory performance"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleExportReport}
              isLoading={isLoading}
            >
              Export Report
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleRefreshData}
              isLoading={isRefreshing}
            >
              Refresh Data
            </Button>
          </HStack>
        }
      />

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={8}>
        <StatCard
          label="Total Revenue"
          value={`$${(kpis.totalRevenue / 1000).toFixed(0)}k`}
          hint="12.5% increase from last month"
          trend="increase"
          icon={FiDollarSign}
          colorScheme="success"
        />
        <StatCard
          label="Total Orders"
          value={`${(kpis.totalOrders / 1000).toFixed(1)}k`}
          hint="8.2% increase from last month"
          trend="increase"
          icon={FiPackage}
          colorScheme="info"
        />
        <StatCard
          label="Stockout Rate"
          value={`${kpis.stockoutRate.toFixed(1)}%`}
          hint="2.1% decrease from last month"
          trend="decrease"
          icon={FiTrendingUp}
          colorScheme="warning"
        />
        <StatCard
          label="Customer Satisfaction"
          value={`${kpis.customerSatisfaction.toFixed(1)}/5`}
          hint="0.3 increase from last month"
          trend="increase"
          icon={FiHome}
          colorScheme="brand"
        />
      </SimpleGrid>

      {/* Charts Section */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={8}>
        {/* Revenue Trend Chart */}
        <GridItem>
          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Monthly Revenue & Orders Trend
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3182CE"
                    strokeWidth={3}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#38A169"
                    strokeWidth={2}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </GridItem>

        {/* Inventory Status Pie Chart */}
        <GridItem>
          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Inventory Status Distribution
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Store Performance Chart */}
      <Card mb={8}>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Store Performance Comparison
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="store" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3182CE" name="Sales ($)" />
              <Bar dataKey="growth" fill="#38A169" name="Growth (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Weekly Trends Chart */}
      <Card mb={8}>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Weekly Performance Trends
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                stackId="1"
                stroke="#3182CE"
                fill="#3182CE"
                fillOpacity={0.6}
                name="Sales ($)"
              />
              <Area
                type="monotone"
                dataKey="inventory"
                stackId="1"
                stroke="#38A169"
                fill="#38A169"
                fillOpacity={0.6}
                name="Inventory Level (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* At-Risk Items */}
      <SectionCard title="At-Risk Items">
        <DataTable
          head={
            <Tr>
              <Th>SKU</Th>
              <Th>Name</Th>
              <Th>Store</Th>
              <Th>Current Stock</Th>
              <Th>Reorder Point</Th>
              <Th>Days Until Stockout</Th>
              <Th></Th>
            </Tr>
          }
        >
          {atRiskItems.map((r) => (
            <Tr key={r.sku}>
              <Td fontWeight="medium">{r.sku}</Td>
              <Td>{r.name}</Td>
              <Td>{r.store}</Td>
              <Td>{r.currentStock}</Td>
              <Td>{r.reorderPoint}</Td>
              <Td>{r.daysUntilStockout}</Td>
              <Td textAlign="right">
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => handleViewDetails(r.sku, r.store)}
                >
                  View Details
                </Button>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </SectionCard>

      {/* Open Purchase Orders */}
      <SectionCard title="Open Purchase Orders">
        <DataTable
          head={
            <Tr>
              <Th>PO Number</Th>
              <Th>Supplier</Th>
              <Th>ETA</Th>
              <Th>Status</Th>
              <Th isNumeric>Lines</Th>
              <Th></Th>
            </Tr>
          }
        >
          {[
            {
              po: "PO-2024-001",
              supplier: "TechCorp",
              eta: "2024-02-15",
              status: "In Transit",
              lines: 12,
            },
            {
              po: "PO-2024-002",
              supplier: "SupplyCo",
              eta: "2024-02-20",
              status: "Processing",
              lines: 8,
            },
          ].map((r) => (
            <Tr key={r.po}>
              <Td fontWeight="medium">{r.po}</Td>
              <Td>{r.supplier}</Td>
              <Td>{r.eta}</Td>
              <Td>
                <Badge
                  colorScheme={
                    r.status === "In Transit" ? "success" : "warning"
                  }
                  variant="solid"
                >
                  {r.status}
                </Badge>
              </Td>
              <Td isNumeric fontWeight="semibold">
                {r.lines}
              </Td>
              <Td textAlign="right">
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => handleViewPO(r.po)}
                >
                  View PO
                </Button>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </SectionCard>
    </div>
  );
}
