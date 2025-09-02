package com.retailinventory.domain.service;

import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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

    @lombok.Data
    @lombok.Builder
    public static class ReorderSuggestion {
        private Product product;
        private Integer currentStock;
        private Integer onOrder;
        private Integer allocated;
        private Double p90DailyDemand;
        private Integer leadTimeDays;
        private Integer suggestedQuantity;
        private Double unitCost;
        private Double totalCost;
        private String reason;
    }
}