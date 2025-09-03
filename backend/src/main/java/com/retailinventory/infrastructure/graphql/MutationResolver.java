package com.retailinventory.infrastructure.graphql;

import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import com.retailinventory.domain.service.ReorderService;
import com.retailinventory.infrastructure.dto.reorder.ReorderSuggestion;
import com.retailinventory.infrastructure.service.MlApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * GraphQL Mutation Resolver for the Retail Inventory Platform.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class MutationResolver {

    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final MlApiService mlApiService;
    private final ReorderService reorderService;

    @MutationMapping
    public Inventory updateInventory(@Argument InventoryUpdateInput input) {
        log.debug("Updating inventory: {}", input);
        
        Inventory inventory = inventoryRepository.findByStoreIdAndProductId(
            input.getStoreId(), input.getProductId()
        ).orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        inventory.setQuantityOnHand(BigDecimal.valueOf(input.getQuantityOnHand()));
        return inventoryRepository.save(inventory);
    }

    @MutationMapping
    public Inventory adjustInventory(@Argument InventoryAdjustmentInput input) {
        log.debug("Adjusting inventory: {}", input);
        
        Inventory inventory = inventoryRepository.findByStoreIdAndProductId(
            input.getStoreId(), input.getProductId()
        ).orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        BigDecimal newQuantity = inventory.getQuantityOnHand().add(BigDecimal.valueOf(input.getAdjustment()));
        inventory.setQuantityOnHand(newQuantity.max(BigDecimal.ZERO));
        
        return inventoryRepository.save(inventory);
    }

    @MutationMapping
    public PurchaseOrder createPurchaseOrder(@Argument PurchaseOrderCreateInput input) {
        log.debug("Creating purchase order: {}", input);
        
        // This would be implemented to create a purchase order manually
        // For now, returning null as this is a placeholder for manual PO creation
        return null;
    }

    @MutationMapping
    public PurchaseOrder createPurchaseOrderFromSuggestions(
            @Argument UUID storeId,
            @Argument UUID supplierId,
            @Argument List<ReorderSuggestion> suggestions) {
        log.debug("Creating purchase order from suggestions for store: {}, supplier: {}", storeId, supplierId);
        
        return reorderService.createPurchaseOrderFromSuggestions(storeId, supplierId, suggestions);
    }

    @MutationMapping
    public PurchaseOrder approvePurchaseOrder(@Argument UUID id) {
        log.debug("Approving purchase order: {}", id);
        
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        
        po.setStatus(PurchaseOrder.PurchaseOrderStatus.APPROVED);
        return purchaseOrderRepository.save(po);
    }

    @MutationMapping
    public PurchaseOrder rejectPurchaseOrder(@Argument UUID id, @Argument String reason) {
        log.debug("Rejecting purchase order: {}, reason: {}", id, reason);
        
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        
        po.setStatus(PurchaseOrder.PurchaseOrderStatus.CANCELLED);
        return purchaseOrderRepository.save(po);
    }

    @MutationMapping
    public List<ForecastPoint> generateForecast(@Argument ForecastGenerateInput input) {
        log.debug("Generating forecast: {}", input);
        
        if (input.getStoreId() == null || input.getProductId() == null) {
            throw new IllegalArgumentException("Store ID and Product ID are required");
        }
        
        int horizonDays = input.getHorizonDays() != null ? input.getHorizonDays() : 30;
        
        try {
            // Call the ML API service to generate forecasts
            List<Forecast> forecasts = mlApiService.generateForecast(
                input.getStoreId().toString(), 
                input.getProductId().toString(), 
                horizonDays
            ).block(); // Blocking call for GraphQL
            
            if (forecasts == null) {
                return List.of();
            }
            
            // Convert Forecast entities to ForecastPoint DTOs
            return forecasts.stream()
                .map(forecast -> ForecastPoint.builder()
                    .date(forecast.getForecastDate().toString())
                    .p50(forecast.getP50Forecast() != null ? forecast.getP50Forecast().doubleValue() : 0.0)
                    .p90(forecast.getP90Forecast() != null ? forecast.getP90Forecast().doubleValue() : 0.0)
                    .confidence(0.95) // Default confidence level
                    .build())
                .toList();
                
        } catch (Exception e) {
            log.error("Error generating forecast for store: {}, product: {}", 
                input.getStoreId(), input.getProductId(), e);
            throw new RuntimeException("Failed to generate forecast: " + e.getMessage());
        }
    }
}
