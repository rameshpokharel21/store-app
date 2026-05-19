package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.AdjustmentRequest;
import com.ramesh.backend.dto.response.AdjustmentResponse;
import com.ramesh.backend.entity.AdjustmentType;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.service.InventoryService;
import com.ramesh.backend.security.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class SalesController {

    private final InventoryService inventoryService;
    private final UserService userService;

    public SalesController (InventoryService inventoryService, UserService userService) {
        this.inventoryService = inventoryService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<AdjustmentResponse> sellProduct(@Valid @RequestBody AdjustmentRequest request){
        //ensure type is SOLD
        if(request.type() != AdjustmentType.SOLD){
            throw new IllegalArgumentException("Sales endpoint only for SOLD type");
        }
        User currentUser = userService.getUser();
        return ResponseEntity.ok(inventoryService.adjustStock(request, currentUser));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Page<AdjustmentResponse>> getSalesHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ){
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sortBy));
        Page<AdjustmentResponse> salesPage = inventoryService.getAdjustmentsPage(null, "SOLD", pageable);
        return ResponseEntity.ok(salesPage);
    }
}
