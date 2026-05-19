package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PurchaseOrderItemRequest(
        @NotBlank String productId,
        @Min(1) int orderedQuantity,
        @NotNull @DecimalMin("0.01") BigDecimal unitPrice
) {
}
