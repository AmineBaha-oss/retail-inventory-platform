package com.retailinventory.infrastructure.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for creating inventory records.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCreateRequest {

    @NotNull(message = "Store ID is required")
    private UUID storeId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity on hand must be non-negative")
    private BigDecimal quantityOnHand;

    @Min(value = 0, message = "Quantity on order must be non-negative")
    @Builder.Default
    private BigDecimal quantityOnOrder = BigDecimal.ZERO;

    @Min(value = 0, message = "Quantity reserved must be non-negative")
    @Builder.Default
    private BigDecimal quantityReserved = BigDecimal.ZERO;

    @Min(value = 0, message = "Cost per unit must be non-negative")
    private BigDecimal costPerUnit;

    @Min(value = 0, message = "Reorder point must be non-negative")
    private Integer reorderPoint;

    @Min(value = 0, message = "Max stock level must be non-negative")
    private Integer maxStockLevel;

    private String adjustmentReason;
}
