import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Store, ShoppingCart, LogIn, Package, Search, Phone, Mail, MapPin, Twitter, Facebook, Instagram, Languages } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import ShoppingCartComponent from '../components/ShoppingCart';
import { toast } from '../components/ui/use-toast';

const PublicShop = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language, setLanguage, t, dir } = useLanguage();

  const productsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const handleScroll = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category || t.products.uncategorized);
    const uniqueCategories = ['all', ...Array.from(new Set(allCategories))];
    return uniqueCategories.map(cat => ({
      value: cat,
      label: cat === 'all' ? t.products.allCategories : cat
    }));
  }, [products, t]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('hanyshop_products') || '[]');
    const productsWithDetails = storedProducts.map((p, i) => ({
        ...p,
        category: p.category || (i % 3 === 0 ? 'Living Room' : i % 3 === 1 ? 'Bedroom' : 'Kitchen'),
        createdAt: p.createdAt || new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
    }));
    setProducts(productsWithDetails);
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (category !== 'all') {
        filtered = filtered.filter(p => (p.category || t.products.uncategorized) === category);
    }
    
    switch (sortOption) {
        case 'price-asc':
            filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    return filtered;
  }, [products, searchTerm, category, sortOption, t]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };
  
  const getStockBadge = (quantity) => {
      if (quantity === 0) return <Badge variant="destructive">{t.products.stockOut}</Badge>;
      if (quantity <= 10) return <Badge variant="secondary">{t.products.stockLow}</Badge>;
      return <Badge>{t.products.stockIn}</Badge>;
  }

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Feature In Progress",
      description: "Contact form isn't implemented yet—but you can request it in your next prompt! 🚀",
    });
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <>
      <Helmet>
        <html lang={language} dir={dir} />
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 text-gray-800" dir={dir}>
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <motion.div 
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Hany's Shop
                  </span>
                </motion.div>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">{t.header.home}</Link>
                <button onClick={() => handleScroll(aboutRef)} className="text-gray-600 hover:text-blue-600 transition-colors">{t.header.about}</button>
                <button onClick={() => handleScroll(contactRef)} className="text-gray-600 hover:text-blue-600 transition-colors">{t.header.contact}</button>
                <button onClick={() => handleScroll(productsRef)} className="text-gray-600 hover:text-blue-600 transition-colors">{t.header.explore}</button>
              </nav>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={toggleLanguage}>
                    <Languages className="h-5 w-5" />
                 </Button>
                 <ShoppingCartComponent />
                 <Button onClick={() => navigate('/login')} className="hidden sm:flex">
                    <LogIn className={dir === 'rtl' ? 'ml-2' : 'mr-2'} /> {t.header.login}
                 </Button>
              </div>
            </div>
          </div>
        </header>

        <main>
            <section className="relative bg-gradient-to-b from-blue-50 via-white to-white py-20 md:py-32">
                 <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
                    >
                        {t.hero.title}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 max-w-2xl mx-auto text-lg text-gray-600"
                    >
                        {t.hero.subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-8 flex justify-center"
                    >
                        <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-base" onClick={() => handleScroll(productsRef)}>
                            {t.hero.button}
                        </Button>
                    </motion.div>
                 </div>
            </section>
          
            <div ref={productsRef} className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-16">
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative md:col-span-1">
                  <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400`} />
                  <Input
                    placeholder={t.products.searchPlaceholder}
                    className={`h-11 ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
                  <Select value={category} onValueChange={setCategory} dir={dir}>
                      <SelectTrigger className="h-11">
                          <SelectValue placeholder={t.products.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                          {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label.charAt(0).toUpperCase() + cat.label.slice(1)}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Select value={sortOption} onValueChange={setSortOption} dir={dir}>
                      <SelectTrigger className="h-11">
                          <SelectValue placeholder={t.products.sortBy} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="newest">{t.products.sortNewest}</SelectItem>
                          <SelectItem value="price-asc">{t.products.sortPriceAsc}</SelectItem>
                          <SelectItem value="price-desc">{t.products.sortPriceDesc}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>

              <AnimatePresence>
                  {filteredAndSortedProducts.length === 0 ? (
                      <motion.div
                      key="no-products"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-20 text-center"
                      >
                      <Package className="h-16 w-16 text-gray-400" />
                      <h2 className="mt-4 text-2xl font-semibold text-gray-700">{t.products.noProductsTitle}</h2>
                      <p className="mt-2 text-gray-500">{t.products.noProductsSubtitle}</p>
                      </motion.div>
                  ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredAndSortedProducts.map((product, index) => (
                          <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: (index % 12) * 0.05 }}
                          className="group"
                          >
                          <Card className="h-full flex flex-col transform overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                              <div className="relative overflow-hidden">
                                  <img alt={product.name} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110" src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" />
                                  <div className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}>
                                      {getStockBadge(product.quantity)}
                                  </div>
                              </div>
                              <CardContent className="flex flex-1 flex-col p-4">
                              <h3 className="flex-grow font-semibold text-lg text-gray-800 line-clamp-2">
                                  {product.name}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">Code: {product.code}</p>
                              <div className="mt-4 flex items-end justify-between">
                                  <span className="text-2xl font-bold text-blue-600">
                                  ${product.sellingPrice.toFixed(2)}
                                  </span>
                              </div>
                              </CardContent>
                              <CardFooter className="p-4 pt-0">
                                  <Button className="w-full" onClick={() => handleAddToCart(product)} disabled={product.quantity === 0}>
                                      <ShoppingCart className={dir === 'rtl' ? 'ml-2' : 'mr-2' } />
                                      {product.quantity > 0 ? t.products.addToCart : t.products.stockOut}
                                  </Button>
                              </CardFooter>
                          </Card>
                          </motion.div>
                      ))}
                      </div>
                  )}
              </AnimatePresence>
            </div>

            <section ref={aboutRef} className="py-16 sm:py-24 bg-white scroll-mt-16">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className={dir === 'rtl' ? 'md:order-2' : ''}>
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t.about.title}</h2>
                    <p className="mt-4 text-lg text-gray-600">{t.about.p1}</p>
                    <p className="mt-4 text-lg text-gray-600">{t.about.p2}</p>
                  </div>
                  <div className={`rounded-lg overflow-hidden ${dir === 'rtl' ? 'md:order-1' : ''}`}>
                    <img alt="Cozy living room with modern furniture" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1631679706909-1844bbd07221" />
                  </div>
                </div>
              </div>
            </section>

            <section ref={contactRef} className="py-16 sm:py-24 bg-gray-50 scroll-mt-16">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t.contact.title}</h2>
                  <p className="mt-4 text-lg text-gray-600">{t.contact.subtitle}</p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-lg shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900">{t.contact.formTitle}</h3>
                    <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                      <Input type="text" placeholder={t.contact.namePlaceholder} required />
                      <Input type="email" placeholder={t.contact.emailPlaceholder} required />
                      <textarea placeholder={t.contact.messagePlaceholder} rows="4" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required></textarea>
                      <Button type="submit" className="w-full">{t.contact.button}</Button>
                    </form>
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900">{t.contact.infoTitle}</h3>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-blue-600" />
                        <span className="text-gray-600">support@hanysshop.com</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-blue-600" />
                        <span className="text-gray-600">(123) 456-7890</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        <span className="text-gray-600">123 Home Goods Lane, Decor City, 45678</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </main>

        <footer className="bg-gray-900 text-white">
          <div className="max-w-screen-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Hany's Shop</span>
                </div>
                <p className="mt-4 text-sm text-gray-400">{t.footer.tagline}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase">{t.footer.shop}</h3>
                <ul className="mt-4 space-y-2">
                  <li><button onClick={() => handleScroll(productsRef)} className="text-sm text-gray-400 hover:text-white">{t.footer.collections}</button></li>
                  <li><button onClick={() => handleScroll(aboutRef)} className="text-sm text-gray-400 hover:text-white">{t.footer.about}</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase">{t.footer.support}</h3>
                <ul className="mt-4 space-y-2">
                  <li><button onClick={() => handleScroll(contactRef)} className="text-sm text-gray-400 hover:text-white">{t.footer.contact}</button></li>
                  <li><span className="text-sm text-gray-400">{t.footer.faqs}</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase">{t.footer.follow}</h3>
                <div className="flex mt-4 space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
                  <a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>
                  <a href="#" className="text-gray-400 hover:text-white"><Instagram /></a>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} {t.footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicShop;