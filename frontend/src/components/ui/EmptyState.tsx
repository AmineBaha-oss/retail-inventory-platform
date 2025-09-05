import { Center, VStack, Heading, Text, Box, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";

export default function EmptyState({
  title,
  description,
  action,
  icon,
  iconColor = "gray.400",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: IconType;
  iconColor?: string;
}) {
  return (
    <Center py={20} px={6}>
      <VStack spacing={6} textAlign="center" maxW="md">
        {icon && (
          <Box
            p={4}
            borderRadius="full"
            bg="gray.800"
            color={iconColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Icon as={icon} size={32} />
          </Box>
        )}
        
        <VStack spacing={3}>
          <Heading 
            size="lg" 
            color="gray.50"
            fontWeight="semibold"
            letterSpacing="tight"
          >
            {title}
          </Heading>
          {description && (
            <Text 
              color="gray.400" 
              fontSize="md"
              lineHeight="1.6"
            >
              {description}
            </Text>
          )}
        </VStack>

        {action && (
          <Box pt={2}>
            {action}
          </Box>
        )}
      </VStack>
    </Center>
  );
}
