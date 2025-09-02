package com.retailinventory.infrastructure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for processing webhook data from external systems.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookService {

    private final ObjectMapper objectMapper;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SalesTransactionRepository salesTransactionRepository;
    private final WebhookEventRepository webhookEventRepository;

    /**
     * Process Shopify order webhook.
     */
    @Transactional
    public void processShopifyOrder(String payload, String shopDomain) {
        try {
            JsonNode orderData = objectMapper.readTree(payload);
            
            // Store webhook event for audit
            WebhookEvent event = WebhookEvent.builder()
                    .source("shopify")
                    .eventType("order")
                    .shopDomain(shopDomain)
                    .payload(payload)
                    .processedAt(LocalDateTime.now())
                    .build();
            webhookEventRepository.save(event);
            
            // Extract order information
            String orderId = orderData.get("id").asText();
            String orderNumber = orderData.get("order_number").asText();
            String orderDate = orderData.get("created_at").asText();
            
            log.info("Processing Shopify order: {} from shop: {}", orderNumber, shopDomain);
            
            // Find or create store
            Store store = findOrCreateStore(shopDomain);
            
            // Process line items
            JsonNode lineItems = orderData.get("line_items");
            if (lineItems.isArray()) {
                for (JsonNode lineItem : lineItems) {
                    processShopifyLineItem(lineItem, store, orderId, orderDate);
                }
            }
            
            log.info("Successfully processed Shopify order: {} from shop: {}", orderNumber, shopDomain);
            
        } catch (Exception e) {
            log.error("Error processing Shopify order from shop: {}", shopDomain, e);
            throw new RuntimeException("Failed to process Shopify order", e);
        }
    }

    /**
     * Process Shopify inventory webhook.
     */
    @Transactional
    public void processShopifyInventory(String payload, String shopDomain) {
        try {
            JsonNode inventoryData = objectMapper.readTree(payload);
            
            // Store webhook event for audit
            WebhookEvent event = WebhookEvent.builder()
                    .source("shopify")
                    .eventType("inventory")
                    .shopDomain(shopDomain)
                    .payload(payload)
                    .processedAt(LocalDateTime.now())
                    .build();
            webhookEventRepository.save(event);
            
            // Extract inventory information
            String inventoryItemId = inventoryData.get("inventory_item_id").asText();
            String locationId = inventoryData.get("location_id").asText();
            int available = inventoryData.get("available").asInt();
            
            log.info("Processing Shopify inventory update: item={}, location={}, available={}", 
                    inventoryItemId, locationId, available);
            
            // Find store and product
            Store store = findOrCreateStore(shopDomain);
            Product product = findOrCreateProduct(inventoryItemId, inventoryData);
            
            // Update inventory
            updateInventory(store.getId(), product.getId(), available);
            
            log.info("Successfully processed Shopify inventory update for item: {}", inventoryItemId);
            
        } catch (Exception e) {
            log.error("Error processing Shopify inventory from shop: {}", shopDomain, e);
            throw new RuntimeException("Failed to process Shopify inventory", e);
        }
    }

    /**
     * Process Lightspeed order webhook.
     */
    @Transactional
    public void processLightspeedOrder(String payload, String shopId) {
        try {
            JsonNode orderData = objectMapper.readTree(payload);
            
            // Store webhook event for audit
            WebhookEvent event = WebhookEvent.builder()
                    .source("lightspeed")
                    .eventType("order")
                    .shopDomain(shopId)
                    .payload(payload)
                    .processedAt(LocalDateTime.now())
                    .build();
            webhookEventRepository.save(event);
            
            // Extract order information
            String orderId = orderData.get("saleID").asText();
            String orderNumber = orderData.get("referenceNumber").asText();
            String orderDate = orderData.get("createTime").asText();
            
            log.info("Processing Lightspeed order: {} from shop: {}", orderNumber, shopId);
            
            // Find or create store
            Store store = findOrCreateStore(shopId);
            
            // Process line items
            JsonNode lineItems = orderData.get("SaleLines");
            if (lineItems.isArray()) {
                for (JsonNode lineItem : lineItems) {
                    processLightspeedLineItem(lineItem, store, orderId, orderDate);
                }
            }
            
            log.info("Successfully processed Lightspeed order: {} from shop: {}", orderNumber, shopId);
            
        } catch (Exception e) {
            log.error("Error processing Lightspeed order from shop: {}", shopId, e);
            throw new RuntimeException("Failed to process Lightspeed order", e);
        }
    }

    /**
     * Process Lightspeed inventory webhook.
     */
    @Transactional
    public void processLightspeedInventory(String payload, String shopId) {
        try {
            JsonNode inventoryData = objectMapper.readTree(payload);
            
            // Store webhook event for audit
            WebhookEvent event = WebhookEvent.builder()
                    .source("lightspeed")
                    .eventType("inventory")
                    .shopDomain(shopId)
                    .payload(payload)
                    .processedAt(LocalDateTime.now())
                    .build();
            webhookEventRepository.save(event);
            
            // Extract inventory information
            String itemId = inventoryData.get("itemID").asText();
            int quantity = inventoryData.get("qtyInStock").asInt();
            
            log.info("Processing Lightspeed inventory update: item={}, quantity={}", itemId, quantity);
            
            // Find store and product
            Store store = findOrCreateStore(shopId);
            Product product = findOrCreateProduct(itemId, inventoryData);
            
            // Update inventory
            updateInventory(store.getId(), product.getId(), quantity);
            
            log.info("Successfully processed Lightspeed inventory update for item: {}", itemId);
            
        } catch (Exception e) {
            log.error("Error processing Lightspeed inventory from shop: {}", shopId, e);
            throw new RuntimeException("Failed to process Lightspeed inventory", e);
        }
    }

    private void processShopifyLineItem(JsonNode lineItem, Store store, String orderId, String orderDate) {
        String sku = lineItem.get("sku").asText();
        int quantity = lineItem.get("quantity").asInt();
        double price = lineItem.get("price").asDouble();
        
        Product product = findOrCreateProduct(sku, lineItem);
        
        // Create sales transaction
        SalesTransaction transaction = SalesTransaction.builder()
                .storeId(store.getId())
                .productId(product.getId())
                .transactionDate(LocalDateTime.parse(orderDate))
                .quantitySold(quantity)
                .unitPrice(BigDecimal.valueOf(price))
                .totalAmount(BigDecimal.valueOf(quantity * price))
                .externalOrderId(orderId)
                .build();
        
        salesTransactionRepository.save(transaction);
        
        // Update inventory
        updateInventory(store.getId(), product.getId(), -quantity);
    }

    private void processLightspeedLineItem(JsonNode lineItem, Store store, String orderId, String orderDate) {
        String itemId = lineItem.get("itemID").asText();
        int quantity = lineItem.get("unitQuantity").asInt();
        double price = lineItem.get("unitPrice").asDouble();
        
        Product product = findOrCreateProduct(itemId, lineItem);
        
        // Create sales transaction
        SalesTransaction transaction = SalesTransaction.builder()
                .storeId(store.getId())
                .productId(product.getId())
                .transactionDate(LocalDateTime.parse(orderDate))
                .quantitySold(quantity)
                .unitPrice(BigDecimal.valueOf(price))
                .totalAmount(BigDecimal.valueOf(quantity * price))
                .externalOrderId(orderId)
                .build();
        
        salesTransactionRepository.save(transaction);
        
        // Update inventory
        updateInventory(store.getId(), product.getId(), -quantity);
    }

    private Store findOrCreateStore(String shopDomain) {
        return storeRepository.findByCode(shopDomain)
                .orElseGet(() -> {
                    Store store = Store.builder()
                            .code(shopDomain)
                            .name(shopDomain)
                            .status(Store.StoreStatus.ACTIVE)
                            .build();
                    return storeRepository.save(store);
                });
    }

    private Product findOrCreateProduct(String sku, JsonNode data) {
        return productRepository.findBySku(sku)
                .orElseGet(() -> {
                    Product product = Product.builder()
                            .sku(sku)
                            .name(data.get("title").asText(sku))
                            .status(Product.ProductStatus.ACTIVE)
                            .build();
                    return productRepository.save(product);
                });
    }

    private void updateInventory(UUID storeId, UUID productId, int quantityChange) {
        Inventory inventory = inventoryRepository.findByStoreIdAndProductId(storeId, productId)
                .orElseGet(() -> {
                    Inventory newInventory = Inventory.builder()
                            .quantityOnHand(BigDecimal.ZERO)
                            .quantityReserved(BigDecimal.ZERO)
                            .quantityOnOrder(BigDecimal.ZERO)
                            .build();
                    // Set the store and product relationships
                    newInventory.setStore(storeRepository.findById(storeId).orElse(null));
                    newInventory.setProduct(productRepository.findById(productId).orElse(null));
                    return inventoryRepository.save(newInventory);
                });
        
        BigDecimal newQuantity = inventory.getQuantityOnHand().add(BigDecimal.valueOf(quantityChange));
        inventory.setQuantityOnHand(newQuantity.max(BigDecimal.ZERO));
        inventoryRepository.save(inventory);
    }
}
