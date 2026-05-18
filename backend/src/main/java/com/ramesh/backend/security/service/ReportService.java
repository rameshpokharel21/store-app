package com.ramesh.backend.security.service;

import com.ramesh.backend.dto.response.LowStockResponse;
import com.ramesh.backend.dto.response.SalesSummaryResponse;
import com.ramesh.backend.entity.AdjustmentType;
import com.ramesh.backend.entity.InventoryAdjustment;
import com.ramesh.backend.repository.InventoryAdjustmentRepository;
import com.ramesh.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProductRepository productRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;

    public List<LowStockResponse> getLowStockProducts(){
        return productRepository.findByCurrentQuantityLessThanEqualReorderLevel()
                .stream()
                .map(p -> new LowStockResponse(
                        p.getId(), p.getName(), p.getCurrentQuantity(), p.getReorderLevel()
                ))
                .toList();
    }

    public SalesSummaryResponse getSalesSummary(LocalDate start, LocalDate end){
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(23, 59, 59);
        List<InventoryAdjustment> sales = adjustmentRepository.findByCreatedAtBetween(startDateTime, endDateTime)
                .stream()
                .filter(a -> a.getChangeType() == AdjustmentType.SOLD)
                .toList();
        int totalUnits = sales.stream()
                .mapToInt(InventoryAdjustment::getQuantityChange)
                .sum();//negative values
        return new SalesSummaryResponse(start + " to " + end, -totalUnits, BigDecimal.ZERO);
    }
}
