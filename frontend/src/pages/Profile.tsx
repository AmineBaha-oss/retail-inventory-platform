import React, { useState } from "react";
import {
  Box,
  SimpleGrid,
  HStack,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Textarea,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import {
  FiEdit3,
  FiSave,
  FiLock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiKey,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import { showSuccess, showError, showInfo } from "../utils/helpers";
import { useAuthStore } from "../stores/authStore";

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();

  // Profile state
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "John Doe",
    username: user?.username || "johndoe",
    email: user?.email || "john.doe@company.com",
    phone: "+1 (514) 555-0123",
    role: user?.roles?.[0] || "CUSTOMER_USER",
    department: "Procurement",
    location: "Montreal, QC",
    bio: "Experienced procurement specialist with expertise in retail inventory management and supplier relationships.",
    timezone: "America/Toronto",
    language: "en",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle profile change
  const handleProfileChange = (key: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      showInfo("Saving profile changes...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user in auth store
      if (setUser) {
        setUser({
          ...user!,
          full_name: profile.full_name,
          username: profile.username,
          email: profile.email,
        });
      }

      showSuccess("Profile updated successfully!");
    } catch (error) {
      showError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      setIsLoading(true);

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        showError("New password must be at least 8 characters long");
        return;
      }

      showInfo("Changing password...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsPasswordModalOpen(false);
      showSuccess("Password changed successfully!");
    } catch (error) {
      showError("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      showInfo("Uploading avatar...");

      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);

      showSuccess("Avatar uploaded successfully!");
    } catch (error) {
      showError("Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Manage your account information, preferences, and security settings."
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiLock />}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiSave />}
              onClick={handleSaveProfile}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </HStack>
        }
      />

      {/* Profile Header */}
      <Card bg="gray.800" border="none" outline="none" mb={6}>
        <CardBody p={6}>
          <HStack spacing={6} align="start">
            <Box position="relative">
              <Avatar
                size="2xl"
                src={profile.avatar}
                name={profile.full_name}
                bg="brand.500"
                color="white"
                fontSize="2xl"
                fontWeight="bold"
              />
              <Box
                position="absolute"
                bottom={2}
                right={2}
                bg="brand.500"
                borderRadius="full"
                p={2}
                cursor="pointer"
                _hover={{ bg: "brand.600" }}
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <FiEdit3 size={16} color="white" />
              </Box>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
            </Box>

            <VStack align="start" spacing={3} flex="1">
              <Heading size="lg" color="white">
                {profile.full_name}
              </Heading>
              <Text color="gray.300" fontSize="lg">
                {profile.department} • {profile.location}
              </Text>
              <HStack spacing={4}>
                <Badge colorScheme="brand" variant="solid" px={3} py={1}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  Active
                </Badge>
              </HStack>
              <Text color="gray.400" fontSize="sm">
                Member since {new Date().getFullYear()}
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Profile Tabs */}
      <Tabs
        index={["profile", "preferences", "security"].indexOf(activeTab)}
        onChange={(index) => {
          const tabs = ["profile", "preferences", "security"];
          setActiveTab(tabs[index]);
        }}
        mb={6}
      >
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <FiUser />
              <Text>Profile Information</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FiMail />
              <Text>Preferences</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <FiShield />
              <Text>Security</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Profile Information */}
          <TabPanel p={0}>
            <SectionCard title="Personal Information">
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={profile.full_name}
                      onChange={(e) =>
                        handleProfileChange("full_name", e.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={profile.username}
                      onChange={(e) =>
                        handleProfileChange("username", e.target.value)
                      }
                      placeholder="Enter username"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={profile.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Department</FormLabel>
                    <Select
                      value={profile.department}
                      onChange={(e) =>
                        handleProfileChange("department", e.target.value)
                      }
                    >
                      <option value="Procurement">Procurement</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="IT">IT</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={profile.location}
                      onChange={(e) =>
                        handleProfileChange("location", e.target.value)
                      }
                      placeholder="Enter your location"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                  <FormHelperText>
                    Brief description of your role and expertise
                  </FormHelperText>
                </FormControl>
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* Preferences */}
          <TabPanel p={0}>
            <SectionCard title="Account Preferences">
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      value={profile.timezone}
                      onChange={(e) =>
                        handleProfileChange("timezone", e.target.value)
                      }
                    >
                      <option value="America/Toronto">
                        Eastern Time (Toronto)
                      </option>
                      <option value="America/New_York">
                        Eastern Time (New York)
                      </option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select
                      value={profile.language}
                      onChange={(e) =>
                        handleProfileChange("language", e.target.value)
                      }
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>Preferences</AlertTitle>
                  <AlertDescription>
                    These settings affect how the application displays
                    information and communicates with you.
                  </AlertDescription>
                </Alert>
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* Security */}
          <TabPanel p={0}>
            <SectionCard title="Security Settings">
              <VStack spacing={6} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    Keep your account secure by using a strong password and
                    enabling two-factor authentication if available.
                  </AlertDescription>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Last Login</FormLabel>
                    <Input
                      value={new Date().toLocaleString()}
                      isReadOnly
                      bg="gray.700"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Account Status</FormLabel>
                    <Input value="Active" isReadOnly bg="gray.700" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Two-Factor Auth</FormLabel>
                    <Input value="Not Enabled" isReadOnly bg="gray.700" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Session Timeout</FormLabel>
                    <Input value="30 minutes" isReadOnly bg="gray.700" />
                  </FormControl>
                </SimpleGrid>

                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiKey />}
                    colorScheme="brand"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </Button>
                  <Button leftIcon={<FiShield />} variant="outline">
                    Enable 2FA
                  </Button>
                </HStack>
              </VStack>
            </SectionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="gray.100">Change Password</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.200">Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.400"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.200">New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                      icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      color="gray.400"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText color="gray.400">
                  Minimum 8 characters
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.200">Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      color="gray.400"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handlePasswordChange}
              isLoading={isLoading}
              loadingText="Changing..."
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
