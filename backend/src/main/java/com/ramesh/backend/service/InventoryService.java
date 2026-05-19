package com.ramesh.backend.service;

import com.ramesh.backend.dto.request.AdjustmentRequest;
import com.ramesh.backend.dto.response.AdjustmentResponse;
import com.ramesh.backend.dto.response.ProductResponse;
import com.ramesh.backend.dto.response.UserResponse;
import com.ramesh.backend.entity.AdjustmentType;
import com.ramesh.backend.entity.InventoryAdjustment;
import com.ramesh.backend.entity.Product;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.repository.InventoryAdjustmentRepository;
import com.ramesh.backend.repository.ProductRepository;
import com.ramesh.backend.security.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final UserService userService;
    private final ProductService productService;

    public AdjustmentResponse adjustStock(AdjustmentRequest request, User currentUser){
        Product product = productRepository.findById((request.productId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        int quantityChange = request.quantity();
        if(request.type() == AdjustmentType.SOLD || request.type() == AdjustmentType.SPOILED ||
        request.type() == AdjustmentType.DAMAGED){
            quantityChange = -quantityChange;
        }
        //update method
        int newQuantity = product.getCurrentQuantity() + quantityChange;
        if(newQuantity < 0){
            throw new IllegalArgumentException(("Insufficient stock for product: " + product.getName()));
        }
        product.setCurrentQuantity(newQuantity);
        productRepository.save(product);

        //create adjustment log
        InventoryAdjustment adjustment = new InventoryAdjustment();
        adjustment.setProduct(product);
        adjustment.setUser(currentUser);
        adjustment.setChangeType(request.type());
        adjustment.setQuantityChange(quantityChange);
        adjustment.setReason(request.reason());
        InventoryAdjustment savedAdjustment = adjustmentRepository.save(adjustment);
        return toResponse(adjustment);

    }

    public List<AdjustmentResponse> getAdjustments(String productId, String type){
        List<InventoryAdjustment> adjustments;
        if(productId != null && type != null){
            //both filters
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            AdjustmentType adjustmentType = AdjustmentType.valueOf(type.toUpperCase());
            adjustments = adjustmentRepository.findByProductAndChangeType(product, adjustmentType);
        }else if(productId != null){
            //only product filter
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            adjustments = adjustmentRepository.findByProductOrderByCreatedAtDesc(product);
        }else if(type != null){
            //only type filter
            AdjustmentType adjustmentType = AdjustmentType.valueOf(type.toUpperCase());
            adjustments = adjustmentRepository.findByChangeType(adjustmentType);
        }else{
            //no filter-return all
            adjustments = adjustmentRepository.findAllByOrderByCreatedAtDesc();
        }

        return adjustments.stream()
                .map(this::toResponse)
                .toList();
    }

    //Receive from purchase order — called by PurchaseOrderService
    public void receiveProductViaPurchaseOrder(Product product, int receivedQty, BigDecimal unitPrice, User user, String poId){
        int currentQty = product.getCurrentQuantity();
        BigDecimal currentAvg = product.getAvgCostPrice() != null ? product.getAvgCostPrice() : BigDecimal.ZERO;

        // Weighted average: (currentQty * currentAvg + receivedQty * unitPrice) / (currentQty + receivedQty)
        BigDecimal newAvgCost = currentAvg.multiply(BigDecimal.valueOf(currentQty))
                .add(unitPrice.multiply(BigDecimal.valueOf(receivedQty)))
                .divide(BigDecimal.valueOf(currentQty + receivedQty), 2, RoundingMode.HALF_UP);

        product.setAvgCostPrice(newAvgCost);
        product.setCurrentQuantity(currentQty + receivedQty);
        Product savedProduct = productRepository.save(product);

        InventoryAdjustment adjustment = new InventoryAdjustment();
        adjustment.setProduct(savedProduct);
        adjustment.setUser(user);
        adjustment.setChangeType(AdjustmentType.RECEIVED);
        adjustment.setQuantityChange(receivedQty);
        adjustment.setReason("Purchase Order " + poId);
        adjustmentRepository.save(adjustment);
    }

    private AdjustmentResponse toResponse(InventoryAdjustment adj){
        ProductResponse productResponse = productService.toResponse(adj.getProduct());
        UserResponse userResponse = userService.toUserResponse(adj.getUser());
        return  new AdjustmentResponse(
                adj.getId(),
                productResponse,
                userResponse,
                adj.getChangeType(),
                adj.getQuantityChange(),
                adj.getReason(),
                adj.getCreatedAt().toString()
        );
    }

    public Page<AdjustmentResponse> getAdjustmentsPage(String productId, String type, Pageable pageable) {
        Page<InventoryAdjustment> adjustmentPage;
        if(productId != null && type != null) {
            AdjustmentType adjustmentType = AdjustmentType.valueOf(type.toUpperCase());
            if(!productRepository.existsById(productId)){
                throw new ResourceNotFoundException("Product not found: " + productId);
            }
            adjustmentPage = adjustmentRepository.findByChangeType(adjustmentType, pageable);
        }else if(productId != null){
            adjustmentPage = adjustmentRepository.findByProductId(productId, pageable);
        }else if(type != null){
            AdjustmentType adjustmentType = AdjustmentType.valueOf(type.toUpperCase());
            adjustmentPage = adjustmentRepository.findByChangeType(adjustmentType, pageable);
        }else{
            adjustmentPage = adjustmentRepository.findAll(pageable);
        }
        return adjustmentPage.map(this::toResponse);
    }
}
