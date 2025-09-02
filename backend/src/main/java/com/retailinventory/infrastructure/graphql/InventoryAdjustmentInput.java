package com.retailinventory.infrastructure.graphql;

import lombok.Data;

import java.util.UUID;

/**
 * GraphQL Input DTO for inventory adjustments.
 */
@Data
public class InventoryAdjustmentInput {
    private UUID storeId;
    private UUID productId;
    private Integer adjustment;
    private String reason;
}
