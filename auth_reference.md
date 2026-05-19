# JWT Authentication & Authorization Blueprint
## Spring Boot 4 · PostgreSQL · Stateless · HttpOnly Cookies · RBAC

This is a complete, production-tested auth implementation. Copy every file below, adapting only the base package name.

---

## Stack & Versions
- Spring Boot: 4.0.2 (parent BOM manages Spring Security, Validation, etc.)
- Java: 21+ (records, text blocks, pattern matching used)
- JJWT: 0.13.0
- Lombok: managed by Spring Boot BOM

---

## Maven Dependencies (add to pom.xml)

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Bean Validation (@Valid, @NotBlank, etc.) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- JJWT — all three required -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.13.0</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.13.0</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.13.0</version>
    <scope>runtime</scope>
</dependency>

<!-- Test -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

Also add Lombok annotation processor to the maven-compiler-plugin:
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

---

## Environment Variables (.env)

```
JWT_SECRET=<base64-encoded HS256 secret, min 256 bits>
JWT_ACCESS_COOKIE_NAME=accessToken
JWT_REFRESH_COOKIE_NAME=refreshToken
COOKIE_SECURE=false          # true in production (HTTPS)
ALLOWED_ORIGINS=http://localhost:5173
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_ROLES=ADMIN
MANAGER_NAME=Manager
MANAGER_EMAIL=manager@example.com
MANAGER_PASSWORD=manager123
MANAGER_ROLES=MANAGER
USER_NAME=Staff
USER_EMAIL=staff@example.com
USER_PASSWORD=staff123
USER_ROLES=STAFF
```

Generate a secret: `openssl rand -base64 32`

---

## application.yml (property keys — fill values via .env)

```yaml
spring:
  application:
    name: your-app-name
  datasource:
    url: jdbc:postgresql://localhost:5432/your_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false

jwt:
  secret: ${JWT_SECRET}
  access-token-expiration: 900000        # 15 minutes
  refresh-token-expiration: 604800000    # 7 days
  access-cookie-name: ${JWT_ACCESS_COOKIE_NAME}
  refresh-cookie-name: ${JWT_REFRESH_COOKIE_NAME}

cookie:
  secure: ${COOKIE_SECURE:false}

cors:
  allowed-origins: ${ALLOWED_ORIGINS}

app:
  bootstrap-users:
    - name: ${ADMIN_NAME}
      email: ${ADMIN_EMAIL}
      password: ${ADMIN_PASSWORD}
      roles:
        - ${ADMIN_ROLES}
    - name: ${MANAGER_NAME}
      email: ${MANAGER_EMAIL}
      password: ${MANAGER_PASSWORD}
      roles:
        - ${MANAGER_ROLES}
    - name: ${USER_NAME}
      email: ${USER_EMAIL}
      password: ${USER_PASSWORD}
      roles:
        - ${USER_ROLES}
```

Enable ConfigurationProperties in main class:
```java
@SpringBootApplication
@EnableConfigurationProperties(BootstrapUserProperties.class)
public class Application { ... }
```

---

## Package Structure

```
com.{company}.{app}/
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   └── AdminController.java
├── dto/
│   ├── UserProperties.java
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── UpdateProfileRequest.java
│   │   ├── CreateUserAdminRequest.java
│   │   ├── UpdateUserRolesRequest.java
│   │   └── UpdateUserEnabledRequest.java
│   └── response/
│       ├── LoginResponse.java
│       ├── UserResponse.java
│       └── MessageResponse.java
├── entity/
│   ├── User.java
│   └── Role.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── repository/
│   └── UserRepository.java
├── security/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── BootstrapUserInitializer.java
│   │   └── BootstrapUserProperties.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   ├── UserDetailsImpl.java
│   │   └── UserDetailsServiceImpl.java
│   └── utils/
│       ├── JwtUtils.java
│       ├── JwtAuthenticationFilter.java
│       ├── JwtAuthEntryPoint.java
│       └── CustomAccessDeniedHandler.java
└── validation/
    ├── PasswordMatch.java
    └── PasswordMatchValidator.java
```

---

## Auth Flow Summary

**Login:** `POST /api/auth/login` → AuthenticationManager validates credentials → JwtUtils generates access (15m) + refresh (7d) tokens → both set as HttpOnly cookies → LoginResponse returned (id, name, email, roles).

**Every request:** JwtAuthenticationFilter extracts access token from cookie → validates type="access" → loads user from DB → sets SecurityContext → Spring Security applies authorization rules.

**Token refresh:** `POST /api/auth/refresh` → validate refresh cookie → generate new access token → set new access cookie (refresh cookie unchanged).

**Logout:** `POST /api/auth/logout` → set both cookies with maxAge=0 → cookies expire immediately.

---

## Source Files

### `entity/Role.java`
```java
package com.PACKAGE.entity;

public enum Role {
    STAFF,
    MANAGER,
    ADMIN
}
```

---

### `entity/User.java`
```java
package com.PACKAGE.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "roles")
    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    private Set<Role> roles = new HashSet<>();

    private boolean enabled = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreated() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### `repository/UserRepository.java`
```java
package com.PACKAGE.repository;

import com.PACKAGE.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}
```

---

### `dto/UserProperties.java`
```java
package com.PACKAGE.dto;

import java.util.List;

public record UserProperties(
        String name,
        String email,
        String password,
        List<String> roles
) {}
```

---

### `dto/request/LoginRequest.java`
```java
package com.PACKAGE.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {}
```

---

### `dto/request/RegisterRequest.java`
```java
package com.PACKAGE.dto.request;

import com.PACKAGE.validation.PasswordMatch;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@PasswordMatch
public record RegisterRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
        String password,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {}
```

---

### `dto/request/UpdateProfileRequest.java`
```java
package com.PACKAGE.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank
        @Size(min = 2, max = 100, message = "Name should be between 2 and 100 chars")
        String name
) {}
```

---

### `dto/request/CreateUserAdminRequest.java`
```java
package com.PACKAGE.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateUserAdminRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 40) String password,
        Set<String> roles
) {}
```

---

### `dto/request/UpdateUserRolesRequest.java`
```java
package com.PACKAGE.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateUserRolesRequest(
        @NotEmpty Set<String> roles
) {}
```

---

### `dto/request/UpdateUserEnabledRequest.java`
```java
package com.PACKAGE.dto.request;

public record UpdateUserEnabledRequest(boolean enabled) {}
```

---

### `dto/response/LoginResponse.java`
```java
package com.PACKAGE.dto.response;

import java.util.Set;

public record LoginResponse(Long id, String name, String email, Set<String> roles) {}
```

---

### `dto/response/UserResponse.java`
```java
package com.PACKAGE.dto.response;

import java.util.Set;

public record UserResponse(
        Long id, String name, String email,
        Set<String> roles, String createdAt, boolean enabled
) {}
```

---

### `dto/response/MessageResponse.java`
```java
package com.PACKAGE.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageResponse {
    private String message;
}
```

---

### `validation/PasswordMatch.java`
```java
package com.PACKAGE.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordMatchValidator.class)
@Documented
public @interface PasswordMatch {
    String message() default "Passwords do not match";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

---

### `validation/PasswordMatchValidator.java`
```java
package com.PACKAGE.validation;

import com.PACKAGE.dto.request.RegisterRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, Object> {

    @Override
    public void initialize(PasswordMatch constraintAnnotation) {}

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        if (obj instanceof RegisterRequest request) {
            boolean valid = request.password() != null &&
                    request.password().equals(request.confirmPassword());
            if (!valid) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                        .addPropertyNode("confirmPassword")
                        .addConstraintViolation();
            }
            return valid;
        }
        return true;
    }
}
```

---

### `exception/ResourceNotFoundException.java`
```java
package com.PACKAGE.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

---

### `exception/UnauthorizedException.java`
```java
package com.PACKAGE.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

---

### `exception/GlobalExceptionHandler.java`
```java
package com.PACKAGE.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorizedException(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<?> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            errors.put(fieldName, error.getDefaultMessage());
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalExceptions(Exception ex) {
        logger.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
    }
}
```

---

### `security/utils/JwtUtils.java`
```java
package com.PACKAGE.security.utils;

import com.PACKAGE.security.service.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    private SecretKey keyValue;

    public String generateAccessToken(UserDetailsImpl userDetails) {
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        return buildToken(userDetails,
                Map.of("name", userDetails.getName(), "roles", roles),
                "access", accessTokenExpirationMs);
    }

    public String generateRefreshToken(UserDetailsImpl userDetails) {
        return buildToken(userDetails, Map.of(), "refresh", refreshTokenExpirationMs);
    }

    public String getEmailFromJwtToken(String token) {
        return Jwts.parser().verifyWith(keyValue).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public String getTokenType(String token) {
        return Jwts.parser().verifyWith(keyValue).build()
                .parseSignedClaims(token).getPayload().get("type", String.class);
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser().verifyWith(keyValue).build().parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.error("Tampered JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Empty JWT claims: {}", e.getMessage());
        }
        return false;
    }

    public boolean validateAccessToken(String token) {
        return "access".equals(getTokenType(token));
    }

    public boolean validateRefreshToken(String token) {
        return validateJwtToken(token) && "refresh".equals(getTokenType(token));
    }

    public String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) return cookie.getValue();
            }
        }
        return null;
    }

    private String buildToken(UserDetailsImpl userDetails, Map<String, Object> extraClaims,
                               String type, long expirationMs) {
        Date now = new Date();
        JwtBuilder builder = Jwts.builder()
                .subject(userDetails.getEmail())
                .claim("id", userDetails.getId())
                .claim("type", type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(keyValue);
        extraClaims.forEach(builder::claim);
        return builder.compact();
    }

    @PostConstruct
    private void getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        keyValue = Keys.hmacShaKeyFor(keyBytes);
    }
}
```

---

### `security/utils/JwtAuthenticationFilter.java`
```java
package com.PACKAGE.security.utils;

import com.PACKAGE.security.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @Value("${jwt.access-cookie-name}")
    private String accessCookieName;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String accessToken = jwtUtils.extractTokenFromCookie(request, accessCookieName);
            if (accessToken != null && jwtUtils.validateAccessToken(accessToken)) {
                String email = jwtUtils.getEmailFromJwtToken(accessToken);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Could not set user authentication: {}", e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
```

---

### `security/utils/JwtAuthEntryPoint.java`
```java
package com.PACKAGE.security.utils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("""
                {"status":401,"error":"Unauthorized","message":"Invalid or missing authentication token"}
                """);
    }
}
```

---

### `security/utils/CustomAccessDeniedHandler.java`
```java
package com.PACKAGE.security.utils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("""
                {"status":403,"error":"Forbidden","message":"You do not have permission to access this resource."}
                """);
    }
}
```

---

### `security/service/UserDetailsImpl.java`
```java
package com.PACKAGE.security.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.PACKAGE.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String name;
    private String email;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean enabled;

    public static UserDetailsImpl build(User user) {
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
        return new UserDetailsImpl(
                user.getId(), user.getName(), user.getEmail(),
                user.getPassword(), authorities, user.isEnabled()
        );
    }

    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}
```

---

### `security/service/UserDetailsServiceImpl.java`
```java
package com.PACKAGE.security.service;

import com.PACKAGE.entity.User;
import com.PACKAGE.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserDetailsImpl.build(user);
    }
}
```

---

### `security/service/AuthService.java`
```java
package com.PACKAGE.security.service;

import com.PACKAGE.dto.request.LoginRequest;
import com.PACKAGE.dto.request.RegisterRequest;
import com.PACKAGE.dto.response.LoginResponse;
import com.PACKAGE.dto.response.UserResponse;
import com.PACKAGE.entity.Role;
import com.PACKAGE.entity.User;
import com.PACKAGE.exception.UnauthorizedException;
import com.PACKAGE.repository.UserRepository;
import com.PACKAGE.security.utils.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${jwt.access-cookie-name}")
    private String accessCookieName;

    @Value("${jwt.refresh-cookie-name}")
    private String refreshCookieName;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    public LoginResponse login(LoginRequest loginRequest, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        setCookieProperties(accessCookieName, jwtUtils.generateAccessToken(userDetails), accessTokenExpirationMs, response);
        setCookieProperties(refreshCookieName, jwtUtils.generateRefreshToken(userDetails), refreshTokenExpirationMs, response);

        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toSet());

        return new LoginResponse(userDetails.getId(), userDetails.getName(), userDetails.getEmail(), roles);
    }

    public void logout(HttpServletResponse response) {
        setCookieProperties(accessCookieName, "", 0, response);
        setCookieProperties(refreshCookieName, "", 0, response);
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already in use.");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(new HashSet<>(Set.of(Role.STAFF)));
        User saved = userRepository.save(user);
        return new UserResponse(
                saved.getId(), saved.getName(), saved.getEmail(),
                saved.getRoles().stream().map(Enum::name).collect(Collectors.toSet()),
                saved.getCreatedAt().toString(), saved.isEnabled()
        );
    }

    public void refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtUtils.extractTokenFromCookie(request, refreshCookieName);
        if (refreshToken == null || !jwtUtils.validateRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        String email = jwtUtils.getEmailFromJwtToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        setCookieProperties(accessCookieName, jwtUtils.generateAccessToken(userDetails), accessTokenExpirationMs, response);
    }

    private void setCookieProperties(String cookieName, String token, long tokenExpiryMs, HttpServletResponse response) {
        int maxAge = (int) (tokenExpiryMs / 1000);
        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", cookieSecure ? "None" : "Lax");
        response.addCookie(cookie);
    }
}
```

---

### `security/service/UserService.java`
```java
package com.PACKAGE.security.service;

import com.PACKAGE.dto.request.CreateUserAdminRequest;
import com.PACKAGE.dto.request.UpdateProfileRequest;
import com.PACKAGE.dto.request.UpdateUserEnabledRequest;
import com.PACKAGE.dto.request.UpdateUserRolesRequest;
import com.PACKAGE.dto.response.UserResponse;
import com.PACKAGE.entity.Role;
import com.PACKAGE.entity.User;
import com.PACKAGE.exception.ResourceNotFoundException;
import com.PACKAGE.exception.UnauthorizedException;
import com.PACKAGE.repository.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser() { return toUserResponse(getUser()); }
    public UserResponse getProfile() { return getCurrentUser(); }

    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getUser();
        user.setName(request.name());
        return toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)));
    }

    public UserResponse createUser(CreateUserAdminRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use: " + request.email());
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        Set<Role> roles = (request.roles() != null && !request.roles().isEmpty())
                ? request.roles().stream().map(r -> Role.valueOf(r.toUpperCase())).collect(Collectors.toSet())
                : Set.of(Role.STAFF);
        user.setRoles(roles);
        return toUserResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        if (getUser().getId().equals(id)) throw new IllegalArgumentException("You cannot delete your own account");
        userRepository.delete(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)));
    }

    public UserResponse updateUserRoles(Long id, UpdateUserRolesRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setRoles(request.roles().stream().map(r -> Role.valueOf(r.toUpperCase())).collect(Collectors.toSet()));
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserEnabled(Long id, UpdateUserEnabledRequest request) {
        if (getUser().getId().equals(id) && !request.enabled())
            throw new IllegalArgumentException("You cannot disable your own account");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(request.enabled());
        return toUserResponse(userRepository.save(user));
    }

    public @NonNull User getUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedException("User not authenticated");
        if (!(auth.getPrincipal() instanceof UserDetailsImpl ud)) throw new UnauthorizedException("User not authenticated");
        return userRepository.findById(ud.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()),
                user.getCreatedAt().toString(), user.isEnabled()
        );
    }
}
```

---

### `security/config/SecurityConfig.java`
```java
package com.PACKAGE.security.config;

import com.PACKAGE.security.utils.CustomAccessDeniedHandler;
import com.PACKAGE.security.utils.JwtAuthEntryPoint;
import com.PACKAGE.security.utils.JwtAuthenticationFilter;
import com.PACKAGE.security.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthEntryPoint jwtAuthEntryPoint,
                          CustomAccessDeniedHandler accessDeniedHandler) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthEntryPoint = jwtAuthEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .authenticationProvider(authenticationProvider())
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(c -> c.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/login", "/api/auth/register",
                    "/api/auth/logout", "/api/auth/refresh"
                ).permitAll()
                .requestMatchers("/api/auth/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/manager/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")
                .anyRequest().authenticated())
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

### `security/config/BootstrapUserProperties.java`
```java
package com.PACKAGE.security.config;

import com.PACKAGE.dto.UserProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record BootstrapUserProperties(List<UserProperties> bootstrapUsers) {}
```

---

### `security/config/BootstrapUserInitializer.java`
```java
package com.PACKAGE.security.config;

import com.PACKAGE.dto.UserProperties;
import com.PACKAGE.entity.Role;
import com.PACKAGE.entity.User;
import com.PACKAGE.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BootstrapUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(BootstrapUserInitializer.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapUserProperties properties;

    public BootstrapUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                     BootstrapUserProperties properties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    public void run(String... args) {
        for (UserProperties userProps : properties.bootstrapUsers()) {
            if (!userRepository.existsByEmail(userProps.email())) {
                User user = new User();
                user.setName(userProps.name());
                user.setEmail(userProps.email());
                user.setPassword(passwordEncoder.encode(userProps.password()));
                Set<Role> roles = userProps.roles().stream().map(Role::valueOf).collect(Collectors.toSet());
                user.setRoles(roles);
                userRepository.save(user);
                logger.info("Created bootstrap user: {}", userProps.email());
            }
        }
    }
}
```

---

### `controller/AuthController.java`
```java
package com.PACKAGE.controller;

import com.PACKAGE.dto.request.LoginRequest;
import com.PACKAGE.dto.request.RegisterRequest;
import com.PACKAGE.dto.response.LoginResponse;
import com.PACKAGE.dto.response.MessageResponse;
import com.PACKAGE.dto.response.UserResponse;
import com.PACKAGE.security.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(loginRequest, response));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(new MessageResponse("Logged out successfully."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        authService.refreshAccessToken(request, response);
        return ResponseEntity.ok(new MessageResponse("Token refreshed successfully."));
    }
}
```

---

### `controller/UserController.java`
```java
package com.PACKAGE.controller;

import com.PACKAGE.dto.request.UpdateProfileRequest;
import com.PACKAGE.dto.response.UserResponse;
import com.PACKAGE.security.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(Map.of("user", userService.getCurrentUser()));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}
```

---

### `controller/AdminController.java`
```java
package com.PACKAGE.controller;

import com.PACKAGE.dto.request.CreateUserAdminRequest;
import com.PACKAGE.dto.request.UpdateUserEnabledRequest;
import com.PACKAGE.dto.request.UpdateUserRolesRequest;
import com.PACKAGE.dto.response.MessageResponse;
import com.PACKAGE.dto.response.UserResponse;
import com.PACKAGE.security.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) { this.userService = userService; }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<UserResponse> updateUserRoles(@PathVariable Long id,
                                                         @Valid @RequestBody UpdateUserRolesRequest request) {
        return ResponseEntity.ok(userService.updateUserRoles(id, request));
    }

    @PutMapping("/users/{id}/enabled")
    public ResponseEntity<UserResponse> updateUserEnabled(@PathVariable Long id,
                                                           @RequestBody UpdateUserEnabledRequest request) {
        return ResponseEntity.ok(userService.updateUserEnabled(id, request));
    }
}
```

---

## Database Schema (Flyway migration V1)

```sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roles   VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, roles)
);
```

---

## How to Adapt for a New Project

1. **Package name:** Replace every `com.PACKAGE` with your actual base package (e.g. `com.acme.myapp`).
2. **Roles:** Edit `Role.java` enum values. Update `SecurityConfig` authorization rules and `AuthService.register()` default role.
3. **New API paths:** Add `.requestMatchers("/api/yourpath/**").hasAnyRole(...)` in `SecurityConfig.filterChain()`.
4. **Token TTLs:** Change `jwt.access-token-expiration` and `jwt.refresh-token-expiration` in application.yml.
5. **Cookie names:** Set via env vars — no code change needed.
6. **Bootstrap users:** Add/remove entries in application.yml under `app.bootstrap-users`. Add matching env vars.
7. **Spring Boot version:** This was built on 4.0.2. For 3.x, the API is identical but check `DaoAuthenticationProvider` constructor signature (may differ slightly).
