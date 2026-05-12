package com.ramesh.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @Column(unique = true)
    private String barcode;

    @Column(nullable = false)
    private String unit;  //kg, pcs, liters

    private int reorderLevel; //low stock threshold

    private int currentQuantity; //total stock at hand

    @Column(precision = 10, scale = 2)
    private BigDecimal avgCostPrice; //for profit reporting

    @Column(name="created_at")
    private LocalDateTime createdAt;

    protected void onCreate(){
        createdAt = LocalDateTime.now();
        currentQuantity = 0;
    }

}
