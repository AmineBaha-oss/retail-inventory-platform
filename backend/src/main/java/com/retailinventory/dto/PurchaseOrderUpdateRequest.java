package com.retailinventory.dto;

import com.retailinventory.domain.entity.PurchaseOrder;
import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PurchaseOrderUpdateRequest {
    
    private PurchaseOrder.PurchaseOrderStatus status;
    
    @DecimalMin(value = "0.0", message = "Tax amount must be non-negative")
    private BigDecimal taxAmount;
    
    @DecimalMin(value = "0.0", message = "Shipping amount must be non-negative")
    private BigDecimal shippingAmount;
    
    private LocalDate expectedDeliveryDate;
    
    private LocalDate actualDeliveryDate;
    
    private UUID approvedBy;
    
    private LocalDateTime approvedAt;
    
    private PurchaseOrder.Priority priority;
    
    private String notes;
}
