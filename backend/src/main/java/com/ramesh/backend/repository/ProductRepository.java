package com.ramesh.backend.repository;

import com.ramesh.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    boolean existsByBarcode(String barcode);
    Optional<Product> findByBarcode(String barcode);
    List<Product> findByCategoryId(String categoryId);

    @Query("SELECT p FROM Product p WHERE p.currentQuantity <= p.reorderLevel")
    List<Product> findLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentQuantity <= p.reorderLevel")
    long countLowStockProducts();
}
