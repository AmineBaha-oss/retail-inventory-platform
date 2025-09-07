package com.retailinventory.infrastructure.security;

import com.retailinventory.domain.entity.User;
import com.retailinventory.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * TenantGuard provides methods for tenant-based security checks.
 * Ensures users can only access resources within their organization.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TenantGuard {

    private final UserRepository userRepository;

    /**
     * Check if the current user belongs to the same organization as the target user
     */
    public boolean sameTenant(UUID targetUserId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
                return false;
            }

            User targetUser = userRepository.findById(targetUserId).orElse(null);
            if (targetUser == null) {
                return false;
            }

            return sameTenant(currentUser, targetUser);
        } catch (Exception e) {
            log.error("Error checking tenant access for user {}: {}", targetUserId, e.getMessage());
            return false;
        }
    }

    /**
     * Check if two users belong to the same organization
     */
    public boolean sameTenant(User user1, User user2) {
        // System admins can access all tenants
        if (user1.hasRole("ADMIN")) {
            return true;
        }

        // Both users must belong to the same organization
        if (user1.getOrganization() == null || user2.getOrganization() == null) {
            return false;
        }

        return user1.getOrganization().getId().equals(user2.getOrganization().getId());
    }

    /**
     * Check if the current user belongs to the specified organization
     */
    public boolean belongsToTenant(UUID organizationId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
                return false;
            }

            // System admins can access all tenants
            if (currentUser.hasRole("ADMIN")) {
                return true;
            }

            return currentUser.belongsToOrganization(organizationId);
        } catch (Exception e) {
            log.error("Error checking tenant membership for org {}: {}", organizationId, e.getMessage());
            return false;
        }
    }

    /**
     * Check if the current user can manage the target user
     */
    public boolean canManageUser(UUID targetUserId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
                return false;
            }

            User targetUser = userRepository.findById(targetUserId).orElse(null);
            if (targetUser == null) {
                return false;
            }

            return currentUser.canManageUser(targetUser);
        } catch (Exception e) {
            log.error("Error checking user management access for user {}: {}", targetUserId, e.getMessage());
            return false;
        }
    }

    /**
     * Get the current user's organization ID
     */
    public UUID getCurrentUserOrganizationId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
                return null;
            }

            return currentUser.getOrganization() != null ? currentUser.getOrganization().getId() : null;
        } catch (Exception e) {
            log.error("Error getting current user organization ID: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if the current user has a specific role
     */
    public boolean hasRole(String roleName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
                return false;
            }

            return currentUser.hasRole(roleName);
        } catch (Exception e) {
            log.error("Error checking role {}: {}", roleName, e.getMessage());
            return false;
        }
    }

    /**
     * Check if the current user has a specific permission
     */
    public boolean hasPermission(String permissionName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
                return false;
            }

            return currentUser.hasPermission(permissionName);
        } catch (Exception e) {
            log.error("Error checking permission {}: {}", permissionName, e.getMessage());
            return false;
        }
    }
}
