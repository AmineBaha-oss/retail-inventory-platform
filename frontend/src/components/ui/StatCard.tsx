import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  Box,
  Icon,
  Text,
} from "@chakra-ui/react";
import { IconType } from "react-icons";

export default function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  colorScheme = "brand",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: "increase" | "decrease";
  icon?: IconType;
  colorScheme?: "brand" | "success" | "warning" | "error" | "info";
}) {
  const getColorScheme = () => {
    switch (colorScheme) {
      case "success":
        return "success.500";
      case "warning":
        return "warning.500";
      case "error":
        return "error.500";
      case "info":
        return "brand.500";
      default:
        return "brand.500";
    }
  };

  const getTrendColor = () => {
    if (trend === "increase") return "success.500";
    if (trend === "decrease") return "error.500";
    return "gray.500";
  };

  return (
    <Card
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "xl",
      }}
      transition="all 0.3s ease"
      cursor="pointer"
      minH="120px"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.700"
    >
      <CardBody p={6}>
        <HStack spacing={4} align="flex-start" h="full">
          {icon && (
            <Box
              p={3}
              borderRadius="xl"
              bg={`${colorScheme}.100`}
              color={getColorScheme()}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={icon} size={20} />
            </Box>
          )}
          <Box flex="1" minW="0">
            <Stat>
              <StatLabel
                color="gray.400"
                fontSize="sm"
                fontWeight="medium"
                textTransform="none"
                letterSpacing="wide"
                mb={2}
                noOfLines={1}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {label}
              </StatLabel>
              <StatNumber
                color="gray.50"
                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                fontWeight="bold"
                lineHeight="1"
                mb={2}
                noOfLines={1}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {value}
              </StatNumber>
              {hint && (
                <StatHelpText
                  fontSize="xs"
                  color="gray.500"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  noOfLines={2}
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {trend && <StatArrow type={trend} color={getTrendColor()} />}
                  <Text
                    as="span"
                    noOfLines={1}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    fontSize="xs"
                  >
                    {hint}
                  </Text>
                </StatHelpText>
              )}
            </Stat>
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
}
