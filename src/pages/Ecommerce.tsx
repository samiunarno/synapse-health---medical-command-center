import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Filter, 
  ChevronRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  Clock,
  ArrowRight,
  Package,
  Heart,
  Grid,
  List,
  Loader2,
  Plus,
  Minus,
  X,
  CheckCircle2,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  manufacturer?: string;
  specifications?: Record<string, string>;
}

export default function Ecommerce() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const categories = ['All', 'Medicine', 'Equipment', 'Supplies', 'Diagnostics', 'Wellness'];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      if (category !== 'All') url += `?category=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('API returned non-array data:', data);
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item => 
          item.product._id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const res = await fetch('/api/pharmacy/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          medicines: cart.map(item => ({
            medicine_id: item.product._id,
            quantity: item.quantity
          })),
          total_price: cartTotal,
          delivery_address: user?.address || 'Default Address',
          service_type: 'Express'
        })
      });

      if (res.ok) {
        setCheckoutSuccess(true);
        setCart([]);
        setTimeout(() => {
          setCheckoutSuccess(false);
          setIsCartOpen(false);
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred during checkout');
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col transition-colors duration-500">
      {/* Top Navigation Bar - Alibaba Style */}
      <nav className="sticky top-0 z-[100] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter uppercase italic text-gray-900 dark:text-white">Synapse<span className="text-blue-500">Global</span></span>
          </div>

          <div className="flex-1 max-w-2xl relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder={t('search_placeholder_ecommerce')}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-blue-500 transition-colors">{t('sourcing')}</a>
              <a href="#" className="hover:text-blue-500 transition-colors">{t('membership')}</a>
              <a href="#" className="hover:text-blue-500 transition-colors">{t('help_center')}</a>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex max-w-[1600px] mx-auto w-full px-6 py-8 gap-8">
        {/* Sidebar Categories */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-8">
          <div className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-3xl p-6">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <List className="w-3 h-3" /> {t('categories')}
            </h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                    category === cat ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                  <ChevronRight className={`w-3 h-3 transition-transform ${category === cat ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t('trade_assurance')}</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {t('trade_assurance_desc')}
            </p>
            <button className="w-full py-2.5 bg-gray-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-white dark:text-white">
              {t('learn_more')}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Hero Banner */}
          <section className="relative h-64 rounded-[2.5rem] overflow-hidden group">
            <img 
              src="https://picsum.photos/seed/medical-sourcing/1200/400" 
              alt="Global Sourcing"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[8px] font-bold uppercase tracking-widest mb-4 w-fit">
                <Zap className="w-3 h-3" /> {t('flash_sourcing_event')}
              </div>
              <h2 className="text-4xl font-display font-black text-white mb-4 uppercase tracking-tighter">
                {t('direct_from')} <br />
                <span className="text-blue-500">{t('global_manufacturers')}</span>
              </h2>
              <p className="text-gray-300 text-xs font-bold uppercase tracking-widest max-w-md">
                {t('ecommerce_hero_desc')}
              </p>
            </div>
          </section>

          {/* Quick Filters & View Toggle */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{t('sort_by')}:</span>
              <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white outline-none">
                <option className="bg-white dark:bg-[#0a0a0a]">{t('best_match')}</option>
                <option className="bg-white dark:bg-[#0a0a0a]">{t('price_low_high')}</option>
                <option className="bg-white dark:bg-[#0a0a0a]">{t('newest_arrivals')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{t('synchronizing_catalog')}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-4"
            }>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden group hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-500 shadow-sm dark:shadow-none ${
                    viewMode === 'list' ? 'flex gap-6 p-6' : 'flex flex-col'
                  }`}
                >
                  <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-48 h-48 rounded-2xl' : 'aspect-square'}`}>
                    <img 
                      src={product.image_url || `https://picsum.photos/seed/${product.name}/400/400`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="px-2 py-1 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-widest rounded flex items-center gap-1 shadow-lg">
                        <ShieldCheck className="w-3 h-3" /> {t('verified')}
                      </div>
                      <div className="px-2 py-1 bg-amber-500 text-black text-[8px] font-bold uppercase tracking-widest rounded flex items-center gap-1 shadow-lg">
                        <Star className="w-3 h-3 fill-current" /> {t('top_rated')}
                      </div>
                    </div>
                    <button className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{product.category}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{product.manufacturer || 'Global Supplier'}</span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-black text-gray-900 dark:text-white">${product.price}</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">/ {t('unit')}</span>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3 h-3" /> {product.stock_quantity} {t('in_stock')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3 h-3" /> {t('global_shipping')}
                        </div>
                      </div>

                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-3"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('source_now')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/10 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('your_cart')}</h2>
                  <p className="text-gray-500 text-sm">{cart.length} {t('items_selected')}</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {checkoutSuccess ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('order_placed')}</h3>
                    <p className="text-gray-500">{t('order_placed_desc')}</p>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">{t('cart_empty')}</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5">
                        <img src={item.product.image_url || `https://picsum.photos/seed/${item.product.name}/100/100`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">{item.product.name}</h4>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-3">${item.product.price}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold w-4 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400"><Plus className="w-3 h-3" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.product._id)} className="text-xs text-red-500 font-bold hover:underline">{t('remove')}</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-gray-50 dark:bg-white/2 border-t border-gray-200 dark:border-white/10 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm">
                    <span>{t('subtotal')}</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm">
                    <span>{t('shipping')}</span>
                    <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-widest text-[10px]">{t('calculated_at_next_step')}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 dark:text-white font-bold text-xl pt-2 border-t border-gray-200 dark:border-white/5">
                    <span>{t('total')}</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || checkoutSuccess}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutSuccess ? t('processing_request') : t('proceed_to_checkout')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#050505]">
            {cart.length}
          </span>
        )}
      </motion.button>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t('added_to_cart')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Badges */}
      <section className="bg-gray-50 dark:bg-white/2 border-y border-gray-200 dark:border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">{t('global_logistics')}</h5>
              <p className="text-xs text-gray-500">{t('global_logistics_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">{t('quality_guaranteed')}</h5>
              <p className="text-xs text-gray-500">{t('quality_guaranteed_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">{t('support_24_7')}</h5>
              <p className="text-xs text-gray-500">{t('support_24_7_desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
