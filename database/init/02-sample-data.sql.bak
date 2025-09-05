-- Initial data for retail inventory platform
-- This file will be executed when the database is first created

-- Insert Stores
INSERT INTO stores (id, code, name, manager, email, phone, address, city, state, zip_code, country, status, created_at, updated_at) VALUES
('10ee69e1-72ee-4092-b63d-38fd752ad060', 'NYC001', 'Manhattan Flagship', 'Sarah Johnson', 'manhattan@boutique.com', '+1-212-555-0101', '123 Fifth Avenue', 'New York', 'NY', '10001', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7331da39-f361-4e06-8aa6-4b2c07891d7f', 'LA002', 'Beverly Hills Location', 'Michael Chen', 'beverlyhills@boutique.com', '+1-310-555-0102', '456 Rodeo Drive', 'Beverly Hills', 'CA', '90210', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c18278f5-93cf-4890-9a71-89f46c08f668', 'CHI003', 'Michigan Avenue Store', 'Emily Rodriguez', 'chicago@boutique.com', '+1-312-555-0103', '789 N Michigan Ave', 'Chicago', 'IL', '60611', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bc612abb-30bb-4b0e-8593-d9a18b480900', 'MIA004', 'South Beach Boutique', 'Carlos Martinez', 'miami@boutique.com', '+1-305-555-0104', '321 Ocean Drive', 'Miami', 'FL', '33139', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('62dec203-1ec6-4544-b8c5-87bfd5f5aa09', 'SEA005', 'Pike Place Market', 'Jessica Wang', 'seattle@boutique.com', '+1-206-555-0105', '567 Pike Street', 'Seattle', 'WA', '98101', 'USA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Suppliers  
INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, city, country, lead_time_days, status, created_at, updated_at) VALUES
('d534ff8d-171e-4967-aea9-9f4482d67439', 'SUP001', 'Fashion Forward Inc', 'Alice Thompson', 'orders@fashionforward.com', '+1-555-0201', '100 Garment District', 'New York', 'USA', 14, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('48f1ac2b-d004-4cd2-aae3-4c58065cb7d4', 'SUP002', 'Premium Textiles Ltd', 'David Wilson', 'sales@premiumtextiles.com', '+1-555-0202', '200 Industrial Blvd', 'Los Angeles', 'USA', 21, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('87722a21-af29-472f-b21a-6f49bd27eb6d', 'SUP003', 'Eco-Friendly Apparel', 'Maria Garcia', 'info@ecofriendlyapparel.com', '+1-555-0203', '300 Green Street', 'Portland', 'USA', 18, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Products
INSERT INTO products (id, sku, name, category, subcategory, brand, description, unit_cost, unit_price, case_pack_size, supplier_id, status, created_at, updated_at) VALUES
('3ec10fca-f783-4f4e-b3d7-c9d77e37c861', 'TOP001', 'Silk Blouse - Navy', 'TOPS', 'BLOUSES', 'Fashion Forward', 'Elegant navy silk blouse with pearl buttons', 35.00, 89.99, 12, 'd534ff8d-171e-4967-aea9-9f4482d67439', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8c430c6b-02e4-401c-bbfb-6efe185bf521', 'DRS001', 'Summer Maxi Dress', 'DRESSES', 'MAXI', 'Premium Textiles', 'Flowing maxi dress in floral print', 28.50, 79.99, 8, '48f1ac2b-d004-4cd2-aae3-4c58065cb7d4', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5e9e2f6e-2e73-4a9f-a52c-b820b5cea3fb', 'JKT001', 'Organic Cotton Blazer', 'OUTERWEAR', 'BLAZERS', 'Eco-Friendly', 'Sustainable blazer made from organic cotton', 45.00, 129.99, 6, '87722a21-af29-472f-b21a-6f49bd27eb6d', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c6e7f5fe-adb9-467c-8193-f88e79eb1936', 'PNT001', 'High-Waisted Jeans', 'BOTTOMS', 'JEANS', 'Fashion Forward', 'Classic high-waisted denim jeans', 25.00, 69.99, 10, 'd534ff8d-171e-4967-aea9-9f4482d67439', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('72aeb7f3-b466-44df-8541-b177bb9c9419', 'ACC001', 'Leather Handbag - Black', 'ACCESSORIES', 'BAGS', 'Premium Textiles', 'Genuine leather handbag in classic black', 55.00, 159.99, 4, '48f1ac2b-d004-4cd2-aae3-4c58065cb7d4', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Inventory
INSERT INTO inventory (id, store_id, product_id, quantity_on_hand, quantity_on_order, quantity_reserved, cost_per_unit, reorder_point, max_stock_level, recorded_at, created_at, updated_at, created_by, updated_by, version) VALUES
(gen_random_uuid(), '10ee69e1-72ee-4092-b63d-38fd752ad060', '3ec10fca-f783-4f4e-b3d7-c9d77e37c861', 25.00, 0.00, 0.00, 35.00, 15, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0),
(gen_random_uuid(), '10ee69e1-72ee-4092-b63d-38fd752ad060', '8c430c6b-02e4-401c-bbfb-6efe185bf521', 15.00, 0.00, 0.00, 28.50, 8, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0),
(gen_random_uuid(), '7331da39-f361-4e06-8aa6-4b2c07891d7f', '3ec10fca-f783-4f4e-b3d7-c9d77e37c861', 8.00, 0.00, 0.00, 35.00, 15, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0),
(gen_random_uuid(), 'c18278f5-93cf-4890-9a71-89f46c08f668', '5e9e2f6e-2e73-4a9f-a52c-b820b5cea3fb', 30.00, 0.00, 0.00, 45.00, 12, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0),
(gen_random_uuid(), 'bc612abb-30bb-4b0e-8593-d9a18b480900', 'c6e7f5fe-adb9-467c-8193-f88e79eb1936', 2.00, 0.00, 0.00, 25.00, 20, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0);

-- Insert Purchase Orders
INSERT INTO purchase_orders (id, po_number, supplier_id, store_id, status, total_amount, tax_amount, shipping_amount, order_date, priority, notes, created_at, updated_at) VALUES
(gen_random_uuid(), 'PO-2025-001', 'd534ff8d-171e-4967-aea9-9f4482d67439', '10ee69e1-72ee-4092-b63d-38fd752ad060', 'DRAFT', 0.00, 0.00, 0.00, CURRENT_DATE, 'MEDIUM', 'Restock silk blouses for spring season', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PO-2025-002', '48f1ac2b-d004-4cd2-aae3-4c58065cb7d4', '7331da39-f361-4e06-8aa6-4b2c07891d7f', 'PENDING_APPROVAL', 0.00, 0.00, 0.00, CURRENT_DATE, 'MEDIUM', 'Summer collection restock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
