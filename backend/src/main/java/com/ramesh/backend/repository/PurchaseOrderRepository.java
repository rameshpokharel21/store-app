package com.ramesh.backend.repository;

import com.ramesh.backend.entity.PurchaseOrder;
import com.ramesh.backend.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
    List<PurchaseOrder> findByManagerId(Long managerId);
}
