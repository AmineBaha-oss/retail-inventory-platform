package com.retailinventory.domain.service;

import com.retailinventory.domain.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for Store domain operations.
 * Defines business logic for store management, analytics, and performance monitoring.
 */
public interface StoreService {

    // Basic CRUD operations
    Store createStore(Store store);
    Store updateStore(Long id, Store store);
    void deleteStore(Long id, String deletedBy);
    void restoreStore(Long id);
    Optional<Store> getStoreById(Long id);
    Optional<Store> getStoreByCode(String code);
    
    // Store listing and search
    Page<Store> getAllStores(Pageable pageable);
    Page<Store> searchStores(String searchTerm, Pageable pageable);
    List<Store> getStoresByStatus(Store.StoreStatus status);
    List<Store> getStoresByType(Store.StoreType type);
    List<Store> getStoresByPOSSystem(Store.POSSystem posSystem);
    
    // Performance monitoring
    List<Store> getStoresNeedingAttention(BigDecimal stockoutThreshold);
    List<Store> getHighPerformanceStores(BigDecimal minServiceLevel);
    List<Store> getStoresNeedingSync();
    List<Store> getStoresNeedingForecastUpdate();
    
    // Analytics and reporting
    BigDecimal getAverageServiceLevel();
    BigDecimal getAverageStockoutRate();
    BigDecimal getAverageTurnoverRate();
    BigDecimal getTotalMonthlyRevenue();
    long getStoreCountByStatus(Store.StoreStatus status);
    long getStoreCountByType(Store.StoreType type);
    
    // Advanced filtering
    Page<Store> getStoresByMultipleCriteria(
        Store.StoreStatus status,
        Store.StoreType type,
        Store.POSSystem posSystem,
        BigDecimal minServiceLevel,
        BigDecimal maxStockoutRate,
        Pageable pageable
    );
    
    // Business logic operations
    void updateStorePerformanceMetrics(Long storeId);
    void syncStoreData(Long storeId);
    void updateForecastData(Long storeId);
    void calculateReorderPoints(Long storeId);
    
    // Validation
    boolean isStoreCodeUnique(String code);
    boolean isStoreCodeUnique(String code, Long excludeId);
    
    // Bulk operations
    List<Store> bulkUpdateStoreStatus(List<Long> storeIds, Store.StoreStatus status);
    void bulkSyncStores(List<Long> storeIds);
    void bulkUpdateForecasts(List<Long> storeIds);
}
