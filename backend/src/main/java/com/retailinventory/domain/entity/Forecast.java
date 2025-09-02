package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "forecasts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Forecast {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "horizon_days", nullable = false)
    private Integer horizonDays;

    @Column(name = "p50_forecast", precision = 10, scale = 2)
    private BigDecimal p50Forecast;

    @Column(name = "p90_forecast", precision = 10, scale = 2)
    private BigDecimal p90Forecast;

    @Column(name = "p95_forecast", precision = 10, scale = 2)
    private BigDecimal p95Forecast;

    @Column(name = "confidence_lower", precision = 10, scale = 2)
    private BigDecimal confidenceLower;

    @Column(name = "confidence_upper", precision = 10, scale = 2)
    private BigDecimal confidenceUpper;

    @Column(name = "model_version", nullable = false)
    private String modelVersion;

    @Column(name = "model_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ModelType modelType;

    @Column(name = "training_samples")
    private Integer trainingSamples;

    @Column(name = "mae", precision = 10, scale = 4)
    private BigDecimal mae;

    @Column(name = "mape", precision = 10, scale = 4)
    private BigDecimal mape;

    @Column(name = "rmse", precision = 10, scale = 4)
    private BigDecimal rmse;

    @Column(name = "coverage", precision = 10, scale = 4)
    private BigDecimal coverage;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum ModelType {
        PROPHET,
        LIGHTGBM,
        PYTORCH_DEEPAR,
        PYTORCH_NBEATS,
        PYTORCH_TFT,
        ENSEMBLE
    }

    // Helper methods
    public boolean isRecent() {
        return forecastDate.isAfter(LocalDate.now().minusDays(7));
    }

    public boolean hasGoodAccuracy() {
        return mape != null && mape.compareTo(BigDecimal.valueOf(20)) < 0; // MAPE < 20%
    }

    public BigDecimal getForecastValue(ForecastQuantile quantile) {
        return switch (quantile) {
            case P50 -> p50Forecast;
            case P90 -> p90Forecast;
            case P95 -> p95Forecast;
        };
    }

    public enum ForecastQuantile {
        P50, P90, P95
    }
}
