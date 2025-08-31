import React, { useState, useEffect } from "react";
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
  Textarea,
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
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { 
  FiTrendingUp, 
  FiBarChart3, 
  FiRefreshCw, 
  FiPlay,
  FiSettings,
  FiDownload,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiZap,
  FiPlus
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import { forecastingAPI } from "../services/api";
import { showSuccess, showError, showInfo, formatCurrency, formatDate, formatPercentage } from "../utils/helpers";

type ForecastStatus = "Pending" | "In Progress" | "Completed" | "Failed" | "Outdated";

type ForecastItem = {
  id: string;
  sku: string;
  name: string;
  store: string;
  currentStock: number;
  forecastedDemand: number;
  confidenceLevel: number;
  p50Forecast: number;
  p90Forecast: number;
  leadTime: number;
  reorderPoint: number;
  safetyStock: number;
  lastUpdated: string;
  accuracy: number;
  status: ForecastStatus;
};

type WhatIfScenario = {
  id: string;
  name: string;
  description: string;
  leadTimeChange: number;
  demandChange: number;
  promoImpact: number;
  stockoutRisk: number;
  overstockRisk: number;
  costImpact: number;
  createdAt: string;
};

// Demo data
const initialForecasts: ForecastItem[] = [
  {
    id: "1",
    sku: "TEE-Black-S",
    name: "Black T-Shirt (Small)",
    store: "Downtown",
    currentStock: 45,
    forecastedDemand: 3.2,
    confidenceLevel: 85,
    p50Forecast: 3.2,
    p90Forecast: 4.8,
    leadTime: 14,
    reorderPoint: 20,
    safetyStock: 15,
    lastUpdated: "2024-01-15",
    accuracy: 92.5,
    status: "Completed",
  },
  {
    id: "2",
    sku: "JKT-Navy-M",
    name: "Navy Jacket (Medium)",
    store: "Longueuil",
    currentStock: 8,
    forecastedDemand: 2.1,
    confidenceLevel: 78,
    p50Forecast: 2.1,
    p90Forecast: 3.2,
    leadTime: 21,
    reorderPoint: 15,
    safetyStock: 12,
    lastUpdated: "2024-01-15",
    accuracy: 88.3,
    status: "Completed",
  },
  {
    id: "3",
    sku: "SHO-Brown-42",
    name: "Brown Shoes (42)",
    store: "Plateau",
    currentStock: 0,
    forecastedDemand: 1.8,
    confidenceLevel: 82,
    p50Forecast: 1.8,
    p90Forecast: 2.7,
    leadTime: 28,
    reorderPoint: 10,
    safetyStock: 8,
    lastUpdated: "2024-01-15",
    accuracy: 91.2,
    status: "Completed",
  },
];

const initialScenarios: WhatIfScenario[] = [
  {
    id: "1",
    name: "Extended Lead Time",
    description: "Supplier lead time increases from 14 to 21 days",
    leadTimeChange: 7,
    demandChange: 0,
    promoImpact: 0,
    stockoutRisk: 15,
    overstockRisk: -5,
    costImpact: 1200,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Holiday Promotion",
    description: "20% increase in demand due to holiday promotion",
    leadTimeChange: 0,
    demandChange: 20,
    promoImpact: 20,
    stockoutRisk: 25,
    overstockRisk: 10,
    costImpact: 800,
    createdAt: "2024-01-15",
  },
];

export default function Forecasting() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>(initialForecasts);
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>(initialScenarios);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Partial<WhatIfScenario>>({});
  const [activeTab, setActiveTab] = useState("forecasts");
  const toast = useToast();

  // Calculate stats
  const stats = {
    totalItems: forecasts.length,
    completed: forecasts.filter(f => f.status === "Completed").length,
    pending: forecasts.filter(f => f.status === "Pending").length,
    averageAccuracy: forecasts.reduce((sum, f) => sum + f.accuracy, 0) / forecasts.length,
    totalStockoutRisk: forecasts.filter(f => f.currentStock < f.reorderPoint).length,
  };

  // Handle generate forecast
  const handleGenerateForecast = async () => {
    try {
      setIsGeneratingForecast(true);
      showInfo("Generating demand forecasts for all stores...");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update forecasts with new data
      setForecasts(prev => prev.map(f => ({
        ...f,
        status: "Completed" as ForecastStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
        accuracy: Math.random() * 20 + 80, // Random accuracy between 80-100%
        forecastedDemand: f.forecastedDemand * (0.8 + Math.random() * 0.4), // Random variation
      })));
      
      showSuccess("Demand forecasts generated successfully!");
    } catch (error) {
      showError("Failed to generate forecasts");
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  // Handle refresh forecasts
  const handleRefreshForecasts = async () => {
    try {
      setIsLoading(true);
      showInfo("Refreshing forecast data...");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess("Forecast data refreshed successfully!");
    } catch (error) {
      showError("Failed to refresh forecasts");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create scenario
  const handleCreateScenario = () => {
    setEditingScenario({});
    setIsModalOpen(true);
  };

  // Handle save scenario
  const handleSaveScenario = () => {
    if (editingScenario.id) {
      // Update existing scenario
      setScenarios(prev => 
        prev.map(s => 
          s.id === editingScenario.id 
            ? { ...s, ...editingScenario }
            : s
        )
      );
      showSuccess("Scenario updated successfully!");
    } else {
      // Create new scenario
      const newScenario: WhatIfScenario = {
        id: Date.now().toString(),
        name: editingScenario.name || "",
        description: editingScenario.description || "",
        leadTimeChange: editingScenario.leadTimeChange || 0,
        demandChange: editingScenario.demandChange || 0,
        promoImpact: editingScenario.promoImpact || 0,
        stockoutRisk: editingScenario.stockoutRisk || 0,
        overstockRisk: editingScenario.overstockRisk || 0,
        costImpact: editingScenario.costImpact || 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setScenarios(prev => [newScenario, ...prev]);
      showSuccess("Scenario created successfully!");
    }
    setIsModalOpen(false);
    setEditingScenario({});
  };

  // Handle run scenario
  const handleRunScenario = async (scenario: WhatIfScenario) => {
    try {
      setIsLoading(true);
      showInfo(`Running scenario: ${scenario.name}...`);
      
      // Simulate scenario analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(`Scenario "${scenario.name}" completed! Check results for impact analysis.`);
    } catch (error) {
      showError("Failed to run scenario");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export forecasts
  const handleExportForecasts = async () => {
    try {
      setIsLoading(true);
      showInfo("Exporting forecast data...");
      
      // Create CSV content
      const csvContent = `SKU,Store,Current Stock,Forecasted Demand,Confidence Level,P50 Forecast,P90 Forecast,Lead Time,Reorder Point,Safety Stock,Accuracy
${forecasts.map(f => 
  `${f.sku},${f.store},${f.currentStock},${f.forecastedDemand},${f.confidenceLevel}%,${f.p50Forecast},${f.p90Forecast},${f.leadTime},${f.reorderPoint},${f.safetyStock},${f.accuracy.toFixed(1)}%`
).join('\n')}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `demand-forecasts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess("Forecast data exported successfully!");
    } catch (error) {
      showError("Failed to export forecasts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Demand Forecasting"
        subtitle="AI-powered demand forecasting with probabilistic models and what-if scenario analysis."
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleExportForecasts}
              isLoading={isLoading}
              loadingText="Exporting..."
            >
              Export Forecasts
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleRefreshForecasts}
              isLoading={isLoading}
              loadingText="Refreshing..."
            >
              Refresh Data
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiPlay />}
              onClick={handleGenerateForecast}
              isLoading={isGeneratingForecast}
              loadingText="Generating..."
            >
              Generate Forecasts
            </Button>
          </HStack>
        }
      />

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={6}>
        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Total Items
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {stats.totalItems}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                Being forecasted
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Completed
              </StatLabel>
              <StatNumber color="green.400" fontSize="2xl" fontWeight="bold">
                {stats.completed}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" /> Ready
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Pending
              </StatLabel>
              <StatNumber color="orange.400" fontSize="2xl" fontWeight="bold">
                {stats.pending}
              </StatNumber>
              <StatHelpText fontSize="xs" color="orange.300">
                Awaiting analysis
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Avg Accuracy
              </StatLabel>
              <StatNumber color="blue.400" fontSize="2xl" fontWeight="bold">
                {stats.averageAccuracy.toFixed(1)}%
              </StatNumber>
              <StatHelpText fontSize="xs" color="blue.300">
                Model performance
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" border="none" outline="none">
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Stockout Risk
              </StatLabel>
              <StatNumber color="red.400" fontSize="2xl" fontWeight="bold">
                {stats.totalStockoutRisk}
              </StatNumber>
              <StatHelpText fontSize="xs" color="red.300">
                Items below reorder point
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs index={["forecasts", "scenarios"].indexOf(activeTab)} onChange={(index) => {
        const tabs = ["forecasts", "scenarios"];
        setActiveTab(tabs[index]);
      }} mb={6}>
        <TabList>
          <Tab>Demand Forecasts</Tab>
          <Tab>What-If Scenarios</Tab>
        </TabList>

        <TabPanels>
          {/* Forecasts Tab */}
          <TabPanel p={0}>
            <SectionCard title="Demand Forecasts">
              <DataTable
                head={
                  <tr>
                    <th>SKU</th>
                    <th>Store</th>
                    <th>Current Stock</th>
                    <th>Forecasted Demand</th>
                    <th>Confidence</th>
                    <th>P50/P90</th>
                    <th>Lead Time</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                  </tr>
                }
              >
                {forecasts.map((forecast) => (
                  <tr key={forecast.id} style={{ backgroundColor: parseInt(forecast.id) % 2 === 0 ? '#1a202c' : 'transparent' }}>
                    <td style={{ fontWeight: 'medium' }}>{forecast.sku}</td>
                    <td>{forecast.store}</td>
                    <td style={{ fontWeight: 'semibold' }}>{forecast.currentStock}</td>
                    <td style={{ fontWeight: 'semibold' }}>{forecast.forecastedDemand.toFixed(1)}/day</td>
                    <td>
                      <Progress 
                        value={forecast.confidenceLevel} 
                        size="sm" 
                        colorScheme={forecast.confidenceLevel > 80 ? "green" : forecast.confidenceLevel > 60 ? "yellow" : "red"}
                        borderRadius="md"
                      />
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {forecast.confidenceLevel}%
                      </Text>
                    </td>
                    <td>
                      <VStack spacing={1} align="start">
                        <Text fontSize="xs" color="gray.300">P50: {forecast.p50Forecast.toFixed(1)}</Text>
                        <Text fontSize="xs" color="gray.300">P90: {forecast.p90Forecast.toFixed(1)}</Text>
                      </VStack>
                    </td>
                    <td>{forecast.leadTime} days</td>
                    <td>
                      <Badge
                        colorScheme={
                          forecast.accuracy > 90 ? "success" :
                          forecast.accuracy > 80 ? "warning" : "error"
                        }
                        variant="solid"
                      >
                        {forecast.accuracy.toFixed(1)}%
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        colorScheme={
                          forecast.status === "Completed" ? "success" :
                          forecast.status === "In Progress" ? "blue" :
                          forecast.status === "Pending" ? "orange" :
                          forecast.status === "Failed" ? "red" : "gray"
                        }
                        variant="solid"
                      >
                        {forecast.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </SectionCard>
          </TabPanel>

          {/* Scenarios Tab */}
          <TabPanel p={0}>
            <SectionCard 
              title="What-If Scenarios" 
              actions={
                <Button
                  colorScheme="brand"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={handleCreateScenario}
                >
                  Create Scenario
                </Button>
              }
            >
              <DataTable
                head={
                  <tr>
                    <th>Scenario Name</th>
                    <th>Description</th>
                    <th>Lead Time Change</th>
                    <th>Demand Change</th>
                    <th>Stockout Risk</th>
                    <th>Cost Impact</th>
                    <th>Actions</th>
                  </tr>
                }
              >
                {scenarios.map((scenario) => (
                  <tr key={scenario.id} style={{ backgroundColor: parseInt(scenario.id) % 2 === 0 ? '#1a202c' : 'transparent' }}>
                    <td style={{ fontWeight: 'medium' }}>{scenario.name}</td>
                    <td>{scenario.description}</td>
                    <td>
                      <Badge
                        colorScheme={scenario.leadTimeChange > 0 ? "red" : "green"}
                        variant="solid"
                      >
                        {scenario.leadTimeChange > 0 ? "+" : ""}{scenario.leadTimeChange} days
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        colorScheme={scenario.demandChange > 0 ? "green" : "red"}
                        variant="solid"
                      >
                        {scenario.demandChange > 0 ? "+" : ""}{scenario.demandChange}%
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        colorScheme={
                          scenario.stockoutRisk > 20 ? "red" :
                          scenario.stockoutRisk > 10 ? "orange" : "green"
                        }
                        variant="solid"
                      >
                        {scenario.stockoutRisk}%
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 'semibold' }}>{formatCurrency(scenario.costImpact)}</td>
                    <td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="solid"
                          colorScheme="blue"
                          leftIcon={<FiPlay />}
                          onClick={() => handleRunScenario(scenario)}
                          isLoading={isLoading}
                        >
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiEye />}
                        >
                          View
                        </Button>
                      </HStack>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </SectionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Scenario Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">
            {editingScenario.id ? "Edit Scenario" : "Create What-If Scenario"}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.200">Scenario Name</FormLabel>
                <Input
                  value={editingScenario.name || ""}
                  onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  placeholder="e.g., Extended Lead Time, Holiday Promotion"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.200">Description</FormLabel>
                <Textarea
                  value={editingScenario.description || ""}
                  onChange={(e) => setEditingScenario({ ...editingScenario, description: e.target.value })}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="gray.100"
                  rows={3}
                  placeholder="Describe the scenario and its business impact"
                />
              </FormControl>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel color="gray.200">Lead Time Change (days)</FormLabel>
                  <NumberInput
                    value={editingScenario.leadTimeChange || 0}
                    onChange={(_, value) => setEditingScenario({ ...editingScenario, leadTimeChange: value })}
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
                    value={editingScenario.demandChange || 0}
                    onChange={(_, value) => setEditingScenario({ ...editingScenario, demandChange: value })}
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
              </HStack>
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel color="gray.200">Promo Impact (%)</FormLabel>
                  <NumberInput
                    value={editingScenario.promoImpact || 0}
                    onChange={(_, value) => setEditingScenario({ ...editingScenario, promoImpact: value })}
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
                  <FormLabel color="gray.200">Cost Impact ($)</FormLabel>
                  <NumberInput
                    value={editingScenario.costImpact || 0}
                    onChange={(_, value) => setEditingScenario({ ...editingScenario, costImpact: value })}
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
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveScenario}>
              {editingScenario.id ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
