package com.ramesh.backend.controller;

import com.ramesh.backend.dto.request.ProductRequest;
import com.ramesh.backend.dto.response.MessageResponse;
import com.ramesh.backend.dto.response.ProductResponse;
import com.ramesh.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String barcode
    ){
        return ResponseEntity.ok(
                productService.getAllProducts(categoryId, barcode)
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request){
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProductResponse> update(@PathVariable String productId, @Valid @RequestBody ProductRequest request ){
        ProductResponse response = productService.updateProduct(productId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> delete(String id){
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully with id: " + id));
    }
}
