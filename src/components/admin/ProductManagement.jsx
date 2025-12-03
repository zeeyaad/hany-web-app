import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/labal';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const ProductManagement = () => {
  const { t, dir } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addImageFile, setAddImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    image: ''
  });
  const galleryImages = [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=400&h=300&fit=crop'
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      image: ''
    });
    setAddImageFile(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('hanyshop_token');
    const fd = new FormData();
    fd.append('item_code', formData.code);
    fd.append('name', formData.name);
    fd.append('purchase_price', String(parseFloat(formData.purchasePrice || '0')));
    fd.append('selling_price', String(parseFloat(formData.sellingPrice || '0')));
    fd.append('quantity', String(parseInt(formData.quantity || '0')));
    if (addImageFile) fd.append('image', addImageFile);
    try {
      const res = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Error creating product');
      }
      toast({ title: 'Product Added', description: `${formData.name} has been added successfully.` });
      await loadProducts();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to add product', variant: 'destructive' });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('hanyshop_token');
    const payload = {
      item_code: formData.code,
      name: formData.name,
      purchase_price: parseFloat(formData.purchasePrice || '0'),
      selling_price: parseFloat(formData.sellingPrice || '0'),
      quantity: parseInt(formData.quantity || '0')
    };
    // if user chose a new image file, upload it first to get a URL
    if (editImageFile) {
      try {
        const uploadFd = new FormData();
        uploadFd.append('image', editImageFile);
        const upRes = await fetch('http://localhost:4000/api/upload', { method: 'POST', body: uploadFd });
        const upData = await upRes.json();
        if (upRes.ok && upData?.url) payload.image_url = upData.url;
      } catch {}
    }
    try {
      const res = await fetch(`http://localhost:4000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Error updating product');
      }
      toast({ title: 'Product Updated', description: `${data.name || formData.name} has been updated successfully.` });
      await loadProducts();
      resetForm();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setEditImageFile(null);
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to update product', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    const token = localStorage.getItem('hanyshop_token');
    try {
      const res = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (res.status !== 204) {
        let msg = 'Error deleting product';
        try { const d = await res.json(); msg = d?.message || msg; } catch {}
        throw new Error(msg);
      }
      toast({ title: 'Product Deleted', description: 'Product has been removed from inventory.' });
      await loadProducts();
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to delete product', variant: 'destructive' });
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      code: product.item_code || product.code,
      name: product.name,
      purchasePrice: String(product.purchase_price ?? product.purchasePrice),
      sellingPrice: String(product.selling_price ?? product.sellingPrice),
      quantity: String(product.quantity),
      image: product.image_url || product.image
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.admin.productManagement.title}</h2>
          <p className="text-gray-600">{t.admin.productManagement.subtitle}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              {t.admin.productManagement.addProduct}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.admin.productManagement.addDialogTitle}</DialogTitle>
              <DialogDescription>
                {t.admin.productManagement.addDialogDesc}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t.admin.productManagement.itemCode}</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t.admin.productManagement.productName}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">{t.admin.productManagement.purchasePrice}</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">{t.admin.productManagement.sellingPrice}</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t.admin.productManagement.quantity}</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t.admin.productManagement.imageUrl}</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {galleryImages.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={async () => {
                        const r = await fetch(src);
                        const b = await r.blob();
                        const f = new File([b], `gallery-${Date.now()}.jpg`, { type: b.type || 'image/jpeg' });
                        setAddImageFile(f);
                      }}
                      className="border rounded overflow-hidden"
                    >
                      <img src={src} alt="" className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t.admin.productManagement.cancel}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  {t.admin.productManagement.add}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">{t.admin.productManagement.emptyTitle}</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              {t.admin.productManagement.emptyButton}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img 
                    src={
                      (() => {
                        const raw = product.image_url || product.image;
                        if (!raw) return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';
                        if (String(raw).startsWith('http')) return raw;
                        return `http://localhost:4000${raw}`;
                      })()
                    } 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{t.admin.productManagement.codeLabel}: {product.item_code || product.code}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.admin.productManagement.purchaseLabel}</span>
                      <span className="font-semibold">${Number(product.purchase_price ?? product.purchasePrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.admin.productManagement.sellingLabel}</span>
                      <span className="font-semibold text-green-600">${Number(product.selling_price ?? product.sellingPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.admin.productManagement.stockLabel}</span>
                      <Badge variant={product.quantity > 10 ? "default" : product.quantity > 0 ? "secondary" : "destructive"}>
                        {product.quantity} {t.admin.productManagement.unitsSuffix}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      onClick={() => openEditDialog(product)}
                      variant="outline"
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {t.admin.productManagement.edit}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t.admin.productManagement.delete}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.admin.productManagement.confirmTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.admin.productManagement.confirmDescPrefix} {product.name} {t.admin.productManagement.confirmDescSuffix}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.admin.productManagement.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t.admin.productManagement.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.admin.productManagement.updateDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.admin.productManagement.updateDialogDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Item Code</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-purchasePrice">Purchase Price ($)</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sellingPrice">Selling Price ($)</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.productManagement.imageUrl}</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {galleryImages.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={async () => {
                      const r = await fetch(src);
                      const b = await r.blob();
                      const f = new File([b], `gallery-${Date.now()}.jpg`, { type: b.type || 'image/jpeg' });
                      setEditImageFile(f);
                    }}
                    className="border rounded overflow-hidden"
                  >
                    <img src={src} alt="" className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                {t.admin.productManagement.update}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;