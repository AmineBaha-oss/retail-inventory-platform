package com.retailinventory.infrastructure.controller;

import com.retailinventory.infrastructure.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Controller for handling webhooks from external systems (Shopify, Lightspeed, etc.).
 */
@RestController
@RequestMapping("/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final WebhookService webhookService;

    /**
     * Handle Shopify order webhooks.
     */
    @PostMapping("/shopify/orders")
    public ResponseEntity<Void> handleShopifyOrder(
            @RequestHeader("X-Shopify-Hmac-Sha256") String hmac,
            @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
            @RequestBody String payload) {
        
        log.info("Received Shopify order webhook from shop: {}", shopDomain);
        
        try {
            // Verify HMAC signature
            if (!verifyShopifyHmac(payload, hmac)) {
                log.warn("Invalid HMAC signature for Shopify webhook from shop: {}", shopDomain);
                return ResponseEntity.badRequest().build();
            }
            
            // Process the webhook
            webhookService.processShopifyOrder(payload, shopDomain);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error processing Shopify order webhook from shop: {}", shopDomain, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Handle Shopify inventory webhooks.
     */
    @PostMapping("/shopify/inventory")
    public ResponseEntity<Void> handleShopifyInventory(
            @RequestHeader("X-Shopify-Hmac-Sha256") String hmac,
            @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
            @RequestBody String payload) {
        
        log.info("Received Shopify inventory webhook from shop: {}", shopDomain);
        
        try {
            // Verify HMAC signature
            if (!verifyShopifyHmac(payload, hmac)) {
                log.warn("Invalid HMAC signature for Shopify inventory webhook from shop: {}", shopDomain);
                return ResponseEntity.badRequest().build();
            }
            
            // Process the webhook
            webhookService.processShopifyInventory(payload, shopDomain);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error processing Shopify inventory webhook from shop: {}", shopDomain, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Handle Lightspeed order webhooks.
     */
    @PostMapping("/lightspeed/orders")
    public ResponseEntity<Void> handleLightspeedOrder(
            @RequestHeader("X-LS-Signature") String signature,
            @RequestHeader("X-LS-Shop-ID") String shopId,
            @RequestBody String payload) {
        
        log.info("Received Lightspeed order webhook from shop: {}", shopId);
        
        try {
            // Verify signature
            if (!verifyLightspeedSignature(payload, signature)) {
                log.warn("Invalid signature for Lightspeed webhook from shop: {}", shopId);
                return ResponseEntity.badRequest().build();
            }
            
            // Process the webhook
            webhookService.processLightspeedOrder(payload, shopId);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error processing Lightspeed order webhook from shop: {}", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Handle Lightspeed inventory webhooks.
     */
    @PostMapping("/lightspeed/inventory")
    public ResponseEntity<Void> handleLightspeedInventory(
            @RequestHeader("X-LS-Signature") String signature,
            @RequestHeader("X-LS-Shop-ID") String shopId,
            @RequestBody String payload) {
        
        log.info("Received Lightspeed inventory webhook from shop: {}", shopId);
        
        try {
            // Verify signature
            if (!verifyLightspeedSignature(payload, signature)) {
                log.warn("Invalid signature for Lightspeed inventory webhook from shop: {}", shopId);
                return ResponseEntity.badRequest().build();
            }
            
            // Process the webhook
            webhookService.processLightspeedInventory(payload, shopId);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error processing Lightspeed inventory webhook from shop: {}", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Verify Shopify HMAC signature.
     */
    private boolean verifyShopifyHmac(String payload, String hmac) {
        try {
            String secret = System.getenv("SHOPIFY_WEBHOOK_SECRET");
            if (secret == null) {
                log.warn("SHOPIFY_WEBHOOK_SECRET not configured");
                return false;
            }
            
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String calculatedHmac = Base64.getEncoder().encodeToString(hash);
            
            return calculatedHmac.equals(hmac);
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error verifying Shopify HMAC", e);
            return false;
        }
    }

    /**
     * Verify Lightspeed signature.
     */
    private boolean verifyLightspeedSignature(String payload, String signature) {
        try {
            String secret = System.getenv("LIGHTSPEED_WEBHOOK_SECRET");
            if (secret == null) {
                log.warn("LIGHTSPEED_WEBHOOK_SECRET not configured");
                return false;
            }
            
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hash);
            
            return calculatedSignature.equals(signature);
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error verifying Lightspeed signature", e);
            return false;
        }
    }
}
