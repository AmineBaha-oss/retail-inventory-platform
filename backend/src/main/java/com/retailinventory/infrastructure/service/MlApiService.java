package com.retailinventory.infrastructure.service;

import com.retailinventory.domain.entity.Forecast;
import com.retailinventory.domain.entity.Product;
import com.retailinventory.domain.entity.Store;
import com.retailinventory.domain.repository.ForecastRepository;
import com.retailinventory.domain.repository.ProductRepository;
import com.retailinventory.domain.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for integrating with the ML API for forecasting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MlApiService {

    private final WebClient mlWebClient;
    private final ForecastRepository forecastRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;

    @Value("${app.ml-service.base-url}")
    private String mlServiceBaseUrl;

    /**
     * Generate forecast for a product at a specific store.
     */
    public Mono<List<Forecast>> generateForecast(String storeId, String productId, int horizonDays) {
        log.info("Generating forecast for store: {}, product: {}, horizon: {} days", storeId, productId, horizonDays);

        // Prepare request payload
        Map<String, Object> requestPayload = Map.of(
            "store_id", storeId,
            "product_id", productId,
            "horizon_days", horizonDays
        );

        return mlWebClient
            .post()
            .uri("/api/v1/forecasting/generate")
            .bodyValue(requestPayload)
            .retrieve()
            .bodyToMono(Map.class)
            .flatMap(response -> {
                // Parse the response and create Forecast entities
                List<Map<String, Object>> forecastData = (List<Map<String, Object>>) response.get("forecast_data");
                
                // Get store and product entities
                Store store = storeRepository.findById(UUID.fromString(storeId)).orElse(null);
                Product product = productRepository.findById(UUID.fromString(productId)).orElse(null);
                
                if (store == null || product == null) {
                    return Mono.error(new RuntimeException("Store or product not found"));
                }
                
                List<Forecast> forecasts = forecastData.stream()
                    .map(data -> Forecast.builder()
                        .store(store)
                        .product(product)
                        .forecastDate(LocalDate.parse((String) data.get("date")))
                        .p50Forecast(new BigDecimal(data.get("p50").toString()))
                        .p90Forecast(new BigDecimal(data.get("p90").toString()))
                        .modelVersion((String) response.get("model_version"))
                        .build())
                    .toList();

                // Save forecasts to database
                return Mono.fromCallable(() -> {
                    forecastRepository.saveAll(forecasts);
                    log.info("Saved {} forecast records for store: {}, product: {}", 
                        forecasts.size(), storeId, productId);
                    return forecasts;
                });
            })
            .doOnError(error -> log.error("Error generating forecast for store: {}, product: {}", 
                storeId, productId, error));
    }

    /**
     * Train a new forecasting model.
     */
    public Mono<Map> trainModel(String storeId, String productId, 
                               List<Map<String, Object>> salesData) {
        log.info("Training model for store: {}, product: {}", storeId, productId);

        Map<String, Object> requestPayload = Map.of(
            "store_id", storeId,
            "product_id", productId,
            "sales_data", salesData
        );

        return mlWebClient
            .post()
            .uri("/api/v1/forecasting/train")
            .bodyValue(requestPayload)
            .retrieve()
            .bodyToMono(Map.class)
            .doOnSuccess(response -> log.info("Model trained successfully for store: {}, product: {}", 
                storeId, productId))
            .doOnError(error -> log.error("Error training model for store: {}, product: {}", 
                storeId, productId, error));
    }

    /**
     * Get model performance metrics.
     */
    public Mono<Map> getModelPerformance(String storeId, String productId) {
        return mlWebClient
            .get()
            .uri("/api/v1/forecasting/performance/{storeId}/{productId}", storeId, productId)
            .retrieve()
            .bodyToMono(Map.class)
            .doOnError(error -> log.error("Error getting model performance for store: {}, product: {}", 
                storeId, productId, error));
    }
}
