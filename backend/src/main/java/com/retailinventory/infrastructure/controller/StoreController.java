package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Store;
import com.retailinventory.domain.service.StoreService;
import com.retailinventory.infrastructure.dto.StoreCreateRequest;
import com.retailinventory.infrastructure.dto.StoreUpdateRequest;
import com.retailinventory.infrastructure.dto.StoreResponse;
import com.retailinventory.infrastructure.dto.StoreAnalyticsResponse;
import com.retailinventory.infrastructure.mapper.StoreMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST API controller for Store management.
 * Provides endpoints for CRUD operations, search, filtering, and analytics.
 */
@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Store Management", description = "APIs for managing retail stores and warehouses")
public class StoreController {

    private final StoreService storeService;
    private final StoreMapper storeMapper;

    @PostMapping
    @Operation(summary = "Create a new store", description = "Creates a new store with the provided details")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<StoreResponse> createStore(@Valid @RequestBody StoreCreateRequest request) {
        log.info("Creating new store: {}", request.getName());
        
        Store store = storeMapper.toEntity(request);
        Store createdStore = storeService.createStore(store);
        StoreResponse response = storeMapper.toResponse(createdStore);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get store by ID", description = "Retrieves a store by its unique identifier")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<StoreResponse> getStoreById(@PathVariable Long id) {
        log.info("Fetching store with ID: {}", id);
        
        Store store = storeService.getStoreById(id)
            .orElseThrow(() -> new RuntimeException("Store not found"));
        
        StoreResponse response = storeMapper.toResponse(store);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all stores", description = "Retrieves a paginated list of all stores with optional filtering")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<StoreResponse>> getAllStores(
            @PageableDefault(size = 20, sort = "name") Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Store.StoreStatus status,
            @RequestParam(required = false) Store.StoreType type,
            @RequestParam(required = false) Store.POSSystem posSystem,
            @RequestParam(required = false) BigDecimal minServiceLevel,
            @RequestParam(required = false) BigDecimal maxStockoutRate) {
        
        log.info("Fetching stores with filters - search: {}, status: {}, type: {}, posSystem: {}", 
                search, status, type, posSystem);
        
        Page<Store> stores;
        if (search != null && !search.trim().isEmpty()) {
            stores = storeService.searchStores(search, pageable);
        } else if (status != null || type != null || posSystem != null || 
                   minServiceLevel != null || maxStockoutRate != null) {
            stores = storeService.getStoresByMultipleCriteria(
                status, type, posSystem, minServiceLevel, maxStockoutRate, pageable);
        } else {
            stores = storeService.getAllStores(pageable);
        }
        
        Page<StoreResponse> response = stores.map(storeMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update store", description = "Updates an existing store with the provided details")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable Long id, 
            @Valid @RequestBody StoreUpdateRequest request) {
        log.info("Updating store with ID: {}", id);
        
        Store store = storeMapper.toEntity(request);
        Store updatedStore = storeService.updateStore(id, store);
        StoreResponse response = storeMapper.toResponse(updatedStore);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete store", description = "Soft deletes a store (marks as deleted)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        log.info("Deleting store with ID: {}", id);
        
        // TODO: Get current user from security context
        String currentUser = "system";
        storeService.deleteStore(id, currentUser);
        
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restore store", description = "Restores a previously deleted store")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreStore(@PathVariable Long id) {
        log.info("Restoring store with ID: {}", id);
        
        storeService.restoreStore(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/analytics/summary")
    @Operation(summary = "Get store analytics summary", description = "Retrieves summary analytics for all stores")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<StoreAnalyticsResponse> getStoreAnalytics() {
        log.info("Fetching store analytics summary");
        
        StoreAnalyticsResponse analytics = StoreAnalyticsResponse.builder()
            .totalStores(storeService.getAllStores(Pageable.unpaged()).getTotalElements())
            .activeStores(storeService.getStoreCountByStatus(Store.StoreStatus.ACTIVE))
            .pausedStores(storeService.getStoreCountByStatus(Store.StoreStatus.PAUSED))
            .averageServiceLevel(storeService.getAverageServiceLevel())
            .averageStockoutRate(storeService.getAverageStockoutRate())
            .averageTurnoverRate(storeService.getAverageTurnoverRate())
            .totalMonthlyRevenue(storeService.getTotalMonthlyRevenue())
            .build();
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get stores by status", description = "Retrieves all stores with the specified status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StoreResponse>> getStoresByStatus(
            @PathVariable Store.StoreStatus status) {
        log.info("Fetching stores with status: {}", status);
        
        List<Store> stores = storeService.getStoresByStatus(status);
        List<StoreResponse> response = stores.stream()
            .map(storeMapper::toResponse)
            .toList();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get stores by type", description = "Retrieves all stores with the specified type")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StoreResponse>> getStoresByType(
            @PathVariable Store.StoreType type) {
        log.info("Fetching stores with type: {}", type);
        
        List<Store> stores = storeService.getStoresByType(type);
        List<StoreResponse> response = stores.stream()
            .map(storeMapper::toResponse)
            .toList();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attention-needed")
    @Operation(summary = "Get stores needing attention", description = "Retrieves stores with high stockout rates")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StoreResponse>> getStoresNeedingAttention(
            @RequestParam(defaultValue = "5.0") BigDecimal threshold) {
        log.info("Fetching stores needing attention with threshold: {}", threshold);
        
        List<Store> stores = storeService.getStoresNeedingAttention(threshold);
        List<StoreResponse> response = stores.stream()
            .map(storeMapper::toResponse)
            .toList();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/high-performance")
    @Operation(summary = "Get high-performance stores", description = "Retrieves stores with high service levels")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StoreResponse>> getHighPerformanceStores(
            @RequestParam(defaultValue = "98.0") BigDecimal minServiceLevel) {
        log.info("Fetching high-performance stores with minimum service level: {}", minServiceLevel);
        
        List<Store> stores = storeService.getHighPerformanceStores(minServiceLevel);
        List<StoreResponse> response = stores.stream()
            .map(storeMapper::toResponse)
            .toList();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/sync")
    @Operation(summary = "Sync store data", description = "Triggers data synchronization for a specific store")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> syncStoreData(@PathVariable Long id) {
        log.info("Syncing data for store ID: {}", id);
        
        storeService.syncStoreData(id);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{id}/forecast")
    @Operation(summary = "Update store forecast", description = "Triggers forecast update for a specific store")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> updateStoreForecast(@PathVariable Long id) {
        log.info("Updating forecast for store ID: {}", id);
        
        storeService.updateForecastData(id);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/bulk/status")
    @Operation(summary = "Bulk update store status", description = "Updates status for multiple stores")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StoreResponse>> bulkUpdateStoreStatus(
            @RequestParam List<Long> storeIds,
            @RequestParam Store.StoreStatus status) {
        log.info("Bulk updating status to {} for {} stores", status, storeIds.size());
        
        List<Store> updatedStores = storeService.bulkUpdateStoreStatus(storeIds, status);
        List<StoreResponse> response = updatedStores.stream()
            .map(storeMapper::toResponse)
            .toList();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk/sync")
    @Operation(summary = "Bulk sync stores", description = "Triggers data synchronization for multiple stores")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> bulkSyncStores(@RequestParam List<Long> storeIds) {
        log.info("Bulk syncing {} stores", storeIds.size());
        
        storeService.bulkSyncStores(storeIds);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/bulk/forecast")
    @Operation(summary = "Bulk update forecasts", description = "Triggers forecast updates for multiple stores")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> bulkUpdateForecasts(@RequestParam List<Long> storeIds) {
        log.info("Bulk updating forecasts for {} stores", storeIds.size());
        
        storeService.bulkUpdateForecasts(storeIds);
        return ResponseEntity.accepted().build();
    }
}
