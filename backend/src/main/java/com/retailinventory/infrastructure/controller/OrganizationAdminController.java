package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.User;
import com.retailinventory.infrastructure.dto.org.OrganizationUserCreateRequest;
import com.retailinventory.infrastructure.dto.org.OrganizationUserResponse;
import com.retailinventory.infrastructure.dto.org.OrganizationUserUpdateRequest;
import com.retailinventory.infrastructure.service.OrganizationAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for organization admin operations.
 * Provides endpoints for managing users within an organization.
 */
@RestController
@RequestMapping("/api/orgs/{orgId}/users")
@RequiredArgsConstructor
@Slf4j
public class OrganizationAdminController {

    private final OrganizationAdminService organizationAdminService;

    /**
     * Get all users in the organization
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrganizationUserResponse>> getOrganizationUsers(
            @PathVariable UUID orgId,
            Pageable pageable) {
        
        log.info("Getting users for organization: {}", orgId);
        Page<OrganizationUserResponse> users = organizationAdminService.getOrganizationUsers(orgId, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get a specific user in the organization
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<OrganizationUserResponse> getOrganizationUser(
            @PathVariable UUID orgId,
            @PathVariable UUID userId) {
        
        log.info("Getting user {} for organization: {}", userId, orgId);
        OrganizationUserResponse user = organizationAdminService.getOrganizationUser(orgId, userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Create a new user in the organization
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<OrganizationUserResponse> createOrganizationUser(
            @PathVariable UUID orgId,
            @Valid @RequestBody OrganizationUserCreateRequest request) {
        
        log.info("Creating user {} for organization: {}", request.getEmail(), orgId);
        OrganizationUserResponse user = organizationAdminService.createOrganizationUser(orgId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Update a user in the organization
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<OrganizationUserResponse> updateOrganizationUser(
            @PathVariable UUID orgId,
            @PathVariable UUID userId,
            @Valid @RequestBody OrganizationUserUpdateRequest request) {
        
        log.info("Updating user {} for organization: {}", userId, orgId);
        OrganizationUserResponse user = organizationAdminService.updateOrganizationUser(orgId, userId, request);
        return ResponseEntity.ok(user);
    }

    /**
     * Activate a user
     */
    @PatchMapping("/{userId}/activate")
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<OrganizationUserResponse> activateUser(
            @PathVariable UUID orgId,
            @PathVariable UUID userId) {
        
        log.info("Activating user {} for organization: {}", userId, orgId);
        OrganizationUserResponse user = organizationAdminService.toggleUserStatus(orgId, userId, User.UserStatus.ACTIVE);
        return ResponseEntity.ok(user);
    }

    /**
     * Deactivate a user
     */
    @PatchMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<OrganizationUserResponse> deactivateUser(
            @PathVariable UUID orgId,
            @PathVariable UUID userId) {
        
        log.info("Deactivating user {} for organization: {}", userId, orgId);
        OrganizationUserResponse user = organizationAdminService.toggleUserStatus(orgId, userId, User.UserStatus.INACTIVE);
        return ResponseEntity.ok(user);
    }

    /**
     * Suspend a user
     */
    @PatchMapping("/{userId}/suspend")
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<OrganizationUserResponse> suspendUser(
            @PathVariable UUID orgId,
            @PathVariable UUID userId) {
        
        log.info("Suspending user {} for organization: {}", userId, orgId);
        OrganizationUserResponse user = organizationAdminService.toggleUserStatus(orgId, userId, User.UserStatus.SUSPENDED);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete a user from the organization
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('CUSTOMER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrganizationUser(
            @PathVariable UUID orgId,
            @PathVariable UUID userId) {
        
        log.info("Deleting user {} from organization: {}", userId, orgId);
        organizationAdminService.deleteOrganizationUser(orgId, userId);
        return ResponseEntity.noContent().build();
    }
}
