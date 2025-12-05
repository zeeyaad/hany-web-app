PRAGMA foreign_keys = ON;

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','staff')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  purchase_price REAL NOT NULL DEFAULT 0,
  selling_price REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- sales
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  quantity_sold INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  staff_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(staff_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- refunds
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  quantity_refunded INTEGER NOT NULL,
  staff_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(staff_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- admin action logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  meta TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- seed: create one admin profile
INSERT OR IGNORE INTO profiles(id, name, role) VALUES ('admin-uid-1','Hany','admin');
