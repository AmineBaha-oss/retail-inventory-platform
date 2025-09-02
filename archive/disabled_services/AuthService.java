package com.retailinventory.application.service;

import com.retailinventory.domain.entity.User;
import com.retailinventory.infrastructure.dto.auth.*;
import com.retailinventory.infrastructure.repository.UserRepository;
import com.retailinventory.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // Try to authenticate
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsernameOrEmail(),
                    request.getPassword()
                )
            );

            // Find user by username or email
            User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Update last login
            user.setLastLoginAt(LocalDateTime.now());
            user.setFailedLoginAttempts(0);
            userRepository.save(user);

            return generateLoginResponse(user);

        } catch (AuthenticationException e) {
            // Handle failed login attempt
            userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .ifPresent(user -> {
                    user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                    if (user.getFailedLoginAttempts() >= 5) {
                        user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                    }
                    userRepository.save(user);
                });
            throw new RuntimeException("Invalid credentials");
        }
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phone(request.getPhone())
            .emailVerified(true) // Auto-verify for now
            .build();

        user = userRepository.save(user);
        return generateLoginResponse(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);
        
        if (username != null) {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (jwtService.isTokenValid(refreshToken, user)) {
                return generateLoginResponse(user);
            }
        }
        
        throw new RuntimeException("Invalid refresh token");
    }

    public void logout(String refreshToken) {
        // In a real implementation, you would invalidate the refresh token
        // For now, we'll just validate that it's a valid token
        try {
            String username = jwtService.extractUsername(refreshToken);
            if (username == null) {
                throw new RuntimeException("Invalid refresh token");
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    private LoginResponse generateLoginResponse(User user) {
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .roles(user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList()))
            .permissions(user.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(auth -> !auth.startsWith("ROLE_"))
                .collect(Collectors.toList()))
            .accessibleStores(user.getAccessibleStores().stream()
                .map(store -> store.getId())
                .collect(Collectors.toList()))
            .lastLogin(user.getLastLoginAt())
            .build();

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(86400L) // 24 hours in seconds
            .user(userInfo)
            .build();
    }
}
