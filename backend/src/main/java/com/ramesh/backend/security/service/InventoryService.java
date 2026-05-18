package com.ramesh.backend.security.service;

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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final UserService userService;
    private final ProductService productService;

    public AdjustmentResponse adjustStock(AdjustmentRequest request){
        Product product = productRepository.findById((request.productId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        User currentUser = userService.getUser();

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

    //Receive from purchase order PurchaseOrderService
    public void receiveProductViaPurchaseOrder(Product product, int receivedQty, User user, String poId){
        int newQty = product.getCurrentQuantity() + receivedQty;
        product.setCurrentQuantity(newQty);
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
}
