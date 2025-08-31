import { Card, CardHeader, CardBody, Heading, HStack, Box } from "@chakra-ui/react";

export default function SectionCard({
  title,
  action,
  children,
  padding = 6,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  padding?: number;
}) {
  return (
    <Card
      bg="gray.900"
      border="1px solid"
      borderColor="gray.800"
      borderRadius="xl"
      boxShadow="sm"
      _hover={{
        borderColor: "gray.700",
        boxShadow: "md",
      }}
      transition="all 0.2s"
    >
      <CardHeader
        pb={4}
        bg="transparent"
        borderBottom="1px solid"
        borderColor="gray.800"
      >
        <HStack justify="space-between" align="center">
          <Heading 
            size="md" 
            color="gray.50"
            fontWeight="semibold"
            letterSpacing="tight"
          >
            {title}
          </Heading>
          {action && (
            <Box flexShrink={0}>
              {action}
            </Box>
          )}
        </HStack>
      </CardHeader>
      <CardBody
        p={padding}
        bg="transparent"
        color="gray.200"
      >
        {children}
      </CardBody>
    </Card>
  );
}
