package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Store;
import com.retailinventory.domain.repository.StoreRepository;
import com.retailinventory.domain.repository.InventoryRepository;
import com.retailinventory.infrastructure.dto.store.StoreCreateRequest;
import com.retailinventory.infrastructure.dto.store.StoreResponse;
import com.retailinventory.infrastructure.dto.store.StoreUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller for Store management operations.
 */
@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreRepository storeRepository;
    private final InventoryRepository inventoryRepository;

    /**
     * Get all stores with optional pagination and filtering.
     */
    @GetMapping
    public ResponseEntity<Page<StoreResponse>> getAllStores(Pageable pageable) {
        try {
            Page<Store> stores = storeRepository.findAll(pageable);
            Page<StoreResponse> response = stores.map(this::convertToResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving stores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get store by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StoreResponse> getStoreById(@PathVariable UUID id) {
        try {
            Optional<Store> store = storeRepository.findById(id);
            return store.map(s -> ResponseEntity.ok(convertToResponse(s)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving store with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new store.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<StoreResponse> createStore(@Valid @RequestBody StoreCreateRequest request) {
        try {
            // Check if store with same code already exists
            if (storeRepository.existsByCode(request.getCode())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            Store store = Store.builder()
                    .code(request.getCode())
                    .name(request.getName())
                    .manager(request.getManager())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .city(request.getCity())
                    .country(request.getCountry())
                    .timezone(request.getTimezone())
                    .status(request.getStatus())
                    .build();

            Store savedStore = storeRepository.save(store);
            log.info("Created new store with id: {} and code: {}", savedStore.getId(), savedStore.getCode());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedStore));
        } catch (Exception e) {
            log.error("Error creating store", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing store.
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<StoreResponse> updateStore(@PathVariable UUID id, 
                                                    @Valid @RequestBody StoreUpdateRequest request) {
        try {
            Optional<Store> existingStore = storeRepository.findById(id);
            if (existingStore.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Store store = existingStore.get();
            
            // Update fields if provided
            if (request.getName() != null) {
                store.setName(request.getName());
            }
            if (request.getManager() != null) {
                store.setManager(request.getManager());
            }
            if (request.getEmail() != null) {
                store.setEmail(request.getEmail());
            }
            if (request.getPhone() != null) {
                store.setPhone(request.getPhone());
            }
            if (request.getAddress() != null) {
                store.setAddress(request.getAddress());
            }
            if (request.getCity() != null) {
                store.setCity(request.getCity());
            }
            if (request.getCountry() != null) {
                store.setCountry(request.getCountry());
            }
            if (request.getTimezone() != null) {
                store.setTimezone(request.getTimezone());
            }
            if (request.getStatus() != null) {
                store.setStatus(request.getStatus());
            }

            Store savedStore = storeRepository.save(store);
            log.info("Updated store with id: {}", savedStore.getId());
            
            return ResponseEntity.ok(convertToResponse(savedStore));
        } catch (Exception e) {
            log.error("Error updating store with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a store.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteStore(@PathVariable UUID id) {
        try {
            if (!storeRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            storeRepository.deleteById(id);
            log.info("Deleted store with id: {}", id);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting store with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get store analytics.
     */
    @GetMapping("/{id}/analytics")
    public ResponseEntity<Map<String, Object>> getStoreAnalytics(@PathVariable UUID id) {
        try {
            if (!storeRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // For now, return basic analytics - can be expanded later
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("storeId", id);
            
            // Basic analytics using available data
            long totalStores = storeRepository.count();
            analytics.put("totalStores", totalStores);
            analytics.put("storeRank", Math.min(totalStores, 10)); // Mock ranking
            
            // Mock data that would come from other services
            analytics.put("totalProducts", 150);
            analytics.put("totalInventoryValue", 25000.0);
            analytics.put("lowStockItems", 5);
            analytics.put("monthlyRevenue", 18500.0);
            analytics.put("activeEmployees", 8);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error retrieving analytics for store with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Convert Store entity to StoreResponse DTO.
     */
    private StoreResponse convertToResponse(Store store) {
        // Calculate product count for this store
        int productCount = inventoryRepository.countDistinctProductsByStore(store.getId());
        
        return StoreResponse.builder()
                .id(store.getId())
                .code(store.getCode())
                .name(store.getName())
                .manager(store.getManager())
                .email(store.getEmail())
                .phone(store.getPhone())
                .address(store.getAddress())
                .city(store.getCity())
                .country(store.getCountry())
                .timezone(store.getTimezone())
                .status(store.getStatus())
                .productCount(productCount)
                .isActive(store.getStatus() == Store.StoreStatus.ACTIVE)
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}
