package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.CreateUserAdminRequest;
import com.ramesh.backend.dto.request.UpdateUserEnabledRequest;
import com.ramesh.backend.dto.request.UpdateUserRolesRequest;
import com.ramesh.backend.dto.response.MessageResponse;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.security.service.UserService;
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

    public AdminController(UserService userService) {
        this.userService = userService;
    }

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
    public ResponseEntity<UserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request) {
        return ResponseEntity.ok(userService.updateUserRoles(id, request));
    }

    @PutMapping("/users/{id}/enabled")
    public ResponseEntity<UserResponse> updateUserEnabled(
            @PathVariable Long id,
            @RequestBody UpdateUserEnabledRequest request) {
        return ResponseEntity.ok(userService.updateUserEnabled(id, request));
    }
}
