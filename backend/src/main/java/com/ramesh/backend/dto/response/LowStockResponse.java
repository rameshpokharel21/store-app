package com.ramesh.backend.dto.response;

public record LowStockResponse(
        String productId, String productName, int currentQuantity,
        int reorderLevel
) {
}
