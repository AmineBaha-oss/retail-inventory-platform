package com.retailinventory.dto;

import com.retailinventory.domain.entity.Product;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductCreateRequest {
    
    // SKU is now optional - will be auto-generated if not provided
    private String sku;
    
    @NotBlank(message = "Product name is required")
    private String name;
    
    private String category;
    
    private String subcategory;
    
    private String brand;
    
    private String description;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit cost must be greater than 0")
    private BigDecimal unitCost;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    private BigDecimal unitPrice;
    
    @Min(value = 1, message = "Case pack size must be at least 1")
    private Integer casePackSize = 1;
    
    @NotNull(message = "Supplier ID is required")
    private UUID supplierId;
    
    private Product.ProductStatus status = Product.ProductStatus.ACTIVE;
}
