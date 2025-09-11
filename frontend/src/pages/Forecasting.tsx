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
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiBarChart,
  FiPieChart,
  FiTarget,
  FiAlertTriangle,
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
const forecastData = [
  { week: "Week 1", actual: 45, forecast: 42, p90: 50, p50: 35 },
  { week: "Week 2", actual: 52, forecast: 48, p90: 58, p50: 40 },
  { week: "Week 3", actual: 38, forecast: 44, p90: 52, p50: 36 },
  { week: "Week 4", actual: 61, forecast: 55, p90: 65, p50: 45 },
  { week: "Week 5", actual: 48, forecast: 52, p90: 62, p50: 42 },
  { week: "Week 6", actual: 55, forecast: 58, p90: 68, p50: 48 },
  { week: "Week 7", actual: 42, forecast: 45, p90: 55, p50: 35 },
  { week: "Week 8", actual: 58, forecast: 62, p90: 72, p50: 52 },
];

const accuracyData = [
  { sku: "TSH-001", accuracy: 92, mape: 8 },
  { sku: "SHP-003", accuracy: 87, mape: 13 },
  { sku: "HT-005", accuracy: 95, mape: 5 },
];

const forecasts = [
  {
    id: "1",
    sku: "TSH-001",
    name: "Black T-Shirt (Small)",
    store: "Downtown",
    currentStock: 25,
    forecastedDemand: 45,
    confidenceP90: 52,
    leadTime: 7,
    suggestedOrder: 30,
  },
  {
    id: "2",
    sku: "JKT-002",
    name: "Navy Jacket (Medium)",
    store: "Longueuil",
    currentStock: 15,
    forecastedDemand: 28,
    confidenceP90: 35,
    leadTime: 10,
    suggestedOrder: 20,
  },
  {
    id: "3",
    sku: "SHP-003",
    name: "Brown Shoes (42)",
    store: "Plateau",
    currentStock: 8,
    forecastedDemand: 22,
    confidenceP90: 28,
    leadTime: 14,
    suggestedOrder: 25,
  },
];

export default function Forecasting() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Export successful",
        description: "Forecasting data exported successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export forecasting data",
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Data refreshed",
        description: "Forecasting data updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh forecasting data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const forecastColumns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Name" },
    { key: "store", label: "Store" },
    { key: "currentStock", label: "Current Stock" },
    { key: "forecastedDemand", label: "Forecasted Demand" },
    { key: "confidenceP90", label: "Confidence P90" },
    { key: "leadTime", label: "Lead Time" },
    { key: "suggestedOrder", label: "Suggested Order" },
  ];

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Forecasting"
        subtitle="Predict future demand and analyze what-if scenarios"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiDownload} />}
              onClick={handleExport}
              isLoading={isLoading}
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
            >
              Refresh
            </Button>
            <Button
              size="md"
              leftIcon={<Icon as={FiTarget} />}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Generate Forecasts
            </Button>
          </HStack>
        }
      />

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Forecasts"
          value="3"
          icon={FiBarChart}
          iconColor="brand"
          description="Active forecasts"
          status="info"
        />
        <StatCard
          title="Average Accuracy"
          value="90.8%"
          change={5.2}
          changeType="increase"
          icon={FiTarget}
          iconColor="success"
          description="Forecast accuracy"
          status="success"
        />
        <StatCard
          title="Total Scenarios"
          value="3"
          icon={FiPieChart}
          iconColor="brand"
          description="What-if scenarios"
          status="info"
        />
        <StatCard
          title="Completed"
          value="2"
          icon={FiAlertTriangle}
          iconColor="warning"
          description="Pending forecasts"
          status="warning"
        />
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Demand Forecast Chart */}
        <SectionCard
          title="Demand Forecast with Confidence Intervals"
          subtitle="8-week demand forecast with confidence bounds"
          icon={FiTrendingUp}
        >
          <Box h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
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
                  type="monotone"
                  dataKey="actual"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Actual Demand"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                  name="Forecast"
                />
                <Line
                  type="monotone"
                  dataKey="p90"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 3 }}
                  name="P90 Confidence"
                />
                <Line
                  type="monotone"
                  dataKey="p50"
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#6B7280", strokeWidth: 2, r: 3 }}
                  name="P50 Confidence"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        {/* Forecast Accuracy Chart */}
        <SectionCard
          title="Forecast Accuracy by SKU"
          subtitle="Accuracy and MAPE for different products"
          icon={FiTarget}
        >
          <Box h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="sku" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="#10B981" name="Accuracy (%)" />
                <Bar dataKey="mape" fill="#EF4444" name="MAPE (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </SimpleGrid>

      {/* Forecasts Table */}
      <SectionCard
        title="Demand Forecasts"
        subtitle="Detailed forecast information for all products"
        icon={FiBarChart}
      >
        <DataTable
          columns={forecastColumns}
          data={forecasts}
          emptyMessage="No forecasts available"
        />
      </SectionCard>
    </VStack>
  );
}
