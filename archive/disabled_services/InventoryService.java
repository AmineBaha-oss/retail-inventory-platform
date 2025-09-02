package com.retailinventory.application.service;

import com.retailinventory.domain.entity.Inventory;
import com.retailinventory.domain.entity.Product;
import com.retailinventory.domain.entity.Store;
import com.retailinventory.infrastructure.repository.InventoryRepository;
import com.retailinventory.infrastructure.repository.ProductRepository;
import com.retailinventory.infrastructure.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public Inventory getCurrentInventory(UUID storeId, UUID productId) {
        return inventoryRepository.findLatestByStoreAndProduct(storeId, productId)
                .orElseThrow(() -> new RuntimeException("No inventory record found for store: " + storeId + " and product: " + productId));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public List<Inventory> getCurrentInventoryByStore(UUID storeId) {
        return inventoryRepository.findLatestByStore(storeId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public List<Inventory> getLowStockItems(UUID storeId) {
        return inventoryRepository.findLowStockByStore(storeId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public List<Inventory> getStockOuts(UUID storeId) {
        return inventoryRepository.findStockOutsByStore(storeId);
    }

    @Transactional
    @PreAuthorize("hasAuthority('inventory:update')")
    public Inventory updateInventory(UUID storeId, UUID productId, Integer quantityChange, 
                                   String reason, String idempotencyKey) {
        
        // Validate store and product exist
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        // Check idempotency
        if (idempotencyKey != null && inventoryRepository.existsByIdempotencyKey(idempotencyKey)) {
            log.warn("Duplicate inventory update request with idempotency key: {}", idempotencyKey);
            return inventoryRepository.findLatestByStoreAndProduct(storeId, productId)
                    .orElseThrow(() -> new RuntimeException("Inventory record not found"));
        }

        // Get current inventory or create new
        Optional<Inventory> currentInventoryOpt = inventoryRepository.findLatestByStoreAndProduct(storeId, productId);
        Inventory currentInventory;
        
        if (currentInventoryOpt.isPresent()) {
            currentInventory = currentInventoryOpt.get();
        } else {
            // Create new inventory record
            currentInventory = Inventory.builder()
                    .store(store)
                    .product(product)
                    .quantityOnHand(0)
                    .quantityReserved(0)
                    .reorderPoint(10) // Default reorder point
                    .costPerUnit(product.getUnitCost())
                    .build();
        }

        // Update quantities
        int newQuantityOnHand = currentInventory.getQuantityOnHand() + quantityChange;
        if (newQuantityOnHand < 0) {
            throw new RuntimeException("Cannot reduce inventory below 0. Current: " + currentInventory.getQuantityOnHand() + ", Change: " + quantityChange);
        }

        // Create new inventory record (time-series approach)
        Inventory newInventory = Inventory.builder()
                .store(store)
                .product(product)
                .quantityOnHand(newQuantityOnHand)
                .quantityReserved(currentInventory.getQuantityReserved())
                .reorderPoint(currentInventory.getReorderPoint())
                .maxStockLevel(currentInventory.getMaxStockLevel())
                .costPerUnit(currentInventory.getCostPerUnit())
                .lastCountDate(LocalDateTime.now().toLocalDate())
                .adjustmentReason(reason)
                .idempotencyKey(idempotencyKey)
                .build();

        log.info("Updating inventory for product {} in store {}: {} -> {} (change: {})", 
                product.getSku(), store.getCode(), currentInventory.getQuantityOnHand(), newQuantityOnHand, quantityChange);

        return inventoryRepository.save(newInventory);
    }

    @Transactional
    @PreAuthorize("hasAuthority('inventory:update')")
    public Inventory reserveInventory(UUID storeId, UUID productId, Integer quantityToReserve) {
        Inventory currentInventory = getCurrentInventory(storeId, productId);
        
        int newReserved = currentInventory.getQuantityReserved() + quantityToReserve;
        int available = currentInventory.getQuantityOnHand() - currentInventory.getQuantityReserved();
        
        if (quantityToReserve > available) {
            throw new RuntimeException("Cannot reserve " + quantityToReserve + " units. Only " + available + " available.");
        }

        // Create new inventory record with updated reserved quantity
        Inventory newInventory = Inventory.builder()
                .store(currentInventory.getStore())
                .product(currentInventory.getProduct())
                .quantityOnHand(currentInventory.getQuantityOnHand())
                .quantityReserved(newReserved)
                .reorderPoint(currentInventory.getReorderPoint())
                .maxStockLevel(currentInventory.getMaxStockLevel())
                .costPerUnit(currentInventory.getCostPerUnit())
                .lastCountDate(LocalDateTime.now().toLocalDate())
                .adjustmentReason("Inventory reserved")
                .build();

        log.info("Reserving {} units of product {} in store {}", quantityToReserve, productId, storeId);
        return inventoryRepository.save(newInventory);
    }

    @Transactional
    @PreAuthorize("hasAuthority('inventory:update')")
    public Inventory releaseReservedInventory(UUID storeId, UUID productId, Integer quantityToRelease) {
        Inventory currentInventory = getCurrentInventory(storeId, productId);
        
        if (quantityToRelease > currentInventory.getQuantityReserved()) {
            throw new RuntimeException("Cannot release " + quantityToRelease + " units. Only " + currentInventory.getQuantityReserved() + " reserved.");
        }

        int newReserved = currentInventory.getQuantityReserved() - quantityToRelease;

        // Create new inventory record with updated reserved quantity
        Inventory newInventory = Inventory.builder()
                .store(currentInventory.getStore())
                .product(currentInventory.getProduct())
                .quantityOnHand(currentInventory.getQuantityOnHand())
                .quantityReserved(newReserved)
                .reorderPoint(currentInventory.getReorderPoint())
                .maxStockLevel(currentInventory.getMaxStockLevel())
                .costPerUnit(currentInventory.getCostPerUnit())
                .lastCountDate(LocalDateTime.now().toLocalDate())
                .adjustmentReason("Inventory reservation released")
                .build();

        log.info("Releasing {} reserved units of product {} in store {}", quantityToRelease, productId, storeId);
        return inventoryRepository.save(newInventory);
    }

    @Transactional
    @PreAuthorize("hasAuthority('inventory:update')")
    public Inventory setReorderPoint(UUID storeId, UUID productId, Integer newReorderPoint) {
        Inventory currentInventory = getCurrentInventory(storeId, productId);
        
        if (newReorderPoint < 0) {
            throw new RuntimeException("Reorder point cannot be negative");
        }

        // Create new inventory record with updated reorder point
        Inventory newInventory = Inventory.builder()
                .store(currentInventory.getStore())
                .product(currentInventory.getProduct())
                .quantityOnHand(currentInventory.getQuantityOnHand())
                .quantityReserved(currentInventory.getQuantityReserved())
                .reorderPoint(newReorderPoint)
                .maxStockLevel(currentInventory.getMaxStockLevel())
                .costPerUnit(currentInventory.getCostPerUnit())
                .lastCountDate(LocalDateTime.now().toLocalDate())
                .adjustmentReason("Reorder point updated to " + newReorderPoint)
                .build();

        log.info("Setting reorder point for product {} in store {} to {}", productId, storeId, newReorderPoint);
        return inventoryRepository.save(newInventory);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public BigDecimal getTotalInventoryValue(UUID storeId) {
        Double totalValue = inventoryRepository.calculateTotalInventoryValueByStore(storeId);
        return totalValue != null ? BigDecimal.valueOf(totalValue) : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public Long getLowStockItemCount(UUID storeId) {
        return inventoryRepository.countLowStockItemsByStore(storeId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public Long getStockOutCount(UUID storeId) {
        return inventoryRepository.countStockOutsByStore(storeId);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('inventory:read')")
    public List<Inventory> getInventoryHistory(UUID storeId, LocalDateTime startDate, LocalDateTime endDate) {
        return inventoryRepository.findByStoreAndDateRange(storeId, startDate, endDate);
    }
}
