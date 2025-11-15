import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '../components/ui/sheet';
import { ScrollArea } from '../components/ui/scroll-area';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from '../components/ui/use-toast';

const ShoppingCart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount, cartSubtotal, isCartOpen, setIsCartOpen } = useCart();
  const { t, dir } = useLanguage();

  const handleCheckout = () => {
    toast({
      title: "🚧 Feature In Progress",
      description: "Checkout isn't implemented yet—but you can request it in your next prompt! 🚀",
    });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {cartCount > 0 && (
            <AnimatePresence>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
              >
                {cartCount}
              </motion.span>
            </AnimatePresence>
          )}
        </motion.button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg" side={dir === 'rtl' ? 'left' : 'right'}>
        <SheetHeader className={dir === 'rtl' ? 'pl-6' : 'pr-6'}>
          <SheetTitle className="text-2xl font-bold">{t.cart.title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <ShoppingCartIcon className="h-20 w-20 text-gray-300" />
              <p className="text-lg text-gray-500">{t.cart.empty}</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>{t.cart.continueShopping}</Button>
            </div>
          ) : (
            <ScrollArea className={`h-full ${dir === 'rtl' ? 'pl-6' : 'pr-6'}`}>
              <div className="flex flex-col gap-4 py-4">
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-500">${item.sellingPrice.toFixed(2)}</p>
                      <div className="mt-2 flex items-center">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="font-semibold">${(item.sellingPrice * item.quantity).toFixed(2)}</p>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        {cartItems.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between font-semibold">
                <span>{t.cart.subtotal}</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200" size="lg" onClick={handleCheckout}>
                {t.cart.checkout}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;