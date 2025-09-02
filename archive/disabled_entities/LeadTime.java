package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lead_times", )
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadTime {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "lead_time_days", nullable = false)
    private Integer leadTimeDays;

    @Column(name = "lead_time_std_days", precision = 5, scale = 2)
    private BigDecimal leadTimeStdDays;

    @Column(name = "min_lead_time_days")
    private Integer minLeadTimeDays;

    @Column(name = "max_lead_time_days")
    private Integer maxLeadTimeDays;

    @Column(name = "p50_lead_time_days")
    private Integer p50LeadTimeDays;

    @Column(name = "p90_lead_time_days")
    private Integer p90LeadTimeDays;

    @Column(name = "p95_lead_time_days")
    private Integer p95LeadTimeDays;

    @Column(name = "reliability_score", precision = 3, scale = 2)
    private BigDecimal reliabilityScore;

    @Column(name = "on_time_delivery_rate", precision = 5, scale = 2)
    private BigDecimal onTimeDeliveryRate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_updated_from_po")
    private LocalDateTime lastUpdatedFromPo;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public boolean isReliable() {
        return reliabilityScore != null && reliabilityScore.compareTo(BigDecimal.valueOf(0.8)) >= 0;
    }

    public boolean hasGoodOnTimeDelivery() {
        return onTimeDeliveryRate != null && onTimeDeliveryRate.compareTo(BigDecimal.valueOf(90)) >= 0;
    }

    public Integer getLeadTimeForServiceLevel(ServiceLevel serviceLevel) {
        return switch (serviceLevel) {
            case P50 -> p50LeadTimeDays != null ? p50LeadTimeDays : leadTimeDays;
            case P90 -> p90LeadTimeDays != null ? p90LeadTimeDays : leadTimeDays;
            case P95 -> p95LeadTimeDays != null ? p95LeadTimeDays : leadTimeDays;
        };
    }

    public boolean hasSufficientData() {
        return sampleSize != null && sampleSize >= 10;
    }

    public enum ServiceLevel {
        P50, P90, P95
    }
}
