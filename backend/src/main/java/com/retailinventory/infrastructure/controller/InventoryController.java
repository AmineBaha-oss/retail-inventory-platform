package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.Inventory;
import com.retailinventory.domain.entity.Product;
import com.retailinventory.domain.entity.Store;
import com.retailinventory.domain.repository.InventoryRepository;
import com.retailinventory.domain.repository.ProductRepository;
import com.retailinventory.domain.repository.StoreRepository;
import com.retailinventory.infrastructure.dto.inventory.InventoryCreateRequest;
import com.retailinventory.infrastructure.dto.inventory.InventoryQuantityUpdateRequest;
import com.retailinventory.infrastructure.dto.inventory.InventoryResponse;
import com.retailinventory.infrastructure.dto.inventory.InventoryUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST Controller for Inventory management operations.
 */
@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;

    /**
     * Get all inventory records with optional pagination and filtering.
     */
    @GetMapping
    public ResponseEntity<Page<InventoryResponse>> getAllInventory(Pageable pageable) {
        try {
            Page<Inventory> inventory = inventoryRepository.findAll(pageable);
            Page<InventoryResponse> response = inventory.map(this::convertToResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving inventory", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get inventory by store ID.
     */
    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<InventoryResponse>> getInventoryByStore(@PathVariable UUID storeId) {
        try {
            List<Inventory> inventory = inventoryRepository.findLatestByStore(storeId);
            List<InventoryResponse> response = inventory.stream()
                    .map(this::convertToResponse)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving inventory for store: " + storeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get low stock items.
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        try {
            List<Inventory> lowStockItems = inventoryRepository.findStockOuts();
            List<InventoryResponse> response = lowStockItems.stream()
                    .map(this::convertToResponse)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving low stock items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get critical stock items.
     */
    @GetMapping("/critical")
    public ResponseEntity<List<InventoryResponse>> getCriticalStockItems() {
        try {
            List<Inventory> criticalItems = inventoryRepository.findStockOuts();
            List<InventoryResponse> response = criticalItems.stream()
                    .map(this::convertToResponse)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving critical stock items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new inventory record.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<InventoryResponse> createInventory(@Valid @RequestBody InventoryCreateRequest request) {
        try {
            // Validate store exists
            Optional<Store> store = storeRepository.findById(request.getStoreId());
            if (store.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate product exists
            Optional<Product> product = productRepository.findById(request.getProductId());
            if (product.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Check if inventory record already exists for this store-product combination
            Optional<Inventory> existingInventory = inventoryRepository
                    .findLatestByStoreAndProduct(request.getStoreId(), request.getProductId());
            if (existingInventory.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            Inventory inventory = Inventory.builder()
                    .store(store.get())
                    .product(product.get())
                    .quantityOnHand(request.getQuantityOnHand())
                    .quantityOnOrder(request.getQuantityOnOrder() != null ? request.getQuantityOnOrder() : BigDecimal.ZERO)
                    .quantityReserved(request.getQuantityReserved() != null ? request.getQuantityReserved() : BigDecimal.ZERO)
                    .costPerUnit(request.getCostPerUnit())
                    .reorderPoint(request.getReorderPoint())
                    .maxStockLevel(request.getMaxStockLevel())
                    .adjustmentReason(request.getAdjustmentReason())
                    .recordedAt(LocalDateTime.now())
                    .build();

            Inventory savedInventory = inventoryRepository.save(inventory);
            log.info("Created new inventory record with id: {}", savedInventory.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedInventory));
        } catch (Exception e) {
            log.error("Error creating inventory record", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update inventory quantity.
     */
    @PutMapping("/{id}/quantity")
    @Transactional
    public ResponseEntity<InventoryResponse> updateInventoryQuantity(
            @PathVariable UUID id, 
            @Valid @RequestBody InventoryQuantityUpdateRequest request) {
        try {
            Optional<Inventory> existingInventory = inventoryRepository.findById(id);
            if (existingInventory.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Inventory inventory = existingInventory.get();
            inventory.setQuantityOnHand(request.getQuantity());
            if (request.getReason() != null) {
                inventory.setAdjustmentReason(request.getReason());
            }
            inventory.setRecordedAt(LocalDateTime.now());

            Inventory savedInventory = inventoryRepository.save(inventory);
            log.info("Updated inventory quantity for id: {} to {}", id, request.getQuantity());
            
            return ResponseEntity.ok(convertToResponse(savedInventory));
        } catch (Exception e) {
            log.error("Error updating inventory quantity for id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing inventory record.
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable UUID id, 
            @Valid @RequestBody InventoryUpdateRequest request) {
        try {
            Optional<Inventory> existingInventory = inventoryRepository.findById(id);
            if (existingInventory.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Inventory inventory = existingInventory.get();
            
            // Update fields if provided
            if (request.getQuantityOnHand() != null) {
                inventory.setQuantityOnHand(request.getQuantityOnHand());
            }
            if (request.getQuantityOnOrder() != null) {
                inventory.setQuantityOnOrder(request.getQuantityOnOrder());
            }
            if (request.getQuantityReserved() != null) {
                inventory.setQuantityReserved(request.getQuantityReserved());
            }
            if (request.getCostPerUnit() != null) {
                inventory.setCostPerUnit(request.getCostPerUnit());
            }
            if (request.getReorderPoint() != null) {
                inventory.setReorderPoint(request.getReorderPoint());
            }
            if (request.getMaxStockLevel() != null) {
                inventory.setMaxStockLevel(request.getMaxStockLevel());
            }
            if (request.getAdjustmentReason() != null) {
                inventory.setAdjustmentReason(request.getAdjustmentReason());
            }

            inventory.setRecordedAt(LocalDateTime.now());

            Inventory savedInventory = inventoryRepository.save(inventory);
            log.info("Updated inventory record with id: {}", savedInventory.getId());
            
            return ResponseEntity.ok(convertToResponse(savedInventory));
        } catch (Exception e) {
            log.error("Error updating inventory with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an inventory record.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteInventory(@PathVariable UUID id) {
        try {
            if (!inventoryRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            inventoryRepository.deleteById(id);
            log.info("Deleted inventory record with id: {}", id);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting inventory with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Convert Inventory entity to InventoryResponse DTO.
     */
    private InventoryResponse convertToResponse(Inventory inventory) {
        BigDecimal quantityAvailable = inventory.getQuantityOnHand()
                .subtract(inventory.getQuantityReserved() != null ? inventory.getQuantityReserved() : BigDecimal.ZERO);

        return InventoryResponse.builder()
                .id(inventory.getId())
                .storeId(inventory.getStore().getId())
                .storeCode(inventory.getStore().getCode())
                .storeName(inventory.getStore().getName())
                .productId(inventory.getProduct().getId())
                .productSku(inventory.getProduct().getSku())
                .productName(inventory.getProduct().getName())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityOnOrder(inventory.getQuantityOnOrder())
                .quantityReserved(inventory.getQuantityReserved())
                .quantityAvailable(quantityAvailable)
                .costPerUnit(inventory.getCostPerUnit())
                .reorderPoint(inventory.getReorderPoint())
                .maxStockLevel(inventory.getMaxStockLevel())
                .lastCountDate(inventory.getLastCountDate())
                .recordedAt(inventory.getRecordedAt())
                .createdAt(inventory.getCreatedAt())
                .adjustmentReason(inventory.getAdjustmentReason())
                .createdBy(inventory.getCreatedBy())
                .updatedBy(inventory.getUpdatedBy())
                .version(inventory.getVersion())
                .build();
    }
}
