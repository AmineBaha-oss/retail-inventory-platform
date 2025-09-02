package com.retailinventory.infrastructure.graphql;

import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * GraphQL Input DTO for creating purchase orders.
 */
@Data
public class PurchaseOrderCreateInput {
    private UUID storeId;
    private UUID supplierId;
    private List<PurchaseOrderItemInput> items;
    private String expectedDeliveryDate;
}
