import React from "react";
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  Icon,
  Box,
  Text,
  Flex,
  Badge,
} from "@chakra-ui/react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon?: React.ElementType;
  iconColor?: string;
  bgColor?: string;
  description?: string;
  status?: "success" | "warning" | "error" | "info";
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = "increase",
  icon: IconComponent,
  iconColor = "brand.500",
  bgColor = "gray.800",
  description,
  status = "info",
  isLoading = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "success.500";
      case "warning":
        return "warning.500";
      case "error":
        return "error.500";
      default:
        return "brand.500";
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "brand";
    }
  };

  return (
    <Card
      bg={bgColor}
      border="1px solid"
      borderColor="gray.700"
      borderRadius="xl"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      _hover={{
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        transform: "translateY(-2px)",
        transition: "all 0.2s ease-in-out",
      }}
      transition="all 0.2s ease-in-out"
    >
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={1}
            >
              {title}
            </Text>
            <Stat>
              <StatNumber
                fontSize="3xl"
                fontWeight="bold"
                color="gray.100"
                lineHeight="shorter"
              >
                {isLoading ? "..." : value}
              </StatNumber>
              {change !== undefined && (
                <StatHelpText mb={0} mt={2}>
                  <HStack spacing={1}>
                    <StatArrow type={changeType} />
                    <Text
                      fontSize="sm"
                      color={
                        changeType === "increase" ? "success.400" : "error.400"
                      }
                      fontWeight="medium"
                    >
                      {Math.abs(change)}%
                    </Text>
                  </HStack>
                </StatHelpText>
              )}
            </Stat>
          </Box>
          {IconComponent && (
            <Box
              p={3}
              borderRadius="xl"
              bg={`${iconColor}.100`}
              color={iconColor}
              opacity={0.8}
            >
              <Icon as={IconComponent} boxSize={6} />
            </Box>
          )}
        </Flex>

        {description && (
          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              {description}
            </Text>
            <Badge
              colorScheme={getStatusBadgeColor()}
              variant="subtle"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="md"
            >
              {status.toUpperCase()}
            </Badge>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default StatCard;
