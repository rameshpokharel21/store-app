package com.ramesh.backend.dto.response;

import java.math.BigDecimal;

public record SalesSummaryResponse(
        String period, int totalUnitsSold, BigDecimal totalRevenue
) {
}
