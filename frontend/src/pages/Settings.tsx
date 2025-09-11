import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Switch,
  Select,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  useToast,
  Icon,
  Badge,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  Progress,
} from "@chakra-ui/react";
import {
  FiUser,
  FiBell,
  FiShield,
  FiDatabase,
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiGlobe,
  FiMail,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiUpload,
  FiTrash2,
} from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";

export default function Settings() {
  const [settings, setSettings] = useState({
    // User Preferences
    theme: "dark",
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",

    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    lowStockAlerts: true,
    orderUpdates: true,
    weeklyReports: true,
    systemUpdates: false,

    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
    deviceManagement: true,

    // Data & Privacy
    dataRetention: 365,
    analyticsTracking: true,
    errorReporting: true,
    dataExport: true,
    dataBackup: true,

    // System
    autoRefresh: true,
    refreshInterval: 5,
    maxFileSize: 10,
    cacheSize: 100,
    logLevel: "info",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast({
      title: "Settings saved successfully",
      description: "Your preferences have been updated and applied.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const handleReset = () => {
    setSettings({
      theme: "dark",
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
      emailNotifications: true,
      pushNotifications: false,
      lowStockAlerts: true,
      orderUpdates: true,
      weeklyReports: true,
      systemUpdates: false,
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAlerts: true,
      deviceManagement: true,
      dataRetention: 365,
      analyticsTracking: true,
      errorReporting: true,
      dataExport: true,
      dataBackup: true,
      autoRefresh: true,
      refreshInterval: 5,
      maxFileSize: 10,
      cacheSize: 100,
      logLevel: "info",
    });
    setHasChanges(false);
    toast({
      title: "Settings reset to defaults",
      description: "All settings have been restored to their default values.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const SettingRow = ({
    label,
    description,
    children,
    isRequired = false,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
    isRequired?: boolean;
  }) => (
    <FormControl>
      <HStack justify="space-between" align="flex-start">
        <VStack align="start" spacing={1} flex={1}>
          <HStack>
            <FormLabel mb={0} fontSize="sm" fontWeight="medium">
              {label}
            </FormLabel>
            {isRequired && (
              <Badge colorScheme="red" size="sm">
                Required
              </Badge>
            )}
          </HStack>
          {description && (
            <Text fontSize="xs" color="gray.400">
              {description}
            </Text>
          )}
        </VStack>
        <Box minW="200px">{children}</Box>
      </HStack>
    </FormControl>
  );

  return (
    <VStack spacing={6} align="stretch">
      <PageHeader
        title="Settings"
        subtitle="Manage your application preferences, security settings, and system configuration"
        actions={
          <HStack spacing={3}>
            <Button
              variant="outline"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={handleReset}
              size="sm"
            >
              Reset to Defaults
            </Button>
            <Button
              colorScheme="brand"
              leftIcon={<Icon as={FiSave} />}
              onClick={handleSave}
              isDisabled={!hasChanges}
              size="sm"
            >
              Save Changes
            </Button>
          </HStack>
        }
      />

      {hasChanges && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Unsaved changes detected!</AlertTitle>
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        index={activeTab}
        onChange={setActiveTab}
        variant="enclosed"
        colorScheme="brand"
      >
        <TabList>
          <Tab>
            <Icon as={FiUser} mr={2} />
            Personal
          </Tab>
          <Tab>
            <Icon as={FiBell} mr={2} />
            Notifications
          </Tab>
          <Tab>
            <Icon as={FiShield} mr={2} />
            Security
          </Tab>
          <Tab>
            <Icon as={FiDatabase} mr={2} />
            Data & Privacy
          </Tab>
          <Tab>
            <Icon as={FiSettings} mr={2} />
            System
          </Tab>
        </TabList>

        <TabPanels>
          {/* Personal Settings */}
          <TabPanel px={0} py={6}>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader pb={3}>
                  <Heading size="md" color="gray.100">
                    <Icon as={FiUser} mr={2} />
                    Personal Preferences
                  </Heading>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Customize your personal experience and interface preferences
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={6} align="stretch">
                    <SettingRow
                      label="Theme"
                      description="Choose your preferred color scheme"
                    >
                      <Select
                        value={settings.theme}
                        onChange={(e) =>
                          handleSettingChange("theme", e.target.value)
                        }
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                        <option value="auto">Auto (System)</option>
                      </Select>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Language"
                      description="Select your preferred language"
                    >
                      <Select
                        value={settings.language}
                        onChange={(e) =>
                          handleSettingChange("language", e.target.value)
                        }
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                      </Select>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Timezone"
                      description="Set your local timezone for accurate timestamps"
                    >
                      <Select
                        value={settings.timezone}
                        onChange={(e) =>
                          handleSettingChange("timezone", e.target.value)
                        }
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <option value="UTC">
                          UTC (Coordinated Universal Time)
                        </option>
                        <option value="America/New_York">
                          Eastern Time (ET)
                        </option>
                        <option value="America/Chicago">
                          Central Time (CT)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT)
                        </option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </Select>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Date Format"
                      description="How dates are displayed throughout the application"
                    >
                      <Select
                        value={settings.dateFormat}
                        onChange={(e) =>
                          handleSettingChange("dateFormat", e.target.value)
                        }
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <option value="MM/DD/YYYY">
                          MM/DD/YYYY (US Format)
                        </option>
                        <option value="DD/MM/YYYY">
                          DD/MM/YYYY (European Format)
                        </option>
                        <option value="YYYY-MM-DD">
                          YYYY-MM-DD (ISO Format)
                        </option>
                      </Select>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Currency"
                      description="Default currency for financial displays"
                    >
                      <Select
                        value={settings.currency}
                        onChange={(e) =>
                          handleSettingChange("currency", e.target.value)
                        }
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </Select>
                    </SettingRow>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Notifications */}
          <TabPanel px={0} py={6}>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader pb={3}>
                  <Heading size="md" color="gray.100">
                    <Icon as={FiBell} mr={2} />
                    Notification Preferences
                  </Heading>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Configure how and when you receive notifications
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={6} align="stretch">
                    <SettingRow
                      label="Email Notifications"
                      description="Receive important updates via email"
                    >
                      <Switch
                        isChecked={settings.emailNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Push Notifications"
                      description="Get real-time alerts in your browser"
                    >
                      <Switch
                        isChecked={settings.pushNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "pushNotifications",
                            e.target.checked
                          )
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Low Stock Alerts"
                      description="Get notified when inventory levels are low"
                    >
                      <Switch
                        isChecked={settings.lowStockAlerts}
                        onChange={(e) =>
                          handleSettingChange(
                            "lowStockAlerts",
                            e.target.checked
                          )
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Order Updates"
                      description="Receive notifications about purchase order status changes"
                    >
                      <Switch
                        isChecked={settings.orderUpdates}
                        onChange={(e) =>
                          handleSettingChange("orderUpdates", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Weekly Reports"
                      description="Get weekly summary reports via email"
                    >
                      <Switch
                        isChecked={settings.weeklyReports}
                        onChange={(e) =>
                          handleSettingChange("weeklyReports", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="System Updates"
                      description="Notifications about system maintenance and updates"
                    >
                      <Switch
                        isChecked={settings.systemUpdates}
                        onChange={(e) =>
                          handleSettingChange("systemUpdates", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Security */}
          <TabPanel px={0} py={6}>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader pb={3}>
                  <Heading size="md" color="gray.100">
                    <Icon as={FiShield} mr={2} />
                    Security Settings
                  </Heading>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Manage your account security and authentication preferences
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={6} align="stretch">
                    <SettingRow
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      isRequired
                    >
                      <HStack>
                        <Switch
                          isChecked={settings.twoFactorAuth}
                          onChange={(e) =>
                            handleSettingChange(
                              "twoFactorAuth",
                              e.target.checked
                            )
                          }
                          colorScheme="brand"
                          size="lg"
                        />
                        {settings.twoFactorAuth && (
                          <Badge colorScheme="green" size="sm">
                            <Icon as={FiCheckCircle} mr={1} />
                            Enabled
                          </Badge>
                        )}
                      </HStack>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Session Timeout"
                      description="Automatically log out after inactivity (in minutes)"
                    >
                      <NumberInput
                        value={settings.sessionTimeout}
                        onChange={(value) =>
                          handleSettingChange(
                            "sessionTimeout",
                            parseInt(value) || 30
                          )
                        }
                        min={5}
                        max={480}
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Password Expiry"
                      description="Force password change after specified days"
                    >
                      <NumberInput
                        value={settings.passwordExpiry}
                        onChange={(value) =>
                          handleSettingChange(
                            "passwordExpiry",
                            parseInt(value) || 90
                          )
                        }
                        min={30}
                        max={365}
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Login Alerts"
                      description="Get notified of new login attempts"
                    >
                      <Switch
                        isChecked={settings.loginAlerts}
                        onChange={(e) =>
                          handleSettingChange("loginAlerts", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Device Management"
                      description="Allow device management and remote logout"
                    >
                      <Switch
                        isChecked={settings.deviceManagement}
                        onChange={(e) =>
                          handleSettingChange(
                            "deviceManagement",
                            e.target.checked
                          )
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Data & Privacy */}
          <TabPanel px={0} py={6}>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader pb={3}>
                  <Heading size="md" color="gray.100">
                    <Icon as={FiDatabase} mr={2} />
                    Data & Privacy
                  </Heading>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Control how your data is collected, stored, and used
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={6} align="stretch">
                    <SettingRow
                      label="Data Retention Period"
                      description="How long to keep your data before automatic deletion (in days)"
                    >
                      <NumberInput
                        value={settings.dataRetention}
                        onChange={(value) =>
                          handleSettingChange(
                            "dataRetention",
                            parseInt(value) || 365
                          )
                        }
                        min={30}
                        max={2555}
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Analytics Tracking"
                      description="Help improve the application by sharing anonymous usage data"
                    >
                      <Switch
                        isChecked={settings.analyticsTracking}
                        onChange={(e) =>
                          handleSettingChange(
                            "analyticsTracking",
                            e.target.checked
                          )
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Error Reporting"
                      description="Automatically report errors to help improve stability"
                    >
                      <Switch
                        isChecked={settings.errorReporting}
                        onChange={(e) =>
                          handleSettingChange(
                            "errorReporting",
                            e.target.checked
                          )
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Data Export"
                      description="Allow exporting your data in various formats"
                    >
                      <Switch
                        isChecked={settings.dataExport}
                        onChange={(e) =>
                          handleSettingChange("dataExport", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Automatic Backup"
                      description="Automatically backup your data to prevent data loss"
                    >
                      <Switch
                        isChecked={settings.dataBackup}
                        onChange={(e) =>
                          handleSettingChange("dataBackup", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* System */}
          <TabPanel px={0} py={6}>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader pb={3}>
                  <Heading size="md" color="gray.100">
                    <Icon as={FiSettings} mr={2} />
                    System Configuration
                  </Heading>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Configure system behavior, performance, and advanced
                    settings
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={6} align="stretch">
                    <SettingRow
                      label="Auto Refresh"
                      description="Automatically refresh data at specified intervals"
                    >
                      <Switch
                        isChecked={settings.autoRefresh}
                        onChange={(e) =>
                          handleSettingChange("autoRefresh", e.target.checked)
                        }
                        colorScheme="brand"
                        size="lg"
                      />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Refresh Interval"
                      description="How often to refresh data when auto-refresh is enabled (in minutes)"
                    >
                      <NumberInput
                        value={settings.refreshInterval}
                        onChange={(value) =>
                          handleSettingChange(
                            "refreshInterval",
                            parseInt(value) || 5
                          )
                        }
                        min={1}
                        max={60}
                        isDisabled={!settings.autoRefresh}
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Max File Upload Size"
                      description="Maximum file size for uploads (in MB)"
                    >
                      <NumberInput
                        value={settings.maxFileSize}
                        onChange={(value) =>
                          handleSettingChange(
                            "maxFileSize",
                            parseInt(value) || 10
                          )
                        }
                        min={1}
                        max={100}
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Cache Size"
                      description="Amount of memory to use for caching (in MB)"
                    >
                      <NumberInput
                        value={settings.cacheSize}
                        onChange={(value) =>
                          handleSettingChange(
                            "cacheSize",
                            parseInt(value) || 100
                          )
                        }
                        min={10}
                        max={1000}
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </SettingRow>

                    <Divider />

                    <SettingRow
                      label="Log Level"
                      description="Level of detail for system logs"
                    >
                      <Select
                        value={settings.logLevel}
                        onChange={(e) =>
                          handleSettingChange("logLevel", e.target.value)
                        }
                        bg="gray.700"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      >
                        <option value="error">Error Only</option>
                        <option value="warn">Warning & Error</option>
                        <option value="info">Info, Warning & Error</option>
                        <option value="debug">All Messages (Debug)</option>
                      </Select>
                    </SettingRow>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
