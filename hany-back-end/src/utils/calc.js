const db = require('../services/db');

module.exports = {
  calculateProfit: () => {
    const sales = db.prepare('SELECT s.quantity_sold, s.total_amount, p.purchase_price FROM sales s JOIN products p ON s.product_id=p.id').all();
    let profit = 0;
    sales.forEach(sale => {
      profit += sale.total_amount - (sale.purchase_price * sale.quantity_sold);
    });
    return profit;
  },
  getInventoryValue: () => {
    const products = db.prepare('SELECT quantity, purchase_price FROM products').all();
    return products.reduce((acc,p) => acc + p.quantity * p.purchase_price, 0);
  }
};
