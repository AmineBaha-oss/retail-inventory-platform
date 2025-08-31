package com.retailinventory.infrastructure.dto;

import com.retailinventory.domain.entity.Store;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating an existing store.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreUpdateRequest {

    @NotBlank(message = "Store name is required")
    @Size(max = 255, message = "Store name cannot exceed 255 characters")
    private String name;

    @NotBlank(message = "Store code is required")
    @Size(max = 50, message = "Store code cannot exceed 50 characters")
    private String code;

    @NotNull(message = "Store type is required")
    private Store.StoreType type;

    @NotNull(message = "Store status is required")
    private Store.StoreStatus status;

    @Size(max = 255, message = "Manager name cannot exceed 255 characters")
    private String manager;

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;

    @Size(max = 50, message = "Phone cannot exceed 50 characters")
    private String phone;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 100, message = "Country cannot exceed 100 characters")
    private String country;

    @Size(max = 100, message = "Timezone cannot exceed 100 characters")
    private String timezone;

    private Store.POSSystem posSystem;

    @NotNull(message = "Sync frequency is required")
    private Store.SyncFrequency syncFrequency;

    @DecimalMin(value = "0.0", message = "Service level cannot be negative")
    @DecimalMax(value = "100.0", message = "Service level cannot exceed 100")
    private BigDecimal serviceLevel;

    @Min(value = 1, message = "Average lead time must be at least 1 day")
    @Max(value = 365, message = "Average lead time cannot exceed 365 days")
    private Integer avgLeadTime;

    @Min(value = 0, message = "Safety stock buffer cannot be negative")
    @Max(value = 365, message = "Safety stock buffer cannot exceed 365 days")
    private Integer safetyStockBuffer;

    @Min(value = 0, message = "Reorder point cannot be negative")
    private Integer reorderPoint;

    @DecimalMin(value = "0.0", message = "Monthly revenue cannot be negative")
    private BigDecimal monthlyRevenue;

    @DecimalMin(value = "0.0", message = "Profit margin cannot be negative")
    @DecimalMax(value = "100.0", message = "Profit margin cannot exceed 100")
    private BigDecimal profitMargin;

    @DecimalMin(value = "0.0", message = "Holding cost cannot be negative")
    private BigDecimal holdingCost;
}
