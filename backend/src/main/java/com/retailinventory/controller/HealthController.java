package com.retailinventory.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

/**
 * Simple health check controller for Railway deployment
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "retail-inventory-platform");
        health.put("timestamp", System.currentTimeMillis());
        return health;
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> info = new HashMap<>();
        info.put("message", "Retail Inventory Platform API");
        info.put("status", "UP");
        info.put("version", "1.0.0");
        return info;
    }
}
