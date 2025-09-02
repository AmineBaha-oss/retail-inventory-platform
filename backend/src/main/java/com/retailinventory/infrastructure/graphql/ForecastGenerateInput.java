package com.retailinventory.infrastructure.graphql;

import lombok.Data;

import java.util.UUID;

/**
 * GraphQL Input DTO for generating forecasts.
 */
@Data
public class ForecastGenerateInput {
    private UUID storeId;
    private UUID productId;
    private Integer horizonDays;
}
