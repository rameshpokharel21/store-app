package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SupplierRequest(
        @NotBlank String name,
        String description
) {
}
