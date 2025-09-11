package com.retailinventory.infrastructure.dto.graphql;

import lombok.Builder;
import lombok.Data;

/**
 * DTO for GraphQL forecast point response.
 */
@Data
@Builder
public class ForecastPoint {
    private String date;
    private Double p50;
    private Double p90;
    private Double confidence;
}
