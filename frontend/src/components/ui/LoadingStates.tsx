import React from "react";
import {
  Box,
  Skeleton,
  SkeletonText,
  Spinner,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

// General loading spinner
export function LoadingSpinner({
  size = "lg",
  label = "Loading...",
}: {
  size?: string;
  label?: string;
}) {
  return (
    <VStack spacing={4} py={8}>
      <Spinner size={size} color="brand.500" thickness="3px" />
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
    </VStack>
  );
}

// Page-level loading skeleton
export function PageLoadingSkeleton() {
  return (
    <VStack spacing={6} align="stretch">
      {/* Header skeleton */}
      <Box>
        <Skeleton height="40px" width="300px" mb={2} />
        <Skeleton height="20px" width="500px" />
      </Box>

      {/* Stats cards skeleton */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Skeleton height="16px" width="100px" />
                <Skeleton height="32px" width="80px" />
                <Skeleton height="14px" width="120px" />
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Content skeleton */}
      <Card>
        <CardBody>
          <Skeleton height="24px" width="200px" mb={4} />
          <VStack spacing={3} align="stretch">
            {[...Array(5)].map((_, i) => (
              <HStack key={i} spacing={4}>
                <Skeleton height="20px" flex={1} />
                <Skeleton height="20px" width="100px" />
                <Skeleton height="20px" width="80px" />
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}

// Table loading skeleton
export function TableLoadingSkeleton({
  columns = 5,
  rows = 5,
  headers = [],
}: {
  columns?: number;
  rows?: number;
  headers?: string[];
}) {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          {headers.length > 0
            ? headers.map((header, i) => <Th key={i}>{header}</Th>)
            : [...Array(columns)].map((_, i) => (
                <Th key={i}>
                  <Skeleton height="16px" width="80px" />
                </Th>
              ))}
        </Tr>
      </Thead>
      <Tbody>
        {[...Array(rows)].map((_, i) => (
          <Tr key={i}>
            {[...Array(columns)].map((_, j) => (
              <Td key={j}>
                <Skeleton height="16px" width="100%" />
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

// Card content loading skeleton
export function CardLoadingSkeleton() {
  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Skeleton height="24px" width="60%" />
          <SkeletonText noOfLines={3} spacing={2} />
          <HStack spacing={4}>
            <Skeleton height="32px" width="100px" />
            <Skeleton height="32px" width="100px" />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

// Form loading skeleton
export function FormLoadingSkeleton() {
  return (
    <VStack spacing={6} align="stretch">
      {[...Array(4)].map((_, i) => (
        <Box key={i}>
          <Skeleton height="14px" width="100px" mb={2} />
          <Skeleton height="40px" width="100%" />
        </Box>
      ))}
      <HStack spacing={4} justify="end">
        <Skeleton height="40px" width="100px" />
        <Skeleton height="40px" width="100px" />
      </HStack>
    </VStack>
  );
}

// Chart loading skeleton
export function ChartLoadingSkeleton({
  height = "300px",
}: {
  height?: string;
}) {
  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Skeleton height="24px" width="200px" />
          <Box height={height} position="relative">
            <Skeleton height="100%" width="100%" />
            <VStack
              spacing={2}
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            >
              <Spinner size="lg" color="brand.500" />
              <Text fontSize="sm" color="gray.500">
                Loading chart data...
              </Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}

// Inline loading for buttons
export function InlineLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <HStack spacing={2}>
      <Spinner size="sm" />
      <Text fontSize="sm">{label}</Text>
    </HStack>
  );
}

// Dashboard specific loading
export function DashboardLoadingSkeleton() {
  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <Skeleton height="40px" width="300px" mb={2} />
        <Skeleton height="20px" width="600px" />
      </Box>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Skeleton height="16px" width="120px" />
                <Skeleton height="32px" width="80px" />
                <Skeleton height="14px" width="150px" />
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ChartLoadingSkeleton />
        <ChartLoadingSkeleton />
      </SimpleGrid>

      {/* Tables */}
      <Card>
        <CardBody>
          <Skeleton height="24px" width="200px" mb={4} />
          <TableLoadingSkeleton columns={6} rows={4} />
        </CardBody>
      </Card>
    </VStack>
  );
}

// Inventory page loading
export function InventoryLoadingSkeleton() {
  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Skeleton height="40px" width="400px" mb={2} />
        <Skeleton height="20px" width="700px" />
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {[...Array(4)].map((_, i) => (
          <CardLoadingSkeleton key={i} />
        ))}
      </SimpleGrid>

      {/* Filters */}
      <HStack spacing={4} wrap="wrap">
        <Skeleton height="40px" width="300px" />
        <Skeleton height="40px" width="150px" />
        <Skeleton height="40px" width="150px" />
        <Skeleton height="40px" width="100px" />
      </HStack>

      {/* Table */}
      <Card>
        <CardBody>
          <TableLoadingSkeleton
            headers={[
              "SKU",
              "Name",
              "Store",
              "Quantity",
              "Reorder Point",
              "Days Left",
              "Status",
              "Actions",
            ]}
            rows={8}
          />
        </CardBody>
      </Card>
    </VStack>
  );
}

export default LoadingSpinner;
