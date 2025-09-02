package com.retailinventory.infrastructure.graphql;

import lombok.Data;

import java.util.UUID;

/**
 * GraphQL Input DTO for purchase order items.
 */
@Data
public class PurchaseOrderItemInput {
    private UUID productId;
    private Integer quantity;
    private Double unitPrice;
}
