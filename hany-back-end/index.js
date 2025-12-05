require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/controllers/auth');
const productRoutes = require('./src/controllers/products');
const salesRoutes = require('./src/controllers/sales');
const refundsRoutes = require('./src/controllers/refunds');
const profilesRoutes = require('./src/controllers/profiles');
const adminLogsRoutes = require('./src/controllers/admin_log');
const uploadRoute = require('./src/routes/upload');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}
// serve static uploaded images
app.use('/uploads', express.static(path.resolve('./uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/refunds', refundsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/admin-logs', adminLogsRoutes);
app.use('/api/upload', uploadRoute);
// Docs
app.get('/api/docs', (req,res) => {
  res.sendFile(path.resolve('./swagger.json'));
});

app.listen(PORT, () => {
  console.log(`Hany's Shop backend running on http://localhost:${PORT}`);
});
