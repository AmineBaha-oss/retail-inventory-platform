import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Spinner,
  Center,
  Icon,
} from "@chakra-ui/react";
import { FiSearch, FiMoreVertical, FiFilter } from "react-icons/fi";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    onFilter?: (value: string) => void;
  }>;
  actions?: (row: any) => React.ReactNode;
  emptyMessage?: string;
  maxH?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  filters = [],
  actions,
  emptyMessage = "No data available",
  maxH = "400px",
}) => {
  const renderCell = (column: Column, row: any) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return (
      <Text
        fontSize="sm"
        color="gray.300"
        noOfLines={1}
        textAlign={column.align || "left"}
      >
        {value || "-"}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="lg" color="brand.500" />
          <Text color="gray.400">Loading data...</Text>
        </VStack>
      </Center>
    );
  }

  if (data.length === 0) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Text color="gray.400" fontSize="lg">
            {emptyMessage}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      {(searchable || filters.length > 0) && (
        <Flex gap={4} mb={6} flexWrap="wrap" align="center">
          {searchable && (
            <InputGroup maxW="300px">
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                bg="gray.700"
                borderColor="gray.600"
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px rgba(0, 102, 204, 0.6)",
                }}
              />
            </InputGroup>
          )}

          {filters.map((filter) => (
            <Select
              key={filter.key}
              placeholder={filter.label}
              onChange={(e) => filter.onFilter?.(e.target.value)}
              bg="gray.700"
              borderColor="gray.600"
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px rgba(0, 102, 204, 0.6)",
              }}
              minW="150px"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ))}
        </Flex>
      )}

      {/* Table */}
      <TableContainer
        maxH={maxH}
        overflowY="auto"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.700"
        bg="gray.800"
      >
        <Table variant="simple" size="md">
          <Thead position="sticky" top={0} zIndex={1} bg="gray.800">
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.key}
                  color="gray.300"
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  py={4}
                  px={6}
                  textAlign={column.align || "left"}
                  borderColor="gray.700"
                  width={column.width}
                >
                  {column.label}
                </Th>
              ))}
              {actions && (
                <Th
                  color="gray.300"
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  py={4}
                  px={6}
                  textAlign="center"
                  borderColor="gray.700"
                  width="80px"
                >
                  Actions
                </Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, index) => (
              <Tr
                key={index}
                _hover={{
                  bg: "gray.750",
                }}
                transition="background-color 0.2s"
              >
                {columns.map((column) => (
                  <Td
                    key={column.key}
                    py={4}
                    px={6}
                    borderColor="gray.700"
                    textAlign={column.align || "left"}
                  >
                    {renderCell(column, row)}
                  </Td>
                ))}
                {actions && (
                  <Td py={4} px={6} borderColor="gray.700" textAlign="center">
                    {actions(row)}
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataTable;
