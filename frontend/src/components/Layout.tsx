import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Divider,
  useToken,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiHome,
  FiTrendingUp,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUser,
  FiGrid,
  FiBell,
  FiMoon,
  FiGlobe,
  FiHelpCircle,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useOrganization } from "../contexts/OrganizationContext";

const SIDEBAR_W = 280;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuthStore();
  const { currentOrganization, canManageUsers } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: FiHome, path: "/" },
    { name: "Forecasting", icon: FiTrendingUp, path: "/forecasting" },
    { name: "Inventory", icon: FiPackage, path: "/inventory" },
    { name: "Purchase Orders", icon: FiShoppingCart, path: "/purchase-orders" },
    { name: "Suppliers", icon: FiUsers, path: "/suppliers" },
    { name: "Products", icon: FiGrid, path: "/products" },
    { name: "Stores", icon: FiHome, path: "/stores" },
    ...(canManageUsers
      ? [{ name: "Users", icon: FiUsers, path: "/organization/users" }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <VStack spacing={0} align="stretch" w="full" h="full">
      {/* Logo Section */}
      <Box
        px={6}
        py={6}
        bg="gray.900"
        borderBottom="1px solid"
        borderColor="gray.800"
      >
        <HStack spacing={4}>
          <Box
            w="12"
            h="12"
            borderRadius="xl"
            bgGradient="linear(to-br, brand.500, brand.400)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="lg"
          >
            <FiGrid size={20} color="white" />
          </Box>
          <Box>
            <Text
              fontWeight="bold"
              color="gray.50"
              fontSize="lg"
              letterSpacing="tight"
            >
              Retail Inventory
            </Text>
            <Text fontSize="xs" color="gray.400" letterSpacing="wide">
              Demand & Replenishment
            </Text>
          </Box>
        </HStack>

        {/* Organization Info */}
        {currentOrganization && (
          <Box mt={4} p={3} bg="gray.800" borderRadius="lg">
            <Text fontSize="sm" fontWeight="medium" color="gray.200">
              {currentOrganization.name}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {currentOrganization.status}
            </Text>
          </Box>
        )}
      </Box>

      {/* Navigation Menu */}
      <VStack align="stretch" spacing={1} px={4} py={6} flex="1" bg="gray.900">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              leftIcon={<Icon size={18} />}
              variant={isActive ? "solid" : "ghost"}
              colorScheme={isActive ? "brand" : "gray"}
              justifyContent="flex-start"
              h="52px"
              px={4}
              borderRadius="xl"
              fontSize="sm"
              fontWeight="medium"
              letterSpacing="wide"
              bg={isActive ? "brand.500" : "transparent"}
              color={isActive ? "white" : "gray.300"}
              _hover={{
                bg: isActive ? "brand.600" : "gray.800",
                color: isActive ? "white" : "gray.100",
                transform: isActive ? "none" : "translateX(4px)",
                boxShadow: isActive
                  ? "0 4px 12px rgba(0, 102, 204, 0.3)"
                  : "none",
              }}
              _active={{
                bg: isActive ? "brand.700" : "gray.700",
                transform: "none",
              }}
              transition="all 0.2s ease-in-out"
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
            >
              {item.name}
            </Button>
          );
        })}
      </VStack>

      {/* User Section */}
      <Box
        px={4}
        py={4}
        bg="gray.900"
        borderTop="1px solid"
        borderColor="gray.800"
      >
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            variant="ghost"
            w="full"
            h="auto"
            p={3}
            borderRadius="xl"
            _hover={{ bg: "gray.800" }}
          >
            <HStack spacing={3} w="full">
              <Avatar
                size="sm"
                name={user?.full_name || user?.username || "User"}
                bg="brand.500"
                color="white"
                fontSize="sm"
                fontWeight="bold"
              />
              <Box flex="1" textAlign="left">
                <Text fontSize="sm" fontWeight="medium" color="gray.100">
                  {user?.full_name || user?.username || "User"}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {user?.email || "user@example.com"}
                </Text>
              </Box>
            </HStack>
          </MenuButton>

          <MenuList
            bg="gray.800"
            border="1px solid"
            borderColor="gray.700"
            borderRadius="lg"
            boxShadow="xl"
            p={1} // use padding instead of MenuItem mx
            w="280px"
            overflow="hidden" // 🚫 clip hover/focus backgrounds
          >
            <MenuItem
              icon={<FiUser size={16} />}
              w="full"
              bg="gray.800"
              color="gray.100"
              borderRadius="md"
              px={3}
              py={2}
              _hover={{ bg: "gray.700", color: "white" }}
              _focus={{
                bg: "gray.700",
                color: "white",
                boxShadow: "none",
                outline: "none",
              }}
              onClick={() => navigate("/profile")}
            >
              Profile
            </MenuItem>

            <MenuItem
              icon={<FiSettings size={16} />}
              w="full"
              bg="gray.800"
              color="gray.100"
              borderRadius="md"
              px={3}
              py={2}
              _hover={{ bg: "gray.700", color: "white" }}
              _focus={{
                bg: "gray.700",
                color: "white",
                boxShadow: "none",
                outline: "none",
              }}
              onClick={() => navigate("/settings")}
            >
              Settings
            </MenuItem>

            <MenuDivider borderColor="gray.600" mx={0} />

            <MenuItem
              icon={<FiLogOut size={16} />}
              w="full"
              bg="gray.800"
              color="gray.100"
              borderRadius="md"
              px={3}
              py={2}
              _hover={{ bg: "gray.700", color: "white" }}
              _focus={{
                bg: "gray.700",
                color: "white",
                boxShadow: "none",
                outline: "none",
              }}
              onClick={handleLogout}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </VStack>
  );

  return (
    <Box minH="100vh" bg="gray.950">
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent bg="gray.900" border="none">
          <DrawerCloseButton color="gray.400" />
          <DrawerHeader borderBottom="1px solid" borderColor="gray.800" pb={4}>
            <HStack spacing={3}>
              <Box
                w="10"
                h="10"
                borderRadius="lg"
                bgGradient="linear(to-br, brand.500, brand.400)"
              />
              <Text fontWeight="bold" color="gray.50">
                Retail Inventory
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop Layout */}
      <Flex>
        {/* Sidebar */}
        <Box
          w={SIDEBAR_W}
          h="100vh"
          position="fixed"
          left={0}
          top={0}
          zIndex={10}
          display={{ base: "none", lg: "block" }}
        >
          <SidebarContent />
        </Box>

        {/* Main Content */}
        <Box
          ml={{ base: 0, lg: SIDEBAR_W }}
          w={{ base: "full", lg: `calc(100% - ${SIDEBAR_W}px)` }}
          minH="100vh"
        >
          {/* Top Bar */}
          <Box
            h="16"
            borderBottom="1px solid"
            borderColor="gray.800"
            px={6}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            position="sticky"
            top={0}
            zIndex={5}
            backdropFilter="blur(10px)"
            bg="rgba(15, 23, 42, 0.8)"
          >
            <HStack spacing={4}>
              <IconButton
                aria-label="Open menu"
                icon={<FiMenu size={20} />}
                variant="ghost"
                size="sm"
                display={{ base: "flex", lg: "none" }}
                onClick={onOpen}
                color="gray.400"
                _hover={{ bg: "gray.800", color: "gray.200" }}
              />
              <Text fontSize="lg" fontWeight="semibold" color="gray.100">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.name || "Dashboard"}
              </Text>
            </HStack>

            <HStack spacing={3}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiSettings size={16} />}
                color="gray.400"
                _hover={{ bg: "gray.800", color: "gray.200" }}
                onClick={() => navigate("/settings")}
              >
                Settings
              </Button>
            </HStack>
          </Box>

          {/* Page Content */}
          <Box p={8} maxW="7xl" mx="auto" minH="calc(100vh - 4rem)">
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
