package com.retailinventory.infrastructure.dto.supplier;

import com.retailinventory.domain.entity.Supplier.SupplierStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

/**
 * DTO for creating a new supplier.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierCreateRequest {

    @NotBlank(message = "Supplier code is required")
    @Size(max = 50, message = "Supplier code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 255, message = "Supplier name must not exceed 255 characters")
    private String name;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    private String contactPerson;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    private String address;

    @Min(value = 0, message = "Lead time days must be non-negative")
    private Integer leadTimeDays;

    @Min(value = 0, message = "Minimum order quantity must be non-negative")
    private Integer minOrderQuantity;

    @Min(value = 0, message = "Minimum order value must be non-negative")
    private BigDecimal minOrderValue;

    @Builder.Default
    private SupplierStatus status = SupplierStatus.ACTIVE;
}
