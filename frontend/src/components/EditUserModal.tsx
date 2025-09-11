import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Checkbox,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import {
  OrganizationUserResponse,
  OrganizationUserUpdateRequest,
  UserRole,
  UserStatus,
} from "../types/api";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: OrganizationUserUpdateRequest) => void;
  user: OrganizationUserResponse;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [formData, setFormData] = useState<OrganizationUserUpdateRequest>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles: user.roles,
        status: user.status,
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (formData.roles && formData.roles.length === 0) {
      newErrors.roles = "At least one role must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  const handleRoleChange = (role: UserRole, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        roles: [...(prev.roles || []), role],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        roles: (prev.roles || []).filter((r) => r !== role),
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@example.com"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input
                  value={formData.username || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="username"
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={formData.firstName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="John"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={formData.lastName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Doe"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.roles}>
                <FormLabel>Roles</FormLabel>
                <VStack align="start" spacing={2}>
                  <Checkbox
                    isChecked={
                      formData.roles?.includes("CUSTOMER_USER") || false
                    }
                    onChange={(e) =>
                      handleRoleChange("CUSTOMER_USER", e.target.checked)
                    }
                  >
                    Customer User
                  </Checkbox>
                  <Checkbox
                    isChecked={
                      formData.roles?.includes("CUSTOMER_ADMIN") || false
                    }
                    onChange={(e) =>
                      handleRoleChange("CUSTOMER_ADMIN", e.target.checked)
                    }
                  >
                    Customer Admin
                  </Checkbox>
                </VStack>
                <FormErrorMessage>{errors.roles}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status || user.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as UserStatus,
                    }))
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING_VERIFICATION">
                    Pending Verification
                  </option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              Update User
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;
