package com.retailinventory.infrastructure.dto.graphql;

import lombok.Data;

import java.util.UUID;

/**
 * Input DTO for GraphQL forecast generation mutation.
 */
@Data
public class ForecastGenerateInput {
    private UUID storeId;
    private UUID productId;
    private Integer horizonDays;
}
