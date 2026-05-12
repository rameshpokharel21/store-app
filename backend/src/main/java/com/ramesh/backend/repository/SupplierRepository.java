package com.ramesh.backend.repository;

import com.ramesh.backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, String> {

    boolean existsByName(String name);
}
