import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Icon,
  useToast,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiGrid, FiMail, FiLock } from "react-icons/fi";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
      toast({
        title: "Success",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.950"
      background="linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
      backgroundAttachment="fixed"
      display="grid"
      placeItems="center"
      px={4}
      py={8}
    >
      <Card
        w="full"
        maxW="440px"
        border="1px solid"
        borderColor="gray.800"
        borderRadius="2xl"
        boxShadow="2xl"
        backdropFilter="blur(20px)"
        bg="rgba(15, 23, 42, 0.9)"
      >
        <CardBody p={10}>
          <VStack spacing={8} align="stretch">
            {/* Logo and Header */}
            <VStack spacing={4} textAlign="center">
              <Box
                w="16"
                h="16"
                borderRadius="2xl"
                bgGradient="linear(to-br, brand.500, brand.400)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="xl"
              >
                <Icon as={FiGrid} size={32} color="white" />
              </Box>

              <Box>
                <Heading
                  size="lg"
                  color="gray.50"
                  fontWeight="bold"
                  letterSpacing="tight"
                  mb={2}
                >
                  Welcome back
                </Heading>
                <Text color="gray.400" fontSize="md" lineHeight="1.5">
                  Sign in to your Retail Inventory account
                </Text>
              </Box>
            </VStack>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel color="gray.200" fontWeight="medium" mb={2}>
                    Email Address
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement color="gray.400">
                      <Icon as={FiMail} />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      _focus={{
                        borderColor: "brand.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.200" fontWeight="medium" mb={2}>
                    Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement color="gray.400">
                      <Icon as={FiLock} />
                    </InputLeftElement>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      _focus={{
                        borderColor: "brand.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  h="48px"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  fontWeight="semibold"
                  letterSpacing="wide"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                  }}
                >
                  Sign in
                </Button>
              </VStack>
            </form>

            {/* Demo Credentials */}
            <Box textAlign="center" p={4} bg="gray.800" borderRadius="md">
              <Text color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                🧪 Demo Credentials
              </Text>
              <Text color="gray.400" fontSize="xs" mb={1}>
                Email: admin@retail.com
              </Text>
              <Text color="gray.400" fontSize="xs">
                Password: password123
              </Text>
            </Box>

            {/* Footer */}
            <Box textAlign="center">
              <Text color="gray.500" fontSize="sm">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  color="brand.400"
                  fontSize="sm"
                  fontWeight="medium"
                  _hover={{ color: "brand.300" }}
                >
                  Contact your administrator
                </Button>
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
