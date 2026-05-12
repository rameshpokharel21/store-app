package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TaskRequest(
        @NotNull Long assignedToId,
        @NotBlank String title,
        String description,
        LocalDateTime dueDate
) {
}
