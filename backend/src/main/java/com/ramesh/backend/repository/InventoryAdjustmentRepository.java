package com.ramesh.backend.repository;

import com.ramesh.backend.entity.AdjustmentType;
import com.ramesh.backend.entity.InventoryAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, String> {

    List<InventoryAdjustment> findByProductIdOrderByCreatedAtDesc(String productId);
    List<InventoryAdjustment> findByChangeType(AdjustmentType type);

//    @Query("SELECT a FROM InventoryAdjustment a WHERE a.createdAt BETWEEN :start AND :end")
//    List<InventoryAdjustment> findByDateRange(@Param("start")LocalDateTime start, @Param("end")LocalDateTime end);

    List<InventoryAdjustment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
