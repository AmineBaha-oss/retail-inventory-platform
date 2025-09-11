import React, { useState } from "react";
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
import { OrganizationUserCreateRequest, UserRole } from "../types/api";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: OrganizationUserCreateRequest) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<OrganizationUserCreateRequest>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    roles: ["CUSTOMER_USER"],
    sendWelcomeEmail: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (formData.roles.length === 0) {
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
    setFormData({
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      phone: "",
      roles: ["CUSTOMER_USER"],
      sendWelcomeEmail: true,
    });
    setErrors({});
    onClose();
  };

  const handleRoleChange = (role: UserRole, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, role],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        roles: prev.roles.filter((r) => r !== role),
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email *</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@example.com"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Username *</FormLabel>
                <Input
                  value={formData.username}
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
                <FormControl isInvalid={!!errors.firstName}>
                  <FormLabel>First Name *</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="John"
                  />
                  <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.lastName}>
                  <FormLabel>Last Name *</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Doe"
                  />
                  <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.roles}>
                <FormLabel>Roles *</FormLabel>
                <VStack align="start" spacing={2}>
                  <Checkbox
                    isChecked={formData.roles.includes("CUSTOMER_USER")}
                    onChange={(e) =>
                      handleRoleChange("CUSTOMER_USER", e.target.checked)
                    }
                  >
                    Customer User
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.roles.includes("CUSTOMER_ADMIN")}
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
                <Checkbox
                  isChecked={formData.sendWelcomeEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sendWelcomeEmail: e.target.checked,
                    }))
                  }
                >
                  Send welcome email
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              Create User
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;
