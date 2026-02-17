package com.ramesh.backend.security.service;

import com.ramesh.backend.dto.request.LoginRequest;
import com.ramesh.backend.dto.response.LoginResponse;
import com.ramesh.backend.repository.UserRepository;
import com.ramesh.backend.security.JwtUtils;
import com.ramesh.backend.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${jwt.access-cookie-name}")
    private String acessCookieName;

    @Value("${jwt.refresh-cookie-name}")
    private String refreshCookieName;

    @Value("{jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    @Value("{jwt.refresh-token-expiration}")
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
    }
}
