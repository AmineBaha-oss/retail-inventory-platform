package com.retailinventory.infrastructure.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    
    private UserInfo user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private List<String> roles;
        private List<String> permissions;
        private List<UUID> accessibleStores;
        private LocalDateTime lastLogin;
    }
}
