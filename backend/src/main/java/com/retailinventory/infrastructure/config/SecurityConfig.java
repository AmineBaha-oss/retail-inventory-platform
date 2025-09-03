package com.retailinventory.infrastructure.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.retailinventory.infrastructure.security.JwtAuthenticationFilter;
import com.retailinventory.infrastructure.security.JwtService;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Security configuration with JWT authentication and RBAC.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    @Profile("dev")
    public SecurityFilterChain devFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/v1/auth/**").permitAll()
                .requestMatchers("/health/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll() // Permissive for dev
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    @Profile("!dev")
    public SecurityFilterChain prodFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/v1/auth/**").permitAll()
                .requestMatchers("/health/**").permitAll()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                .requestMatchers("/v1/products/**").hasAnyAuthority("product:read", "product:create", "product:update")
                .requestMatchers("/v1/inventory/**").hasAnyAuthority("inventory:read", "inventory:update")
                .requestMatchers("/v1/purchase-orders/**").hasAnyAuthority("purchase_order:read", "purchase_order:create")
                .requestMatchers("/v1/suppliers/**").hasAnyAuthority("supplier:read", "supplier:create")
                .requestMatchers("/v1/stores/**").hasAnyAuthority("store:read", "store:create")
                .requestMatchers("/v1/forecasting/**").hasAnyAuthority("forecast:read", "forecast:create")
                .requestMatchers("/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:3001", 
            "http://localhost:5173"  // Vite default port
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new org.springframework.security.core.userdetails.UserDetailsService() {
            @Override
            public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws org.springframework.security.core.userdetails.UsernameNotFoundException {
                // For development, return a simple user
                return org.springframework.security.core.userdetails.User.builder()
                    .username("admin")
                    .password(passwordEncoder().encode("admin"))
                    .roles("ADMIN")
                    .build();
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
