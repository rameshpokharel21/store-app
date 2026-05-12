package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest (
        @NotBlank String name,
        String description
){
}
