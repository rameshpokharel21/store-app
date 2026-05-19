-- Categories
INSERT INTO categories (id, name, description, created_at) VALUES
  (gen_random_uuid(), 'Beverages', 'Drinks and liquid refreshments', NOW()),
  (gen_random_uuid(), 'Snacks',    'Packaged snack foods',           NOW()),
  (gen_random_uuid(), 'Dairy',     'Milk, cheese, yogurt products',  NOW());

-- Suppliers
INSERT INTO suppliers (id, name, contact_info, address, created_at) VALUES
  (gen_random_uuid(), 'Metro Wholesale',     'metro@example.com',  '123 Main St, Kathmandu', NOW()),
  (gen_random_uuid(), 'Valley Distributors', 'valley@example.com', '45 Ring Rd, Pokhara',    NOW());

-- Products (category_id resolved by name so no hard-coded UUIDs)
INSERT INTO products (id, name, category_id, barcode, unit, reorder_level, current_quantity, avg_cost_price, selling_price, created_at)
SELECT gen_random_uuid(), 'Mineral Water 1L',   c.id, 'BEV-001', 'pcs',    50, 0,  25.00,  40.00, NOW() FROM categories c WHERE c.name = 'Beverages'
UNION ALL
SELECT gen_random_uuid(), 'Orange Juice 500ml', c.id, 'BEV-002', 'pcs',    30, 0,  60.00,  95.00, NOW() FROM categories c WHERE c.name = 'Beverages'
UNION ALL
SELECT gen_random_uuid(), 'Potato Chips 100g',  c.id, 'SNK-001', 'pcs',    40, 0,  35.00,  60.00, NOW() FROM categories c WHERE c.name = 'Snacks'
UNION ALL
SELECT gen_random_uuid(), 'Chocolate Bar 50g',  c.id, 'SNK-002', 'pcs',    25, 0,  45.00,  75.00, NOW() FROM categories c WHERE c.name = 'Snacks'
UNION ALL
SELECT gen_random_uuid(), 'Full Cream Milk 1L', c.id, 'DAI-001', 'liters', 20, 0,  80.00, 120.00, NOW() FROM categories c WHERE c.name = 'Dairy'
UNION ALL
SELECT gen_random_uuid(), 'Cheddar Cheese 200g',c.id, 'DAI-002', 'pcs',    15, 0, 150.00, 220.00, NOW() FROM categories c WHERE c.name = 'Dairy';
