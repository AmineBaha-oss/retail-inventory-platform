package com.retailinventory.infrastructure.dto.supplier;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.retailinventory.domain.entity.Supplier.SupplierStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for supplier responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {

    private UUID id;
    private String code;
    private String name;
    private String category;
    private String contactPerson;
    private String email;
    private String phone;
    private String country;
    private String city;
    private String address;
    private Integer leadTimeDays;
    private Integer minOrderQuantity;
    private BigDecimal minOrderValue;
    private SupplierStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
