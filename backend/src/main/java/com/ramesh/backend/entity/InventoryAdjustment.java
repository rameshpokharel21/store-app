package com.ramesh.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="inventory_adjustments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name="product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User user; //who performed the adjustment

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentType changeType;

    //positive=received, negative = sold/spoilded/damanged
    @Column(nullable = false)
    private int quantityChange;

    private String reason;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
    }
}
