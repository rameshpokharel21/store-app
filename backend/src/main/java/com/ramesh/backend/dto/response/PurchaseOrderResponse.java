package com.ramesh.backend.dto.response;

import com.ramesh.backend.entity.PurchaseOrderStatus;

import java.util.List;

public record PurchaseOrderResponse(
        String id, SupplierResponse supplier, UserResponse manager, PurchaseOrderStatus status,
        List<PurchaseOrderItemResponse> items, String createdAt
) {
}
