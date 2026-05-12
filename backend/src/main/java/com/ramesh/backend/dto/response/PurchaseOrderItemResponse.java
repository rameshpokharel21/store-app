package com.ramesh.backend.dto.response;

public record PurchaseOrderItemResponse(
        String productid, String productName, int orderedQuantity, int receivedQuantity
) {
}
