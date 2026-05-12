package com.ramesh.backend.dto.request;

import com.ramesh.backend.entity.AdjustmentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AdjustmentRequest(
        @NotNull String productId,
        @NotNull AdjustmentType type,
        @Min(1) int quantity,
        String reason
        ) {
}
