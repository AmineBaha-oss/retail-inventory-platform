package com.retailinventory.infrastructure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for store analytics summary responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreAnalyticsResponse {

    private long totalStores;
    private long activeStores;
    private long pausedStores;
    private long maintenanceStores;
    private long closedStores;
    
    // Performance Metrics
    private BigDecimal averageServiceLevel;
    private BigDecimal averageStockoutRate;
    private BigDecimal averageTurnoverRate;
    private BigDecimal totalMonthlyRevenue;
    
    // Store Type Distribution
    private long retailStores;
    private long warehouseStores;
    private long popUpStores;
    private long outletStores;
    
    // POS System Distribution
    private long shopifyStores;
    private long lightspeedStores;
    private long squareStores;
    private long wooCommerceStores;
    private long customStores;
    
    // Risk Indicators
    private long storesNeedingAttention;
    private long highPerformanceStores;
    private long storesNeedingSync;
    private long storesNeedingForecastUpdate;
}
