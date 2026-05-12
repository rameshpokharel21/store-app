package com.ramesh.backend.dto.request;

public record PurchaseOrderItemRequest(String productId, int orderedQuantity) {
}
