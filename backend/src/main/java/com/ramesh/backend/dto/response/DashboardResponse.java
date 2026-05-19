package com.ramesh.backend.dto.response;

public record DashboardResponse(
        long totalUsers,
        long totalProducts,
        long lowStockCount,
        long pendingOrders,
        long pendingTasks
) {
}
