import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Icon,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiArrowRight,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { useAuthStore } from "../stores/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const { login } = useAuthStore();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ email: "", password: "" });

    // Basic validation
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      setIsLoading(true);
      await login(demoEmail, demoPassword);
      toast({
        title: "Demo login successful",
        description: "Welcome to the demo!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Demo login failed",
        description: "Please try again or contact support.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bgGradient = useColorModeValue(
    "linear(to-br, gray.50, gray.100)",
    "linear(to-br, gray.900, gray.800)"
  );

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card
        maxW="md"
        w="full"
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="xl"
        borderRadius="2xl"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
      >
        <CardHeader textAlign="center" pb={4}>
          <VStack spacing={4}>
            <Box
              w="16"
              h="16"
              borderRadius="2xl"
              bgGradient="linear(to-br, brand.500, brand.400)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
            >
              <Icon as={FiGrid} boxSize={8} color="white" />
            </Box>
            <VStack spacing={2}>
              <Heading
                size="lg"
                color={useColorModeValue("gray.800", "gray.100")}
              >
                Welcome back
              </Heading>
              <Text
                color={useColorModeValue("gray.600", "gray.400")}
                fontSize="sm"
              >
                Sign in to your Retail Inventory account
              </Text>
            </VStack>
          </VStack>
        </CardHeader>

        <CardBody pt={0}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={useColorModeValue("gray.700", "gray.300")}
                >
                  Email Address
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiMail} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px rgba(0, 102, 204, 0.6)",
                    }}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={useColorModeValue("gray.700", "gray.300")}
                >
                  Password
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiLock} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px rgba(0, 102, 204, 0.6)",
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.400"
                      _hover={{ color: "gray.600" }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="lg"
                bg="brand.500"
                color="white"
                _hover={{
                  bg: "brand.600",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
                }}
                _active={{
                  bg: "brand.700",
                  transform: "translateY(0)",
                }}
                isLoading={isLoading}
                loadingText="Signing in..."
                rightIcon={<Icon as={FiArrowRight} />}
              >
                Sign in
              </Button>
            </VStack>
          </form>

          <Divider
            my={6}
            borderColor={useColorModeValue("gray.200", "gray.700")}
          />

          {/* Demo Credentials */}
          <VStack spacing={4}>
            <HStack>
              <Icon as={FiShield} color="success.500" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue("gray.700", "gray.300")}
              >
                Demo Credentials
              </Text>
            </HStack>

            <VStack spacing={3} w="full">
              <Button
                variant="outline"
                size="sm"
                w="full"
                onClick={() =>
                  handleDemoLogin("admin@retail.com", "password123")
                }
                isLoading={isLoading}
                leftIcon={<Icon as={FiUser} />}
                colorScheme="brand"
              >
                Admin Account
              </Button>

              <Button
                variant="outline"
                size="sm"
                w="full"
                onClick={() =>
                  handleDemoLogin("manager@modernboutique.com", "password123")
                }
                isLoading={isLoading}
                leftIcon={<Icon as={FiUser} />}
                colorScheme="brand"
              >
                Manager Account
              </Button>
            </VStack>

            <Text
              fontSize="xs"
              color={useColorModeValue("gray.500", "gray.400")}
              textAlign="center"
            >
              Don't have an account?{" "}
              <Link
                color="brand.500"
                href="#"
                _hover={{ textDecoration: "underline" }}
              >
                Contact your administrator
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
