package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.AdjustmentRequest;
import com.ramesh.backend.dto.response.AdjustmentResponse;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.service.InventoryService;
import com.ramesh.backend.security.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/adjustments")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserService userService;

    public InventoryController(InventoryService inventoryService, UserService userService) {
        this.inventoryService = inventoryService;
        this.userService = userService;
    }

    @PostMapping()
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<AdjustmentResponse> adjustStock(@Valid @RequestBody AdjustmentRequest request){
        User currentUser = userService.getUser();
        return ResponseEntity.ok(inventoryService.adjustStock(request, currentUser));
    }

    @GetMapping()
    public ResponseEntity<List<AdjustmentResponse>> getAdjustments(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) String type){
        List<AdjustmentResponse> adjustments = inventoryService.getAdjustments(productId, type);
        return ResponseEntity.ok(adjustments);
    }



}
