const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../services/db');
const upload = require('../services/image');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Public routes
router.get('/', (req, res) => {
  const { q, available } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (q) {
    sql += ' AND (name LIKE ? OR item_code LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (available === 'true') sql += ' AND quantity>0';

  const products = db.prepare(sql).all(...params);
  res.json(products);
});

router.get('/:id', (req,res) => {
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Protected routes (admin only)
router.use(authMiddleware, isAdmin);

router.post('/', upload.single('image'), (req,res) => {
  const { item_code, name, purchase_price, selling_price, quantity } = req.body;
  const id = uuidv4();
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    db.prepare(`INSERT INTO products(id,item_code,name,purchase_price,selling_price,quantity,image_url)
                VALUES(?,?,?,?,?,?,?)`).run(id,item_code,name,purchase_price,selling_price,quantity,image_url);
    res.json({ message: 'Product created', id });
  } catch(err) {
    res.status(400).json({ message: 'Error creating product', error: err.message });
  }
});

// simple per-admin rate limiter for write operations
const writeLimiter = (() => {
  const buckets = new Map();
  const windowMs = 60 * 1000;
  const max = 30;
  return (req, res, next) => {
    const key = req.user?.id || 'anon';
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.reset) {
      b = { count: 0, reset: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) return res.status(429).json({ message: 'Too many requests' });
    next();
  };
})();

router.put('/:id', writeLimiter, upload.single('image'), (req,res) => {
  const { item_code, name, purchase_price, selling_price, quantity, image_url: imageUrlFromJson } = req.body;
  const id = req.params.id;
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // validation
  const errors = [];
  const nm = typeof name === 'string' ? name.trim() : product.name;
  if (!nm) errors.push('name is required');
  const ic = typeof item_code === 'string' ? item_code.trim() : product.item_code;
  if (!ic) errors.push('item_code is required');
  const pp = purchase_price !== undefined ? Number(purchase_price) : product.purchase_price;
  const sp = selling_price !== undefined ? Number(selling_price) : product.selling_price;
  const qt = quantity !== undefined ? Number(quantity) : product.quantity;
  if (!Number.isFinite(pp) || pp < 0) errors.push('purchase_price must be a non-negative number');
  if (!Number.isFinite(sp) || sp < 0) errors.push('selling_price must be a non-negative number');
  if (!Number.isInteger(qt) || qt < 0) errors.push('quantity must be a non-negative integer');
  if (errors.length) return res.status(400).json({ message: 'Validation failed', errors });

  const effectiveImageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : (typeof imageUrlFromJson === 'string' ? imageUrlFromJson : product.image_url);

  try {
    db.prepare(`UPDATE products SET item_code=?, name=?, purchase_price=?, selling_price=?, quantity=?, image_url=?
                WHERE id=?`).run(ic, nm, pp, sp, qt, effectiveImageUrl, id);
    const updated = db.prepare('SELECT * FROM products WHERE id=?').get(id);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ message: 'Error updating product', error: err.message });
  }
});

router.delete('/:id', writeLimiter, (req,res) => {
  const id = req.params.id;
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // cleanup image file if stored locally
  if (product.image_url && product.image_url.startsWith('/uploads/')) {
    const filePath = path.resolve(`.${product.image_url}`);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
  }

  try {
    db.prepare('DELETE FROM products WHERE id=?').run(id);
    // audit log
    try {
      db.prepare('INSERT INTO admin_logs(admin_id,action,meta) VALUES(?,?,?)')
        .run(req.user.id, 'product_deleted', JSON.stringify({ id, name: product.name, item_code: product.item_code }));
    } catch (_) {}
    return res.status(204).end();
  } catch (err) {
    return res.status(400).json({ message: 'Error deleting product', error: err.message });
  }
});

module.exports = router;
