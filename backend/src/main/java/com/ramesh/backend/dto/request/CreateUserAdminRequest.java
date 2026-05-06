package com.ramesh.backend.dto.request;

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
