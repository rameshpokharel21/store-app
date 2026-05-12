package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PurchaseOrderRequest(
        @NotNull String supplierId,
        @NotEmpty List<PurchaseOrderItemRequest> items
        ) {
}
