package com.retailinventory.infrastructure.mapper;

import com.retailinventory.domain.entity.Store;
import com.retailinventory.infrastructure.dto.StoreCreateRequest;
import com.retailinventory.infrastructure.dto.StoreUpdateRequest;
import com.retailinventory.infrastructure.dto.StoreResponse;
import org.springframework.stereotype.Component;

/**
 * Simple mapper for converting between Store entities and DTOs.
 * Manual implementation for now to get the backend running.
 */
@Component
public class StoreMapper {

    /**
     * Maps StoreCreateRequest to Store entity.
     */
    public Store toEntity(StoreCreateRequest request) {
        if (request == null) {
            return null;
        }

        Store store = new Store();
        store.setName(request.getName());
        store.setCode(request.getCode());
        store.setType(request.getType());
        store.setStatus(request.getStatus());
        store.setManager(request.getManager());
        store.setEmail(request.getEmail());
        store.setPhone(request.getPhone());
        store.setAddress(request.getAddress());
        store.setCity(request.getCity());
        store.setCountry(request.getCountry());
        store.setTimezone(request.getTimezone());
        store.setPosSystem(request.getPosSystem());
        store.setSyncFrequency(request.getSyncFrequency());
        store.setServiceLevel(request.getServiceLevel());
        store.setAvgLeadTime(request.getAvgLeadTime());
        store.setSafetyStockBuffer(request.getSafetyStockBuffer());
        store.setReorderPoint(request.getReorderPoint());
        store.setMonthlyRevenue(request.getMonthlyRevenue());
        store.setProfitMargin(request.getProfitMargin());
        store.setHoldingCost(request.getHoldingCost());
        
        return store;
    }

    /**
     * Maps StoreUpdateRequest to Store entity.
     */
    public Store toEntity(StoreUpdateRequest request) {
        if (request == null) {
            return null;
        }

        Store store = new Store();
        store.setName(request.getName());
        store.setCode(request.getCode());
        store.setType(request.getType());
        store.setStatus(request.getStatus());
        store.setManager(request.getManager());
        store.setEmail(request.getEmail());
        store.setPhone(request.getPhone());
        store.setAddress(request.getAddress());
        store.setCity(request.getCity());
        store.setCountry(request.getCountry());
        store.setTimezone(request.getTimezone());
        store.setPosSystem(request.getPosSystem());
        store.setSyncFrequency(request.getSyncFrequency());
        store.setServiceLevel(request.getServiceLevel());
        store.setAvgLeadTime(request.getAvgLeadTime());
        store.setSafetyStockBuffer(request.getSafetyStockBuffer());
        store.setReorderPoint(request.getReorderPoint());
        store.setMonthlyRevenue(request.getMonthlyRevenue());
        store.setProfitMargin(request.getProfitMargin());
        store.setHoldingCost(request.getHoldingCost());
        
        return store;
    }

    /**
     * Maps Store entity to StoreResponse.
     */
    public StoreResponse toResponse(Store store) {
        if (store == null) {
            return null;
        }

        return StoreResponse.builder()
            .id(store.getId())
            .code(store.getCode())
            .name(store.getName())
            .type(store.getType())
            .status(store.getStatus())
            .manager(store.getManager())
            .email(store.getEmail())
            .phone(store.getPhone())
            .address(store.getAddress())
            .city(store.getCity())
            .country(store.getCountry())
            .timezone(store.getTimezone())
            .posSystem(store.getPosSystem())
            .syncFrequency(store.getSyncFrequency())
            .lastSync(store.getLastSync())
            .lastForecastUpdate(store.getLastForecastUpdate())
            .serviceLevel(store.getServiceLevel())
            .avgLeadTime(store.getAvgLeadTime())
            .safetyStockBuffer(store.getSafetyStockBuffer())
            .reorderPoint(store.getReorderPoint())
            .stockoutRate(store.getStockoutRate())
            .overstockRate(store.getOverstockRate())
            .turnoverRate(store.getTurnoverRate())
            .monthlyRevenue(store.getMonthlyRevenue())
            .profitMargin(store.getProfitMargin())
            .holdingCost(store.getHoldingCost())
            .createdAt(store.getCreatedAt())
            .updatedAt(store.getUpdatedAt())
            .createdBy(store.getCreatedBy())
            .updatedBy(store.getUpdatedBy())
            .build();
    }

    /**
     * Updates existing Store entity with values from StoreUpdateRequest.
     */
    public void updateEntity(Store store, StoreUpdateRequest request) {
        if (store == null || request == null) {
            return;
        }

        store.setName(request.getName());
        store.setCode(request.getCode());
        store.setType(request.getType());
        store.setStatus(request.getStatus());
        store.setManager(request.getManager());
        store.setEmail(request.getEmail());
        store.setPhone(request.getPhone());
        store.setAddress(request.getAddress());
        store.setCity(request.getCity());
        store.setCountry(request.getCountry());
        store.setTimezone(request.getTimezone());
        store.setPosSystem(request.getPosSystem());
        store.setSyncFrequency(request.getSyncFrequency());
        store.setServiceLevel(request.getServiceLevel());
        store.setAvgLeadTime(request.getAvgLeadTime());
        store.setSafetyStockBuffer(request.getSafetyStockBuffer());
        store.setReorderPoint(request.getReorderPoint());
        store.setMonthlyRevenue(request.getMonthlyRevenue());
        store.setProfitMargin(request.getProfitMargin());
        store.setHoldingCost(request.getHoldingCost());
    }
}
