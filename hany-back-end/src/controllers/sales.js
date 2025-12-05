const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../services/db');
const authMiddleware = require('../middleware/auth');
const { isStaffOrAdmin } = require('../middleware/role');

const router = express.Router();
router.use(authMiddleware);
router.use(isStaffOrAdmin);

// GET sales
router.get('/', (req,res) => {
  const mine = req.query.mine === 'true';
  let sql = 'SELECT * FROM sales';
  const params = [];

  if (mine && req.user.role === 'staff') {
    sql += ' WHERE staff_id=?';
    params.push(req.user.id);
  }

  const sales = db.prepare(sql).all(...params);
  res.json(sales);
});

// POST sale
router.post('/', (req,res) => {
  const { product_id, quantity_sold } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.quantity < quantity_sold) return res.status(400).json({ message: 'Not enough stock' });

  const total_amount = product.selling_price * quantity_sold;
  const id = uuidv4();

  db.prepare('INSERT INTO sales(id,product_id,quantity_sold,total_amount,staff_id) VALUES(?,?,?,?,?)')
    .run(id,product_id,quantity_sold,total_amount,req.user.id);

  db.prepare('UPDATE products SET quantity=? WHERE id=?')
    .run(product.quantity - quantity_sold, product_id);

  res.json({ message: 'Sale recorded', sale_id: id });
});

module.exports = router;
