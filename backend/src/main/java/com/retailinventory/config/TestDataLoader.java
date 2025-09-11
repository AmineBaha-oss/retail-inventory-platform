/*
 * SQL-based init now handles test data on fresh volume creation.
 * This Spring Boot loader ensures data is always present after app startup.
 */
package com.retailinventory.config;

import com.retailinventory.domain.entity.*;
import com.retailinventory.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Enhanced Test Data Loader - runs after Spring Boot startup
 * - Loads realistic SaaS test data across Stores, Suppliers, Products, Inventory, Purchase Orders & Items
 * - Runs only in dev/test profiles
 * - Idempotent: guarded by presence of NYC001 store code
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev","test"})
public class TestDataLoader implements CommandLineRunner {

    private final StoreRepository storeRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (storeRepository.findByCode("NYC001").isPresent()) {
            log.info("[TestDataLoader] Existing test data found (NYC001). Skipping load.");
            return;
        }
        long start = System.currentTimeMillis();
        log.info("[TestDataLoader] Loading enhanced test data...");

        Map<String, Organization> organizations = createOrganizations();
        Map<String, Store> stores = createStores(organizations);
        Map<String, Supplier> suppliers = createSuppliers();
        Map<String, Product> products = createProducts(suppliers);
        createUsers(organizations);
        createInventory(stores, products);
        createPurchaseOrders(stores, suppliers, products);

        log.info("[TestDataLoader] Done in {} ms | Stores: {} Suppliers: {} Products: {} InventoryRows: {} PurchaseOrders: {}", 
                (System.currentTimeMillis()-start), storeRepository.count(), supplierRepository.count(), productRepository.count(), inventoryRepository.count(), purchaseOrderRepository.count());
    }

    /* ----------------------- ORGANIZATIONS ----------------------- */
    private Map<String, Organization> createOrganizations() {
        List<Organization> list = List.of(
            organization("Modern Boutique Corp", "modern-boutique", "Premium fashion retail chain", "https://modernboutique.com", "+1-555-0100", "info@modernboutique.com", "123 Fashion Ave", "New York", "NY", "10001", "USA", Organization.OrganizationStatus.ACTIVE, "premium", 50),
            organization("EcoStyle Collective", "ecostyle-collective", "Sustainable fashion retailer", "https://ecostyle.com", "+1-555-0200", "hello@ecostyle.com", "456 Green St", "Portland", "OR", "97201", "USA", Organization.OrganizationStatus.ACTIVE, "standard", 25),
            organization("Urban Threads Co", "urban-threads", "Casual wear retailer", "https://urbanthreads.com", "+1-555-0300", "contact@urbanthreads.com", "789 Urban Blvd", "Los Angeles", "CA", "90210", "USA", Organization.OrganizationStatus.TRIAL, "trial", 10)
        );
        organizationRepository.saveAll(list);
        Map<String, Organization> map = new HashMap<>();
        list.forEach(o -> map.put(o.getSlug(), o));
        return map;
    }

    private Organization organization(String name, String slug, String description, String website, String phone, String email, String address1, String city, String state, String postal, String country, Organization.OrganizationStatus status, String plan, int maxUsers) {
        Organization.Address address = Organization.Address.builder()
            .addressLine1(address1)
            .city(city)
            .state(state)
            .postalCode(postal)
            .country(country)
            .build();

        return Organization.builder()
            .name(name)
            .slug(slug)
            .description(description)
            .website(website)
            .phone(phone)
            .email(email)
            .address(address)
            .status(status)
            .subscriptionPlan(plan)
            .maxUsers(maxUsers)
            .trialEndsAt(status == Organization.OrganizationStatus.TRIAL ? LocalDateTime.now().plusDays(30) : null)
            .build();
    }

    /* ----------------------- USERS ----------------------- */
    private void createUsers(Map<String, Organization> organizations) {
        // Ensure roles exist first
        Role adminRole = roleRepository.findByName("ADMIN")
            .orElseGet(() -> roleRepository.save(Role.builder()
                .name("ADMIN")
                .displayName("System Administrator")
                .description("Full system access")
                .isSystemRole(true)
                .build()));
        
        Role customerAdminRole = roleRepository.findByName("CUSTOMER_ADMIN")
            .orElseGet(() -> roleRepository.save(Role.builder()
                .name("CUSTOMER_ADMIN")
                .displayName("Customer Administrator")
                .description("Organization administrator")
                .isSystemRole(false)
                .build()));
        
        Role customerUserRole = roleRepository.findByName("CUSTOMER_USER")
            .orElseGet(() -> roleRepository.save(Role.builder()
                .name("CUSTOMER_USER")
                .displayName("Customer User")
                .description("Regular organization user")
                .isSystemRole(false)
                .build()));

        List<User> users = List.of(
            // System admin
            user("admin@system.com", "admin", "System", "Administrator", "+1-555-0000", "admin123", Set.of(adminRole), null, User.UserStatus.ACTIVE, true),
            
            // Modern Boutique Corp users
            user("ceo@modernboutique.com", "ceo", "Emma", "Rodriguez", "+1-555-0101", "password123", Set.of(customerAdminRole), organizations.get("modern-boutique"), User.UserStatus.ACTIVE, true),
            user("manager@modernboutique.com", "manager", "James", "Chen", "+1-555-0102", "password123", Set.of(customerUserRole), organizations.get("modern-boutique"), User.UserStatus.ACTIVE, true),
            user("staff@modernboutique.com", "staff", "Sophia", "Williams", "+1-555-0103", "password123", Set.of(customerUserRole), organizations.get("modern-boutique"), User.UserStatus.ACTIVE, true),
            
            // EcoStyle Collective users
            user("admin@ecostyle.com", "ecoadmin", "Maya", "Patel", "+1-555-0201", "password123", Set.of(customerAdminRole), organizations.get("ecostyle-collective"), User.UserStatus.ACTIVE, true),
            user("user@ecostyle.com", "ecouser", "Riley", "Park", "+1-555-0202", "password123", Set.of(customerUserRole), organizations.get("ecostyle-collective"), User.UserStatus.ACTIVE, true),
            
            // Urban Threads Co users (trial)
            user("admin@urbanthreads.com", "urbanadmin", "Carlos", "Mendez", "+1-555-0301", "password123", Set.of(customerAdminRole), organizations.get("urban-threads"), User.UserStatus.ACTIVE, true),
            user("user@urbanthreads.com", "urbanuser", "Maya", "Johnson", "+1-555-0302", "password123", Set.of(customerUserRole), organizations.get("urban-threads"), User.UserStatus.PENDING_VERIFICATION, false)
        );
        
        userRepository.saveAll(users);
    }

    private User user(String email, String username, String firstName, String lastName, String phone, String password, Set<Role> roles, Organization organization, User.UserStatus status, Boolean emailVerified) {
        return User.builder()
            .email(email)
            .username(username)
            .firstName(firstName)
            .lastName(lastName)
            .phone(phone)
            .passwordHash(passwordEncoder.encode(password)) // Properly hash the password
            .roles(roles)
            .organization(organization)
            .status(status)
            .emailVerified(emailVerified)
            .build();
    }

    /* ----------------------- STORES ----------------------- */
    private Map<String, Store> createStores(Map<String, Organization> organizations) {
        List<Store> list = List.of(
                store("NYC001","SoHo Flagship","Emma Rodriguez","soho@modernboutique.com","+1-212-555-0100","125 Spring Street","New York","USA","America/New_York", Store.StoreStatus.ACTIVE, organizations.get("modern-boutique")),
                store("LA001","Beverly Hills Premium","James Chen","beverlyhills@modernboutique.com","+1-310-555-0101","9600 Wilshire Blvd","Beverly Hills","USA","America/Los_Angeles", Store.StoreStatus.ACTIVE, organizations.get("modern-boutique")),
                store("CHI001","Magnificent Mile","Sophia Williams","chicago@modernboutique.com","+1-312-555-0102","663 N Michigan Ave","Chicago","USA","America/Chicago", Store.StoreStatus.ACTIVE, organizations.get("modern-boutique")),
                store("MIA001","Design District","Carlos Mendez","miami@modernboutique.com","+1-305-555-0103","140 NE 39th Street","Miami","USA","America/New_York", Store.StoreStatus.ACTIVE, organizations.get("modern-boutique")),
                store("SEA001","Capitol Hill","Riley Park","seattle@modernboutique.com","+1-206-555-0104","1520 12th Avenue","Seattle","USA","America/Los_Angeles", Store.StoreStatus.ACTIVE, organizations.get("ecostyle-collective")),
                store("DAL001","Deep Ellum","Maya Johnson","dallas@modernboutique.com","+1-214-555-0105","2700 Main Street","Dallas","USA","America/Chicago", Store.StoreStatus.ACTIVE, organizations.get("ecostyle-collective")),
                store("OUT001","Factory Outlet","David Kim","outlet@modernboutique.com","+1-555-555-0106","100 Outlet Drive","Newark","USA","America/New_York", Store.StoreStatus.INACTIVE, organizations.get("urban-threads"))
        );
        storeRepository.saveAll(list);
        Map<String, Store> map = new HashMap<>();
        list.forEach(s -> map.put(s.getCode(), s));
        return map;
    }

    private Store store(String code, String name, String manager, String email, String phone, String address, String city, String country, String tz, Store.StoreStatus status, Organization organization) {
        return Store.builder()
                .code(code).name(name).manager(manager).email(email).phone(phone)
                .address(address).city(city).country(country).timezone(tz).status(status)
                .organization(organization)
                .build();
    }

    /* ----------------------- SUPPLIERS ----------------------- */
    private Map<String, Supplier> createSuppliers() {
        List<Supplier> list = List.of(
                supplier("LOFT","Loft & Co","Premium Apparel","Isabella Martinez","orders@loftandco.com","+1-555-0200","300 Fashion Ave","New York","USA",7,12,new BigDecimal("1000.00"), Supplier.SupplierStatus.ACTIVE),
                supplier("VERA","Vera Couture","Designer Wear","Alessandro Rossi","sales@veracouture.com","+33-1-42-86-87-88","12 Rue Saint-Honoré","Paris","France",14,6,new BigDecimal("2500.00"), Supplier.SupplierStatus.ACTIVE),
                supplier("URBAN","Urban Threads","Casual Wear","Zoe Thompson","wholesale@urbanthreads.com","+1-555-0202","500 Industrial Blvd","Los Angeles","USA",10,24,new BigDecimal("800.00"), Supplier.SupplierStatus.ACTIVE),
                supplier("LUNA","Luna Accessories","Accessories","Sophie Laurent","contact@lunaaccessories.com","+39-02-1234-5678","Via Montenapoleone 12","Milan","Italy",21,18,new BigDecimal("1200.00"), Supplier.SupplierStatus.ACTIVE),
                supplier("ECO","EcoStyle Collective","Sustainable Fashion","Maya Patel","info@ecostylecollective.com","+1-555-0204","200 Green Street","Portland","USA",15,12,new BigDecimal("600.00"), Supplier.SupplierStatus.ACTIVE),
                supplier("SEAS","Seasonal Trends Co","Seasonal Items","Mark Johnson","orders@seasonaltrends.com","+1-555-0205","150 Commerce St","Atlanta","USA",30,50,new BigDecimal("2000.00"), Supplier.SupplierStatus.SUSPENDED)
        );
        supplierRepository.saveAll(list);
        Map<String, Supplier> map = new HashMap<>();
        list.forEach(s -> map.put(s.getCode(), s));
        return map;
    }

    private Supplier supplier(String code, String name, String category, String contact, String email, String phone, String address, String city, String country, int lead, int minQty, BigDecimal minValue, Supplier.SupplierStatus status) {
        return Supplier.builder()
                .code(code).name(name).category(category).contactPerson(contact).email(email).phone(phone)
                .address(address).city(city).country(country).leadTimeDays(lead).minOrderQuantity(minQty)
                .minOrderValue(minValue).status(status)
                .build();
    }

    /* ----------------------- PRODUCTS ----------------------- */
    private Map<String, Product> createProducts(Map<String, Supplier> suppliers) {
        List<Product> list = List.of(
                product("LOFT-BLZ-001","Tailored Power Blazer","OUTERWEAR","BLAZERS","Loft","Professional tailored blazer in navy wool blend",85,295,6,suppliers.get("LOFT"), Product.ProductStatus.ACTIVE),
                product("LOFT-TOP-001","Silk Wrap Blouse","TOPS","BLOUSES","Loft","Elegant wrap blouse in pure silk with tie waist",45,165,12,suppliers.get("LOFT"), Product.ProductStatus.ACTIVE),
                product("LOFT-PNT-001","Wide Leg Trousers","BOTTOMS","PANTS","Loft","High-waisted wide leg trousers in crepe fabric",58,195,8,suppliers.get("LOFT"), Product.ProductStatus.ACTIVE),
                product("VERA-DRS-001","Midnight Gala Dress","DRESSES","EVENING","Vera","Stunning floor-length evening gown with beaded details",180,695,3,suppliers.get("VERA"), Product.ProductStatus.ACTIVE),
                product("VERA-JKT-001","Leather Moto Jacket","OUTERWEAR","JACKETS","Vera","Premium leather motorcycle jacket with asymmetric zip",195,795,4,suppliers.get("VERA"), Product.ProductStatus.ACTIVE),
                product("URBAN-TEE-001","Vintage Graphic Tee","TOPS","T-SHIRTS","Urban","Soft cotton graphic tee with vintage band design",12,39.99,24,suppliers.get("URBAN"), Product.ProductStatus.ACTIVE),
                product("URBAN-JEN-001","Distressed Skinny Jeans","BOTTOMS","JEANS","Urban","Trendy distressed skinny jeans with stretch",22,79.99,15,suppliers.get("URBAN"), Product.ProductStatus.ACTIVE),
                product("URBAN-HOD-001","Oversized Hoodie","TOPS","SWEATSHIRTS","Urban","Cozy oversized hoodie in organic cotton blend",25,89.99,12,suppliers.get("URBAN"), Product.ProductStatus.ACTIVE),
                product("LUNA-BAG-001","Milano Leather Tote","ACCESSORIES","BAGS","Luna","Handcrafted Italian leather tote with gold hardware",95,325,6,suppliers.get("LUNA"), Product.ProductStatus.ACTIVE),
                product("LUNA-JWL-001","Gold Chain Necklace","ACCESSORIES","JEWELRY","Luna","18k gold-plated layered chain necklace set",28,125,18,suppliers.get("LUNA"), Product.ProductStatus.ACTIVE),
                product("LUNA-SHO-001","Classic Heeled Pumps","SHOES","HEELS","Luna","Elegant pointed-toe pumps in genuine leather",68,245,9,suppliers.get("LUNA"), Product.ProductStatus.ACTIVE),
                product("ECO-DRS-001","Organic Cotton Midi Dress","DRESSES","CASUAL","EcoStyle","Sustainable midi dress in organic cotton",32,115,10,suppliers.get("ECO"), Product.ProductStatus.ACTIVE),
                product("ECO-BAG-001","Recycled Canvas Tote","ACCESSORIES","BAGS","EcoStyle","Eco-friendly tote bag made from recycled materials",18,65,20,suppliers.get("ECO"), Product.ProductStatus.ACTIVE),
                product("LOFT-OLD-001","Last Season Blazer","OUTERWEAR","BLAZERS","Loft","Previous season blazer - discontinued",75,150,6,suppliers.get("LOFT"), Product.ProductStatus.DISCONTINUED)
        );
        productRepository.saveAll(list);
        Map<String, Product> map = new HashMap<>();
        list.forEach(p -> map.put(p.getSku(), p));
        return map;
    }

    private Product product(String sku, String name, String category, String subcategory, String brand, String desc, double cost, double price, int pack, Supplier supplier, Product.ProductStatus status) {
        return Product.builder()
                .sku(sku).name(name).category(category).subcategory(subcategory).brand(brand)
                .description(desc)
                .unitCost(new BigDecimal(String.valueOf(cost)))
                .unitPrice(new BigDecimal(String.valueOf(price)))
                .casePackSize(pack)
                .supplier(supplier)
                .status(status)
                .build();
    }

    /* ----------------------- INVENTORY ----------------------- */
    private void createInventory(Map<String, Store> stores, Map<String, Product> products) {
        LocalDateTime now = LocalDateTime.now();
        List<Inventory> list = new ArrayList<>();
        list.add(inv(stores.get("NYC001"), products.get("LOFT-BLZ-001"),15,12,2,85,8,25, now));
        list.add(inv(stores.get("NYC001"), products.get("LOFT-TOP-001"),8,0,1,45,12,30, now)); // low stock
        list.add(inv(stores.get("NYC001"), products.get("VERA-DRS-001"),3,6,0,180,2,8, now));
        list.add(inv(stores.get("NYC001"), products.get("URBAN-TEE-001"),45,0,5,12,20,60, now));
        list.add(inv(stores.get("NYC001"), products.get("LUNA-BAG-001"),12,0,2,95,6,18, now));
        list.add(inv(stores.get("LA001"), products.get("VERA-DRS-001"),5,3,1,180,3,10, now));
        list.add(inv(stores.get("LA001"), products.get("VERA-JKT-001"),4,4,0,195,2,8, now));
        list.add(inv(stores.get("LA001"), products.get("LUNA-SHO-001"),0,9,0,68,6,15, now)); // stock out
        inventoryRepository.saveAll(list);
    }

    private Inventory inv(Store store, Product product, double onHand, double onOrder, double reserved, double cost, int reorder, int max, LocalDateTime at) {
        return Inventory.builder()
                .store(store)
                .product(product)
                .quantityOnHand(BigDecimal.valueOf(onHand))
                .quantityOnOrder(BigDecimal.valueOf(onOrder))
                .quantityReserved(BigDecimal.valueOf(reserved))
                .costPerUnit(BigDecimal.valueOf(cost))
                .reorderPoint(reorder)
                .maxStockLevel(max)
                .recordedAt(at)
                .build();
    }

    /* ----------------------- PURCHASE ORDERS ----------------------- */
    private void createPurchaseOrders(Map<String, Store> stores, Map<String, Supplier> suppliers, Map<String, Product> products) {
        LocalDate today = LocalDate.now();
        PurchaseOrder po1 = po("PO-2025-001", suppliers.get("LOFT"), stores.get("NYC001"), PurchaseOrder.PurchaseOrderStatus.PENDING_APPROVAL, PurchaseOrder.Priority.HIGH, today.minusDays(2), today.plusDays(5), "Urgent restock - Silk blouses nearly sold out");
        PurchaseOrder po2 = po("PO-2025-002", suppliers.get("VERA"), stores.get("LA001"), PurchaseOrder.PurchaseOrderStatus.APPROVED, PurchaseOrder.Priority.MEDIUM, today.minusDays(1), today.plusDays(12), "Beverly Hills - Designer evening wear restock");
        purchaseOrderRepository.saveAll(List.of(po1, po2));

        PurchaseOrderItem i1 = poi(po1, products.get("LOFT-TOP-001"),12);
        PurchaseOrderItem i2 = poi(po2, products.get("VERA-DRS-001"),6);
        purchaseOrderItemRepository.saveAll(List.of(i1, i2));
    }

    private PurchaseOrder po(String number, Supplier supplier, Store store, PurchaseOrder.PurchaseOrderStatus status, PurchaseOrder.Priority priority, LocalDate orderDate, LocalDate expected, String notes) {
        return PurchaseOrder.builder()
                .poNumber(number)
                .supplier(supplier)
                .store(store)
                .status(status)
                .priority(priority)
                .orderDate(orderDate)
                .expectedDeliveryDate(expected)
                .notes(notes)
                .build();
    }

    private PurchaseOrderItem poi(PurchaseOrder po, Product product, int qty) {
        return PurchaseOrderItem.builder()
                .purchaseOrder(po)
                .product(product)
                .quantityOrdered(qty)
                .quantityReceived(0)
                .unitCost(product.getUnitCost())
                .build();
    }
}
