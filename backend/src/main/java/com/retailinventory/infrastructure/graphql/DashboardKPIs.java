package com.retailinventory.infrastructure.graphql;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * GraphQL DTO for Dashboard KPIs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKPIs {
    private Double totalInventoryValue;
    private Integer lowStockItems;
    private Integer openPurchaseOrders;
    private Double averageLeadTime;
    private Double forecastAccuracy;
    private List<ProductSales> topSellingProducts;
    private Double inventoryTurnover;
}
