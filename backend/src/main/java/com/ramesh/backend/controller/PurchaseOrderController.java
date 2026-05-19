package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.PurchaseOrderRequest;
import com.ramesh.backend.dto.request.ReceiveShipmentRequest;
import com.ramesh.backend.dto.response.PurchaseOrderResponse;
import com.ramesh.backend.entity.PurchaseOrderStatus;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.service.PurchaseOrderService;
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
@RequestMapping("/api/purchase-orders")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private final UserService userService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService, UserService userService) {
        this.purchaseOrderService = purchaseOrderService;
        this.userService = userService;
    }

    @PostMapping()
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderRequest request){
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(request));
    }

    @PutMapping("/{poId}/receive")
    public ResponseEntity<PurchaseOrderResponse> receiveShipment(
            @PathVariable String poId,
            @Valid @RequestBody ReceiveShipmentRequest request
            ){
        User currentUser = userService.getUser();
        PurchaseOrderResponse updatedPO = purchaseOrderService.receiveShipment(poId, request, currentUser);
        return ResponseEntity.ok(updatedPO);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Page<PurchaseOrderResponse>> getAllPurchaseOrders(
            @RequestParam (required = false)PurchaseOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue="20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
            ){
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sortBy));
        Page<PurchaseOrderResponse> responsePage = purchaseOrderService.getAllPurchaseOrders(status, pageable);
        return ResponseEntity.ok(responsePage);
    }
}
