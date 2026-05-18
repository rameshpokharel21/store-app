package com.ramesh.backend.security.service;

import com.ramesh.backend.dto.request.CreateUserAdminRequest;
import com.ramesh.backend.dto.request.UpdateProfileRequest;
import com.ramesh.backend.dto.request.UpdateUserEnabledRequest;
import com.ramesh.backend.dto.request.UpdateUserRolesRequest;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.entity.Role;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.exception.UnauthorizedException;
import com.ramesh.backend.repository.UserRepository;
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

    public UserResponse getCurrentUser() {
        return toUserResponse(getUser());
    }

    public UserResponse getProfile() {
        return getCurrentUser();
    }

    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getUser();
        user.setName(request.name());
        return toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toUserResponse(user);
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
                ? request.roles().stream()
                        .map(r -> Role.valueOf(r.toUpperCase()))
                        .collect(Collectors.toSet())
                : Set.of(Role.STAFF);
        user.setRoles(roles);

        return toUserResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User current = getUser();
        if (current.getId().equals(id)) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public UserResponse updateUserRoles(Long id, UpdateUserRolesRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        Set<Role> newRoles = request.roles().stream()
                .map(r -> Role.valueOf(r.toUpperCase()))
                .collect(Collectors.toSet());
        user.setRoles(newRoles);
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserEnabled(Long id, UpdateUserEnabledRequest request) {
        User current = getUser();
        if (current.getId().equals(id) && !request.enabled()) {
            throw new IllegalArgumentException("You cannot disable your own account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(request.enabled());
        return toUserResponse(userRepository.save(user));
    }

    public @NonNull User getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl userDetails)) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse toUserResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                roles,
                user.getCreatedAt().toString(),
                user.isEnabled()
        );
    }


}
