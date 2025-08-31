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
} from "@chakra-ui/react";
import {
  FiHome,
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
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

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // demo metrics – wire to real data later
  const kpis = useMemo(
    () => ({
      stores: 12,
      serviceLevel: "97.8%",
      stockoutRate: "2.2%",
      holdingCost: "$182k",
    }),
    []
  );

  // Handle export report
  const handleExportReport = async () => {
    try {
      setIsLoading(true);
      showInfo("Generating report...");

      // For now, create a demo CSV export
      const csvContent = `Dashboard Report,${new Date().toLocaleDateString()}
Active Stores,${kpis.stores}
Service Level,${kpis.serviceLevel}
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

  // Handle refresh data
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

  // Handle view details for at-risk items
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

  // Handle view details for purchase orders
  const handleViewPO = (poNumber: string) => {
    showInfo(`Viewing purchase order ${poNumber}`);
    navigate("/purchase-orders", {
      state: {
        search: poNumber,
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live view of demand, replenishment, and inventory health across all stores."
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleExportReport}
              isLoading={isLoading}
              loadingText="Exporting..."
            >
              Export Report
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleRefreshData}
              isLoading={isRefreshing}
              loadingText="Refreshing..."
            >
              Refresh Data
            </Button>
          </HStack>
        }
      />

      {/* Summary KPIs */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Active Stores
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {kpis.stores}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                Total locations
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Service Level
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {kpis.serviceLevel}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.300">
                <StatArrow type="increase" /> Target 98%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Stockout Rate
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {kpis.stockoutRate}
              </StatNumber>
              <StatHelpText fontSize="xs" color="red.300">
                <StatArrow type="decrease" /> Last 7 days
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="gray.800"
          border="none"
          outline="none"
          _hover={{ transform: "translateY(-2px)" }}
          transition="200ms"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.200" fontSize="sm" fontWeight="medium">
                Holding Cost
              </StatLabel>
              <StatNumber color="brand.400" fontSize="2xl" fontWeight="bold">
                {kpis.holdingCost}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.400">
                On-hand total
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        <SectionCard title="At-Risk Items (Stockout Risk)">
          <DataTable
            head={
              <Tr>
                <Th>SKU</Th>
                <Th>Store</Th>
                <Th isNumeric>Days Cover</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            }
          >
            {[
              { sku: "TEE-Black-S", store: "Downtown", days: 1.4 },
              { sku: "JKT-Navy-M", store: "Longueuil", days: 1.8 },
            ].map((r) => (
              <Tr key={`${r.sku}-${r.store}`} _odd={{ bg: "gray.850" }}>
                <Td fontWeight="medium">{r.sku}</Td>
                <Td>{r.store}</Td>
                <Td isNumeric fontWeight="semibold">
                  {r.days.toFixed(1)}
                </Td>
                <Td>
                  <Badge colorScheme="error" variant="solid">
                    High Risk
                  </Badge>
                </Td>
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

        <SectionCard title="Open Purchase Orders">
          <DataTable
            head={
              <Tr>
                <Th>PO Number</Th>
                <Th>Supplier</Th>
                <Th>ETA</Th>
                <Th>Status</Th>
                <Th isNumeric>Lines</Th>
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
              <Tr key={r.po} _odd={{ bg: "gray.850" }}>
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
              </Tr>
            ))}
          </DataTable>
        </SectionCard>
      </SimpleGrid>
    </>
  );
}
