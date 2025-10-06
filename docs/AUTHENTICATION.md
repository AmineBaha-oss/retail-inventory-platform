# Authentication - User Authentication and Authorization

This guide covers the comprehensive authentication and authorization system of the Retail Inventory Platform, including user management, role-based access control, and security best practices.

## Table of Contents

- [Authentication Overview](#authentication-overview)
- [User Management](#user-management)
- [Authentication Methods](#authentication-methods)
- [Authorization System](#authorization-system)
- [Session Management](#session-management)
- [Security Features](#security-features)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Authentication Overview

The Retail Inventory Platform implements a comprehensive authentication and authorization system designed to secure access to sensitive business data while providing a seamless user experience.

### Key Features

- **Multi-Factor Authentication (MFA)**: TOTP, SMS, and email-based MFA
- **Role-Based Access Control (RBAC)**: Granular permissions and role management
- **JWT Token Authentication**: Stateless authentication with secure token management
- **Session Management**: Secure session handling and timeout management
- **Password Security**: Strong password policies and secure password storage
- **Audit Logging**: Complete authentication and authorization audit trail

## User Management

### User Registration

#### User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private boolean mfaEnabled = false;

    @Column
    private String mfaSecret;

    @Column
    private LocalDateTime lastLogin;

    @Column
    private LocalDateTime passwordChangedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @ElementCollection
    @CollectionTable(name = "user_store_access")
    private Set<String> storeAccess;

    // Getters and setters
}
```

#### User Registration Process

```java
@Service
public class UserRegistrationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public UserRegistrationResponse registerUser(UserRegistrationRequest request) {
        // Validate input
        validateRegistrationRequest(request);

        // Check if user already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setActive(true);
        user.setEmailVerified(false);

        // Assign default role
        Role defaultRole = roleService.getDefaultRole();
        user.setRoles(Set.of(defaultRole));

        // Save user
        user = userRepository.save(user);

        // Send verification email
        String verificationToken = generateVerificationToken(user.getId());
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        return UserRegistrationResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status("PENDING_VERIFICATION")
                .build();
    }
}
```

### User Authentication

#### Login Process

```java
@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MfaService mfaService;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // Find user
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        // Check if user is active
        if (!user.isActive()) {
            throw new AuthenticationException("User account is disabled");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
        }

        // Check if MFA is required
        if (user.isMfaEnabled()) {
            // Generate MFA challenge
            String mfaChallenge = mfaService.generateChallenge(user.getId());

            return AuthenticationResponse.builder()
                    .requiresMfa(true)
                    .mfaChallenge(mfaChallenge)
                    .build();
        }

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return AuthenticationResponse.builder()
                .token(token)
                .user(UserInfo.fromUser(user))
                .expiresAt(jwtService.getExpirationDate(token))
                .build();
    }
}
```

#### MFA Authentication

```java
@Service
public class MfaAuthenticationService {

    @Autowired
    private MfaService mfaService;

    @Autowired
    private JwtService jwtService;

    public AuthenticationResponse verifyMfa(MfaVerificationRequest request) {
        // Verify MFA code
        boolean isValid = mfaService.verifyCode(request.getUserId(), request.getCode());

        if (!isValid) {
            throw new AuthenticationException("Invalid MFA code");
        }

        // Get user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Generate JWT token
        String token = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .user(UserInfo.fromUser(user))
                .expiresAt(jwtService.getExpirationDate(token))
                .build();
    }
}
```

## Authentication Methods

### Password Authentication

#### Password Policies

```java
@Component
public class PasswordPolicyValidator {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final String PASSWORD_PATTERN =
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{" + MIN_LENGTH + "," + MAX_LENGTH + "}$";

    public void validatePassword(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new PasswordPolicyException("Password must be at least " + MIN_LENGTH + " characters long");
        }

        if (password.length() > MAX_LENGTH) {
            throw new PasswordPolicyException("Password must be no more than " + MAX_LENGTH + " characters long");
        }

        if (!password.matches(PASSWORD_PATTERN)) {
            throw new PasswordPolicyException(
                "Password must contain at least one lowercase letter, one uppercase letter, " +
                "one digit, and one special character"
            );
        }

        // Check against common passwords
        if (isCommonPassword(password)) {
            throw new PasswordPolicyException("Password is too common, please choose a different one");
        }
    }

    private boolean isCommonPassword(String password) {
        // Check against common password list
        return CommonPasswordsList.contains(password.toLowerCase());
    }
}
```

#### Password Reset

```java
@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Generate reset token
        String resetToken = generateResetToken(user.getId());

        // Save reset token
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpires(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        // Check if token is expired
        if (user.getPasswordResetExpires().isBefore(LocalDateTime.now())) {
            throw new ExpiredTokenException("Reset token has expired");
        }

        // Validate new password
        passwordPolicyValidator.validatePassword(newPassword);

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
```

### Multi-Factor Authentication

#### TOTP Setup

```java
@Service
public class TotpMfaService {

    @Autowired
    private TotpService totpService;

    public MfaSetupResponse setupTotp(UUID userId) {
        // Generate secret
        String secret = totpService.generateSecret();

        // Generate QR code URL
        String qrCodeUrl = totpService.generateQrCodeUrl(userId, secret);

        // Save secret to user
        User user = userRepository.findById(userId).orElseThrow();
        user.setMfaSecret(secret);
        userRepository.save(user);

        return MfaSetupResponse.builder()
                .secret(secret)
                .qrCodeUrl(qrCodeUrl)
                .backupCodes(generateBackupCodes())
                .build();
    }

    public boolean verifyTotpCode(UUID userId, String code) {
        User user = userRepository.findById(userId).orElseThrow();
        String secret = user.getMfaSecret();

        return totpService.verifyCode(secret, code);
    }
}
```

#### SMS MFA

```java
@Service
public class SmsMfaService {

    @Autowired
    private SmsService smsService;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public void sendSmsCode(UUID userId, String phoneNumber) {
        // Generate 6-digit code
        String code = generateSmsCode();

        // Store code in Redis with 5-minute expiration
        String key = "mfa:sms:" + userId;
        redisTemplate.opsForValue().set(key, code, Duration.ofMinutes(5));

        // Send SMS
        smsService.sendSms(phoneNumber, "Your verification code is: " + code);
    }

    public boolean verifySmsCode(UUID userId, String code) {
        String key = "mfa:sms:" + userId;
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null) {
            return false;
        }

        boolean isValid = storedCode.equals(code);

        if (isValid) {
            // Remove code after successful verification
            redisTemplate.delete(key);
        }

        return isValid;
    }
}
```

## Authorization System

### Role-Based Access Control

#### Role Management

```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;

    @Column(nullable = false)
    private boolean active = true;

    // Getters and setters
}
```

#### Permission System

```java
@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(nullable = false)
    private boolean active = true;

    // Getters and setters
}
```

#### Access Control Implementation

```java
@Component
public class AccessControlService {

    @Autowired
    private UserRepository userRepository;

    public boolean hasPermission(UUID userId, String resource, String action) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission ->
                    permission.getResourceType().equals(resource) &&
                    permission.getActionType().equals(action)
                );
    }

    public boolean hasStoreAccess(UUID userId, String storeId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        return user.getStoreAccess().contains(storeId);
    }

    public boolean hasRole(UUID userId, String roleName) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }
}
```

### Method-Level Security

#### Security Annotations

```java
@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasRole('MANAGER') or hasRole('STORE_MANAGER')")
public class InventoryController {

    @GetMapping("/positions/{storeId}")
    @PreAuthorize("hasPermission(#storeId, 'STORE', 'READ')")
    public ResponseEntity<List<InventoryPosition>> getInventoryPositions(
            @PathVariable String storeId) {
        // Implementation
    }

    @PostMapping("/positions")
    @PreAuthorize("hasPermission('INVENTORY', 'WRITE')")
    public ResponseEntity<InventoryPosition> createInventoryPosition(
            @RequestBody @Valid InventoryPositionRequest request) {
        // Implementation
    }

    @PutMapping("/positions/{id}")
    @PreAuthorize("hasPermission('INVENTORY', 'WRITE')")
    public ResponseEntity<InventoryPosition> updateInventoryPosition(
            @PathVariable UUID id,
            @RequestBody @Valid InventoryPositionRequest request) {
        // Implementation
    }

    @DeleteMapping("/positions/{id}")
    @PreAuthorize("hasPermission('INVENTORY', 'DELETE')")
    public ResponseEntity<Void> deleteInventoryPosition(@PathVariable UUID id) {
        // Implementation
    }
}
```

## Session Management

### JWT Token Management

#### Token Generation

```java
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        claims.put("permissions", getPermissions(userDetails));
        claims.put("store_access", getStoreAccess(userDetails));

        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }
}
```

#### Token Validation

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

        String token = extractTokenFromRequest(request);

        if (token != null && jwtService.validateToken(token)) {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### Session Security

#### Session Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .sessionRegistry(sessionRegistry())
            )
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

## Security Features

### Audit Logging

#### Authentication Audit

```java
@Service
public class AuthenticationAuditService {

    @Autowired
    private AuditEventRepository auditEventRepository;

    public void logLoginAttempt(String username, String ipAddress, boolean success) {
        AuditEvent event = new AuditEvent();
        event.setEventType("AUTHENTICATION");
        event.setAction("LOGIN_ATTEMPT");
        event.setUsername(username);
        event.setIpAddress(ipAddress);
        event.setSuccess(success);
        event.setTimestamp(LocalDateTime.now());

        auditEventRepository.save(event);
    }

    public void logPasswordChange(String username, String ipAddress) {
        AuditEvent event = new AuditEvent();
        event.setEventType("AUTHENTICATION");
        event.setAction("PASSWORD_CHANGE");
        event.setUsername(username);
        event.setIpAddress(ipAddress);
        event.setSuccess(true);
        event.setTimestamp(LocalDateTime.now());

        auditEventRepository.save(event);
    }
}
```

### Security Monitoring

#### Failed Login Detection

```java
@Service
public class SecurityMonitoringService {

    @Autowired
    private AuditEventRepository auditEventRepository;

    public void checkForSuspiciousActivity(String username, String ipAddress) {
        // Check for multiple failed logins
        int failedAttempts = auditEventRepository.countFailedLogins(
            username, Duration.ofMinutes(15)
        );

        if (failedAttempts >= 5) {
            createSecurityAlert("MULTIPLE_FAILED_LOGINS", username,
                "User has " + failedAttempts + " failed login attempts in 15 minutes");
        }

        // Check for unusual IP addresses
        if (isUnusualIpAddress(ipAddress)) {
            createSecurityAlert("UNUSUAL_IP_ADDRESS", username,
                "Login from unusual IP address: " + ipAddress);
        }
    }
}
```

## API Reference

### Authentication Endpoints

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "user@example.com",
    "password": "SecurePassword123!",
    "rememberMe": false
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["MANAGER"],
    "storeAccess": ["store-uuid-1", "store-uuid-2"]
  },
  "expiresAt": "2024-01-15T14:30:00Z",
  "requiresMfa": false
}
```

#### MFA Verification

```http
POST /api/auth/verify-mfa
Content-Type: application/json

{
    "userId": "uuid",
    "code": "123456",
    "method": "TOTP"
}
```

#### Password Reset

```http
POST /api/auth/password-reset
Content-Type: application/json

{
    "email": "user@example.com"
}
```

### User Management Endpoints

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer {token}
```

#### Update User Profile

```http
PUT /api/auth/profile
Content-Type: application/json
Authorization: Bearer {token}

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
}
```

## Best Practices

### Authentication Security

1. **Strong Password Policies**

   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Regular password changes
   - Password history prevention

2. **Multi-Factor Authentication**

   - Enable MFA for all users
   - Use TOTP as primary MFA method
   - Provide backup codes
   - Support SMS and email as alternatives

3. **Session Management**
   - Short session timeouts
   - Secure token storage
   - Token rotation
   - Logout on all devices

### Authorization Best Practices

1. **Principle of Least Privilege**

   - Grant minimum required permissions
   - Regular access reviews
   - Remove unused permissions
   - Segregation of duties

2. **Role Management**

   - Clear role definitions
   - Regular role reviews
   - Role-based access control
   - Permission inheritance

3. **Access Control**
   - Method-level security
   - Resource-level permissions
   - Store-level access control
   - API endpoint protection

## Troubleshooting

### Common Authentication Issues

#### Login Failures

**Symptoms:**

- Users cannot log in
- Invalid credentials errors
- Account locked messages

**Solutions:**

1. **Check User Status**

   ```java
   // Verify user is active
   public boolean isUserActive(String username) {
       User user = userRepository.findByUsername(username).orElse(null);
       return user != null && user.isActive();
   }
   ```

2. **Check Password**

   ```java
   // Verify password
   public boolean verifyPassword(String username, String password) {
       User user = userRepository.findByUsername(username).orElse(null);
       if (user == null) return false;
       return passwordEncoder.matches(password, user.getPasswordHash());
   }
   ```

3. **Check Account Lockout**
   ```java
   // Check if account is locked
   public boolean isAccountLocked(String username) {
       int failedAttempts = auditService.countFailedLogins(username, Duration.ofMinutes(15));
       return failedAttempts >= 5;
   }
   ```

#### Token Issues

**Symptoms:**

- Token validation failures
- Expired token errors
- Invalid token format

**Solutions:**

1. **Check Token Validity**

   ```java
   // Validate JWT token
   public boolean validateToken(String token) {
       try {
           Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
           return true;
       } catch (JwtException e) {
           return false;
       }
   }
   ```

2. **Check Token Expiration**

   ```java
   // Check if token is expired
   public boolean isTokenExpired(String token) {
       Date expiration = extractExpiration(token);
       return expiration.before(new Date());
   }
   ```

3. **Check Token Format**
   ```java
   // Validate token format
   public boolean isValidTokenFormat(String token) {
       return token != null && token.split("\\.").length == 3;
   }
   ```

### Authorization Issues

#### Permission Denied

**Symptoms:**

- Access denied errors
- Permission validation failures
- Role assignment problems

**Solutions:**

1. **Check User Permissions**

   ```java
   // Check user permissions
   public boolean hasPermission(String userId, String resource, String action) {
       User user = userRepository.findById(userId).orElse(null);
       if (user == null) return false;

       return user.getRoles().stream()
           .flatMap(role -> role.getPermissions().stream())
           .anyMatch(permission ->
               permission.getResourceType().equals(resource) &&
               permission.getActionType().equals(action)
           );
   }
   ```

2. **Check Store Access**

   ```java
   // Check store access
   public boolean hasStoreAccess(String userId, String storeId) {
       User user = userRepository.findById(userId).orElse(null);
       if (user == null) return false;

       return user.getStoreAccess().contains(storeId);
   }
   ```

3. **Check Role Assignment**

   ```java
   // Check user roles
   public boolean hasRole(String userId, String role) {
       User user = userRepository.findById(userId).orElse(null);
       if (user == null) return false;

       return user.getRoles().stream()
           .anyMatch(r -> r.getName().equals(role));
   }
   ```

### Getting Help

1. **Authentication Documentation**: Check authentication documentation and guides
2. **Security Team**: Contact security team for complex issues
3. **User Support**: Contact user support for account issues
4. **Training**: Attend authentication training sessions
5. **Community**: Join user community forums

---

_This authentication guide is regularly updated. Check for the latest version and new features._
