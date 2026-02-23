package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.LoginRequest;
import com.ramesh.backend.dto.request.RegisterRequest;
import com.ramesh.backend.dto.response.LoginResponse;
import com.ramesh.backend.dto.response.MessageResponse;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.security.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   HttpServletResponse response){
        LoginResponse loginResponse = authService.login(loginRequest, response);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request){
        UserResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response){
        authService.logout(response);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(new MessageResponse("Logged out successfully."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response){
        authService.refreshAccessToken(request, response);
        return ResponseEntity.ok(new MessageResponse("Token refreshed successfully."));
    }
}
