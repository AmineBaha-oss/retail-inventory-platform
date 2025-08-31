package com.retailinventory.domain.service.impl;

import com.retailinventory.domain.entity.Store;
import com.retailinventory.domain.repository.StoreRepository;
import com.retailinventory.domain.service.StoreService;
import com.retailinventory.infrastructure.exception.ResourceNotFoundException;
import com.retailinventory.infrastructure.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of StoreService providing business logic for store management.
 * Handles CRUD operations, performance monitoring, and analytics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;

    @Override
    public Store createStore(Store store) {
        log.info("Creating new store with code: {}", store.getCode());
        
        // Validate store code uniqueness
        if (!isStoreCodeUnique(store.getCode())) {
            throw new ValidationException("Store code must be unique: " + store.getCode());
        }
        
        // Set default values
        if (store.getStatus() == null) {
            store.setStatus(Store.StoreStatus.ACTIVE);
        }
        if (store.getSyncFrequency() == null) {
            store.setSyncFrequency(Store.SyncFrequency.DAILY);
        }
        if (store.getServiceLevel() == null) {
            store.setServiceLevel(BigDecimal.valueOf(95.0));
        }
        if (store.getAvgLeadTime() == null) {
            store.setAvgLeadTime(14);
        }
        if (store.getSafetyStockBuffer() == null) {
            store.setSafetyStockBuffer(7);
        }
        
        Store savedStore = storeRepository.save(store);
        log.info("Successfully created store with ID: {}", savedStore.getId());
        
        return savedStore;
    }

    @Override
    public Store updateStore(Long id, Store storeDetails) {
        log.info("Updating store with ID: {}", id);
        
        Store existingStore = storeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + id));
        
        // Validate store code uniqueness if changed
        if (!existingStore.getCode().equals(storeDetails.getCode()) && 
            !isStoreCodeUnique(storeDetails.getCode(), id)) {
            throw new ValidationException("Store code must be unique: " + storeDetails.getCode());
        }
        
        // Update fields
        existingStore.setName(storeDetails.getName());
        existingStore.setCode(storeDetails.getCode());
        existingStore.setType(storeDetails.getType());
        existingStore.setStatus(storeDetails.getStatus());
        existingStore.setManager(storeDetails.getManager());
        existingStore.setEmail(storeDetails.getEmail());
        existingStore.setPhone(storeDetails.getPhone());
        existingStore.setAddress(storeDetails.getAddress());
        existingStore.setCity(storeDetails.getCity());
        existingStore.setCountry(storeDetails.getCountry());
        existingStore.setTimezone(storeDetails.getTimezone());
        existingStore.setPosSystem(storeDetails.getPosSystem());
        existingStore.setSyncFrequency(storeDetails.getSyncFrequency());
        existingStore.setServiceLevel(storeDetails.getServiceLevel());
        existingStore.setAvgLeadTime(storeDetails.getAvgLeadTime());
        existingStore.setSafetyStockBuffer(storeDetails.getSafetyStockBuffer());
        existingStore.setMonthlyRevenue(storeDetails.getMonthlyRevenue());
        existingStore.setProfitMargin(storeDetails.getProfitMargin());
        existingStore.setHoldingCost(storeDetails.getHoldingCost());
        
        Store updatedStore = storeRepository.save(existingStore);
        log.info("Successfully updated store with ID: {}", updatedStore.getId());
        
        return updatedStore;
    }

    @Override
    public void deleteStore(Long id, String deletedBy) {
        log.info("Soft deleting store with ID: {} by user: {}", id, deletedBy);
        
        Store store = storeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + id));
        
        store.softDelete(deletedBy);
        storeRepository.save(store);
        
        log.info("Successfully soft deleted store with ID: {}", id);
    }

    @Override
    public void restoreStore(Long id) {
        log.info("Restoring store with ID: {}", id);
        
        Store store = storeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Store not found with ID: " + id));
        
        store.restore();
        storeRepository.save(store);
        
        log.info("Successfully restored store with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Store> getStoreById(Long id) {
        return storeRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Store> getStoreByCode(String code) {
        return storeRepository.findByCodeAndDeletedFalse(code);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Store> getAllStores(Pageable pageable) {
        return storeRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Store> searchStores(String searchTerm, Pageable pageable) {
        return storeRepository.searchStores(searchTerm, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getStoresByStatus(Store.StoreStatus status) {
        return storeRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getStoresByType(Store.StoreType type) {
        return storeRepository.findByType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getStoresByPOSSystem(Store.POSSystem posSystem) {
        return storeRepository.findByPosSystem(posSystem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getStoresNeedingAttention(BigDecimal stockoutThreshold) {
        return storeRepository.findStoresNeedingAttention(stockoutThreshold);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getHighPerformanceStores(BigDecimal minServiceLevel) {
        return storeRepository.findHighPerformanceStores(minServiceLevel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getStoresNeedingSync() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(1);
        return storeRepository.findStoresNeedingSync(cutoffDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Store> getStoresNeedingForecastUpdate() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        return storeRepository.findStoresNeedingForecastUpdate(cutoffDate);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getAverageServiceLevel() {
        return storeRepository.getAverageServiceLevel().orElse(BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getAverageStockoutRate() {
        return storeRepository.getAverageStockoutRate().orElse(BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getAverageTurnoverRate() {
        return storeRepository.getAverageTurnoverRate().orElse(BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalMonthlyRevenue() {
        return storeRepository.getTotalMonthlyRevenue().orElse(BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public long getStoreCountByStatus(Store.StoreStatus status) {
        return storeRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long getStoreCountByType(Store.StoreType type) {
        return storeRepository.countByType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Store> getStoresByMultipleCriteria(
            Store.StoreStatus status,
            Store.StoreType type,
            Store.POSSystem posSystem,
            BigDecimal minServiceLevel,
            BigDecimal maxStockoutRate,
            Pageable pageable) {
        return storeRepository.findStoresByMultipleCriteria(
            status, type, posSystem, minServiceLevel, maxStockoutRate, pageable);
    }

    @Override
    public void updateStorePerformanceMetrics(Long storeId) {
        log.info("Updating performance metrics for store ID: {}", storeId);
        // TODO: Implement performance metrics calculation
        // This would integrate with the Python ML service for forecasting
    }

    @Override
    public void syncStoreData(Long storeId) {
        log.info("Syncing data for store ID: {}", storeId);
        // TODO: Implement POS system integration
        // This would sync data from Shopify, Lightspeed, Square, etc.
    }

    @Override
    public void updateForecastData(Long storeId) {
        log.info("Updating forecast data for store ID: {}", storeId);
        // TODO: Integrate with Python ML service
        // This would call the FastAPI microservice for forecasting
    }

    @Override
    public void calculateReorderPoints(Long storeId) {
        log.info("Calculating reorder points for store ID: {}", storeId);
        // TODO: Implement reorder point calculation
        // This would use forecasting data and lead time information
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStoreCodeUnique(String code) {
        return !storeRepository.existsByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStoreCodeUnique(String code, Long excludeId) {
        Optional<Store> existingStore = storeRepository.findByCode(code);
        return existingStore.isEmpty() || existingStore.get().getId().equals(excludeId);
    }

    @Override
    public List<Store> bulkUpdateStoreStatus(List<Long> storeIds, Store.StoreStatus status) {
        log.info("Bulk updating status to {} for {} stores", status, storeIds.size());
        
        List<Store> stores = storeRepository.findAllById(storeIds);
        stores.forEach(store -> store.setStatus(status));
        
        return storeRepository.saveAll(stores);
    }

    @Override
    public void bulkSyncStores(List<Long> storeIds) {
        log.info("Bulk syncing {} stores", storeIds.size());
        storeIds.forEach(this::syncStoreData);
    }

    @Override
    public void bulkUpdateForecasts(List<Long> storeIds) {
        log.info("Bulk updating forecasts for {} stores", storeIds.size());
        storeIds.forEach(this::updateForecastData);
    }
}
