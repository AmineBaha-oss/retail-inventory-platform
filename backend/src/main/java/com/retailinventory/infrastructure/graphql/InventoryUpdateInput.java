package com.retailinventory.infrastructure.graphql;

import lombok.Data;

import java.util.UUID;

/**
 * GraphQL Input DTO for inventory updates.
 */
@Data
public class InventoryUpdateInput {
    private UUID storeId;
    private UUID productId;
    private Integer quantityOnHand;
}
