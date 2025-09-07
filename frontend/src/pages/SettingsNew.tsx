import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Icon,
  Flex,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiUser,
  FiBell,
  FiShield,
  FiDatabase,
  FiGlobe,
  FiMail,
  FiLock,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    // User Preferences
    theme: "dark",
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",

    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    lowStockAlerts: true,
    orderUpdates: true,

    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,

    // Data & Privacy
    dataRetention: 365,
    analyticsTracking: true,
    errorReporting: true,

    // System
    autoRefresh: true,
    refreshInterval: 5,
    maxFileSize: 10,
  });

  const toast = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save settings. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    toast({
      title: "Reset settings",
      description: "Settings have been reset to default values",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        subtitle="Manage your application preferences, security settings, and system configuration"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              leftIcon={<Icon as={FiSave} />}
              onClick={handleSave}
              isLoading={isLoading}
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 102, 204, 0.4)",
              }}
            >
              Save Changes
            </Button>
          </HStack>
        }
      />

      {/* Settings Sections */}
      <VStack spacing={6} align="stretch">
        {/* User Preferences */}
        <SectionCard
          title="User Preferences"
          subtitle="Customize your personal experience"
          icon={FiUser}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Theme</FormLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                bg="gray.700"
                borderColor="gray.600"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Language</FormLabel>
              <Select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
                bg="gray.700"
                borderColor="gray.600"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Timezone</FormLabel>
              <Select
                value={settings.timezone}
                onChange={(e) =>
                  handleSettingChange("timezone", e.target.value)
                }
                bg="gray.700"
                borderColor="gray.600"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Date Format</FormLabel>
              <Select
                value={settings.dateFormat}
                onChange={(e) =>
                  handleSettingChange("dateFormat", e.target.value)
                }
                bg="gray.700"
                borderColor="gray.600"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </FormControl>
          </VStack>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          title="Notifications"
          subtitle="Configure how you receive alerts and updates"
          icon={FiBell}
        >
          <VStack spacing={4} align="stretch">
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Email Notifications</FormLabel>
              <Switch
                isChecked={settings.emailNotifications}
                onChange={(e) =>
                  handleSettingChange("emailNotifications", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>

            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Push Notifications</FormLabel>
              <Switch
                isChecked={settings.pushNotifications}
                onChange={(e) =>
                  handleSettingChange("pushNotifications", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>

            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Low Stock Alerts</FormLabel>
              <Switch
                isChecked={settings.lowStockAlerts}
                onChange={(e) =>
                  handleSettingChange("lowStockAlerts", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>

            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Order Updates</FormLabel>
              <Switch
                isChecked={settings.orderUpdates}
                onChange={(e) =>
                  handleSettingChange("orderUpdates", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>
          </VStack>
        </SectionCard>

        {/* Security */}
        <SectionCard
          title="Security"
          subtitle="Manage your account security and privacy settings"
          icon={FiShield}
        >
          <VStack spacing={4} align="stretch">
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Two-Factor Authentication</FormLabel>
              <Switch
                isChecked={settings.twoFactorAuth}
                onChange={(e) =>
                  handleSettingChange("twoFactorAuth", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Session Timeout (minutes)</FormLabel>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    "sessionTimeout",
                    parseInt(e.target.value)
                  )
                }
                bg="gray.700"
                borderColor="gray.600"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password Expiry (days)</FormLabel>
              <Input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) =>
                  handleSettingChange(
                    "passwordExpiry",
                    parseInt(e.target.value)
                  )
                }
                bg="gray.700"
                borderColor="gray.600"
              />
            </FormControl>
          </VStack>
        </SectionCard>

        {/* Data & Privacy */}
        <SectionCard
          title="Data & Privacy"
          subtitle="Control how your data is collected and used"
          icon={FiDatabase}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Data Retention Period (days)</FormLabel>
              <Input
                type="number"
                value={settings.dataRetention}
                onChange={(e) =>
                  handleSettingChange("dataRetention", parseInt(e.target.value))
                }
                bg="gray.700"
                borderColor="gray.600"
              />
            </FormControl>

            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Analytics Tracking</FormLabel>
              <Switch
                isChecked={settings.analyticsTracking}
                onChange={(e) =>
                  handleSettingChange("analyticsTracking", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>

            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Error Reporting</FormLabel>
              <Switch
                isChecked={settings.errorReporting}
                onChange={(e) =>
                  handleSettingChange("errorReporting", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>
          </VStack>
        </SectionCard>

        {/* System */}
        <SectionCard
          title="System"
          subtitle="Configure system behavior and performance"
          icon={FiSettings}
        >
          <VStack spacing={4} align="stretch">
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel mb="0">Auto Refresh</FormLabel>
              <Switch
                isChecked={settings.autoRefresh}
                onChange={(e) =>
                  handleSettingChange("autoRefresh", e.target.checked)
                }
                colorScheme="brand"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Refresh Interval (seconds)</FormLabel>
              <Input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) =>
                  handleSettingChange(
                    "refreshInterval",
                    parseInt(e.target.value)
                  )
                }
                bg="gray.700"
                borderColor="gray.600"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Max File Upload Size (MB)</FormLabel>
              <Input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) =>
                  handleSettingChange("maxFileSize", parseInt(e.target.value))
                }
                bg="gray.700"
                borderColor="gray.600"
              />
            </FormControl>
          </VStack>
        </SectionCard>
      </VStack>
    </VStack>
  );
}
