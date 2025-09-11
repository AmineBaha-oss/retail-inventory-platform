package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Organization;
import com.retailinventory.domain.entity.User;
import com.retailinventory.domain.repository.OrganizationRepository;
import com.retailinventory.domain.repository.UserRepository;
import com.retailinventory.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * API Authentication controller for frontend integration.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class ApiAuthController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            // Find user
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token with organization info
            String jwtToken = jwtService.generateTokenWithOrganization(user);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwtToken);
            response.put("token", jwtToken); // For backward compatibility
            
            // Add user info
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId().toString());
            userInfo.put("email", user.getEmail());
            userInfo.put("username", user.getUsername());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("phone", user.getPhone());
            userInfo.put("status", user.getStatus().toString());
            userInfo.put("emailVerified", user.getEmailVerified());
            userInfo.put("twoFactorEnabled", user.getTwoFactorEnabled());
            userInfo.put("lastLoginAt", user.getLastLoginAt());
            userInfo.put("lastLoginIp", user.getLastLoginIp());
            userInfo.put("roles", user.getRoles().stream().map(role -> role.getName()).toList());
            userInfo.put("organizationId", user.getOrganization() != null ? user.getOrganization().getId().toString() : null);
            userInfo.put("organizationName", user.getOrganization() != null ? user.getOrganization().getName() : null);
            userInfo.put("createdAt", user.getCreatedAt());
            userInfo.put("updatedAt", user.getUpdatedAt());
            
            response.put("user", userInfo);

            // Add organization info if user belongs to one
            if (user.getOrganization() != null) {
                Organization org = user.getOrganization();
                Map<String, Object> orgInfo = new HashMap<>();
                orgInfo.put("id", org.getId().toString());
                orgInfo.put("name", org.getName());
                orgInfo.put("slug", org.getSlug());
                orgInfo.put("description", org.getDescription());
                orgInfo.put("website", org.getWebsite());
                orgInfo.put("phone", org.getPhone());
                orgInfo.put("email", org.getEmail());
                orgInfo.put("address", org.getAddress());
                orgInfo.put("status", org.getStatus().toString());
                orgInfo.put("subscriptionPlan", org.getSubscriptionPlan());
                orgInfo.put("maxUsers", org.getMaxUsers());
                orgInfo.put("trialEndsAt", org.getTrialEndsAt());
                orgInfo.put("createdAt", org.getCreatedAt());
                orgInfo.put("updatedAt", org.getUpdatedAt());
                
                response.put("organization", orgInfo);
            }

            log.info("User {} successfully logged in", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed for user: {}", request.get("email"), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // In a stateless JWT system, logout is handled client-side
        // by removing the token from storage
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("refreshToken");
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
            }

            // Validate the refresh token
            if (!jwtService.isTokenValid(token)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired refresh token"));
            }

            // Extract username from refresh token
            String username = jwtService.extractUsername(token);
            
            // Find user
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate new access token
            String newAccessToken = jwtService.generateTokenWithOrganization(user);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Token refresh failed"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        // This would typically extract user from JWT token
        // For now, return a placeholder
        return ResponseEntity.ok(Map.of("message", "Current user endpoint"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        // This would implement password change logic
        return ResponseEntity.ok(Map.of("message", "Password change endpoint"));
    }
}
