package com.ramesh.backend.service;

import com.ramesh.backend.dto.request.PurchaseOrderItemRequest;
import com.ramesh.backend.dto.request.PurchaseOrderRequest;
import com.ramesh.backend.dto.request.ReceiveShipmentRequest;
import com.ramesh.backend.dto.response.*;
import com.ramesh.backend.entity.*;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.exception.UnauthorizedException;
import com.ramesh.backend.repository.ProductRepository;
import com.ramesh.backend.repository.PurchaseOrderRepository;
import com.ramesh.backend.repository.SupplierRepository;
import com.ramesh.backend.security.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PurchaseOrderService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final InventoryService inventoryService;

    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request){
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        User manager = userService.getUser();

        //role check already done by @PreAuthorize, ensure MANAGER role
        if(manager.getRoles().stream().noneMatch(r -> r == Role.MANAGER || r == Role.ADMIN)){
            throw new UnauthorizedException("Only managers can create purchase orders");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setManager(manager);
        po.setStatus(PurchaseOrderStatus.PENDING);
        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        List<PurchaseOrderItem> items = new ArrayList<>();
        for(PurchaseOrderItemRequest itemRequest: request.items()){
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.productId()));
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(savedPo);
            item.setProduct(product);
            item.setOrderedQuantity(itemRequest.orderedQuantity());
            item.setUnitPrice(itemRequest.unitPrice());
            item.setReceivedQuantity(0);
            items.add(item);
        }

        savedPo.setItems(items);
        savedPo = purchaseOrderRepository.save(savedPo);
    return toResponse(savedPo);
    }

    public PurchaseOrderResponse receiveShipment(String poId, ReceiveShipmentRequest request, User currentUser){
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found."));
        if(po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.CANCELLED){
            throw new IllegalArgumentException("Purchase order already completed or cancelled");
        }

        Map<String, Integer> receivedItems = request.receivedItems().stream()
                .collect(Collectors.toMap(ReceiveShipmentRequest.ReceivedItem::productId, ReceiveShipmentRequest.ReceivedItem::receivedQuantity));
        for (PurchaseOrderItem item : po.getItems()){
            Integer receivedQuantity = receivedItems.get(item.getProduct().getId());
            if(receivedQuantity != null && receivedQuantity > 0){
                int newTotalReceived = item.getReceivedQuantity() + receivedQuantity;
                if(newTotalReceived > item.getOrderedQuantity()){
                    throw new IllegalArgumentException(
                            "Received quantity (" + newTotalReceived + ") exceeds ordered quantity (" +
                            item.getOrderedQuantity() + ") for product: " + item.getProduct().getName());
                }
                item.setReceivedQuantity(newTotalReceived);
                //update inventory and recalculate avg cost
                inventoryService.receiveProductViaPurchaseOrder(item.getProduct(), receivedQuantity, item.getUnitPrice(), currentUser, po.getId());
            }
        }

        //Update po status
        boolean allReceived = po.getItems().stream().allMatch(
                i -> i.getReceivedQuantity() >= i.getOrderedQuantity());
        boolean anyReceived = po.getItems().stream().anyMatch(
                i -> i.getReceivedQuantity() > 0);
        if(allReceived){
            po.setStatus(PurchaseOrderStatus.RECEIVED);
        }else if(anyReceived){
            po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
        }

        po = purchaseOrderRepository.save(po);
        return toResponse(po);

    }


    public Page<PurchaseOrderResponse> getAllPurchaseOrders(PurchaseOrderStatus status, Pageable pageable){
            Page<PurchaseOrder> poPage;
            if(status != null){
                poPage = purchaseOrderRepository.findByStatus(status, pageable);
            }else{
                poPage = purchaseOrderRepository.findAll(pageable);
            }
            return poPage.map(this::toResponse);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po){
       //Map supplier
        SupplierResponse supplierResponse = new SupplierResponse(
          po.getSupplier().getId(),
          po.getSupplier().getName(),
          po.getSupplier().getContactInfo(),
          po.getSupplier().getAddress(),
          po.getSupplier().getCreatedAt().toString()
        );

        //Map manager(user)
        UserResponse managerResponse = userService.toUserResponse(po.getManager());

        //Map items
        List<PurchaseOrderItemResponse> itemResponses = po.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

     return new PurchaseOrderResponse(
             po.getId(),
             supplierResponse,
             managerResponse,
             po.getStatus(),
             itemResponses,
             po.getCreatedAt().toString()

     );
    }

    private PurchaseOrderItemResponse toItemResponse(PurchaseOrderItem item){
        BigDecimal lineTotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getOrderedQuantity()));
        return new PurchaseOrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getOrderedQuantity(),
                item.getReceivedQuantity(),
                item.getUnitPrice(),
                lineTotal
        );
    }
}
