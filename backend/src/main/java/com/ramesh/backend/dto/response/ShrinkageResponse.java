package com.ramesh.backend.dto.response;

public record ShrinkageResponse(
        String productId, String productName, int spoiledUnits, int damagedUnits
) {
}
