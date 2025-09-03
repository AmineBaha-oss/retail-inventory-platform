package com.retailinventory.infrastructure.controller;

import com.retailinventory.infrastructure.dto.auth.AuthenticationRequest;
import com.retailinventory.infrastructure.dto.auth.AuthenticationResponse;
import com.retailinventory.infrastructure.dto.auth.RefreshTokenRequest;
import com.retailinventory.infrastructure.dto.auth.RegisterRequest;
import com.retailinventory.infrastructure.security.JwtService;
import com.retailinventory.domain.entity.User;
import com.retailinventory.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication controller for user login and registration.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getEmail()) // Use email as username
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        userRepository.save(user);

        // Generate tokens
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId().toString());
        extraClaims.put("roles", user.getRoles().stream().map(role -> role.getName()).toArray());

        String jwtToken = jwtService.generateToken(extraClaims, user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return ResponseEntity.ok(AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId().toString());
        extraClaims.put("roles", user.getRoles().stream().map(role -> role.getName()).toArray());

        String jwtToken = jwtService.generateToken(extraClaims, user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return ResponseEntity.ok(AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(@RequestBody RefreshTokenRequest request) {
        log.info("Refreshing token for user");
        
        String refreshToken = request.getRefreshToken();
        
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            log.warn("Refresh token is missing or empty");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            // Validate the refresh token
            if (!jwtService.isTokenValid(refreshToken)) {
                log.warn("Invalid or expired refresh token");
                return ResponseEntity.badRequest().build();
            }
            
            // Extract username from refresh token
            String username = jwtService.extractUsername(refreshToken);
            
            // Find user by username (email)
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Generate new access token
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("userId", user.getId().toString());
            extraClaims.put("roles", user.getRoles().stream().map(role -> role.getName()).toArray());
            
            String newAccessToken = jwtService.generateToken(extraClaims, user);
            String newRefreshToken = jwtService.generateRefreshToken(user);
            
            log.info("Successfully refreshed tokens for user: {}", username);
            
            return ResponseEntity.ok(AuthenticationResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build());
                    
        } catch (Exception e) {
            log.error("Error refreshing token", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
