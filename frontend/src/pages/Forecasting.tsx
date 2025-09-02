import React, { useState, useMemo } from "react";
import {
  Box,
  SimpleGrid,
  HStack,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiPlay,
  FiBarChart,
  FiPieChart,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Tr, Th, Td } from "@chakra-ui/react";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { forecastingAPI } from "../services/api";
import {
  showSuccess,
  showError,
  showInfo,
  formatCurrency,
  formatPercentage,
} from "../utils/helpers";

type ForecastItem = {
  id: string;
  sku: string;
  name: string;
  store: string;
  currentStock: number;
  forecastedDemand: number;
  confidenceP50: number;
  confidenceP90: number;
  leadTime: number;
  reorderPoint: number;
  suggestedOrder: number;
  lastUpdated: string;
};

type WhatIfScenario = {
  id: string;
  name: string;
  description: string;
  leadTimeChange: number;
  demandChange: number;
  costImpact: number;
  stockoutRisk: number;
  status: "Draft" | "Running" | "Completed" | "Failed";
  createdAt: string;
};

// Chart data
const demandForecastData = [
  {
    week: "Week 1",
    actual: 120,
    forecast: 125,
    p50: 125,
    p90: 140,
    stock: 200,
  },
  {
    week: "Week 2",
    actual: 135,
    forecast: 130,
    p50: 130,
    p90: 145,
    stock: 175,
  },
  {
    week: "Week 3",
    actual: 118,
    forecast: 135,
    p50: 135,
    p90: 150,
    stock: 160,
  },
  {
    week: "Week 4",
    actual: 142,
    forecast: 140,
    p50: 140,
    p90: 155,
    stock: 145,
  },
  {
    week: "Week 5",
    actual: 128,
    forecast: 145,
    p50: 145,
    p90: 160,
    stock: 130,
  },
  {
    week: "Week 6",
    actual: null,
    forecast: 150,
    p50: 150,
    p90: 165,
    stock: 115,
  },
  {
    week: "Week 7",
    actual: null,
    forecast: 155,
    p50: 155,
    p90: 170,
    stock: 100,
  },
  {
    week: "Week 8",
    actual: null,
    forecast: 160,
    p50: 160,
    p90: 175,
    stock: 85,
  },
];

const forecastAccuracyData = [
  { sku: "TSH-001", accuracy: 92, bias: -2.1, mape: 8.5 },
  { sku: "JKT-002", accuracy: 87, bias: 1.8, mape: 12.3 },
  { sku: "SHP-003", accuracy: 95, bias: -0.5, mape: 5.2 },
  { sku: "PNT-004", accuracy: 89, bias: 3.2, mape: 10.8 },
  { sku: "HT-005", accuracy: 91, bias: -1.5, mape: 9.1 },
];

const seasonalPatternData = [
  { month: "Jan", demand: 1200, seasonality: 0.85 },
  { month: "Feb", demand: 1100, seasonality: 0.78 },
  { month: "Mar", demand: 1300, seasonality: 0.92 },
  { month: "Apr", demand: 1400, seasonality: 1.0 },
  { month: "May", demand: 1500, seasonality: 1.07 },
  { month: "Jun", demand: 1600, seasonality: 1.14 },
  { month: "Jul", demand: 1550, seasonality: 1.11 },
  { month: "Aug", demand: 1450, seasonality: 1.04 },
  { month: "Sep", demand: 1350, seasonality: 0.96 },
  { month: "Oct", demand: 1250, seasonality: 0.89 },
  { month: "Nov", demand: 1150, seasonality: 0.82 },
  { month: "Dec", demand: 1050, seasonality: 0.75 },
];

// Demo data
const initialForecasts: ForecastItem[] = [
  {
    id: "1",
    sku: "TSH-001",
    name: "Black T-Shirt (Small)",
    store: "Downtown",
    currentStock: 45,
    forecastedDemand: 120,
    confidenceP50: 120,
    confidenceP90: 140,
    leadTime: 14,
    reorderPoint: 30,
    suggestedOrder: 95,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    sku: "JKT-002",
    name: "Navy Jacket (Medium)",
    store: "Longueuil",
    currentStock: 28,
    forecastedDemand: 85,
    confidenceP50: 85,
    confidenceP90: 95,
    leadTime: 21,
    reorderPoint: 25,
    suggestedOrder: 67,
    lastUpdated: "2024-01-15",
  },
  {
    id: "3",
    sku: "SHP-003",
    name: "Brown Shoes (42)",
    store: "Plateau",
    currentStock: 32,
    forecastedDemand: 65,
    confidenceP50: 65,
    confidenceP90: 75,
    leadTime: 28,
    reorderPoint: 20,
    suggestedOrder: 43,
    lastUpdated: "2024-01-15",
  },
];

const initialScenarios: WhatIfScenario[] = [
  {
    id: "1",
    name: "Lead Time Increase",
    description: "What if supplier lead time increases by 7 days?",
    leadTimeChange: 7,
    demandChange: 0,
    costImpact: 2500,
    stockoutRisk: 15,
    status: "Completed",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Demand Surge",
    description: "What if demand increases by 25% during holiday season?",
    leadTimeChange: 0,
    demandChange: 25,
    costImpact: -1800,
    stockoutRisk: 35,
    status: "Completed",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    name: "Supply Chain Disruption",
    description: "What if lead time doubles and demand drops by 10%?",
    leadTimeChange: 14,
    demandChange: -10,
    costImpact: 4200,
    stockoutRisk: 8,
    status: "Draft",
    createdAt: "2024-01-14",
  },
];

export default function Forecasting() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>(initialForecasts);
  const [scenarios, setScenarios] =
    useState<WhatIfScenario[]>(initialScenarios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("forecasts");
  const [newScenario, setNewScenario] = useState<Partial<WhatIfScenario>>({});
  const toast = useToast();

  // Calculate stats
  const stats = useMemo(
    () => ({
      totalForecasts: forecasts.length,
      averageAccuracy: 90.8,
      totalScenarios: scenarios.length,
      completedScenarios: scenarios.filter((s) => s.status === "Completed")
        .length,
    }),
    [forecasts, scenarios]
  );

  const handleGenerateForecast = async () => {
    try {
      setIsLoading(true);
      showInfo("Generating new forecasts...");

      // Call the actual API
      const response = await forecastingAPI.generateForecast("1");

      if (response.data) {
        showSuccess("Forecasts generated successfully!");
      }
    } catch (error) {
      console.error("Forecast generation error:", error);
      showError("Failed to generate forecasts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshForecasts = async () => {
    try {
      setIsLoading(true);
      showInfo("Refreshing forecast data...");

      // Call the actual API to get fresh data
      const response = await forecastingAPI.getForecastHistory("1");

      if (response.data) {
        showSuccess("Forecast data refreshed successfully!");
      }
    } catch (error) {
      console.error("Forecast refresh error:", error);
      showError("Failed to refresh forecast data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScenario = () => {
    setNewScenario({});
    setIsModalOpen(true);
  };

  const handleSaveScenario = async () => {
    if (!newScenario.name || !newScenario.description) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      // Call the actual API to create scenario
      const response = await forecastingAPI.createScenario({
        name: newScenario.name,
        description: newScenario.description,
        leadTimeChange: newScenario.leadTimeChange || 0,
        demandChange: newScenario.demandChange || 0,
      });

      if (response.data) {
        const scenario: WhatIfScenario = {
          id: response.data.id.toString(),
          name: response.data.name,
          description: newScenario.description,
          leadTimeChange: newScenario.leadTimeChange || 0,
          demandChange: newScenario.demandChange || 0,
          costImpact: 0,
          stockoutRisk: 0,
          status: response.data.status,
          createdAt: response.data.createdAt,
        };

        setScenarios((prev) => [scenario, ...prev]);
        setIsModalOpen(false);
        setNewScenario({});
        showSuccess("Scenario created successfully!");
      }
    } catch (error) {
      console.error("Scenario creation error:", error);
      showError("Failed to create scenario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScenario = async (scenario: WhatIfScenario) => {
    try {
      setIsLoading(true);
      showInfo(`Running scenario: ${scenario.name}...`);

      // Call the actual API to run scenario
      const response = await forecastingAPI.runScenario(scenario.id);

      if (response.data) {
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === scenario.id
              ? {
                  ...s,
                  status: response.data.status,
                  costImpact: response.data.costImpact,
                  stockoutRisk: response.data.stockoutRisk,
                }
              : s
          )
        );

        showSuccess(`Scenario ${scenario.name} completed successfully!`);
      }
    } catch (error) {
      console.error("Scenario run error:", error);
      showError("Failed to run scenario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportForecasts = async () => {
    try {
      setIsLoading(true);
      showInfo("Exporting forecast data...");

      // Create CSV content
      const csvContent = `SKU,Name,Store,Current Stock,Forecasted Demand,Confidence P50,Confidence P90,Lead Time,Reorder Point,Suggested Order
${forecasts
  .map(
    (f) =>
      `${f.sku},${f.name},${f.store},${f.currentStock},${f.forecastedDemand},${f.confidenceP50},${f.confidenceP90},${f.leadTime},${f.reorderPoint},${f.suggestedOrder}`
  )
  .join("\n")}`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `forecasts-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("Forecast data exported successfully!");
    } catch (error) {
      showError("Failed to export forecast data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Demand Forecasting"
        subtitle="Predict future demand and analyze what-if scenarios"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleExportForecasts}
              isLoading={isLoading}
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleRefreshForecasts}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiTrendingUp />}
              onClick={handleGenerateForecast}
              isLoading={isLoading}
            >
              Generate Forecasts
            </Button>
          </HStack>
        }
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Total Forecasts
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.100">
              {stats.totalForecasts}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Average Accuracy
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.100">
              {stats.averageAccuracy}%
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Total Scenarios
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.100">
              {stats.totalScenarios}
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.400" mb={1}>
              Completed
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.100">
              {stats.completedScenarios}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts Section */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={8}>
        {/* Demand Forecast Chart */}
        <GridItem>
          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Demand Forecast with Confidence Intervals
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={demandForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#48BB78"
                    strokeWidth={3}
                    name="Actual Demand"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#3182CE"
                    strokeWidth={2}
                    name="Forecast"
                  />
                  <Area
                    dataKey="p90"
                    fill="#E53E3E"
                    fillOpacity={0.1}
                    stroke="#E53E3E"
                    strokeDasharray="5 5"
                    name="P90 Confidence"
                  />
                  <Area
                    dataKey="p50"
                    fill="#ED8936"
                    fillOpacity={0.1}
                    stroke="#ED8936"
                    strokeDasharray="3 3"
                    name="P50 Confidence"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </GridItem>

        {/* Forecast Accuracy Chart */}
        <GridItem>
          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Forecast Accuracy by SKU
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sku" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#48BB78" name="Accuracy (%)" />
                  <Bar dataKey="mape" fill="#E53E3E" name="MAPE (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Seasonal Pattern Chart */}
      <Card mb={8}>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Seasonal Demand Patterns
          </Text>
          {/* Temporarily commenting out the third chart as it's causing the page to break */}
          <div
            style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1a202c",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
          >
            <Text color="gray.400">
              Seasonal Pattern Chart - Temporarily disabled
            </Text>
          </div>
        </CardBody>
      </Card>

      {/* Tabs for Forecasts and Scenarios */}
      <Tabs
        index={activeTab === "forecasts" ? 0 : 1}
        onChange={(index) =>
          setActiveTab(index === 0 ? "forecasts" : "scenarios")
        }
        mb={6}
      >
        <TabList>
          <Tab>Demand Forecasts ({forecasts.length})</Tab>
          <Tab>What-If Scenarios ({scenarios.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Forecasts Tab */}
          <TabPanel>
            <SectionCard title="Demand Forecasts">
              <DataTable
                head={
                  <Tr>
                    <Th>SKU</Th>
                    <Th>Name</Th>
                    <Th>Store</Th>
                    <Th>Current Stock</Th>
                    <Th>Forecasted Demand</Th>
                    <Th>Confidence P90</Th>
                    <Th>Lead Time</Th>
                    <Th>Suggested Order</Th>
                  </Tr>
                }
              >
                {forecasts.map((forecast) => (
                  <Tr key={forecast.id}>
                    <Td fontWeight="medium">{forecast.sku}</Td>
                    <Td>{forecast.name}</Td>
                    <Td>{forecast.store}</Td>
                    <Td>{forecast.currentStock}</Td>
                    <Td fontWeight="semibold">{forecast.forecastedDemand}</Td>
                    <Td>
                      <Badge colorScheme="orange" variant="solid">
                        {forecast.confidenceP90}
                      </Badge>
                    </Td>
                    <Td>{forecast.leadTime} days</Td>
                    <Td fontWeight="semibold" color="brand.400">
                      {forecast.suggestedOrder}
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            </SectionCard>
          </TabPanel>

          {/* Scenarios Tab */}
          <TabPanel>
            <SectionCard
              title="What-If Scenarios"
              action={
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="brand"
                  size="sm"
                  onClick={handleCreateScenario}
                >
                  New Scenario
                </Button>
              }
            >
              <DataTable
                head={
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Lead Time Change</Th>
                    <Th>Demand Change</Th>
                    <Th>Cost Impact</Th>
                    <Th>Stockout Risk</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                }
              >
                {scenarios.map((scenario) => (
                  <Tr key={scenario.id}>
                    <Td fontWeight="medium">{scenario.name}</Td>
                    <Td fontSize="sm" color="gray.300">
                      {scenario.description}
                    </Td>
                    <Td>
                      {scenario.leadTimeChange > 0 ? "+" : ""}
                      {scenario.leadTimeChange} days
                    </Td>
                    <Td>
                      {scenario.demandChange > 0 ? "+" : ""}
                      {scenario.demandChange}%
                    </Td>
                    <Td
                      color={scenario.costImpact > 0 ? "red.400" : "green.400"}
                    >
                      {scenario.costImpact > 0 ? "+" : ""}
                      {formatCurrency(scenario.costImpact)}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          scenario.stockoutRisk > 20
                            ? "red"
                            : scenario.stockoutRisk > 10
                            ? "orange"
                            : "green"
                        }
                        variant="solid"
                      >
                        {scenario.stockoutRisk}%
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          scenario.status === "Completed"
                            ? "green"
                            : scenario.status === "Running"
                            ? "blue"
                            : scenario.status === "Failed"
                            ? "red"
                            : "gray"
                        }
                        variant="solid"
                      >
                        {scenario.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {scenario.status === "Draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="brand"
                            leftIcon={<FiPlay />}
                            onClick={() => handleRunScenario(scenario)}
                            isLoading={isLoading}
                          >
                            Run
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            </SectionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* New Scenario Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">
            Create New What-If Scenario
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.200">Scenario Name</FormLabel>
                <Input
                  value={newScenario.name || ""}
                  onChange={(e) =>
                    setNewScenario({ ...newScenario, name: e.target.value })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  placeholder="e.g., Lead Time Increase"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Description</FormLabel>
                <Input
                  value={newScenario.description || ""}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      description: e.target.value,
                    })
                  }
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  placeholder="Describe the scenario and its impact"
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel color="gray.200">
                    Lead Time Change (days)
                  </FormLabel>
                  <NumberInput
                    value={newScenario.leadTimeChange || 0}
                    onChange={(_, value) =>
                      setNewScenario({ ...newScenario, leadTimeChange: value })
                    }
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.200">Demand Change (%)</FormLabel>
                  <NumberInput
                    value={newScenario.demandChange || 0}
                    onChange={(_, value) =>
                      setNewScenario({ ...newScenario, demandChange: value })
                    }
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveScenario}>
              Create Scenario
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
