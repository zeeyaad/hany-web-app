import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Package, TrendingUp, RotateCcw, DollarSign } from 'lucide-react';

const InventoryDashboard = () => {
  const { t, dir } = useLanguage();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalSold: 0,
    totalRefunds: 0,
    totalProfit: 0
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const products = JSON.parse(localStorage.getItem('hanyshop_products') || '[]');
    const transactions = JSON.parse(localStorage.getItem('hanyshop_transactions') || '[]');

    const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
    const sales = transactions.filter(t => t.type === 'sale');
    const refunds = transactions.filter(t => t.type === 'refund');
    const totalSold = sales.length;
    const totalRefunds = refunds.length;
    const totalProfit = transactions.reduce((sum, t) => sum + t.profit, 0);

    setStats({
      totalItems,
      totalSold,
      totalRefunds,
      totalProfit
    });
  };

  const statCards = [
    {
      title: t.admin.inventory.stats.totalItems,
      value: stats.totalItems,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: t.admin.inventory.stats.totalSold,
      value: stats.totalSold,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: t.admin.inventory.stats.totalRefunds,
      value: stats.totalRefunds,
      icon: RotateCcw,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: t.admin.inventory.stats.totalProfit,
      value: `${stats.totalProfit.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.admin.inventory.overviewTitle}</h2>
        <p className="text-gray-600">{t.admin.inventory.overviewSubtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader className={`${stat.bgColor} pb-4`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InventoryDashboard;