import React from "react";
import { Box, Heading, Text, HStack, Divider } from "@chakra-ui/react";

export default function PageHeader({
  title,
  subtitle,
  actions,
  icon,
  accentColor,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <Box mb={8}>
      <HStack
        justify="space-between"
        align={{ base: "start", md: "center" }}
        spacing={6}
        mb={4}
      >
        <HStack align="start" spacing={4}>
          {icon && (
            <Box
              aria-hidden
              display="grid"
              placeItems="center"
              w="42px"
              h="42px"
              borderRadius="full"
              bg={accentColor ? `${accentColor}22` : "gray.800"}
              border="1px solid"
              borderColor={accentColor ? `${accentColor}55` : "gray.700"}
              color={accentColor || "gray.300"}
              flexShrink={0}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Heading 
              size="lg" 
              color="gray.50"
              fontWeight="bold"
              letterSpacing="tight"
              mb={2}
            >
              {title}
            </Heading>
            {subtitle && (
              <Text 
                color="gray.400" 
                fontSize="md"
                lineHeight="1.5"
                maxW="2xl"
              >
                {subtitle}
              </Text>
            )}
          </Box>
        </HStack>
        {actions && (
          <Box flexShrink={0}>
            {actions}
          </Box>
        )}
      </HStack>
      <Divider borderColor="gray.800" />
      {accentColor && (
        <Box
          mt={2}
          h="2px"
          w="64px"
          borderRadius="full"
          bg={accentColor}
        />
      )}
    </Box>
  );
}
