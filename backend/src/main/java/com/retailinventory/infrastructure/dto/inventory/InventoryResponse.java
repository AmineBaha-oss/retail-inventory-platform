package com.retailinventory.infrastructure.dto.inventory;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for inventory responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private UUID id;
    private UUID storeId;
    private String storeCode;
    private String storeName;
    private UUID productId;
    private String productSku;
    private String productName;
    private BigDecimal quantityOnHand;
    private BigDecimal quantityOnOrder;
    private BigDecimal quantityReserved;
    private BigDecimal quantityAvailable;
    private BigDecimal costPerUnit;
    private Integer reorderPoint;
    private Integer maxStockLevel;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastCountDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime recordedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private String adjustmentReason;
    private String createdBy;
    private String updatedBy;
    private Long version;
}
