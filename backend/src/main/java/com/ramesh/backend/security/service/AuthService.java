package com.ramesh.backend.security.service;

import com.ramesh.backend.repository.UserRepository;
import com.ramesh.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
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

    
}
