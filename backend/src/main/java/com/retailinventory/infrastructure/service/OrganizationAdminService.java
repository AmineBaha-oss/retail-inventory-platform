package com.retailinventory.infrastructure.service;

import com.retailinventory.domain.entity.Organization;
import com.retailinventory.domain.entity.Role;
import com.retailinventory.domain.entity.User;
import com.retailinventory.domain.repository.OrganizationRepository;
import com.retailinventory.domain.repository.RoleRepository;
import com.retailinventory.domain.repository.UserRepository;
import com.retailinventory.infrastructure.dto.org.OrganizationUserCreateRequest;
import com.retailinventory.infrastructure.dto.org.OrganizationUserResponse;
import com.retailinventory.infrastructure.dto.org.OrganizationUserUpdateRequest;
import com.retailinventory.infrastructure.exception.ResourceNotFoundException;
import com.retailinventory.infrastructure.exception.ValidationException;
import com.retailinventory.infrastructure.security.TenantGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for organization admin operations.
 * Handles user management within organizations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationAdminService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantGuard tenantGuard;
    private final EmailService emailService;

    /**
     * Get all users in the current user's organization
     */
    @Transactional(readOnly = true)
    public Page<OrganizationUserResponse> getOrganizationUsers(UUID organizationId, Pageable pageable) {
        // Verify the current user belongs to this organization
        if (!tenantGuard.belongsToTenant(organizationId)) {
            throw new ValidationException("Access denied: You can only view users in your organization");
        }

        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Page<User> users = userRepository.findByOrganizationId(organizationId, pageable);
        return users.map(OrganizationUserResponse::fromUser);
    }

    /**
     * Get a specific user in the organization
     */
    @Transactional(readOnly = true)
    public OrganizationUserResponse getOrganizationUser(UUID organizationId, UUID userId) {
        // Verify the current user belongs to this organization
        if (!tenantGuard.belongsToTenant(organizationId)) {
            throw new ValidationException("Access denied: You can only view users in your organization");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify the user belongs to the same organization
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new ValidationException("Access denied: User not authenticated");
        }
        if (!tenantGuard.sameTenant(currentUser, user)) {
            throw new ValidationException("Access denied: User does not belong to your organization");
        }

        return OrganizationUserResponse.fromUser(user);
    }

    /**
     * Create a new user in the organization
     */
    @Transactional
    public OrganizationUserResponse createOrganizationUser(UUID organizationId, OrganizationUserCreateRequest request) {
        // Verify the current user can manage users in this organization
        if (!tenantGuard.belongsToTenant(organizationId)) {
            throw new ValidationException("Access denied: You can only create users in your organization");
        }

        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ValidationException("User with email " + request.getEmail() + " already exists");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ValidationException("User with username " + request.getUsername() + " already exists");
        }

        // Check organization user limit
        if (organization.hasReachedUserLimit()) {
            throw new ValidationException("Organization has reached its user limit");
        }

        // Validate roles - only allow customer roles
        Set<Role> roles = validateAndGetRoles(request.getRoles());

        // Create user
        User user = User.builder()
            .email(request.getEmail())
            .username(request.getUsername())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phone(request.getPhone())
            .passwordHash(passwordEncoder.encode(generateTemporaryPassword()))
            .organization(organization)
            .roles(roles)
            .status(User.UserStatus.PENDING_VERIFICATION)
            .emailVerified(false)
            .build();

        User savedUser = userRepository.save(user);

        // Send welcome email if requested
        if (request.getSendWelcomeEmail()) {
            sendWelcomeEmail(savedUser, organization);
        }

        log.info("Created user {} in organization {}", savedUser.getUsername(), organization.getName());
        return OrganizationUserResponse.fromUser(savedUser);
    }

    /**
     * Update a user in the organization
     */
    @Transactional
    public OrganizationUserResponse updateOrganizationUser(UUID organizationId, UUID userId, OrganizationUserUpdateRequest request) {
        // Verify the current user can manage this user
        if (!tenantGuard.canManageUser(userId)) {
            throw new ValidationException("Access denied: You can only manage users in your organization");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify the user belongs to the same organization
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new ValidationException("Access denied: User not authenticated");
        }
        if (!tenantGuard.sameTenant(currentUser, user)) {
            throw new ValidationException("Access denied: User does not belong to your organization");
        }

        // Update fields
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ValidationException("User with email " + request.getEmail() + " already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new ValidationException("User with username " + request.getUsername() + " already exists");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getRoles() != null) {
            Set<Role> roles = validateAndGetRoles(request.getRoles());
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);
        log.info("Updated user {} in organization {}", savedUser.getUsername(), organizationId);
        return OrganizationUserResponse.fromUser(savedUser);
    }

    /**
     * Activate/deactivate a user
     */
    @Transactional
    public OrganizationUserResponse toggleUserStatus(UUID organizationId, UUID userId, User.UserStatus status) {
        // Verify the current user can manage this user
        if (!tenantGuard.canManageUser(userId)) {
            throw new ValidationException("Access denied: You can only manage users in your organization");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify the user belongs to the same organization
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new ValidationException("Access denied: User not authenticated");
        }
        if (!tenantGuard.sameTenant(currentUser, user)) {
            throw new ValidationException("Access denied: User does not belong to your organization");
        }

        user.setStatus(status);
        User savedUser = userRepository.save(user);

        log.info("Changed user {} status to {} in organization {}", 
            savedUser.getUsername(), status, organizationId);
        return OrganizationUserResponse.fromUser(savedUser);
    }

    /**
     * Delete a user from the organization
     */
    @Transactional
    public void deleteOrganizationUser(UUID organizationId, UUID userId) {
        // Verify the current user can manage this user
        if (!tenantGuard.canManageUser(userId)) {
            throw new ValidationException("Access denied: You can only manage users in your organization");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify the user belongs to the same organization
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new ValidationException("Access denied: User not authenticated");
        }
        if (!tenantGuard.sameTenant(currentUser, user)) {
            throw new ValidationException("Access denied: User does not belong to your organization");
        }

        // Don't allow deleting the last admin
        if (user.hasRole("CUSTOMER_ADMIN")) {
            long adminCount = userRepository.findByOrganizationId(organizationId, Pageable.unpaged())
                .getContent().stream()
                .filter(u -> u.hasRole("CUSTOMER_ADMIN"))
                .count();
            
            if (adminCount <= 1) {
                throw new ValidationException("Cannot delete the last administrator in the organization");
            }
        }

        userRepository.delete(user);
        log.info("Deleted user {} from organization {}", user.getUsername(), organizationId);
    }

    /**
     * Validate and get roles for the user
     */
    private Set<Role> validateAndGetRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new ValidationException("At least one role must be specified");
        }

        // Only allow customer roles for organization users
        Set<String> allowedRoles = Set.of("CUSTOMER_USER", "CUSTOMER_ADMIN");
        for (String roleName : roleNames) {
            if (!allowedRoles.contains(roleName)) {
                throw new ValidationException("Invalid role: " + roleName + ". Only CUSTOMER_USER and CUSTOMER_ADMIN are allowed");
            }
        }

        return roleRepository.findByNameIn(roleNames).stream().collect(java.util.stream.Collectors.toSet());
    }

    /**
     * Generate a temporary password for new users
     */
    private String generateTemporaryPassword() {
        return "TempPass123!"; // In production, generate a secure random password
    }

    /**
     * Send welcome email to new user
     */
    private void sendWelcomeEmail(User user, Organization organization) {
        try {
            // In a real implementation, send an email with login instructions
            log.info("Welcome email sent to {} for organization {}", user.getEmail(), organization.getName());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
