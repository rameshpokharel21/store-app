package com.ramesh.backend.dto.response;

import java.math.BigDecimal;

public record ProductResponse (
        String id, String name, CategoryResponse category, String barcode,
        String unit, int reorderLevel, int currentQuantity, BigDecimal avCostPrice, String createdAt
){

}
