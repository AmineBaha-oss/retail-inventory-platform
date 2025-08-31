package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Store entity representing a retail location or warehouse.
 * Core entity for multi-store inventory management and forecasting.
 */
@Entity
@Table(name = "stores", indexes = {
    @Index(name = "idx_store_code", columnList = "code", unique = true),
    @Index(name = "idx_store_status", columnList = "status"),
    @Index(name = "idx_store_type", columnList = "type"),
    @Index(name = "idx_store_pos_system", columnList = "pos_system")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Store extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    @NotBlank(message = "Store code is required")
    @Size(max = 50, message = "Store code cannot exceed 50 characters")
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    @NotBlank(message = "Store name is required")
    @Size(max = 255, message = "Store name cannot exceed 255 characters")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @NotNull(message = "Store type is required")
    private StoreType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @NotNull(message = "Store status is required")
    private StoreStatus status;

    @Column(name = "manager", length = 255)
    @Size(max = 255, message = "Manager name cannot exceed 255 characters")
    private String manager;

    @Column(name = "email", length = 255)
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;

    @Column(name = "phone", length = 50)
    @Size(max = 50, message = "Phone cannot exceed 50 characters")
    private String phone;

    @Column(name = "address", length = 500)
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Column(name = "city", length = 100)
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Column(name = "country", length = 100)
    @Size(max = 100, message = "Country cannot exceed 100 characters")
    private String country;

    @Column(name = "timezone", length = 100)
    @Size(max = 100, message = "Timezone cannot exceed 100 characters")
    private String timezone;

    // Integration Settings
    @Enumerated(EnumType.STRING)
    @Column(name = "pos_system")
    private POSSystem posSystem;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_frequency", nullable = false)
    @NotNull(message = "Sync frequency is required")
    private SyncFrequency syncFrequency;

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "last_forecast_update")
    private LocalDateTime lastForecastUpdate;

    // Performance Metrics
    @Column(name = "service_level", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Service level cannot be negative")
    @DecimalMax(value = "100.0", message = "Service level cannot exceed 100")
    private BigDecimal serviceLevel;

    @Column(name = "avg_lead_time")
    @Min(value = 1, message = "Average lead time must be at least 1 day")
    @Max(value = 365, message = "Average lead time cannot exceed 365 days")
    private Integer avgLeadTime;

    @Column(name = "safety_stock_buffer")
    @Min(value = 0, message = "Safety stock buffer cannot be negative")
    @Max(value = 365, message = "Safety stock buffer cannot exceed 365 days")
    private Integer safetyStockBuffer;

    @Column(name = "reorder_point")
    @Min(value = 0, message = "Reorder point cannot be negative")
    private Integer reorderPoint;

    @Column(name = "stockout_rate", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Stockout rate cannot be negative")
    @DecimalMax(value = "100.0", message = "Stockout rate cannot exceed 100")
    private BigDecimal stockoutRate;

    @Column(name = "overstock_rate", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Overstock rate cannot be negative")
    @DecimalMax(value = "100.0", message = "Overstock rate cannot exceed 100")
    private BigDecimal overstockRate;

    @Column(name = "turnover_rate", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Turnover rate cannot be negative")
    private BigDecimal turnoverRate;

    // Financial Metrics
    @Column(name = "monthly_revenue", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Monthly revenue cannot be negative")
    private BigDecimal monthlyRevenue;

    @Column(name = "profit_margin", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Profit margin cannot be negative")
    @DecimalMax(value = "100.0", message = "Profit margin cannot exceed 100")
    private BigDecimal profitMargin;

    @Column(name = "holding_cost", precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Holding cost cannot be negative")
    private BigDecimal holdingCost;

    // Audit Fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships - Commented out until other entities are created
    // @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @ToString.Exclude
    // private List<Inventory> inventories = new ArrayList<>();

    // @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @ToString.Exclude
    // private List<SalesTransaction> salesTransactions = new ArrayList<>();

    // @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @ToString.Exclude
    // private List<PurchaseOrder> purchaseOrders = new ArrayList<>();

    // Enums
    public enum StoreType {
        RETAIL, WAREHOUSE, POP_UP, OUTLET
    }

    public enum StoreStatus {
        ACTIVE, PAUSED, MAINTENANCE, CLOSED
    }

    public enum POSSystem {
        SHOPIFY, LIGHTSPEED, SQUARE, WOOCOMMERCE, CUSTOM
    }

    public enum SyncFrequency {
        REAL_TIME, HOURLY, DAILY, WEEKLY
    }

    // Business Logic Methods
    public boolean isActive() {
        return StoreStatus.ACTIVE.equals(this.status);
    }

    public boolean needsAttention() {
        return this.stockoutRate != null && 
               this.stockoutRate.compareTo(BigDecimal.valueOf(5.0)) > 0;
    }

    public boolean isHighPerformance() {
        return this.serviceLevel != null && 
               this.serviceLevel.compareTo(BigDecimal.valueOf(98.0)) >= 0;
    }

    public String getDisplayName() {
        return String.format("%s (%s)", this.name, this.code);
    }
}
