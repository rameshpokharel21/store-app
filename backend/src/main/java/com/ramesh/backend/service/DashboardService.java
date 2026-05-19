package com.ramesh.backend.service;

import com.ramesh.backend.dto.response.DashboardResponse;
import com.ramesh.backend.entity.PurchaseOrderStatus;
import com.ramesh.backend.entity.TaskStatus;
import com.ramesh.backend.repository.ProductRepository;
import com.ramesh.backend.repository.PurchaseOrderRepository;
import com.ramesh.backend.repository.TaskRepository;
import com.ramesh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final TaskRepository taskRepository;

    public DashboardResponse getDashboardData() {
        long totalUsers    = userRepository.count();
        long totalProducts = productRepository.count();
        long lowStockCount = productRepository.countLowStockProducts();
        long pendingOrders = purchaseOrderRepository.countByStatusIn(
                List.of(PurchaseOrderStatus.PENDING, PurchaseOrderStatus.PARTIALLY_RECEIVED));
        long pendingTasks  = taskRepository.countByStatus(TaskStatus.PENDING);

        return new DashboardResponse(totalUsers, totalProducts, lowStockCount, pendingOrders, pendingTasks);
    }
}
