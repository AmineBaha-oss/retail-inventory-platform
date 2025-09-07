import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { organizationAPI } from "../services/api";
import { OrganizationUserResponse, UserStatus, UserRole } from "../types/api";
import { useOrganization } from "../contexts/OrganizationContext";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";

const OrganizationUsers: React.FC = () => {
  const { currentOrganization, canManageUsers } = useOrganization();
  const [users, setUsers] = useState<OrganizationUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] =
    useState<OrganizationUserResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    if (currentOrganization) {
      loadUsers();
    }
  }, [currentOrganization]);

  const loadUsers = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const response = await organizationAPI.getOrganizationUsers(
        currentOrganization.id
      );
      setUsers(response.data.content);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    if (!currentOrganization) return;

    try {
      await organizationAPI.createOrganizationUser(
        currentOrganization.id,
        userData
      );
      toast({
        title: "Success",
        description: "User created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onCreateClose();
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!currentOrganization || !selectedUser) return;

    try {
      await organizationAPI.updateOrganizationUser(
        currentOrganization.id,
        selectedUser.id,
        userData
      );
      toast({
        title: "Success",
        description: "User updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    if (!currentOrganization) return;

    try {
      setActionLoading(userId);
      let response;

      switch (status) {
        case "ACTIVE":
          response = await organizationAPI.activateUser(
            currentOrganization.id,
            userId
          );
          break;
        case "INACTIVE":
          response = await organizationAPI.deactivateUser(
            currentOrganization.id,
            userId
          );
          break;
        case "SUSPENDED":
          response = await organizationAPI.suspendUser(
            currentOrganization.id,
            userId
          );
          break;
        default:
          return;
      }

      toast({
        title: "Success",
        description: `User ${status.toLowerCase()} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadUsers();
    } catch (error) {
      console.error("Error changing user status:", error);
      toast({
        title: "Error",
        description: "Failed to change user status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentOrganization || !selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      await organizationAPI.deleteOrganizationUser(
        currentOrganization.id,
        selectedUser.id
      );
      toast({
        title: "Success",
        description: "User deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "gray";
      case "SUSPENDED":
        return "red";
      case "PENDING_VERIFICATION":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "purple";
      case "CUSTOMER_ADMIN":
        return "blue";
      case "CUSTOMER_USER":
        return "green";
      default:
        return "gray";
    }
  };

  if (!canManageUsers) {
    return (
      <Center h="400px">
        <VStack>
          <Text fontSize="lg" color="gray.500">
            Access Denied
          </Text>
          <Text color="gray.400">
            You don't have permission to manage users
          </Text>
        </VStack>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Organization Users
          </Text>
          <Text color="gray.500">
            Manage users in {currentOrganization?.name}
          </Text>
        </VStack>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onCreateOpen}
        >
          Add User
        </Button>
      </HStack>

      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Username</Th>
              <Th>Roles</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {user.phone}
                    </Text>
                  </VStack>
                </Td>
                <Td>{user.email}</Td>
                <Td>{user.username}</Td>
                <Td>
                  <HStack spacing={1}>
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        colorScheme={getRoleColor(role)}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {role.replace("_", " ")}
                      </Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <Badge
                    colorScheme={getStatusColor(user.status)}
                    variant="subtle"
                  >
                    {user.status.replace("_", " ")}
                  </Badge>
                </Td>
                <Td>
                  {user.lastLoginAt ? (
                    <Text fontSize="sm">
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      Never
                    </Text>
                  )}
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<ChevronDownIcon />}
                      variant="ghost"
                      size="sm"
                      isLoading={actionLoading === user.id}
                    />
                    <MenuList>
                      <MenuItem
                        icon={<EditIcon />}
                        onClick={() => {
                          setSelectedUser(user);
                          onEditOpen();
                        }}
                      >
                        Edit
                      </MenuItem>
                      <MenuDivider />
                      {user.status !== "ACTIVE" && (
                        <MenuItem
                          onClick={() => handleStatusChange(user.id, "ACTIVE")}
                        >
                          Activate
                        </MenuItem>
                      )}
                      {user.status !== "INACTIVE" && (
                        <MenuItem
                          onClick={() =>
                            handleStatusChange(user.id, "INACTIVE")
                          }
                        >
                          Deactivate
                        </MenuItem>
                      )}
                      {user.status !== "SUSPENDED" && (
                        <MenuItem
                          onClick={() =>
                            handleStatusChange(user.id, "SUSPENDED")
                          }
                        >
                          Suspend
                        </MenuItem>
                      )}
                      <MenuDivider />
                      <MenuItem
                        icon={<DeleteIcon />}
                        color="red.500"
                        onClick={() => {
                          setSelectedUser(user);
                          onDeleteOpen();
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          onSubmit={handleUpdateUser}
          user={selectedUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={undefined}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedUser?.firstName}{" "}
              {selectedUser?.lastName}? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>Cancel</Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteUser}
                ml={3}
                isLoading={actionLoading === selectedUser?.id}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default OrganizationUsers;
