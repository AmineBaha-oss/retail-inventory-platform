package com.retailinventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application for the Retail Inventory Platform.
 * 
 * Features:
 * - Multi-store demand forecasting
 * - Auto-replenishment with probabilistic forecasts
 * - Real-time inventory management
 * - Purchase order automation
 * - Supplier constraint management
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class RetailInventoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetailInventoryApplication.class, args);
    }
}
