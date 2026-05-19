package com.ramesh.backend.controller;

import com.ramesh.backend.dto.response.LowStockResponse;
import com.ramesh.backend.dto.response.SalesSummaryResponse;
import com.ramesh.backend.dto.response.ShrinkageResponse;
import com.ramesh.backend.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<LowStockResponse>> lowStock(){
        List<LowStockResponse> lowStocks = reportService.getLowStockProducts();
        return ResponseEntity.ok(lowStocks);
    }

    @GetMapping("/sales-summary")
    public ResponseEntity<SalesSummaryResponse> salesSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
            ){
        //validate date range
        if(start.isAfter(end)){
            throw new IllegalArgumentException("Start date must be before or equal to end data");
        }
        SalesSummaryResponse salesSummary = reportService.getSalesSummary(start, end);
        return ResponseEntity.ok(salesSummary);
    }

    @GetMapping("/shrinkage")
    public ResponseEntity<List<ShrinkageResponse>> shrinkage(){
        List<ShrinkageResponse> shrinkage = reportService.getShrinkageReport();
        return ResponseEntity.ok(shrinkage);

    }
}
