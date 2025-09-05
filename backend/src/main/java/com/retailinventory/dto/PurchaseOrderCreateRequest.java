package com.retailinventory.dto;

import com.retailinventory.domain.entity.PurchaseOrder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchaseOrderCreateRequest {
    
    // PO number is now optional - will be auto-generated if not provided
    private String poNumber;
    
    @NotNull(message = "Supplier ID is required")
    private UUID supplierId;
    
    @NotNull(message = "Store ID is required")
    private UUID storeId;
    
    private PurchaseOrder.PurchaseOrderStatus status = PurchaseOrder.PurchaseOrderStatus.DRAFT;
    
    @DecimalMin(value = "0.0", message = "Tax amount must be non-negative")
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @DecimalMin(value = "0.0", message = "Shipping amount must be non-negative")
    private BigDecimal shippingAmount = BigDecimal.ZERO;
    
    private LocalDate orderDate;
    
    private LocalDate expectedDeliveryDate;
    
    private UUID createdBy;
    
    private PurchaseOrder.Priority priority = PurchaseOrder.Priority.MEDIUM;
    
    private String notes;
}
