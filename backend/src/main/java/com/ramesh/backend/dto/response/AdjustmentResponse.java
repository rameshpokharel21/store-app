package com.ramesh.backend.dto.response;

import com.ramesh.backend.entity.AdjustmentType;

public record AdjustmentResponse(
        String id, ProductResponse product, UserResponse user,
        AdjustmentType changeType, int quantityChange, String reason, String createdAt
) {
}
