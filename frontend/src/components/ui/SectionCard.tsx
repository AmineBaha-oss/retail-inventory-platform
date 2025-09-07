import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  HStack,
  VStack,
  Box,
  Divider,
  Badge,
  Icon,
  Flex,
} from "@chakra-ui/react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: {
    text: string;
    colorScheme: string;
  };
  icon?: React.ElementType;
  isLoading?: boolean;
  minH?: string;
  maxH?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  footer,
  badge,
  icon: IconComponent,
  isLoading = false,
  minH,
  maxH,
}) => {
  return (
    <Card
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="xl"
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      minH={minH}
      maxH={maxH}
      overflow="hidden"
    >
      {(title || actions) && (
        <CardHeader pb={4}>
          <Flex justify="space-between" align="flex-start">
            <HStack spacing={3} align="flex-start">
              {IconComponent && (
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="brand.500"
                  color="white"
                  opacity={0.9}
                >
                  <Icon as={IconComponent} boxSize={5} />
                </Box>
              )}
              <VStack align="flex-start" spacing={1}>
                <HStack spacing={2} align="center">
                  <Heading
                    as="h3"
                    size="lg"
                    fontWeight="semibold"
                    color="gray.100"
                  >
                    {title}
                  </Heading>
                  {badge && (
                    <Badge
                      colorScheme={badge.colorScheme}
                      variant="subtle"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {badge.text}
                    </Badge>
                  )}
                </HStack>
                {subtitle && (
                  <Text fontSize="sm" color="gray.400">
                    {subtitle}
                  </Text>
                )}
              </VStack>
            </HStack>
            {actions && <HStack spacing={2}>{actions}</HStack>}
          </Flex>
        </CardHeader>
      )}

      <CardBody pt={title ? 0 : 6} pb={footer ? 0 : 6}>
        {isLoading ? (
          <VStack spacing={4} align="center" py={8}>
            <Box
              w={8}
              h={8}
              borderRadius="full"
              border="2px solid"
              borderColor="brand.500"
              borderTopColor="transparent"
              animation="spin 1s linear infinite"
            />
            <Text color="gray.400" fontSize="sm">
              Loading...
            </Text>
          </VStack>
        ) : (
          children
        )}
      </CardBody>

      {footer && (
        <>
          <Divider borderColor="gray.700" />
          <CardFooter pt={4}>{footer}</CardFooter>
        </>
      )}
    </Card>
  );
};

export default SectionCard;
