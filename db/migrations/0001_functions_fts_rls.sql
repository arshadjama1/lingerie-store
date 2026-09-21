-- ══════════════════════════════════════════════════════════════════════
-- 0001_functions_fts_rls.sql
--
-- Hand-written migration for everything drizzle-kit can't generate:
--   1. Extensions
--   2. Inventory reservation / release / confirm functions
--   3. Order number sequence + generator
--   4. Full-text search column, indexes, and auto-update trigger
--   5. Product rating aggregate trigger
--   6. Row-Level Security policies
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. EXTENSIONS ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 2. INVENTORY FUNCTIONS ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reserve_inventory(
  p_variant_id TEXT, p_quantity INT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE inventory
  SET    reserved_quantity = reserved_quantity + p_quantity
  WHERE  variant_id = p_variant_id
    AND  (quantity - reserved_quantity) >= p_quantity;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock'
      USING HINT = p_variant_id, ERRCODE = 'P0001';
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION release_inventory(
  p_variant_id TEXT, p_quantity INT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE inventory
  SET    reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
  WHERE  variant_id = p_variant_id;
END; $$;

CREATE OR REPLACE FUNCTION confirm_inventory(
  p_variant_id TEXT, p_quantity INT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE inventory
  SET    quantity          = quantity - p_quantity,
         reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
  WHERE  variant_id = p_variant_id
    AND  quantity   >= p_quantity;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'inventory_confirmation_failed' USING HINT = p_variant_id;
  END IF;
END; $$;

-- ── 3. ORDER NUMBER SEQUENCE ──────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'ORD-' || EXTRACT(YEAR FROM NOW())::TEXT || '-'
      || LPAD(nextval('order_sequence')::TEXT, 6, '0');
END; $$;

-- ── 4. FULL-TEXT SEARCH ───────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE products SET search_vector = to_tsvector('english',
  COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' ||
  COALESCE(array_to_string(tags, ' '), ''));

CREATE INDEX IF NOT EXISTS products_search_gin_idx
  ON products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS products_name_trgm_idx
  ON products USING GIN (name gin_trgm_ops);

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), ''));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS products_search_trigger ON products;
CREATE TRIGGER products_search_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ── 5. RATING AGGREGATE TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products
  SET    rating_avg   = COALESCE(sub.avg_rating, 0),
         rating_count = COALESCE(sub.cnt, 0)
  FROM (
    SELECT AVG(rating)::DECIMAL(3,2) AS avg_rating, COUNT(*) AS cnt
    FROM   reviews
    WHERE  product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND  is_approved = true
  ) sub
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS reviews_rating_trigger ON reviews;
CREATE TRIGGER reviews_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ── 6. ROW-LEVEL SECURITY ─────────────────────────────────────────────

-- Helper function to check admin/staff role without triggering RLS recursion on profiles
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$;

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles FOR ALL USING (is_admin_or_staff());

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own addresses" ON addresses;
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are public when active" ON categories;
CREATE POLICY "Categories are public when active" ON categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (is_admin_or_staff());

-- Brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Brands are public when active" ON brands;
CREATE POLICY "Brands are public when active" ON brands FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage brands" ON brands;
CREATE POLICY "Admins manage brands" ON brands FOR ALL USING (is_admin_or_staff());

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are public when active" ON products;
CREATE POLICY "Products are public when active" ON products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products FOR ALL USING (is_admin_or_staff());

-- Product Variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Variants are public when active" ON product_variants;
CREATE POLICY "Variants are public when active" ON product_variants FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage variants" ON product_variants;
CREATE POLICY "Admins manage variants" ON product_variants FOR ALL USING (is_admin_or_staff());

-- Product Images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Images are public" ON product_images;
CREATE POLICY "Images are public" ON product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage images" ON product_images;
CREATE POLICY "Admins manage images" ON product_images FOR ALL USING (is_admin_or_staff());

-- Inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage inventory" ON inventory;
CREATE POLICY "Admins manage inventory" ON inventory FOR ALL USING (is_admin_or_staff());

-- Carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own cart" ON carts;
CREATE POLICY "Users manage own cart" ON carts FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Cart Items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own cart items" ON cart_items;
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL USING (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR c.session_id IS NOT NULL)));

-- Checkout Sessions
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own checkout sessions" ON checkout_sessions;
CREATE POLICY "Users manage own checkout sessions" ON checkout_sessions FOR ALL USING (auth.uid() = user_id);

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own payments" ON payments;
CREATE POLICY "Users see own payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
DROP POLICY IF EXISTS "Service role manages payments" ON payments;
CREATE POLICY "Service role manages payments" ON payments FOR ALL USING (auth.role() = 'service_role');

-- Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coupons are public when active" ON coupons;
CREATE POLICY "Coupons are public when active" ON coupons FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage coupons" ON coupons;
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (is_admin_or_staff());

-- Coupon Usage
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own coupon usages" ON coupon_usage;
CREATE POLICY "Users see own coupon usages" ON coupon_usage FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role manages coupon usage" ON coupon_usage;
CREATE POLICY "Service role manages coupon usage" ON coupon_usage FOR ALL USING (auth.role() = 'service_role');

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Approved reviews are public" ON reviews;
CREATE POLICY "Approved reviews are public" ON reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Users manage own reviews" ON reviews;
CREATE POLICY "Users manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

-- Wishlist Items
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist_items;
CREATE POLICY "Users manage own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- Return Requests
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own returns" ON return_requests;
CREATE POLICY "Users see own returns" ON return_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create returns" ON return_requests;
CREATE POLICY "Users create returns" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage returns" ON return_requests;
CREATE POLICY "Admins manage returns" ON return_requests FOR ALL USING (is_admin_or_staff());

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own orders" ON orders;
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role manages orders" ON orders;
CREATE POLICY "Service role manages orders" ON orders FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admins see all orders" ON orders;
CREATE POLICY "Admins see all orders" ON orders FOR SELECT USING (is_admin_or_staff());
-- Admins need explicit UPDATE and INSERT for the session-scoped Drizzle client (non-service-role)
DROP POLICY IF EXISTS "Admins update orders" ON orders;
CREATE POLICY "Admins update orders" ON orders FOR UPDATE USING (is_admin_or_staff());
DROP POLICY IF EXISTS "Admins insert orders" ON orders;
CREATE POLICY "Admins insert orders" ON orders FOR INSERT WITH CHECK (is_admin_or_staff());

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own order items" ON order_items;
CREATE POLICY "Users see own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
DROP POLICY IF EXISTS "Service role manages order items" ON order_items;
CREATE POLICY "Service role manages order items" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- Order Status History
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own order history" ON order_status_history;
CREATE POLICY "Users see own order history" ON order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage order history" ON order_status_history;
CREATE POLICY "Admins manage order history" ON order_status_history FOR ALL USING (is_admin_or_staff());

-- ── 7. PRIVILEGES ────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

