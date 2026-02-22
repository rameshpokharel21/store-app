package com.ramesh.backend.security.service;

import com.ramesh.backend.dto.request.UpdateProfileRequest;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.exception.UnauthorizedException;
import com.ramesh.backend.repository.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse getCurrentUser(){
        User user = getUser();

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                roles,
                user.getCreatedAt().toString()
        );
    }

    private @NonNull User getUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated()){
            throw new UnauthorizedException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if(!(principal instanceof UserDetailsImpl)){
            throw new UnauthorizedException("User not authenticated");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user;
    }

    public UserResponse getProfile(){
        return getCurrentUser();
    }

    public UserResponse updateProfile(UpdateProfileRequest request){
        User user = getUser();
        user.setName(request.name());
        User updatedUser = userRepository.save(user);
        Set<String> roles = updatedUser.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                roles,
                updatedUser.getCreatedAt().toString()
        );
    }

    public List<UserResponse> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    Set<String> roles = user.getRoles().stream()
                            .map(Enum::name)
                            .collect(Collectors.toSet());
                    return new UserResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            roles,
                            user.getCreatedAt().toString()
                    );
                })
                .collect(Collectors.toList());
    }
}
