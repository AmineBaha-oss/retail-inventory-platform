package com.retailinventory.infrastructure.graphql;

import com.retailinventory.domain.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * GraphQL DTO for Product Sales data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSales {
    private Product product;
    private Integer quantitySold;
    private Double revenue;
}
