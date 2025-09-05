package com.retailinventory.dto;

import com.retailinventory.domain.entity.Product;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProductResponse {
    
    private UUID id;
    
    private String sku;
    
    private String name;
    
    private String category;
    
    private String subcategory;
    
    private String brand;
    
    private String description;
    
    private BigDecimal unitCost;
    
    private BigDecimal unitPrice;
    
    private Integer casePackSize;
    
    private UUID supplierId;
    
    private String supplierName;
    
    private Product.ProductStatus status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .category(product.getCategory())
                .subcategory(product.getSubcategory())
                .brand(product.getBrand())
                .description(product.getDescription())
                .unitCost(product.getUnitCost())
                .unitPrice(product.getUnitPrice())
                .casePackSize(product.getCasePackSize())
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
