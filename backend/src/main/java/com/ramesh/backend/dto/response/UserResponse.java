package com.ramesh.backend.dto.response;

import java.util.Set;

public record UserResponse(
        Long id, String name, String email, Set<String> roles, String createdAt
) {
}
