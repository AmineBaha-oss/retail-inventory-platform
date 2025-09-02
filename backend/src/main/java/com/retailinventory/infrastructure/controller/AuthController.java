package com.retailinventory.infrastructure.controller;

import com.retailinventory.infrastructure.dto.auth.AuthenticationRequest;
import com.retailinventory.infrastructure.dto.auth.AuthenticationResponse;
import com.retailinventory.infrastructure.dto.auth.RegisterRequest;
import com.retailinventory.infrastructure.security.JwtService;
import com.retailinventory.domain.entity.User;
import com.retailinventory.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<AuthenticationResponse> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        // Validate refresh token and generate new access token
        // Implementation depends on your refresh token strategy
        
        return ResponseEntity.ok().build();
    }
}
