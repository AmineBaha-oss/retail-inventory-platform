package com.retailinventory.infrastructure.dto.reorder;

import com.retailinventory.domain.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for reorder suggestions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSuggestion {
    private Product product;
    private Integer currentStock;
    private Integer onOrder;
    private Integer allocated;
    private Double p90DailyDemand;
    private Integer leadTimeDays;
    private Integer suggestedQuantity;
    private Double unitCost;
    private Double totalCost;
    private String reason;
}
