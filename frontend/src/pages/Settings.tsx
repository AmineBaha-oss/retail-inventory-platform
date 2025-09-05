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
  Switch,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FiSave,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiShield,
  FiBell,
  FiDatabase,
  FiGlobe,
  FiUser,
  FiLock,
  FiMonitor,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import { showSuccess, showError, showInfo } from "../utils/helpers";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const toast = useToast();

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Retail Inventory Platform",
    timezone: "America/Toronto",
    currency: "CAD",
    language: "en",
    dateFormat: "MM/DD/YYYY",

    // Notification Settings
    emailNotifications: true,
    lowStockAlerts: true,
    poApprovalAlerts: true,
    forecastAlerts: true,
    alertFrequency: "daily",

    // System Settings
    autoSync: true,
    syncInterval: 15,
    dataRetention: 365,
    backupEnabled: true,
    backupFrequency: "weekly",

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,

    // Integration Settings
    posSync: true,
    supplierApi: true,
    analyticsEnabled: true,
    webhookEnabled: false,
  });

  // Handle setting change
  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      showInfo("Saving settings...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess("Settings saved successfully!");
    } catch (error) {
      showError("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset settings
  const handleResetSettings = async () => {
    try {
      setIsLoading(true);
      showInfo("Resetting settings to defaults...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess("Settings reset to defaults!");
    } catch (error) {
      showError("Failed to reset settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export settings
  const handleExportSettings = async () => {
    try {
      setIsLoading(true);
      showInfo("Exporting settings...");

      // Create JSON file
      const settingsData = JSON.stringify(settings, null, 2);
      const blob = new Blob([settingsData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `settings-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("Settings exported successfully!");
    } catch (error) {
      showError("Failed to export settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure application preferences, notifications, and system settings."
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleResetSettings}
              isLoading={isLoading}
              loadingText="Resetting..."
            >
              Reset to Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleExportSettings}
              isLoading={isLoading}
              loadingText="Exporting..."
            >
              Export Settings
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              leftIcon={<FiSave />}
              onClick={handleSaveSettings}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </HStack>
        }
      />

      {/* Settings Tabs */}
      <Tabs
        index={[
          "general",
          "notifications",
          "system",
          "security",
          "integrations",
        ].indexOf(activeTab)}
        onChange={(index) => {
          const tabs = [
            "general",
            "notifications",
            "system",
            "security",
            "integrations",
          ];
          setActiveTab(tabs[index]);
        }}
        mb={6}
      >
        <TabList>
          <Tab><HStack spacing={2}><FiUser /><Text>General</Text></HStack></Tab>
          <Tab><HStack spacing={2}><FiBell /><Text>Notifications</Text></HStack></Tab>
          <Tab><HStack spacing={2}><FiMonitor /><Text>System</Text></HStack></Tab>
          <Tab><HStack spacing={2}><FiShield /><Text>Security</Text></HStack></Tab>
          <Tab><HStack spacing={2}><FiGlobe /><Text>Integrations</Text></HStack></Tab>
        </TabList>

        <TabPanels>
          {/* General Settings */}
          <TabPanel p={0}>
            <SectionCard title="General Settings">
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      value={settings.companyName}
                      onChange={(e) =>
                        handleSettingChange("companyName", e.target.value)
                      }
                      placeholder="Enter company name"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleSettingChange("timezone", e.target.value)
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
                    <FormLabel>Currency</FormLabel>
                    <Select
                      value={settings.currency}
                      onChange={(e) =>
                        handleSettingChange("currency", e.target.value)
                      }
                    >
                      <option value="CAD">Canadian Dollar (CAD)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) =>
                        handleSettingChange("language", e.target.value)
                      }
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* Notification Settings */}
          <TabPanel p={0}>
            <SectionCard title="Notification Preferences">
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Email Notifications</FormLabel>
                    <Switch
                      isChecked={settings.emailNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Low Stock Alerts</FormLabel>
                    <Switch
                      isChecked={settings.lowStockAlerts}
                      onChange={(e) =>
                        handleSettingChange("lowStockAlerts", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">PO Approval Alerts</FormLabel>
                    <Switch
                      isChecked={settings.poApprovalAlerts}
                      onChange={(e) =>
                        handleSettingChange(
                          "poApprovalAlerts",
                          e.target.checked
                        )
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Forecast Alerts</FormLabel>
                    <Switch
                      isChecked={settings.forecastAlerts}
                      onChange={(e) =>
                        handleSettingChange("forecastAlerts", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Alert Frequency</FormLabel>
                  <Select
                    value={settings.alertFrequency}
                    onChange={(e) =>
                      handleSettingChange("alertFrequency", e.target.value)
                    }
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </Select>
                  <FormHelperText>
                    How often to send notification summaries
                  </FormHelperText>
                </FormControl>
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* System Settings */}
          <TabPanel p={0}>
            <SectionCard title="System Configuration">
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Auto Sync</FormLabel>
                    <Switch
                      isChecked={settings.autoSync}
                      onChange={(e) =>
                        handleSettingChange("autoSync", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Backup Enabled</FormLabel>
                    <Switch
                      isChecked={settings.backupEnabled}
                      onChange={(e) =>
                        handleSettingChange("backupEnabled", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Sync Interval (minutes)</FormLabel>
                    <NumberInput
                      value={settings.syncInterval}
                      onChange={(_, value) =>
                        handleSettingChange("syncInterval", value)
                      }
                      min={1}
                      max={60}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Data Retention (days)</FormLabel>
                    <NumberInput
                      value={settings.dataRetention}
                      onChange={(_, value) =>
                        handleSettingChange("dataRetention", value)
                      }
                      min={30}
                      max={1095}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Backup Frequency</FormLabel>
                  <Select
                    value={settings.backupFrequency}
                    onChange={(e) =>
                      handleSettingChange("backupFrequency", e.target.value)
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormControl>
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* Security Settings */}
          <TabPanel p={0}>
            <SectionCard title="Security Configuration">
              <VStack spacing={6} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Security Notice</AlertTitle>
                    <AlertDescription>
                      These settings affect the security of your account and
                      data. Changes may require re-authentication.
                    </AlertDescription>
                  </Box>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl display="flex" alignItems="center">
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
                    <NumberInput
                      value={settings.sessionTimeout}
                      onChange={(_, value) =>
                        handleSettingChange("sessionTimeout", value)
                      }
                      min={15}
                      max={480}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Password Expiry (days)</FormLabel>
                    <NumberInput
                      value={settings.passwordExpiry}
                      onChange={(_, value) =>
                        handleSettingChange("passwordExpiry", value)
                      }
                      min={30}
                      max={365}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Max Login Attempts</FormLabel>
                    <NumberInput
                      value={settings.loginAttempts}
                      onChange={(_, value) =>
                        handleSettingChange("loginAttempts", value)
                      }
                      min={3}
                      max={10}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* Integration Settings */}
          <TabPanel p={0}>
            <SectionCard title="External Integrations">
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">POS System Sync</FormLabel>
                    <Switch
                      isChecked={settings.posSync}
                      onChange={(e) =>
                        handleSettingChange("posSync", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Supplier API Integration</FormLabel>
                    <Switch
                      isChecked={settings.supplierApi}
                      onChange={(e) =>
                        handleSettingChange("supplierApi", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Analytics & Reporting</FormLabel>
                    <Switch
                      isChecked={settings.analyticsEnabled}
                      onChange={(e) =>
                        handleSettingChange(
                          "analyticsEnabled",
                          e.target.checked
                        )
                      }
                      colorScheme="brand"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Webhook Notifications</FormLabel>
                    <Switch
                      isChecked={settings.webhookEnabled}
                      onChange={(e) =>
                        handleSettingChange("webhookEnabled", e.target.checked)
                      }
                      colorScheme="brand"
                    />
                  </FormControl>
                </SimpleGrid>

                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>Integration Status</AlertTitle>
                  <AlertDescription>
                    Some integrations require additional configuration and API
                    keys. Contact your administrator for setup assistance.
                  </AlertDescription>
                </Alert>
              </VStack>
            </SectionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
