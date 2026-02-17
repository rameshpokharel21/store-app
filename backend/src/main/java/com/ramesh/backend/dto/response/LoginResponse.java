package com.ramesh.backend.dto.response;

import java.util.Set;

public record LoginResponse(
        Long id, String name, String email, Set<String> roles
        )    {

}
