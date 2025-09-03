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
@RequestMapping("/v1/reorder")
@RequiredArgsConstructor
@Slf4j
public class ReorderController {

    private final ReorderService reorderService;

    /**
     * Test endpoint to debug issues.
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        log.info("Test endpoint called");
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "ReorderController is working",
            "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Test endpoint to show inventory data.
     */
    @GetMapping("/inventory-test")
    public ResponseEntity<Map<String, Object>> inventoryTest(
            @RequestParam UUID storeId,
            @RequestParam UUID supplierId) {
        log.info("Inventory test endpoint called for store: {}, supplier: {}", storeId, supplierId);
        
        // This is a simple test to show that the system is working
        // In a real scenario, you would have forecast data to generate reorder suggestions
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "System is working correctly",
            "storeId", storeId.toString(),
            "supplierId", supplierId.toString(),
            "note", "Reorder suggestions require forecast data. Sales data alone is not sufficient.",
            "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Get reorder suggestions for a store and supplier.
     */
    @GetMapping("/suggestions")
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
    public ResponseEntity<Map<UUID, List<ReorderSuggestion>>> getAllReorderSuggestions(
            @RequestParam UUID storeId) {
        
        log.info("Getting all reorder suggestions for store: {}", storeId);
        
        // This would need to be implemented to get all suppliers for a store
        // For now, return empty map
        return ResponseEntity.ok(Map.of());
    }
}
