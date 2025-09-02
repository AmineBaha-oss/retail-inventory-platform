package com.retailinventory.infrastructure.graphql;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * GraphQL DTO for forecast points.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastPoint {
    private String date;
    private Double p50;
    private Double p90;
    private Double confidence;
}
