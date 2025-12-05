const express = require('express');
const db = require('../services/db');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

const router = express.Router();
router.use(authMiddleware, isAdmin);

router.get('/', (req,res) => {
  const logs = db.prepare('SELECT * FROM admin_logs ORDER BY created_at DESC').all();
  res.json(logs);
});

module.exports = router;
