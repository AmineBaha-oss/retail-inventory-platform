package com.retailinventory.infrastructure.graphql;

import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import com.retailinventory.infrastructure.service.MlApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

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

    @MutationMapping
    public Inventory updateInventory(@Argument InventoryUpdateInput input) {
        log.debug("Updating inventory: {}", input);
        
        Inventory inventory = inventoryRepository.findByStoreIdAndProductId(
            input.getStoreId(), input.getProductId()
        ).orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        inventory.setQuantityOnHand(input.getQuantityOnHand());
        return inventoryRepository.save(inventory);
    }

    @MutationMapping
    public Inventory adjustInventory(@Argument InventoryAdjustmentInput input) {
        log.debug("Adjusting inventory: {}", input);
        
        Inventory inventory = inventoryRepository.findByStoreIdAndProductId(
            input.getStoreId(), input.getProductId()
        ).orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        int newQuantity = inventory.getQuantityOnHand() + input.getAdjustment();
        inventory.setQuantityOnHand(Math.max(0, newQuantity));
        
        return inventoryRepository.save(inventory);
    }

    @MutationMapping
    public PurchaseOrder createPurchaseOrder(@Argument PurchaseOrderCreateInput input) {
        log.debug("Creating purchase order: {}", input);
        
        // This would be implemented to create a purchase order
        // For now, returning null as the service needs to be implemented
        return null;
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
        
        // This would call the ML API to generate forecasts
        // For now, returning empty list
        return List.of();
    }
}
