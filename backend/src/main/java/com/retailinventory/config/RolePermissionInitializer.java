package com.retailinventory.config;

import com.retailinventory.domain.entity.Permission;
import com.retailinventory.domain.entity.Role;
import com.retailinventory.domain.repository.PermissionRepository;
import com.retailinventory.domain.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Initializes roles and permissions for the system.
 * Creates system roles and customer roles for multi-tenancy.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "test", "prod"})
public class RolePermissionInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (roleRepository.findByName("ADMIN").isPresent()) {
            log.info("[RolePermissionInitializer] Roles already exist. Skipping initialization.");
            return;
        }

        log.info("[RolePermissionInitializer] Initializing roles and permissions...");

        // Create permissions
        createPermissions();
        
        // Create roles
        createRoles();

        log.info("[RolePermissionInitializer] Role and permission initialization completed.");
    }

    private void createPermissions() {
        // System permissions
        Permission systemAdmin = createPermission(
            Permission.Names.SYSTEM_ADMIN,
            "System Administrator",
            "Full system access and configuration",
            "system",
            "admin"
        );

        Permission systemConfig = createPermission(
            Permission.Names.SYSTEM_CONFIG,
            "System Configuration",
            "Configure system settings",
            "system",
            "config"
        );

        // User management permissions
        Permission userRead = createPermission(
            Permission.Names.USER_READ,
            "Read Users",
            "View user information",
            "user",
            "read"
        );

        Permission userCreate = createPermission(
            Permission.Names.USER_CREATE,
            "Create Users",
            "Create new users",
            "user",
            "create"
        );

        Permission userUpdate = createPermission(
            Permission.Names.USER_UPDATE,
            "Update Users",
            "Modify user information",
            "user",
            "update"
        );

        Permission userDelete = createPermission(
            Permission.Names.USER_DELETE,
            "Delete Users",
            "Remove users from system",
            "user",
            "delete"
        );

        // Organization permissions
        Permission orgRead = createPermission(
            "organization:read",
            "Read Organization",
            "View organization information",
            "organization",
            "read"
        );

        Permission orgUpdate = createPermission(
            "organization:update",
            "Update Organization",
            "Modify organization settings",
            "organization",
            "update"
        );

        // Product permissions
        Permission productRead = createPermission(
            Permission.Names.PRODUCT_READ,
            "Read Products",
            "View product information",
            "product",
            "read"
        );

        Permission productCreate = createPermission(
            Permission.Names.PRODUCT_CREATE,
            "Create Products",
            "Add new products",
            "product",
            "create"
        );

        Permission productUpdate = createPermission(
            Permission.Names.PRODUCT_UPDATE,
            "Update Products",
            "Modify product information",
            "product",
            "update"
        );

        Permission productDelete = createPermission(
            Permission.Names.PRODUCT_DELETE,
            "Delete Products",
            "Remove products",
            "product",
            "delete"
        );

        // Inventory permissions
        Permission inventoryRead = createPermission(
            Permission.Names.INVENTORY_READ,
            "Read Inventory",
            "View inventory levels",
            "inventory",
            "read"
        );

        Permission inventoryUpdate = createPermission(
            Permission.Names.INVENTORY_UPDATE,
            "Update Inventory",
            "Modify inventory levels",
            "inventory",
            "update"
        );

        // Store permissions
        Permission storeRead = createPermission(
            Permission.Names.STORE_READ,
            "Read Stores",
            "View store information",
            "store",
            "read"
        );

        Permission storeCreate = createPermission(
            Permission.Names.STORE_CREATE,
            "Create Stores",
            "Add new stores",
            "store",
            "create"
        );

        Permission storeUpdate = createPermission(
            Permission.Names.STORE_UPDATE,
            "Update Stores",
            "Modify store information",
            "store",
            "update"
        );

        // Purchase Order permissions
        Permission poRead = createPermission(
            Permission.Names.PO_READ,
            "Read Purchase Orders",
            "View purchase orders",
            "purchase_order",
            "read"
        );

        Permission poCreate = createPermission(
            Permission.Names.PO_CREATE,
            "Create Purchase Orders",
            "Create new purchase orders",
            "purchase_order",
            "create"
        );

        Permission poUpdate = createPermission(
            Permission.Names.PO_UPDATE,
            "Update Purchase Orders",
            "Modify purchase orders",
            "purchase_order",
            "update"
        );

        Permission poApprove = createPermission(
            Permission.Names.PO_APPROVE,
            "Approve Purchase Orders",
            "Approve purchase orders",
            "purchase_order",
            "approve"
        );

        // Supplier permissions
        Permission supplierRead = createPermission(
            Permission.Names.SUPPLIER_READ,
            "Read Suppliers",
            "View supplier information",
            "supplier",
            "read"
        );

        Permission supplierCreate = createPermission(
            Permission.Names.SUPPLIER_CREATE,
            "Create Suppliers",
            "Add new suppliers",
            "supplier",
            "create"
        );

        Permission supplierUpdate = createPermission(
            Permission.Names.SUPPLIER_UPDATE,
            "Update Suppliers",
            "Modify supplier information",
            "supplier",
            "update"
        );

        // Forecast permissions
        Permission forecastRead = createPermission(
            Permission.Names.FORECAST_READ,
            "Read Forecasts",
            "View demand forecasts",
            "forecast",
            "read"
        );

        Permission forecastCreate = createPermission(
            Permission.Names.FORECAST_CREATE,
            "Create Forecasts",
            "Generate new forecasts",
            "forecast",
            "create"
        );

        // Report permissions
        Permission reportRead = createPermission(
            Permission.Names.REPORT_READ,
            "Read Reports",
            "View system reports",
            "report",
            "read"
        );

        Permission reportExport = createPermission(
            Permission.Names.REPORT_EXPORT,
            "Export Reports",
            "Export reports to files",
            "report",
            "export"
        );

        // Save all permissions
        permissionRepository.saveAll(Set.of(
            systemAdmin, systemConfig,
            userRead, userCreate, userUpdate, userDelete,
            orgRead, orgUpdate,
            productRead, productCreate, productUpdate, productDelete,
            inventoryRead, inventoryUpdate,
            storeRead, storeCreate, storeUpdate,
            poRead, poCreate, poUpdate, poApprove,
            supplierRead, supplierCreate, supplierUpdate,
            forecastRead, forecastCreate,
            reportRead, reportExport
        ));
    }

    private void createRoles() {
        // Get all permissions
        var allPermissions = permissionRepository.findAll();
        var userPermissions = allPermissions.stream()
            .filter(p -> p.getResource() != null && p.getResource().equals("user"))
            .collect(java.util.stream.Collectors.toSet());
        var businessPermissions = allPermissions.stream()
            .filter(p -> p.getResource() != null && 
                (p.getResource().equals("product") || 
                 p.getResource().equals("inventory") || 
                 p.getResource().equals("store") || 
                 p.getResource().equals("purchase_order") || 
                 p.getResource().equals("supplier") || 
                 p.getResource().equals("forecast") || 
                 p.getResource().equals("report")))
            .collect(java.util.stream.Collectors.toSet());

        // ADMIN role - System administrator with all permissions
        Role adminRole = Role.builder()
            .name("ADMIN")
            .displayName("System Administrator")
            .description("Full system access and configuration")
            .isSystemRole(true)
            .permissions(Set.copyOf(allPermissions))
            .build();

        // CUSTOMER_ADMIN role - Organization administrator
        Role customerAdminRole = Role.builder()
            .name("CUSTOMER_ADMIN")
            .displayName("Customer Administrator")
            .description("Organization administrator with user management and business permissions")
            .isSystemRole(false)
            .permissions(userPermissions)
            .build();

        // Add business permissions to customer admin
        customerAdminRole.getPermissions().addAll(businessPermissions);

        // CUSTOMER_USER role - Regular organization user
        Role customerUserRole = Role.builder()
            .name("CUSTOMER_USER")
            .displayName("Customer User")
            .description("Regular organization user with business permissions")
            .isSystemRole(false)
            .permissions(businessPermissions.stream()
                .filter(p -> p.getAction().equals("read") || 
                           (p.getResource().equals("inventory") && p.getAction().equals("update")) ||
                           (p.getResource().equals("purchase_order") && (p.getAction().equals("create") || p.getAction().equals("update"))))
                .collect(java.util.stream.Collectors.toSet()))
            .build();

        roleRepository.saveAll(Set.of(adminRole, customerAdminRole, customerUserRole));
    }

    private Permission createPermission(String name, String displayName, String description, String resource, String action) {
        return Permission.builder()
            .name(name)
            .displayName(displayName)
            .description(description)
            .resource(resource)
            .action(action)
            .build();
    }
}
