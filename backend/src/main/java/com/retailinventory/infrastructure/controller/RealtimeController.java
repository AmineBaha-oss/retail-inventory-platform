package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Inventory;
import com.retailinventory.domain.entity.PurchaseOrder;
import com.retailinventory.domain.entity.Forecast;
import com.retailinventory.domain.repository.InventoryRepository;
import com.retailinventory.domain.repository.PurchaseOrderRepository;
import com.retailinventory.domain.repository.ForecastRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.util.UUID;

/**
 * Controller for real-time updates using Server-Sent Events.
 */
@RestController
@RequestMapping("/v1/realtime")
@RequiredArgsConstructor
@Slf4j
public class RealtimeController {

    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ForecastRepository forecastRepository;

    // Sinks for broadcasting events
    private final Sinks.Many<Inventory> inventorySink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<PurchaseOrder> purchaseOrderSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<Forecast> forecastSink = Sinks.many().multicast().onBackpressureBuffer();

    /**
     * Stream inventory updates for a specific store.
     */
    @GetMapping(value = "/inventory/{storeId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Inventory>> streamInventoryUpdates(@PathVariable UUID storeId) {
        log.debug("Starting inventory stream for store: {}", storeId);
        
        return inventorySink.asFlux()
                .filter(inventory -> inventory.getStoreId().equals(storeId))
                .map(inventory -> ServerSentEvent.<Inventory>builder()
                        .event("inventory-update")
                        .data(inventory)
                        .build())
                .doOnCancel(() -> log.debug("Inventory stream cancelled for store: {}", storeId))
                .doOnError(error -> log.error("Error in inventory stream for store: {}", storeId, error));
    }

    /**
     * Stream purchase order updates for a specific store.
     */
    @GetMapping(value = "/purchase-orders/{storeId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<PurchaseOrder>> streamPurchaseOrderUpdates(@PathVariable UUID storeId) {
        log.debug("Starting purchase order stream for store: {}", storeId);
        
        return purchaseOrderSink.asFlux()
                .filter(po -> po.getStoreId().equals(storeId))
                .map(po -> ServerSentEvent.<PurchaseOrder>builder()
                        .event("purchase-order-update")
                        .data(po)
                        .build())
                .doOnCancel(() -> log.debug("Purchase order stream cancelled for store: {}", storeId))
                .doOnError(error -> log.error("Error in purchase order stream for store: {}", storeId, error));
    }

    /**
     * Stream forecast updates for a specific store.
     */
    @GetMapping(value = "/forecasts/{storeId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Forecast>> streamForecastUpdates(@PathVariable UUID storeId) {
        log.debug("Starting forecast stream for store: {}", storeId);
        
        return forecastSink.asFlux()
                .filter(forecast -> forecast.getStoreId().equals(storeId))
                .map(forecast -> ServerSentEvent.<Forecast>builder()
                        .event("forecast-update")
                        .data(forecast)
                        .build())
                .doOnCancel(() -> log.debug("Forecast stream cancelled for store: {}", storeId))
                .doOnError(error -> log.error("Error in forecast stream for store: {}", storeId, error));
    }

    /**
     * Stream dashboard KPIs for a specific store.
     */
    @GetMapping(value = "/dashboard/{storeId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<DashboardKPIs>> streamDashboardKPIs(@PathVariable UUID storeId) {
        log.debug("Starting dashboard KPI stream for store: {}", storeId);
        
        return Flux.interval(Duration.ofSeconds(30)) // Update every 30 seconds
                .map(tick -> {
                    DashboardKPIs kpis = calculateDashboardKPIs(storeId);
                    return ServerSentEvent.<DashboardKPIs>builder()
                            .event("dashboard-update")
                            .data(kpis)
                            .build();
                })
                .doOnCancel(() -> log.debug("Dashboard KPI stream cancelled for store: {}", storeId))
                .doOnError(error -> log.error("Error in dashboard KPI stream for store: {}", storeId, error));
    }

    /**
     * Stream all events for a specific store.
     */
    @GetMapping(value = "/events/{storeId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Object>> streamAllEvents(@PathVariable UUID storeId) {
        log.debug("Starting combined event stream for store: {}", storeId);
        
        Flux<ServerSentEvent<Object>> inventoryEvents = inventorySink.asFlux()
                .filter(inventory -> inventory.getStoreId().equals(storeId))
                .map(inventory -> ServerSentEvent.<Object>builder()
                        .event("inventory-update")
                        .data(inventory)
                        .build());

        Flux<ServerSentEvent<Object>> poEvents = purchaseOrderSink.asFlux()
                .filter(po -> po.getStoreId().equals(storeId))
                .map(po -> ServerSentEvent.<Object>builder()
                        .event("purchase-order-update")
                        .data(po)
                        .build());

        Flux<ServerSentEvent<Object>> forecastEvents = forecastSink.asFlux()
                .filter(forecast -> forecast.getStoreId().equals(storeId))
                .map(forecast -> ServerSentEvent.<Object>builder()
                        .event("forecast-update")
                        .data(forecast)
                        .build());

        return Flux.merge(inventoryEvents, poEvents, forecastEvents)
                .doOnCancel(() -> log.debug("Combined event stream cancelled for store: {}", storeId))
                .doOnError(error -> log.error("Error in combined event stream for store: {}", storeId, error));
    }

    /**
     * Broadcast inventory update to all subscribers.
     */
    public void broadcastInventoryUpdate(Inventory inventory) {
        log.debug("Broadcasting inventory update for store: {}, product: {}", 
                inventory.getStoreId(), inventory.getProductId());
        inventorySink.tryEmitNext(inventory);
    }

    /**
     * Broadcast purchase order update to all subscribers.
     */
    public void broadcastPurchaseOrderUpdate(PurchaseOrder purchaseOrder) {
        log.debug("Broadcasting purchase order update for PO: {}", purchaseOrder.getPoNumber());
        purchaseOrderSink.tryEmitNext(purchaseOrder);
    }

    /**
     * Broadcast forecast update to all subscribers.
     */
    public void broadcastForecastUpdate(Forecast forecast) {
        log.debug("Broadcasting forecast update for store: {}, product: {}", 
                forecast.getStoreId(), forecast.getProductId());
        forecastSink.tryEmitNext(forecast);
    }

    private DashboardKPIs calculateDashboardKPIs(UUID storeId) {
        // This would calculate real KPIs from the database
        // For now, returning mock data
        return DashboardKPIs.builder()
                .totalInventoryValue(100000.0)
                .lowStockItems(5)
                .openPurchaseOrders(3)
                .averageLeadTime(7.5)
                .forecastAccuracy(0.85)
                .inventoryTurnover(4.2)
                .build();
    }

    // DTO for dashboard KPIs
    @lombok.Data
    @lombok.Builder
    public static class DashboardKPIs {
        private Double totalInventoryValue;
        private Integer lowStockItems;
        private Integer openPurchaseOrders;
        private Double averageLeadTime;
        private Double forecastAccuracy;
        private Double inventoryTurnover;
    }
}
