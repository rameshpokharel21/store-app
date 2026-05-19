package com.ramesh.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String name,
        String categoryId,
        String barcode,
        @NotBlank String unit,
        @Min(0) int reorderLevel,
        BigDecimal avgCostPrice,
        BigDecimal sellingPrice
) {
}
