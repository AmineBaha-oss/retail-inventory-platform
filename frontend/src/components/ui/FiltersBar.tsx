import { Stack, Box, Divider } from "@chakra-ui/react";

export default function FiltersBar({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Box mb={6}>
      {title && (
        <Box mb={4}>
          <Box
            fontSize="sm"
            fontWeight="medium"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wide"
            mb={2}
          >
            {title}
          </Box>
          <Divider borderColor="gray.800" />
        </Box>
      )}
      
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={4}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        p={4}
        bg="gray.900"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.800"
        _hover={{
          borderColor: "gray.700",
        }}
        transition="all 0.2s"
      >
        {children}
      </Stack>
    </Box>
  );
}
