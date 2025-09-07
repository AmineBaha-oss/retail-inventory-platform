package com.retailinventory.infrastructure.dto.org;

import com.retailinventory.domain.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class OrganizationUserResponse {

    private UUID id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String phone;
    private User.UserStatus status;
    private Boolean emailVerified;
    private Boolean twoFactorEnabled;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrganizationUserResponse fromUser(User user) {
        return OrganizationUserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .status(user.getStatus())
            .emailVerified(user.getEmailVerified())
            .twoFactorEnabled(user.getTwoFactorEnabled())
            .lastLoginAt(user.getLastLoginAt())
            .lastLoginIp(user.getLastLoginIp())
            .roles(user.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toSet()))
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
