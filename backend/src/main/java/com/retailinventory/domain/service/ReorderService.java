package com.retailinventory.domain.service;

import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import com.retailinventory.infrastructure.dto.reorder.ReorderSuggestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for reorder logic and purchase order generation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReorderService {

    private final InventoryRepository inventoryRepository;
    private final ForecastRepository forecastRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StoreRepository storeRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    public List<ReorderSuggestion> calculateReorderSuggestions(UUID storeId, UUID supplierId) {
        List<ReorderSuggestion> suggestions = new ArrayList<>();

        // Fetch all products from the given supplier
        List<Product> products = productRepository.findBySupplierId(supplierId);

        for (Product product : products) {
            // Get current inventory position for the product in the store
            Inventory inventory = inventoryRepository.findByStoreIdAndProductId(storeId, product.getId())
                    .orElse(null);

            if (inventory == null) {
                // No inventory record, assume 0 on hand and on order
                inventory = new Inventory();
                inventory.setOnHand(BigDecimal.ZERO);
                inventory.setOnOrder(BigDecimal.ZERO);
            }

            // Get the latest P90 forecast for the product in the store
            Supplier supplier = product.getSupplier();
            int leadTimeDays = supplier != null ? supplier.getLeadTimeDays() : 7; // Default lead time

            LocalDate today = LocalDate.now();
            LocalDate forecastEndDate = today.plusDays(leadTimeDays);

            List<Forecast> forecasts = forecastRepository.findByStoreIdAndProductIdAndForecastDateBetween(
                    storeId, product.getId(), today, forecastEndDate
            );

            BigDecimal p90DailyDemand = BigDecimal.ZERO;
            if (!forecasts.isEmpty()) {
                // Sum P90 forecasts over the lead time period
                p90DailyDemand = forecasts.stream()
                        .map(Forecast::getP90Forecast)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }

            // Calculate suggested quantity
            int suggestedQty = suggestQty(
                    inventory.getOnHand(),
                    inventory.getOnOrder(),
                    p90DailyDemand,
                    leadTimeDays,
                    product.getCasePackSize(),
                    product.getCasePackSize()
            );

            if (suggestedQty > 0) {
                suggestions.add(ReorderSuggestion.builder()
                        .product(product)
                        .currentStock(inventory.getOnHand().intValue())
                        .onOrder(inventory.getOnOrder().intValue())
                        .allocated(inventory.getQuantityAllocated().intValue())
                        .p90DailyDemand(p90DailyDemand.doubleValue())
                        .leadTimeDays(leadTimeDays)
                        .suggestedQuantity(suggestedQty)
                        .unitCost(product.getUnitCost().doubleValue())
                        .totalCost(suggestedQty * product.getUnitCost().doubleValue())
                        .reason("Generated based on P90 forecast and lead time.")
                        .build());
            }
        }
        return suggestions;
    }

    public int suggestQty(BigDecimal onHand, BigDecimal onOrder, BigDecimal p90DemandLeadTime,
                          int leadTimeDays, int moq, int casePack) {
        BigDecimal netInventory = onHand.add(onOrder);
        BigDecimal shortfall = p90DemandLeadTime.subtract(netInventory);

        if (shortfall.compareTo(BigDecimal.ZERO) <= 0) {
            return 0; // No shortfall, no reorder needed
        }

        int qty = shortfall.setScale(0, RoundingMode.CEILING).intValue();

        // Apply MOQ
        if (qty < moq) {
            qty = moq;
        }

        // Round to nearest case pack
        int remainder = qty % casePack;
        if (remainder != 0) {
            qty += (casePack - remainder);
        }

        return qty;
    }

    public List<ReorderSuggestion> generateReorderSuggestions(UUID storeId, UUID supplierId) {
        return calculateReorderSuggestions(storeId, supplierId);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrderFromSuggestions(UUID storeId, UUID supplierId, List<ReorderSuggestion> suggestions) {
        if (suggestions == null || suggestions.isEmpty()) {
            throw new IllegalArgumentException("Reorder suggestions cannot be null or empty");
        }

        log.info("Creating purchase order from {} suggestions for store {} and supplier {}", 
                suggestions.size(), storeId, supplierId);

        // Fetch store and supplier entities
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with ID: " + storeId));
        
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID: " + supplierId));

        // Generate PO number
        String poNumber = generatePONumber(store, supplier);

        // Create purchase order
        PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                .poNumber(poNumber)
                .store(store)
                .supplier(supplier)
                .status(PurchaseOrder.PurchaseOrderStatus.DRAFT)
                .orderDate(LocalDate.now())
                .expectedDeliveryDate(LocalDate.now().plusDays(supplier.getLeadTimeDays()))
                .priority(PurchaseOrder.Priority.MEDIUM)
                .notes("Auto-generated from reorder suggestions")
                .build();

        // Save purchase order first to get the ID
        purchaseOrder = purchaseOrderRepository.save(purchaseOrder);
        log.info("Created purchase order {} with ID {}", poNumber, purchaseOrder.getId());

        // Create purchase order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        for (ReorderSuggestion suggestion : suggestions) {
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(purchaseOrder)
                    .product(suggestion.getProduct())
                    .quantityOrdered(suggestion.getSuggestedQuantity())
                    .unitCost(BigDecimal.valueOf(suggestion.getUnitCost()))
                    .notes(String.format("Auto-generated: %s", suggestion.getReason()))
                    .build();

            items.add(item);
            totalAmount = totalAmount.add(item.getTotalCost());
        }

        // Save all items
        purchaseOrderItemRepository.saveAll(items);
        log.info("Created {} purchase order items for PO {}", items.size(), poNumber);

        // Update total amount and save
        purchaseOrder.setTotalAmount(totalAmount);
        purchaseOrder = purchaseOrderRepository.save(purchaseOrder);

        log.info("Successfully created purchase order {} with total amount {}", 
                poNumber, totalAmount);

        return purchaseOrder;
    }

    private String generatePONumber(Store store, Supplier supplier) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String storeCode = store.getCode() != null ? store.getCode() : "ST";
        String supplierCode = supplier.getCode() != null ? supplier.getCode() : "SUP";
        
        String basePoNumber = String.format("PO-%s-%s-%s", storeCode, supplierCode, timestamp.substring(timestamp.length() - 6));
        
        // Ensure uniqueness
        int counter = 1;
        String poNumber = basePoNumber;
        while (purchaseOrderRepository.existsByPoNumber(poNumber)) {
            poNumber = basePoNumber + "-" + counter;
            counter++;
        }
        
        return poNumber;
    }

}