package com.retailinventory.infrastructure.graphql;

import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import com.retailinventory.domain.service.ReorderService;
import com.retailinventory.infrastructure.dto.reorder.ReorderSuggestion;
import com.retailinventory.infrastructure.service.MlApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

/**
 * GraphQL Query Resolver for the Retail Inventory Platform.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class QueryResolver {

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ForecastRepository forecastRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ReorderService reorderService;
    private final MlApiService mlApiService;

    @QueryMapping
    public Store store(@Argument UUID id) {
        log.debug("Fetching store with id: {}", id);
        return storeRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Store> stores() {
        log.debug("Fetching all stores");
        return storeRepository.findAll();
    }

    @QueryMapping
    public Product product(@Argument UUID id) {
        log.debug("Fetching product with id: {}", id);
        return productRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Product> products(@Argument UUID storeId) {
        log.debug("Fetching products for store: {}", storeId);
        if (storeId != null) {
            // Return products available in the specific store
            return productRepository.findByStoreId(storeId);
        }
        return productRepository.findAll();
    }

    @QueryMapping
    public Inventory inventory(@Argument UUID storeId, @Argument UUID productId) {
        log.debug("Fetching inventory for store: {}, product: {}", storeId, productId);
        return inventoryRepository.findByStoreIdAndProductId(storeId, productId).orElse(null);
    }

    @QueryMapping
    public List<Inventory> inventoryByStore(@Argument UUID storeId) {
        log.debug("Fetching inventory for store: {}", storeId);
        return inventoryRepository.findByStoreId(storeId);
    }

    @QueryMapping
    public List<Inventory> lowStockItems(@Argument UUID storeId) {
        log.debug("Fetching low stock items for store: {}", storeId);
        if (storeId != null) {
            return inventoryRepository.findLowStockByStoreId(storeId);
        }
        return inventoryRepository.findLowStock();
    }

    @QueryMapping
    public List<Forecast> forecasts(@Argument UUID storeId) {
        log.debug("Fetching forecasts for store: {}", storeId);
        return forecastRepository.findByStoreId(storeId);
    }

    @QueryMapping
    public PurchaseOrder purchaseOrder(@Argument UUID id) {
        log.debug("Fetching purchase order with id: {}", id);
        return purchaseOrderRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<PurchaseOrder> purchaseOrders(@Argument UUID storeId, @Argument String status) {
        log.debug("Fetching purchase orders for store: {}, status: {}", storeId, status);
        if (storeId != null && status != null) {
            return purchaseOrderRepository.findByStoreIdAndStatus(storeId, PurchaseOrder.PurchaseOrderStatus.valueOf(status));
        } else if (storeId != null) {
            return purchaseOrderRepository.findByStoreId(storeId);
        } else if (status != null) {
            return purchaseOrderRepository.findByStatus(PurchaseOrder.PurchaseOrderStatus.valueOf(status));
        }
        return purchaseOrderRepository.findAll();
    }

    @QueryMapping
    public List<ReorderSuggestion> reorderSuggestions(@Argument UUID storeId, @Argument UUID supplierId) {
        log.debug("Fetching reorder suggestions for store: {}, supplier: {}", storeId, supplierId);
        return reorderService.calculateReorderSuggestions(storeId, supplierId);
    }

    @QueryMapping
    public DashboardKPIs dashboardKPIs(@Argument UUID storeId) {
        log.debug("Fetching dashboard KPIs for store: {}", storeId);
        return calculateDashboardKPIs(storeId);
    }

    private DashboardKPIs calculateDashboardKPIs(UUID storeId) {
        // This would be implemented to calculate real KPIs
        // For now, returning mock data
        return DashboardKPIs.builder()
                .totalInventoryValue(100000.0)
                .lowStockItems(5)
                .openPurchaseOrders(3)
                .averageLeadTime(7.5)
                .forecastAccuracy(0.85)
                .inventoryTurnover(4.2)
                .build();
    }
}
