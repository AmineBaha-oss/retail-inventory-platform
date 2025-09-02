package com.retailinventory.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "permissions", )
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "resource", length = 50)
    private String resource;

    @Column(name = "action", length = 50)
    private String action;

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Common permission constants
    public static class Names {
        // Product permissions
        public static final String PRODUCT_READ = "product:read";
        public static final String PRODUCT_CREATE = "product:create";
        public static final String PRODUCT_UPDATE = "product:update";
        public static final String PRODUCT_DELETE = "product:delete";

        // Inventory permissions
        public static final String INVENTORY_READ = "inventory:read";
        public static final String INVENTORY_UPDATE = "inventory:update";
        public static final String INVENTORY_COUNT = "inventory:count";

        // Purchase Order permissions
        public static final String PO_READ = "purchase_order:read";
        public static final String PO_CREATE = "purchase_order:create";
        public static final String PO_UPDATE = "purchase_order:update";
        public static final String PO_DELETE = "purchase_order:delete";
        public static final String PO_APPROVE = "purchase_order:approve";
        public static final String PO_SEND = "purchase_order:send";
        public static final String PO_RECEIVE = "purchase_order:receive";

        // Supplier permissions
        public static final String SUPPLIER_READ = "supplier:read";
        public static final String SUPPLIER_CREATE = "supplier:create";
        public static final String SUPPLIER_UPDATE = "supplier:update";
        public static final String SUPPLIER_DELETE = "supplier:delete";

        // Store permissions
        public static final String STORE_READ = "store:read";
        public static final String STORE_CREATE = "store:create";
        public static final String STORE_UPDATE = "store:update";
        public static final String STORE_DELETE = "store:delete";

        // Forecast permissions
        public static final String FORECAST_READ = "forecast:read";
        public static final String FORECAST_CREATE = "forecast:create";
        public static final String FORECAST_UPDATE = "forecast:update";
        public static final String FORECAST_RUN = "forecast:run";

        // User management permissions
        public static final String USER_READ = "user:read";
        public static final String USER_CREATE = "user:create";
        public static final String USER_UPDATE = "user:update";
        public static final String USER_DELETE = "user:delete";

        // Reports permissions
        public static final String REPORT_READ = "report:read";
        public static final String REPORT_EXPORT = "report:export";

        // System permissions
        public static final String SYSTEM_ADMIN = "system:admin";
        public static final String SYSTEM_CONFIG = "system:config";
    }
}
