-- Enhanced test data (executed only on fresh volume creation)
-- Assumes empty tables created by 00-schema.sql

-- STORES
INSERT INTO stores (code,name,manager,email,phone,address,city,country,timezone,status)
VALUES
 ('NYC001','SoHo Flagship','Emma Rodriguez','soho@modernboutique.com','+1-212-555-0100','125 Spring Street','New York','USA','America/New_York','ACTIVE'),
 ('LA001','Beverly Hills Premium','James Chen','beverlyhills@modernboutique.com','+1-310-555-0101','9600 Wilshire Blvd','Beverly Hills','USA','America/Los_Angeles','ACTIVE'),
 ('CHI001','Magnificent Mile','Sophia Williams','chicago@modernboutique.com','+1-312-555-0102','663 N Michigan Ave','Chicago','USA','America/Chicago','ACTIVE'),
 ('MIA001','Design District','Carlos Mendez','miami@modernboutique.com','+1-305-555-0103','140 NE 39th Street','Miami','USA','America/New_York','ACTIVE'),
 ('SEA001','Capitol Hill','Riley Park','seattle@modernboutique.com','+1-206-555-0104','1520 12th Avenue','Seattle','USA','America/Los_Angeles','ACTIVE'),
 ('DAL001','Deep Ellum','Maya Johnson','dallas@modernboutique.com','+1-214-555-0105','2700 Main Street','Dallas','USA','America/Chicago','ACTIVE'),
 ('OUT001','Factory Outlet','David Kim','outlet@modernboutique.com','+1-555-555-0106','100 Outlet Drive','Newark','USA','America/New_York','INACTIVE');

-- SUPPLIERS
INSERT INTO suppliers (code,name,category,contact_person,email,phone,address,city,country,lead_time_days,min_order_quantity,min_order_value,status)
VALUES
 ('LOFT','Loft & Co','Premium Apparel','Isabella Martinez','orders@loftandco.com','+1-555-0200','300 Fashion Ave','New York','USA',7,12,1000.00,'ACTIVE'),
 ('VERA','Vera Couture','Designer Wear','Alessandro Rossi','sales@veracouture.com','+33-1-42-86-87-88','12 Rue Saint-Honoré','Paris','France',14,6,2500.00,'ACTIVE'),
 ('URBAN','Urban Threads','Casual Wear','Zoe Thompson','wholesale@urbanthreads.com','+1-555-0202','500 Industrial Blvd','Los Angeles','USA',10,24,800.00,'ACTIVE'),
 ('LUNA','Luna Accessories','Accessories','Sophie Laurent','contact@lunaaccessories.com','+39-02-1234-5678','Via Montenapoleone 12','Milan','Italy',21,18,1200.00,'ACTIVE'),
 ('ECO','EcoStyle Collective','Sustainable Fashion','Maya Patel','info@ecostylecollective.com','+1-555-0204','200 Green Street','Portland','USA',15,12,600.00,'ACTIVE'),
 ('SEAS','Seasonal Trends Co','Seasonal Items','Mark Johnson','orders@seasonaltrends.com','+1-555-0205','150 Commerce St','Atlanta','USA',30,50,2000.00,'SUSPENDED');

-- PRODUCTS
INSERT INTO products (sku,name,category,subcategory,brand,description,unit_cost,unit_price,case_pack_size,supplier_id,status)
SELECT * FROM (
 VALUES
 ('LOFT-BLZ-001','Tailored Power Blazer','OUTERWEAR','BLAZERS','Loft','Professional tailored blazer in navy wool blend',85.00,295.00,6,(SELECT id FROM suppliers WHERE code='LOFT'),'ACTIVE'),
 ('LOFT-TOP-001','Silk Wrap Blouse','TOPS','BLOUSES','Loft','Elegant wrap blouse in pure silk with tie waist',45.00,165.00,12,(SELECT id FROM suppliers WHERE code='LOFT'),'ACTIVE'),
 ('LOFT-PNT-001','Wide Leg Trousers','BOTTOMS','PANTS','Loft','High-waisted wide leg trousers in crepe fabric',58.00,195.00,8,(SELECT id FROM suppliers WHERE code='LOFT'),'ACTIVE'),
 ('VERA-DRS-001','Midnight Gala Dress','DRESSES','EVENING','Vera','Stunning floor-length evening gown with beaded details',180.00,695.00,3,(SELECT id FROM suppliers WHERE code='VERA'),'ACTIVE'),
 ('VERA-JKT-001','Leather Moto Jacket','OUTERWEAR','JACKETS','Vera','Premium leather motorcycle jacket',195.00,795.00,4,(SELECT id FROM suppliers WHERE code='VERA'),'ACTIVE'),
 ('URBAN-TEE-001','Vintage Graphic Tee','TOPS','T-SHIRTS','Urban','Soft cotton graphic tee',12.00,39.99,24,(SELECT id FROM suppliers WHERE code='URBAN'),'ACTIVE'),
 ('URBAN-JEN-001','Distressed Skinny Jeans','BOTTOMS','JEANS','Urban','Trendy distressed skinny jeans',22.00,79.99,15,(SELECT id FROM suppliers WHERE code='URBAN'),'ACTIVE'),
 ('URBAN-HOD-001','Oversized Hoodie','TOPS','SWEATSHIRTS','Urban','Cozy oversized hoodie',25.00,89.99,12,(SELECT id FROM suppliers WHERE code='URBAN'),'ACTIVE'),
 ('LUNA-BAG-001','Milano Leather Tote','ACCESSORIES','BAGS','Luna','Handcrafted Italian leather tote',95.00,325.00,6,(SELECT id FROM suppliers WHERE code='LUNA'),'ACTIVE'),
 ('LUNA-JWL-001','Gold Chain Necklace','ACCESSORIES','JEWELRY','Luna','18k gold-plated layered chain necklace',28.00,125.00,18,(SELECT id FROM suppliers WHERE code='LUNA'),'ACTIVE'),
 ('LUNA-SHO-001','Classic Heeled Pumps','SHOES','HEELS','Luna','Elegant pointed-toe pumps',68.00,245.00,9,(SELECT id FROM suppliers WHERE code='LUNA'),'ACTIVE'),
 ('ECO-DRS-001','Organic Cotton Midi Dress','DRESSES','CASUAL','EcoStyle','Sustainable midi dress',32.00,115.00,10,(SELECT id FROM suppliers WHERE code='ECO'),'ACTIVE'),
 ('ECO-BAG-001','Recycled Canvas Tote','ACCESSORIES','BAGS','EcoStyle','Eco-friendly tote bag',18.00,65.00,20,(SELECT id FROM suppliers WHERE code='ECO'),'ACTIVE'),
 ('LOFT-OLD-001','Last Season Blazer','OUTERWEAR','BLAZERS','Loft','Previous season blazer - discontinued',75.00,150.00,6,(SELECT id FROM suppliers WHERE code='LOFT'),'DISCONTINUED')
 ) AS v;

-- INVENTORY (subset for demo)
INSERT INTO inventory (recorded_at,store_id,product_id,quantity_on_hand,quantity_on_order,quantity_reserved,cost_per_unit,reorder_point,max_stock_level)
SELECT now(), (SELECT id FROM stores WHERE code='NYC001'), (SELECT id FROM products WHERE sku='LOFT-BLZ-001'),15,12,2,85,8,25 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='NYC001'), (SELECT id FROM products WHERE sku='LOFT-TOP-001'),8,0,1,45,12,30 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='NYC001'), (SELECT id FROM products WHERE sku='VERA-DRS-001'),3,6,0,180,2,8 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='NYC001'), (SELECT id FROM products WHERE sku='URBAN-TEE-001'),45,0,5,12,20,60 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='LA001'), (SELECT id FROM products WHERE sku='VERA-DRS-001'),5,3,1,180,3,10 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='LA001'), (SELECT id FROM products WHERE sku='VERA-JKT-001'),4,4,0,195,2,8 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='LA001'), (SELECT id FROM products WHERE sku='LUNA-SHO-001'),0,9,0,68,6,15 UNION ALL
SELECT now(), (SELECT id FROM stores WHERE code='NYC001'), (SELECT id FROM products WHERE sku='LUNA-BAG-001'),12,0,2,95,6,18;

-- PURCHASE ORDERS
INSERT INTO purchase_orders (po_number,supplier_id,store_id,status,priority,order_date,expected_delivery_date,notes,total_amount,tax_amount,shipping_amount)
VALUES
 ('PO-2025-001',(SELECT id FROM suppliers WHERE code='LOFT'),(SELECT id FROM stores WHERE code='NYC001'),'PENDING_APPROVAL','HIGH',CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days','Urgent restock - Silk blouses nearly sold out',0,0,0),
 ('PO-2025-002',(SELECT id FROM suppliers WHERE code='VERA'),(SELECT id FROM stores WHERE code='LA001'),'APPROVED','MEDIUM',CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '12 days','Beverly Hills - Designer evening wear restock',0,0,0);

-- PURCHASE ORDER ITEMS
INSERT INTO purchase_order_items (purchase_order_id,product_id,quantity_ordered,unit_cost,total_cost)
SELECT (SELECT id FROM purchase_orders WHERE po_number='PO-2025-001'), (SELECT id FROM products WHERE sku='LOFT-TOP-001'),12,45,540 UNION ALL
SELECT (SELECT id FROM purchase_orders WHERE po_number='PO-2025-002'), (SELECT id FROM products WHERE sku='VERA-DRS-001'),6,180,1080;

-- Update PO totals
UPDATE purchase_orders SET total_amount = (SELECT SUM(total_cost) FROM purchase_order_items i WHERE i.purchase_order_id=purchase_orders.id) WHERE po_number IN ('PO-2025-001','PO-2025-002');
