package com.ramesh.backend.service;

import com.ramesh.backend.dto.response.LowStockResponse;
import com.ramesh.backend.dto.response.SalesSummaryResponse;
import com.ramesh.backend.dto.response.ShrinkageResponse;
import com.ramesh.backend.entity.AdjustmentType;
import com.ramesh.backend.entity.InventoryAdjustment;
import com.ramesh.backend.entity.Product;
import com.ramesh.backend.repository.InventoryAdjustmentRepository;
import com.ramesh.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ReportService {

    private final ProductRepository productRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;

    public List<LowStockResponse> getLowStockProducts(){
        return productRepository.findLowStockProducts()
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
        //sales is -ve value
        int totalUnits = -sales.stream()
                .mapToInt(InventoryAdjustment::getQuantityChange)
                .sum();

        // Use sellingPrice for revenue; fall back to avgCostPrice only if sellingPrice is not configured
        BigDecimal totalRevenue = sales.stream()
                .map(adj -> {
                    Product p = adj.getProduct();
                    BigDecimal price = p.getSellingPrice() != null ? p.getSellingPrice() : p.getAvgCostPrice();
                    if (price == null) return BigDecimal.ZERO;
                    int unitsSold = -adj.getQuantityChange();
                    return price.multiply(BigDecimal.valueOf(unitsSold));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String period = start + " to " + end;
        return new SalesSummaryResponse(period, totalUnits, totalRevenue);
    }

    //Shrinkage report(spoilage + damage
    public List<ShrinkageResponse> getShrinkageReport(){
        //get all SPOILED and DAMAGED adjustments
        List<InventoryAdjustment> shrinkage = adjustmentRepository.findAll().stream()
                .filter(adj -> adj.getChangeType() == AdjustmentType.SPOILED ||
                        adj.getChangeType() == AdjustmentType.DAMAGED)
                .collect(Collectors.toList());

        Map<Product, ShrinkageStats> statsByProduct = shrinkage.stream()
                .collect(Collectors.toMap(
                        InventoryAdjustment::getProduct,//key mapper
                        adj -> { //value mapper
                            ShrinkageStats stats = new ShrinkageStats();
                            if(adj.getChangeType() == AdjustmentType.SPOILED){
                                stats.spoiled = -adj.getQuantityChange();
                            }else{
                                stats.damaged = -adj.getQuantityChange();
                            }
                            return stats;
                        },
                        //merge function
                        (stats1, stats2) -> {
                            stats1.spoiled += stats2.spoiled;
                            stats1.damaged += stats2.damaged;
                            return stats1;
                        }
                ));

        return statsByProduct.entrySet().stream()
                .map(entry -> new ShrinkageResponse(
                        entry.getKey().getId(),
                        entry.getKey().getName(),
                        entry.getValue().spoiled,
                        entry.getValue().damaged
                ))
                .collect(Collectors.toList());


    }

    private static class ShrinkageStats{
        int spoiled = 0;
        int damaged = 0;
    }

}
