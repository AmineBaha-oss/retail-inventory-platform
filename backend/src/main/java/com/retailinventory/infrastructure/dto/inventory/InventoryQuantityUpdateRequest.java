package com.retailinventory.infrastructure.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

/**
 * DTO for updating inventory quantity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryQuantityUpdateRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be non-negative")
    private BigDecimal quantity;

    private String reason;
}
