import { Box, Table, Thead, Tbody } from "@chakra-ui/react";

export default function DataTable({
  head,
  children,
  size = "md",
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <Box
      overflowX="auto"
      bg="transparent"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.800"
      _hover={{
        borderColor: "gray.700",
      }}
      transition="all 0.2s"
    >
      <Table size={size} variant="simple">
        <Thead position="sticky" top={0} zIndex={1}>
          {head}
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </Box>
  );
}
