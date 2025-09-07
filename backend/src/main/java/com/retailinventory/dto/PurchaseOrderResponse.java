package com.retailinventory.dto;

import com.retailinventory.domain.entity.PurchaseOrder;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PurchaseOrderResponse {
    
    private UUID id;
    
    private String poNumber;
    
    private UUID supplierId;
    
    private String supplierName;
    
    private UUID storeId;
    
    private String storeName;
    
    private PurchaseOrder.PurchaseOrderStatus status;
    
    private BigDecimal totalAmount;
    
    private BigDecimal taxAmount;
    
    private BigDecimal shippingAmount;
    
    private LocalDate orderDate;
    
    private LocalDate expectedDeliveryDate;
    
    private LocalDate actualDeliveryDate;
    
    private UUID createdBy;
    
    private UUID approvedBy;
    
    private LocalDateTime approvedAt;
    
    private LocalDateTime sentAt;
    
    private LocalDateTime receivedAt;
    
    private PurchaseOrder.Priority priority;
    
    private String notes;
    
    private int itemCount;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    public static PurchaseOrderResponse from(PurchaseOrder purchaseOrder) {
        return PurchaseOrderResponse.builder()
                .id(purchaseOrder.getId())
                .poNumber(purchaseOrder.getPoNumber())
                .supplierId(purchaseOrder.getSupplier() != null ? purchaseOrder.getSupplier().getId() : null)
                .supplierName(purchaseOrder.getSupplier() != null ? purchaseOrder.getSupplier().getName() : null)
                .storeId(purchaseOrder.getStore() != null ? purchaseOrder.getStore().getId() : null)
                .storeName(purchaseOrder.getStore() != null ? purchaseOrder.getStore().getName() : null)
                .status(purchaseOrder.getStatus())
                .totalAmount(purchaseOrder.getTotalAmount())
                .taxAmount(purchaseOrder.getTaxAmount())
                .shippingAmount(purchaseOrder.getShippingAmount())
                .orderDate(purchaseOrder.getOrderDate())
                .expectedDeliveryDate(purchaseOrder.getExpectedDeliveryDate())
                .actualDeliveryDate(purchaseOrder.getActualDeliveryDate())
                .createdBy(purchaseOrder.getCreatedBy())
                .approvedBy(purchaseOrder.getApprovedBy())
                .approvedAt(purchaseOrder.getApprovedAt())
                .sentAt(purchaseOrder.getSentAt())
                .receivedAt(purchaseOrder.getReceivedAt())
                .priority(purchaseOrder.getPriority())
                .notes(purchaseOrder.getNotes())
                .itemCount(purchaseOrder.getItems() != null ? purchaseOrder.getItems().size() : 0)
                .createdAt(purchaseOrder.getCreatedAt())
                .updatedAt(purchaseOrder.getUpdatedAt())
                .build();
    }
}
