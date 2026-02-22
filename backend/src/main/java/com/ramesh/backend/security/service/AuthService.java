package com.ramesh.backend.security.service;

import com.ramesh.backend.dto.request.LoginRequest;
import com.ramesh.backend.dto.request.RegisterRequest;
import com.ramesh.backend.dto.response.LoginResponse;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.entity.Role;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.exception.UnauthorizedException;
import com.ramesh.backend.repository.UserRepository;
import com.ramesh.backend.security.JwtUtils;
import com.ramesh.backend.security.UserDetailsImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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

    public LoginResponse login(LoginRequest loginRequest, HttpServletResponse response){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.email(),
                        loginRequest.password()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        if(userDetails == null){
            throw new UnauthorizedException("User not authenticated");
        }

        String accessToken = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        //Set Access token cookie(short-lived)
        setCookieProperties(accessCookieName, accessToken, accessTokenExpirationMs, response);

        //Set Refresh token cookie(long-lived)
        setCookieProperties(refreshCookieName, refreshToken, refreshTokenExpirationMs, response);

        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toSet());

        return new LoginResponse(
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                roles
                //,true //hasRefreshToken
        );
    }

    //Logout -Clear both cookies
    public void logout(HttpServletResponse response){
        //set tokens to null and maxAge to 0
        setCookieProperties(accessCookieName, null, 0, response);
        setCookieProperties(refreshCookieName, null, 0, response);
    }


    public UserResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.email())){
            throw new IllegalArgumentException("Email is already in use.");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        //set default role
        Set<Role> roles = new HashSet<>();
        roles.add(Role.STAFF);
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        Set<String> roleNames = savedUser.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                roleNames,
                savedUser.getCreatedAt().toString()
        );
    }

    public void refreshAccessToken(HttpServletRequest request, HttpServletResponse response){
        String refreshToken = jwtUtils.extractTokenFromCookie(request, refreshCookieName);

        if(refreshToken == null || !jwtUtils.validateRefreshToken(refreshToken)){
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        String email = jwtUtils.getEmailFromJwtToken(refreshToken);

        //load user from DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        //convert to UserDetailsImpl
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        //Generate NEW access token only(refresh token stays the same)
        String newAccessToken = jwtUtils.generateAccessToken(userDetails);
        setCookieProperties(accessCookieName, newAccessToken, accessTokenExpirationMs, response);
    }

    private void setCookieProperties(String cookieName, String token, long tokenExpiryMs, HttpServletResponse response){
        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge((int)(tokenExpiryMs)/1000);
        response.addCookie(cookie);
    }
}
