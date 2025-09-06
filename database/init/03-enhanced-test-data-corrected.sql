-- Enhanced Test Data for Retail Inventory Platform (Schema-Corrected)
-- Shopify-style boutique data with realistic business scenarios
-- Phase A3: Comprehensive SaaS test data

-- Clear existing data (in correct order to avoid foreign key constraints)
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM inventory;
DELETE FROM products;
DELETE FROM suppliers;
DELETE FROM stores;

-- === STORES: Modern Boutique Chain ===
INSERT INTO stores (id, code, name, manager, email, phone, address, city, country, status, created_at, updated_at) VALUES
-- Flagship stores
('550e8400-e29b-41d4-a716-446655440000', 'NYC001', 'SoHo Flagship', 'Emma Rodriguez', 'soho@modernboutique.com', '+1-212-555-0100', '125 Spring Street', 'New York', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440001', 'LA001', 'Beverly Hills Premium', 'James Chen', 'beverlyhills@modernboutique.com', '+1-310-555-0101', '9600 Wilshire Blvd', 'Beverly Hills', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'CHI001', 'Magnificent Mile', 'Sophia Williams', 'chicago@modernboutique.com', '+1-312-555-0102', '663 N Michigan Ave', 'Chicago', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Regional stores
('550e8400-e29b-41d4-a716-446655440003', 'MIA001', 'Design District', 'Carlos Mendez', 'miami@modernboutique.com', '+1-305-555-0103', '140 NE 39th Street', 'Miami', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', 'SEA001', 'Capitol Hill', 'Riley Park', 'seattle@modernboutique.com', '+1-206-555-0104', '1520 12th Avenue', 'Seattle', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440005', 'DAL001', 'Deep Ellum', 'Maya Johnson', 'dallas@modernboutique.com', '+1-214-555-0105', '2700 Main Street', 'Dallas', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Outlet/Testing store (inactive)
('550e8400-e29b-41d4-a716-446655440006', 'OUT001', 'Factory Outlet', 'David Kim', 'outlet@modernboutique.com', '+1-555-555-0106', '100 Outlet Drive', 'Newark', 'USA', 'INACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- === SUPPLIERS: Fashion & Lifestyle Brands ===
INSERT INTO suppliers (id, code, name, category, contact_person, email, phone, address, city, country, lead_time_days, min_order_quantity, min_order_value, status, created_at, updated_at) VALUES
-- Premium Fashion
('660e8400-e29b-41d4-a716-446655440000', 'LOFT', 'Loft & Co', 'Premium Apparel', 'Isabella Martinez', 'orders@loftandco.com', '+1-555-0200', '300 Fashion Ave', 'New York', 'USA', 7, 12, 1000.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('660e8400-e29b-41d4-a716-446655440001', 'VERA', 'Vera Couture', 'Designer Wear', 'Alessandro Rossi', 'sales@veracouture.com', '+33-1-42-86-87-88', '12 Rue Saint-Honoré', 'Paris', 'France', 14, 6, 2500.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('660e8400-e29b-41d4-a716-446655440002', 'URBAN', 'Urban Threads', 'Casual Wear', 'Zoe Thompson', 'wholesale@urbanthreads.com', '+1-555-0202', '500 Industrial Blvd', 'Los Angeles', 'USA', 10, 24, 800.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Accessories & Lifestyle
('660e8400-e29b-41d4-a716-446655440003', 'LUNA', 'Luna Accessories', 'Accessories', 'Sophie Laurent', 'contact@lunaaccessories.com', '+39-02-1234-5678', 'Via Montenapoleone 12', 'Milan', 'Italy', 21, 18, 1200.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('660e8400-e29b-41d4-a716-446655440004', 'ECO', 'EcoStyle Collective', 'Sustainable Fashion', 'Maya Patel', 'info@ecostylecollective.com', '+1-555-0204', '200 Green Street', 'Portland', 'USA', 15, 12, 600.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Seasonal/Test supplier (suspended)
('660e8400-e29b-41d4-a716-446655440005', 'SEAS', 'Seasonal Trends Co', 'Seasonal Items', 'Mark Johnson', 'orders@seasonaltrends.com', '+1-555-0205', '150 Commerce St', 'Atlanta', 'USA', 30, 50, 2000.00, 'SUSPENDED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- === PRODUCTS: Comprehensive Fashion Catalog ===
INSERT INTO products (id, sku, name, category, subcategory, brand, description, unit_cost, unit_price, case_pack_size, supplier_id, status, created_at, updated_at) VALUES
-- Loft & Co Products (Premium)
('770e8400-e29b-41d4-a716-446655440000', 'LOFT-BLZ-001', 'Tailored Power Blazer', 'OUTERWEAR', 'BLAZERS', 'Loft', 'Professional tailored blazer in navy wool blend', 85.00, 295.00, 6, '660e8400-e29b-41d4-a716-446655440000', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440001', 'LOFT-TOP-001', 'Silk Wrap Blouse', 'TOPS', 'BLOUSES', 'Loft', 'Elegant wrap blouse in pure silk with tie waist', 45.00, 165.00, 12, '660e8400-e29b-41d4-a716-446655440000', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440002', 'LOFT-PNT-001', 'Wide Leg Trousers', 'BOTTOMS', 'PANTS', 'Loft', 'High-waisted wide leg trousers in crepe fabric', 58.00, 195.00, 8, '660e8400-e29b-41d4-a716-446655440000', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Vera Couture Products (Designer)
('770e8400-e29b-41d4-a716-446655440003', 'VERA-DRS-001', 'Midnight Gala Dress', 'DRESSES', 'EVENING', 'Vera', 'Stunning floor-length evening gown with beaded details', 180.00, 695.00, 3, '660e8400-e29b-41d4-a716-446655440001', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440004', 'VERA-JKT-001', 'Leather Moto Jacket', 'OUTERWEAR', 'JACKETS', 'Vera', 'Premium leather motorcycle jacket with asymmetric zip', 195.00, 795.00, 4, '660e8400-e29b-41d4-a716-446655440001', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Urban Threads Products (Casual)
('770e8400-e29b-41d4-a716-446655440005', 'URBAN-TEE-001', 'Vintage Graphic Tee', 'TOPS', 'T-SHIRTS', 'Urban', 'Soft cotton graphic tee with vintage band design', 12.00, 39.99, 24, '660e8400-e29b-41d4-a716-446655440002', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440006', 'URBAN-JEN-001', 'Distressed Skinny Jeans', 'BOTTOMS', 'JEANS', 'Urban', 'Trendy distressed skinny jeans with stretch', 22.00, 79.99, 15, '660e8400-e29b-41d4-a716-446655440002', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440007', 'URBAN-HOD-001', 'Oversized Hoodie', 'TOPS', 'SWEATSHIRTS', 'Urban', 'Cozy oversized hoodie in organic cotton blend', 25.00, 89.99, 12, '660e8400-e29b-41d4-a716-446655440002', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Luna Accessories Products
('770e8400-e29b-41d4-a716-446655440008', 'LUNA-BAG-001', 'Milano Leather Tote', 'ACCESSORIES', 'BAGS', 'Luna', 'Handcrafted Italian leather tote with gold hardware', 95.00, 325.00, 6, '660e8400-e29b-41d4-a716-446655440003', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440009', 'LUNA-JWL-001', 'Gold Chain Necklace', 'ACCESSORIES', 'JEWELRY', 'Luna', '18k gold-plated layered chain necklace set', 28.00, 125.00, 18, '660e8400-e29b-41d4-a716-446655440003', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440010', 'LUNA-SHO-001', 'Classic Heeled Pumps', 'SHOES', 'HEELS', 'Luna', 'Elegant pointed-toe pumps in genuine leather', 68.00, 245.00, 9, '660e8400-e29b-41d4-a716-446655440003', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- EcoStyle Products (Sustainable)
('770e8400-e29b-41d4-a716-446655440011', 'ECO-DRS-001', 'Organic Cotton Midi Dress', 'DRESSES', 'CASUAL', 'EcoStyle', 'Sustainable midi dress in GOTS-certified organic cotton', 32.00, 115.00, 10, '660e8400-e29b-41d4-a716-446655440004', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('770e8400-e29b-41d4-a716-446655440012', 'ECO-BAG-001', 'Recycled Canvas Tote', 'ACCESSORIES', 'BAGS', 'EcoStyle', 'Eco-friendly tote bag made from recycled materials', 18.00, 65.00, 20, '660e8400-e29b-41d4-a716-446655440004', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Discontinued/Test Products
('770e8400-e29b-41d4-a716-446655440013', 'LOFT-OLD-001', 'Last Season Blazer', 'OUTERWEAR', 'BLAZERS', 'Loft', 'Previous season blazer - discontinued', 75.00, 150.00, 6, '660e8400-e29b-41d4-a716-446655440000', 'DISCONTINUED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- === INVENTORY: Realistic Stock Levels & Business Scenarios ===
INSERT INTO inventory (id, store_id, product_id, quantity_on_hand, quantity_on_order, quantity_reserved, cost_per_unit, reorder_point, max_stock_level, recorded_at, created_at, created_by, version) VALUES

-- NYC SoHo Flagship - High traffic, diverse inventory
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 15.00, 12.00, 2.00, 85.00, 8, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Power Blazers
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 8.00, 0.00, 1.00, 45.00, 12, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Silk Blouses - LOW STOCK
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', 3.00, 6.00, 0.00, 180.00, 2, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Evening Gowns
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440005', 45.00, 0.00, 5.00, 12.00, 20, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Graphic Tees
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440008', 12.00, 0.00, 2.00, 95.00, 6, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Leather Totes

-- Beverly Hills - Premium focus
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 5.00, 3.00, 1.00, 180.00, 3, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Evening Gowns
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 4.00, 4.00, 0.00, 195.00, 2, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Moto Jackets
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440010', 0.00, 9.00, 0.00, 68.00, 6, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Heeled Pumps - STOCK OUT

-- Chicago - Balanced inventory
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', 22.00, 0.00, 3.00, 85.00, 10, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Power Blazers
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', 18.00, 15.00, 2.00, 22.00, 15, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Skinny Jeans
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440007', 25.00, 0.00, 0.00, 25.00, 12, 36, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Hoodies

-- Miami - Trendy casual focus
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 35.00, 0.00, 8.00, 12.00, 25, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Graphic Tees
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440011', 14.00, 10.00, 0.00, 32.00, 8, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Organic Dresses
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440012', 6.00, 0.00, 1.00, 18.00, 15, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Canvas Totes - LOW STOCK

-- Seattle - Sustainable/casual focus  
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440007', 30.00, 0.00, 5.00, 25.00, 15, 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Hoodies
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440011', 20.00, 0.00, 2.00, 32.00, 12, 35, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Organic Dresses
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440012', 40.00, 0.00, 3.00, 18.00, 20, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Canvas Totes

-- Dallas - Mixed inventory with some low stock scenarios
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 7.00, 8.00, 0.00, 58.00, 10, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0), -- Wide Leg Trousers - LOW STOCK
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440009', 25.00, 0.00, 4.00, 28.00, 15, 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 0); -- Gold Necklaces

-- === PURCHASE ORDERS: Realistic Business Scenarios ===
INSERT INTO purchase_orders (id, po_number, supplier_id, store_id, status, total_amount, tax_amount, shipping_amount, order_date, expected_delivery_date, priority, notes, created_at, updated_at) VALUES

-- Active/Pending Orders
(gen_random_uuid(), 'PO-2025-001', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'PENDING_APPROVAL', 2890.00, 231.20, 75.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'HIGH', 'Urgent restock - Silk blouses nearly sold out', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'PO-2025-002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'APPROVED', 4975.00, 398.00, 125.00, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '12 days', 'MEDIUM', 'Beverly Hills - Designer evening wear restock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'PO-2025-003', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'APPROVED', 1560.00, 124.80, 45.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 'MEDIUM', 'Chicago - Casual wear regular restock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'PO-2025-004', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'DRAFT', 0.00, 0.00, 0.00, CURRENT_DATE, NULL, 'LOW', 'Beverly Hills - Accessories order being prepared', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Completed Orders (for history/reference)
(gen_random_uuid(), 'PO-2024-158', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'RECEIVED', 3240.00, 259.20, 85.00, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '8 days', 'MEDIUM', 'Successfully received - Holiday season prep', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'PO-2024-159', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'RECEIVED', 1890.00, 151.20, 50.00, CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '5 days', 'MEDIUM', 'Seattle - Eco-friendly collection delivery complete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- === PURCHASE ORDER ITEMS: Sample line items ===
-- Creating some representative PO items for the active orders
INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, unit_cost, total_cost, quantity_received, created_at) 
SELECT 
    gen_random_uuid(),
    po.id,
    p.id,
    12.00, -- Quantity
    p.unit_cost,
    12.00 * p.unit_cost, -- Total cost
    CASE WHEN po.status = 'RECEIVED' THEN 12.00 ELSE 0.00 END, -- Received qty
    CURRENT_TIMESTAMP
FROM purchase_orders po
CROSS JOIN products p
WHERE po.po_number = 'PO-2025-001' 
AND p.sku = 'LOFT-TOP-001'

UNION ALL

SELECT 
    gen_random_uuid(),
    po.id,
    p.id,
    6.00, -- Quantity
    p.unit_cost,
    6.00 * p.unit_cost, -- Total cost
    0.00, -- Not received yet
    CURRENT_TIMESTAMP
FROM purchase_orders po
CROSS JOIN products p
WHERE po.po_number = 'PO-2025-002' 
AND p.sku = 'VERA-DRS-001'

UNION ALL

SELECT 
    gen_random_uuid(),
    po.id,
    p.id,
    24.00, -- Quantity
    p.unit_cost,
    24.00 * p.unit_cost, -- Total cost
    0.00, -- Not received yet
    CURRENT_TIMESTAMP
FROM purchase_orders po
CROSS JOIN products p
WHERE po.po_number = 'PO-2025-003' 
AND p.sku = 'URBAN-TEE-001';

-- Update PO totals based on items
UPDATE purchase_orders 
SET total_amount = CASE po_number
    WHEN 'PO-2025-001' THEN 540.00  -- 12 * 45.00 (silk blouses)
    WHEN 'PO-2025-002' THEN 1080.00 -- 6 * 180.00 (evening dresses)  
    WHEN 'PO-2025-003' THEN 288.00  -- 24 * 12.00 (graphic tees)
    ELSE total_amount
END
WHERE po_number IN ('PO-2025-001', 'PO-2025-002', 'PO-2025-003');

-- Add tax and shipping calculations
UPDATE purchase_orders 
SET tax_amount = total_amount * 0.08,
    shipping_amount = CASE 
        WHEN total_amount < 500 THEN 50.00
        WHEN total_amount < 1000 THEN 75.00
        ELSE 100.00
    END
WHERE tax_amount = 0 AND total_amount > 0;

-- Create some forecasts if the table exists
INSERT INTO forecasts (id, store_id, product_id, forecast_date, forecast_quantity, confidence_level, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    s.id,
    p.id,
    CURRENT_DATE + 7, -- 1 week forecast
    CASE 
        WHEN p.category = 'TOPS' THEN 15
        WHEN p.category = 'DRESSES' THEN 8
        WHEN p.category = 'ACCESSORIES' THEN 20
        ELSE 12
    END,
    85.5, -- Confidence percentage
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM stores s
CROSS JOIN products p  
WHERE s.status = 'ACTIVE' 
AND p.status = 'ACTIVE'
LIMIT 50; -- Limit to keep it reasonable

-- Success indicator
SELECT 'Phase A3 Enhanced Test Data loaded successfully!' as result,
       COUNT(DISTINCT s.id) as stores_count,
       COUNT(DISTINCT sup.id) as suppliers_count,
       COUNT(DISTINCT p.id) as products_count,
       COUNT(DISTINCT i.id) as inventory_records,
       COUNT(DISTINCT po.id) as purchase_orders
FROM stores s, suppliers sup, products p, inventory i, purchase_orders po;
