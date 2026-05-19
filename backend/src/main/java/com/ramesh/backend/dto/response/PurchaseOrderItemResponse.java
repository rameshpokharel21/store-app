package com.ramesh.backend.dto.response;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(
        String productId, String productName, int orderedQuantity, int receivedQuantity,
        BigDecimal unitPrice, BigDecimal lineTotal
) {
}
