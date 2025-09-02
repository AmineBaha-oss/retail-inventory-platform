package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for tracking sales transactions.
 */
@Entity
@Table(name = "sales_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "quantity_sold", nullable = false)
    private Integer quantitySold;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "external_order_id", length = 255)
    private String externalOrderId;

    @Column(name = "customer_id", length = 255)
    private String customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 20)
    @Builder.Default
    private TransactionType transactionType = TransactionType.SALE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionType {
        SALE,
        RETURN,
        ADJUSTMENT
    }
}
