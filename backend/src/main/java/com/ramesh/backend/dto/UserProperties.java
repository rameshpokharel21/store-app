package com.ramesh.backend.dto;

import java.util.List;

public record UserProperties(
        String name,
        String email,
        String password,
        List<String> roles
) {
}
