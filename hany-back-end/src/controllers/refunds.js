const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../services/db');
const authMiddleware = require('../middleware/auth');
const { isStaffOrAdmin } = require('../middleware/role');

const router = express.Router();
router.use(authMiddleware);
router.use(isStaffOrAdmin);

// GET refunds
router.get('/', (req,res) => {
  const mine = req.query.mine === 'true';
  let sql = 'SELECT * FROM refunds';
  const params = [];

  if (mine && req.user.role === 'staff') {
    sql += ' WHERE staff_id=?';
    params.push(req.user.id);
  }

  const refunds = db.prepare(sql).all(...params);
  res.json(refunds);
});

// POST refund
router.post('/', (req,res) => {
  const { product_id, quantity_refunded } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const id = uuidv4();
  db.prepare('INSERT INTO refunds(id,product_id,quantity_refunded,staff_id) VALUES(?,?,?,?)')
    .run(id,product_id,quantity_refunded,req.user.id);

  db.prepare('UPDATE products SET quantity=? WHERE id=?')
    .run(product.quantity + quantity_refunded, product_id);

  res.json({ message: 'Refund processed', refund_id: id });
});

module.exports = router;
