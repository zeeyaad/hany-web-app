const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../services/db');

const router = express.Router();

// create users table if not exists
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
)`).run();

// register
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) return res.status(400).json({ message: 'Missing fields' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!pwdRegex.test(password)) return res.status(400).json({ message: 'Weak password. Min 8 chars, include upper, lower, number, special.' });

  if (!['admin','staff'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

  const id = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  try {
    db.prepare('INSERT INTO users(id,email,password_hash) VALUES(?,?,?)').run(id,email.toLowerCase(),hash);
    db.prepare('INSERT INTO profiles(id,name,role) VALUES(?,?,?)').run(id,name,role);

    if (role === 'admin') {
      db.prepare('INSERT INTO admin_logs(admin_id,action,meta) VALUES(?,?,?)')
        .run(id,'admin_registered', JSON.stringify({ email, name }));
    }

    res.json({ message: 'Registered successfully', user: { id, name, role, email } });
  } catch(err) {
    res.status(400).json({ message: 'User exists' });
  }
});

// login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const profile = db.prepare('SELECT id,name,role FROM profiles WHERE id=?').get(user.id);
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY || '7d' });

  res.json({ token, user: { ...profile, email } });
});

module.exports = router;
