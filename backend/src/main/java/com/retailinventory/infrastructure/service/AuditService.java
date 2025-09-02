package com.retailinventory.infrastructure.service;

import com.retailinventory.domain.entity.AuditEvent;
import com.retailinventory.domain.repository.AuditEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for audit logging and tracking state changes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;

    /**
     * Log an audit event.
     */
    @Transactional
    public void logEvent(String entityType, String entityId, String action, String actor, Object payload) {
        try {
            String payloadJson = payload != null ? objectMapper.writeValueAsString(payload) : null;
            
            AuditEvent event = AuditEvent.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .actor(actor)
                    .timestamp(LocalDateTime.now())
                    .payload(payloadJson)
                    .build();
            
            auditEventRepository.save(event);
            log.debug("Audit event logged: {} {} {} by {}", entityType, action, entityId, actor);
            
        } catch (Exception e) {
            log.error("Error logging audit event", e);
        }
    }

    /**
     * Log inventory update.
     */
    public void logInventoryUpdate(UUID storeId, UUID productId, String action, String actor, Object oldValue, Object newValue) {
        String entityId = String.format("store:%s,product:%s", storeId, productId);
        logEvent("INVENTORY", entityId, action, actor, createChangePayload(oldValue, newValue));
    }

    /**
     * Log purchase order state change.
     */
    public void logPurchaseOrderChange(UUID poId, String action, String actor, Object oldValue, Object newValue) {
        logEvent("PURCHASE_ORDER", poId.toString(), action, actor, createChangePayload(oldValue, newValue));
    }

    /**
     * Log forecast generation.
     */
    public void logForecastGeneration(UUID storeId, UUID productId, String actor, Object forecastData) {
        String entityId = String.format("store:%s,product:%s", storeId, productId);
        logEvent("FORECAST", entityId, "GENERATE", actor, forecastData);
    }

    /**
     * Log user authentication.
     */
    public void logAuthentication(String userId, String action, String ipAddress, boolean success) {
        String payload = String.format("{\"ipAddress\":\"%s\",\"success\":%s}", ipAddress, success);
        logEvent("USER", userId, action, userId, payload);
    }

    /**
     * Log webhook processing.
     */
    public void logWebhookProcessing(String source, String eventType, String shopDomain, boolean success, String errorMessage) {
        String payload = String.format("{\"source\":\"%s\",\"eventType\":\"%s\",\"shopDomain\":\"%s\",\"success\":%s,\"error\":\"%s\"}", 
                source, eventType, shopDomain, success, errorMessage);
        logEvent("WEBHOOK", shopDomain, "PROCESS", "system", payload);
    }

    /**
     * Log system configuration changes.
     */
    public void logConfigurationChange(String configKey, String actor, Object oldValue, Object newValue) {
        logEvent("CONFIGURATION", configKey, "UPDATE", actor, createChangePayload(oldValue, newValue));
    }

    /**
     * Log data export/import operations.
     */
    public void logDataOperation(String operation, String entityType, String actor, int recordCount, boolean success) {
        String payload = String.format("{\"operation\":\"%s\",\"recordCount\":%d,\"success\":%s}", 
                operation, recordCount, success);
        logEvent("DATA_OPERATION", entityType, operation, actor, payload);
    }

    private Object createChangePayload(Object oldValue, Object newValue) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("oldValue", oldValue);
        payload.put("newValue", newValue);
        payload.put("timestamp", LocalDateTime.now().toString());
        return payload;
    }
}
