package com.ramesh.backend.repository;

import com.ramesh.backend.entity.PurchaseOrder;
import com.ramesh.backend.entity.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;




public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {

    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);
    Page<PurchaseOrder> findAll(Pageable pageable);
    Page<PurchaseOrder> findByManagerId(Long managerId, Pageable pageable);
    boolean existsBySupplierId(String supplierId);
    long countByStatusIn(List<PurchaseOrderStatus> statuses);
}
