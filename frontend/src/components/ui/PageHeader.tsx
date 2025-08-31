import React from "react";
import { Box, Heading, Text, HStack, Divider } from "@chakra-ui/react";

export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box mb={8}>
      <HStack
        justify="space-between"
        align={{ base: "start", md: "center" }}
        spacing={6}
        mb={4}
      >
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
        {actions && (
          <Box flexShrink={0}>
            {actions}
          </Box>
        )}
      </HStack>
      <Divider borderColor="gray.800" />
    </Box>
  );
}
