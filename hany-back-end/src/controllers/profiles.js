const express = require('express');
const db = require('../services/db');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

const router = express.Router();
router.use(authMiddleware, isAdmin);

// GET staff profiles
router.get('/', (req,res) => {
  const profiles = db.prepare('SELECT * FROM profiles WHERE role="staff"').all();
  res.json(profiles);
});

// Update profile
router.put('/:id', (req,res) => {
  const { name, role } = req.body;
  const profile = db.prepare('SELECT * FROM profiles WHERE id=?').get(req.params.id);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  db.prepare('UPDATE profiles SET name=?, role=? WHERE id=?').run(name, role, req.params.id);
  res.json({ message: 'Profile updated' });
});

module.exports = router;
