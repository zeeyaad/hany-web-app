import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/use-toast';
import { Store, LogOut, Search, ShoppingCart, RotateCcw, Package, Languages } from 'lucide-react';

const StaffDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t, dir, language, setLanguage } = useLanguage();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const loadProducts = () => {
    const storedProducts = JSON.parse(localStorage.getItem('hanyshop_products') || '[]');
    setProducts(storedProducts);
    setFilteredProducts(storedProducts);
  };

  const handleSell = (productId) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId && p.quantity > 0) {
        const transactions = JSON.parse(localStorage.getItem('hanyshop_transactions') || '[]');
        transactions.push({
          id: Date.now(),
          productId: p.id,
          productName: p.name,
          type: 'sale',
          quantity: 1,
          price: p.sellingPrice,
          profit: p.sellingPrice - p.purchasePrice,
          date: new Date().toISOString(),
          staff: user.username
        });
        localStorage.setItem('hanyshop_transactions', JSON.stringify(transactions));
        
        toast({
          title: "Sale Completed",
          description: `Sold 1 unit of ${p.name}`,
        });
        
        return { ...p, quantity: p.quantity - 1 };
      }
      return p;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem('hanyshop_products', JSON.stringify(updatedProducts));
  };

  const handleRefund = (productId) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const transactions = JSON.parse(localStorage.getItem('hanyshop_transactions') || '[]');
        transactions.push({
          id: Date.now(),
          productId: p.id,
          productName: p.name,
          type: 'refund',
          quantity: 1,
          price: p.sellingPrice,
          profit: -(p.sellingPrice - p.purchasePrice),
          date: new Date().toISOString(),
          staff: user.username
        });
        localStorage.setItem('hanyshop_transactions', JSON.stringify(transactions));
        
        toast({
          title: "Refund Processed",
          description: `Refunded 1 unit of ${p.name}`,
        });
        
        return { ...p, quantity: p.quantity + 1 };
      }
      return p;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem('hanyshop_products', JSON.stringify(updatedProducts));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <html lang={language} dir={dir} />
        <title>{t.staff.title}</title>
        <meta name="description" content={t.staff.description} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50" dir={dir}>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {t.staff.brand}
                  </span>
                  <p className="text-xs text-gray-500">{t.staff.panelLabel}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <span className="text-sm text-gray-600">{t.staff.welcome} <span className="font-semibold">{user?.username}</span></span>
                <Button
                  variant="ghost"
                  onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                  className="text-sm"
                >
                  <Languages className="w-4 h-4 mr-2" />
                  {language.toUpperCase()}
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.staff.logout}
                </Button>
              </motion.div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Search className="w-6 h-6 mr-2 text-green-600" />
                  {t.staff.searchTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t.staff.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">{t.staff.noProducts}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-t-lg">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4 space-y-3">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">{t.staff.codeLabel}: {product.code}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">
                            ${product.sellingPrice.toFixed(2)}
                          </span>
                          <Badge variant={product.quantity > 10 ? "default" : product.quantity > 0 ? "secondary" : "destructive"}>
                            {t.staff.stockLabel}: {product.quantity}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button
                            onClick={() => handleSell(product.id)}
                            disabled={product.quantity === 0}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {t.staff.sellButton}
                          </Button>
                          <Button
                            onClick={() => handleRefund(product.id)}
                            variant="outline"
                            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all duration-200"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {t.staff.refundButton}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default StaffDashboard;