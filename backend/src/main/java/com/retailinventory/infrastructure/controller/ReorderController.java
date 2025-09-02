package com.retailinventory.infrastructure.controller;

import com.retailinventory.domain.entity.PurchaseOrder;
import com.retailinventory.domain.service.ReorderService;
import com.retailinventory.infrastructure.dto.reorder.ReorderSuggestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for reorder suggestions and purchase order generation.
 */
@RestController
@RequestMapping("/api/v1/reorder")
@RequiredArgsConstructor
@Slf4j
public class ReorderController {

    private final ReorderService reorderService;

    /**
     * Get reorder suggestions for a store and supplier.
     */
    @GetMapping("/suggestions")
    @PreAuthorize("hasAnyAuthority('inventory:read', 'purchase_order:read')")
    public ResponseEntity<List<ReorderSuggestion>> getReorderSuggestions(
            @RequestParam UUID storeId,
            @RequestParam UUID supplierId) {
        
        log.info("Getting reorder suggestions for store: {}, supplier: {}", storeId, supplierId);
        
        List<ReorderSuggestion> suggestions = reorderService.calculateReorderSuggestions(storeId, supplierId);
        
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Create purchase order from reorder suggestions.
     */
    @PostMapping("/create-purchase-order")
    @PreAuthorize("hasAnyAuthority('purchase_order:create')")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(
            @RequestParam UUID storeId,
            @RequestParam UUID supplierId,
            @RequestBody List<ReorderSuggestion> suggestions) {
        
        log.info("Creating purchase order for store: {}, supplier: {}", storeId, supplierId);
        
        PurchaseOrder purchaseOrder = reorderService.createPurchaseOrderFromSuggestions(
            storeId, supplierId, suggestions);
        
        return ResponseEntity.ok(purchaseOrder);
    }

    /**
     * Get reorder suggestions for all suppliers of a store.
     */
    @GetMapping("/suggestions/all")
    @PreAuthorize("hasAnyAuthority('inventory:read', 'purchase_order:read')")
    public ResponseEntity<Map<UUID, List<ReorderSuggestion>>> getAllReorderSuggestions(
            @RequestParam UUID storeId) {
        
        log.info("Getting all reorder suggestions for store: {}", storeId);
        
        // This would need to be implemented to get all suppliers for a store
        // For now, return empty map
        return ResponseEntity.ok(Map.of());
    }
}
