package com.ramesh.backend.service;

import com.ramesh.backend.dto.request.ProductRequest;
import com.ramesh.backend.dto.response.CategoryResponse;
import com.ramesh.backend.dto.response.ProductResponse;
import com.ramesh.backend.entity.Category;
import com.ramesh.backend.entity.Product;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.repository.CategoryRepository;
import com.ramesh.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductResponse createProduct(ProductRequest request) {
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }
        //barcode uniqueness check
        if (request.barcode() != null && productRepository.existsByBarcode(request.barcode())) {
            throw new IllegalArgumentException("Barcode already exists");
        }

        Product product = new Product();
        product.setName(request.name());
        product.setCategory(category);
        product.setBarcode(request.barcode());
        product.setUnit(request.unit());
        product.setReorderLevel(request.reorderLevel());
        product.setAvgCostPrice(request.avgCostPrice());
        product.setSellingPrice(request.sellingPrice());
        //currentQuantity defaults to 0
        return toResponse(productRepository.save(product));
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toResponse(product);
    }

    //find products by barcode, otherwise by categoryId otherwise find all
    public List<ProductResponse> getAllProducts(String categoryId, String barcode) {
        List<Product> products;

        if (barcode != null) {
            //barcode exact match
            Product product = productRepository.findByBarcode(barcode).orElse(null);
            products = product == null ? List.of() : List.of(product);

        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }
        return products.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    //===== UPDATE ====
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        //update non-null fields so that only provided fields are updated, others remain same
        product.setName(request.name());
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
            product.setCategory(category);

        } else {
            product.setCategory(null);
        }

        product.setBarcode(request.barcode());
        product.setUnit(request.unit());
        product.setReorderLevel(request.reorderLevel());
        product.setAvgCostPrice(request.avgCostPrice());
        product.setSellingPrice(request.sellingPrice());
        //currentQuantity is not updated via product update
        // - stock changes by inventory service
        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    // ==== hard DELETE ====
    public void deleteProduct(String id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        //optional if any inventory adjustments exist, prevent delete
        if(product.getCurrentQuantity() > 0){
            throw new IllegalStateException("Cannot delete product with existing stock.");
        }
        productRepository.delete(product);
    }

    public ProductResponse toResponse(Product product) {
        CategoryResponse categoryResponse = null;
        if (product.getCategory() != null) {
            categoryResponse = new CategoryResponse(
                    product.getCategory().getId(),
                    product.getCategory().getName(),
                    product.getCategory().getDescription(),
                    product.getCategory().getCreatedAt().toString()

            );
        }

        return new ProductResponse(
                product.getId(),
                product.getName(),
                categoryResponse,
                product.getBarcode(),
                product.getUnit(),
                product.getReorderLevel(),
                product.getCurrentQuantity(),
                product.getAvgCostPrice(),
                product.getSellingPrice(),
                product.getCreatedAt().toString()
        );
    }
}
