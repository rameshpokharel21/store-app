package com.ramesh.backend.repository;

import com.ramesh.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {

    boolean existsByBarcode(String barcode);
    Optional<Product> findByBarcode(String barcode);
    List<Product> findByCurrentQuantityLessThanEqual(int reorderLevel);
    List<Product> findByCategoryId(String categoryId);

    List<Product> findByCurrentQuantityLessThanEqualReorderLevel();
}
