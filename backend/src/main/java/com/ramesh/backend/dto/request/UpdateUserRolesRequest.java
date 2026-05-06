package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateUserRolesRequest(
        @NotEmpty Set<String> roles
) {}
