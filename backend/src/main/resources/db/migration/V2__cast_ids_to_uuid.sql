-- Migration to convert VARCHAR IDs to UUID
-- This fixes the schema mismatch between entities (UUID) and existing tables (VARCHAR)

-- 1) Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Drop conflicting foreign keys (names from error logs)
ALTER TABLE IF EXISTS user_stores     DROP CONSTRAINT IF EXISTS FKoishwopv2xtojhxv6anv712cf; -- user_id -> users
ALTER TABLE IF EXISTS user_stores     DROP CONSTRAINT IF EXISTS FKmotj52wmr1ubdtg65s36u99yo; -- store_id -> stores
ALTER TABLE IF EXISTS user_roles      DROP CONSTRAINT IF EXISTS FKhfh9dx7w3ubf1co1vdev94g3f; -- user_id -> users
ALTER TABLE IF EXISTS lead_times      DROP CONSTRAINT IF EXISTS FKlj3axkje2lsc7xwjkuwufwyqj; -- product_id -> products
ALTER TABLE IF EXISTS lead_times      DROP CONSTRAINT IF EXISTS FKaanks4ds2xc1e4t2vynlq4fvo; -- supplier_id -> suppliers
ALTER TABLE IF EXISTS purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_created_by_fkey; -- created_by -> users
ALTER TABLE IF EXISTS purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_approved_by_fkey; -- approved_by -> users
ALTER TABLE IF EXISTS purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_store_id_fkey; -- store_id -> stores
ALTER TABLE IF EXISTS purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_supplier_id_fkey; -- supplier_id -> suppliers

-- 3) Convert primary key columns to UUID
ALTER TABLE IF EXISTS users              ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS stores             ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS suppliers          ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS products           ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS sales_transactions ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS purchase_orders    ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS forecasts          ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS inventory          ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS purchase_order_items ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS webhook_events     ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS audit_events       ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS roles              ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE IF EXISTS permissions        ALTER COLUMN id TYPE uuid USING id::uuid;

-- 4) Convert foreign key columns to UUID
ALTER TABLE IF EXISTS user_roles         ALTER COLUMN user_id     TYPE uuid USING user_id::uuid;
ALTER TABLE IF EXISTS user_stores        ALTER COLUMN user_id     TYPE uuid USING user_id::uuid;
ALTER TABLE IF EXISTS user_stores        ALTER COLUMN store_id    TYPE uuid USING store_id::uuid;
ALTER TABLE IF EXISTS lead_times         ALTER COLUMN product_id  TYPE uuid USING product_id::uuid;
ALTER TABLE IF EXISTS lead_times         ALTER COLUMN supplier_id TYPE uuid USING supplier_id::uuid;
ALTER TABLE IF EXISTS purchase_orders    ALTER COLUMN created_by TYPE uuid USING created_by::uuid;
ALTER TABLE IF EXISTS purchase_orders    ALTER COLUMN approved_by TYPE uuid USING approved_by::uuid;
ALTER TABLE IF EXISTS purchase_orders    ALTER COLUMN store_id    TYPE uuid USING store_id::uuid;
ALTER TABLE IF EXISTS purchase_orders    ALTER COLUMN supplier_id TYPE uuid USING supplier_id::uuid;
ALTER TABLE IF EXISTS sales_transactions ALTER COLUMN product_id  TYPE uuid USING product_id::uuid;
ALTER TABLE IF EXISTS sales_transactions ALTER COLUMN store_id    TYPE uuid USING store_id::uuid;
ALTER TABLE IF EXISTS forecasts          ALTER COLUMN store_id    TYPE uuid USING store_id::uuid;
ALTER TABLE IF EXISTS forecasts          ALTER COLUMN product_id  TYPE uuid USING product_id::uuid;
ALTER TABLE IF EXISTS inventory          ALTER COLUMN store_id    TYPE uuid USING store_id::uuid;
ALTER TABLE IF EXISTS inventory          ALTER COLUMN product_id  TYPE uuid USING product_id::uuid;
ALTER TABLE IF EXISTS purchase_order_items ALTER COLUMN purchase_order_id TYPE uuid USING purchase_order_id::uuid;
ALTER TABLE IF EXISTS purchase_order_items ALTER COLUMN product_id TYPE uuid USING product_id::uuid;
ALTER TABLE IF EXISTS webhook_events     ALTER COLUMN store_id    TYPE uuid USING store_id::uuid;
ALTER TABLE IF EXISTS audit_events       ALTER COLUMN entity_id   TYPE uuid USING entity_id::uuid;
ALTER TABLE IF EXISTS audit_events       ALTER COLUMN user_id     TYPE uuid USING user_id::uuid;
ALTER TABLE IF EXISTS role_permissions   ALTER COLUMN role_id     TYPE uuid USING role_id::uuid;
ALTER TABLE IF EXISTS role_permissions   ALTER COLUMN permission_id TYPE uuid USING permission_id::uuid;

-- 5) Recreate foreign keys (with clean names)
ALTER TABLE user_roles
  ADD CONSTRAINT fk_user_roles_user
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_stores
  ADD CONSTRAINT fk_user_stores_user
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_stores
  ADD CONSTRAINT fk_user_stores_store
  FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE lead_times
  ADD CONSTRAINT fk_lead_times_product
  FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE lead_times
  ADD CONSTRAINT fk_lead_times_supplier
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

ALTER TABLE purchase_orders
  ADD CONSTRAINT fk_po_store
  FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE purchase_orders
  ADD CONSTRAINT fk_po_supplier
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

ALTER TABLE purchase_orders
  ADD CONSTRAINT fk_po_created_by
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE purchase_orders
  ADD CONSTRAINT fk_po_approved_by
  FOREIGN KEY (approved_by) REFERENCES users(id);

ALTER TABLE sales_transactions
  ADD CONSTRAINT fk_sales_product
  FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE sales_transactions
  ADD CONSTRAINT fk_sales_store
  FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE forecasts
  ADD CONSTRAINT fk_forecasts_store
  FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE forecasts
  ADD CONSTRAINT fk_forecasts_product
  FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE inventory
  ADD CONSTRAINT fk_inventory_store
  FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE inventory
  ADD CONSTRAINT fk_inventory_product
  FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE purchase_order_items
  ADD CONSTRAINT fk_po_items_po
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);

ALTER TABLE purchase_order_items
  ADD CONSTRAINT fk_po_items_product
  FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE webhook_events
  ADD CONSTRAINT fk_webhook_events_store
  FOREIGN KEY (store_id) REFERENCES stores(id);

ALTER TABLE audit_events
  ADD CONSTRAINT fk_audit_events_user
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE role_permissions
  ADD CONSTRAINT fk_role_permissions_role
  FOREIGN KEY (role_id) REFERENCES roles(id);

ALTER TABLE role_permissions
  ADD CONSTRAINT fk_role_permissions_permission
  FOREIGN KEY (permission_id) REFERENCES permissions(id);

-- 6) Set DB-side UUID defaults for new rows
ALTER TABLE users              ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE stores             ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE suppliers          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE products           ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE sales_transactions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE purchase_orders    ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE forecasts          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE inventory          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE purchase_order_items ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE webhook_events     ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_events       ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE roles              ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE permissions        ALTER COLUMN id SET DEFAULT gen_random_uuid();
