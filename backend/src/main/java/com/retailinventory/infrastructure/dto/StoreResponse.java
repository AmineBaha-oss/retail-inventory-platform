package com.retailinventory.infrastructure.dto;

import com.retailinventory.domain.entity.Store;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for store responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {

    private Long id;
    private String code;
    private String name;
    private Store.StoreType type;
    private Store.StoreStatus status;
    private String manager;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String timezone;
    
    // Integration Settings
    private Store.POSSystem posSystem;
    private Store.SyncFrequency syncFrequency;
    private LocalDateTime lastSync;
    private LocalDateTime lastForecastUpdate;
    
    // Performance Metrics
    private BigDecimal serviceLevel;
    private Integer avgLeadTime;
    private Integer safetyStockBuffer;
    private Integer reorderPoint;
    private BigDecimal stockoutRate;
    private BigDecimal overstockRate;
    private BigDecimal turnoverRate;
    
    // Financial Metrics
    private BigDecimal monthlyRevenue;
    private BigDecimal profitMargin;
    private BigDecimal holdingCost;
    
    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    // Computed fields - will be calculated in service layer
    // private boolean needsAttention;
    // private boolean isHighPerformance;
    // private String displayName;
}
