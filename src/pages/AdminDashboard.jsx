import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Store, LogOut, LayoutDashboard, Package, Languages } from 'lucide-react';
import InventoryDashboard from '../components/admin/InventoryDashboard';
import ProductManagement from '../components/admin/ProductManagement';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t, dir, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <html lang={language} dir={dir} />
        <title>{t.admin.title}</title>
        <meta name="description" content={t.admin.description} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir={dir}>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t.admin.brand}
                  </span>
                  <p className="text-xs text-gray-500">{t.admin.panelLabel}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <span className="text-sm text-gray-600">{t.admin.welcome} <span className="font-semibold">{user?.username}</span></span>
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
                  {t.admin.logout}
                </Button>
              </motion.div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                <TabsTrigger value="dashboard" className="text-base">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t.admin.tabs.dashboard}
                </TabsTrigger>
                <TabsTrigger value="products" className="text-base">
                  <Package className="w-4 h-4 mr-2" />
                  {t.admin.tabs.products}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <InventoryDashboard />
              </TabsContent>
              
              <TabsContent value="products">
                <ProductManagement />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;