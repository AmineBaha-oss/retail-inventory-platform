import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Icon,
  Divider,
  VStack,
  Badge,
} from "@chakra-ui/react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  badge?: {
    text: string;
    colorScheme: string;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  badge,
}) => {
  return (
    <Box mb={8}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <HStack spacing={2} mb={4} fontSize="sm" color="gray.400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <Text
                as={crumb.href ? "a" : "span"}
                color={crumb.href ? "brand.400" : "gray.400"}
                _hover={crumb.href ? { color: "brand.300" } : {}}
                cursor={crumb.href ? "pointer" : "default"}
                {...(crumb.href && { href: crumb.href })}
              >
                {crumb.label}
              </Text>
              {index < breadcrumbs.length - 1 && (
                <Text color="gray.600">/</Text>
              )}
            </React.Fragment>
          ))}
        </HStack>
      )}

      {/* Main Header */}
      <Flex justify="space-between" align="flex-start" mb={4}>
        <VStack align="flex-start" spacing={2}>
          <HStack spacing={3} align="center">
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              color="gray.100"
              lineHeight="shorter"
            >
              {title}
            </Heading>
            {badge && (
              <Badge
                colorScheme={badge.colorScheme}
                variant="subtle"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {badge.text}
              </Badge>
            )}
          </HStack>
          {subtitle && (
            <Text fontSize="lg" color="gray.400" fontWeight="normal" maxW="2xl">
              {subtitle}
            </Text>
          )}
        </VStack>

        {/* Actions */}
        {actions && <HStack spacing={3}>{actions}</HStack>}
      </Flex>

      <Divider borderColor="gray.700" />
    </Box>
  );
};

export default PageHeader;
