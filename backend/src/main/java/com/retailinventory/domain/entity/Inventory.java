package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand;

    @Column(name = "quantity_reserved")
    @Builder.Default
    private Integer quantityReserved = 0;

    @Column(name = "quantity_available", insertable = false, updatable = false)
    private Integer quantityAvailable;

    @Column(name = "reorder_point")
    @Builder.Default
    private Integer reorderPoint = 10;

    @Column(name = "max_stock_level")
    private Integer maxStockLevel;

    @Column(name = "cost_per_unit", precision = 10, scale = 2)
    private BigDecimal costPerUnit;

    @Column(name = "last_count_date")
    private LocalDate lastCountDate;

    @Column(name = "adjustment_reason", columnDefinition = "TEXT")
    private String adjustmentReason;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Helper methods
    public Integer getQuantityAvailable() {
        return quantityOnHand - quantityReserved;
    }

    public boolean isBelowReorderPoint() {
        return getQuantityAvailable() <= reorderPoint;
    }

    public boolean isStockOut() {
        return getQuantityAvailable() <= 0;
    }

    public BigDecimal getTotalValue() {
        if (costPerUnit != null && quantityOnHand != null) {
            return costPerUnit.multiply(BigDecimal.valueOf(quantityOnHand));
        }
        return BigDecimal.ZERO;
    }

    public InventoryStatus getStatus() {
        if (isStockOut()) {
            return InventoryStatus.STOCKOUT;
        } else if (isBelowReorderPoint()) {
            return InventoryStatus.LOW;
        } else {
            return InventoryStatus.HEALTHY;
        }
    }

    public enum InventoryStatus {
        HEALTHY,
        LOW,
        STOCKOUT
    }
}
