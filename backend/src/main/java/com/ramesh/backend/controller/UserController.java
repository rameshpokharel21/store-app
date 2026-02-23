package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.UpdateProfileRequest;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.security.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/user")
//@CrossOrigin(origins = "${cors.allowed-origins}", allowCredentials = "true")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(){
        UserResponse userResponse = userService.getCurrentUser();
        //wrap in object with "user" kyey to match frontend expectation
        Map<String, Object> response = new HashMap<>();
        response.put("user", userResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(){
        UserResponse userResponse = userService.getProfile();
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request){
        UserResponse userResponse = userService.updateProfile(request);
        return ResponseEntity.ok(userResponse);
    }
}
