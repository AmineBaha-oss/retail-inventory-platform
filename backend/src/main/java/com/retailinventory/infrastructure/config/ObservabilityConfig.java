package com.retailinventory.infrastructure.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for observability metrics.
 */
@Configuration
public class ObservabilityConfig {

    @Bean
    public Counter inventoryUpdateCounter(MeterRegistry meterRegistry) {
        return Counter.builder("inventory.updates")
                .description("Number of inventory updates")
                .register(meterRegistry);
    }

    @Bean
    public Counter purchaseOrderCounter(MeterRegistry meterRegistry) {
        return Counter.builder("purchase_orders.created")
                .description("Number of purchase orders created")
                .register(meterRegistry);
    }

    @Bean
    public Counter forecastGenerationCounter(MeterRegistry meterRegistry) {
        return Counter.builder("forecasts.generated")
                .description("Number of forecasts generated")
                .register(meterRegistry);
    }

    @Bean
    public Counter webhookProcessingCounter(MeterRegistry meterRegistry) {
        return Counter.builder("webhooks.processed")
                .description("Number of webhooks processed")
                .tag("source", "unknown")
                .register(meterRegistry);
    }

    @Bean
    public Timer forecastGenerationTimer(MeterRegistry meterRegistry) {
        return Timer.builder("forecasts.generation.time")
                .description("Time taken to generate forecasts")
                .register(meterRegistry);
    }

    @Bean
    public Timer webhookProcessingTimer(MeterRegistry meterRegistry) {
        return Timer.builder("webhooks.processing.time")
                .description("Time taken to process webhooks")
                .register(meterRegistry);
    }

    @Bean
    public Counter lowStockAlertCounter(MeterRegistry meterRegistry) {
        return Counter.builder("alerts.low_stock")
                .description("Number of low stock alerts")
                .register(meterRegistry);
    }

    @Bean
    public Counter auditEventCounter(MeterRegistry meterRegistry) {
        return Counter.builder("audit.events")
                .description("Number of audit events")
                .tag("entity_type", "unknown")
                .register(meterRegistry);
    }
}
