import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Zap,
  MessageSquare,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '../lib/i18n-utils';
import GlobalNavbar from '../components/GlobalNavbar';

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
  const navigate = useNavigate();
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

  const categories = [
    { value: 'All', label: t('all_categories') },
    { value: 'Medicine', label: t('medicine_category') },
    { value: 'Equipment', label: t('equipment_category') },
    { value: 'Supplies', label: t('supplies_category') },
    { value: 'Diagnostics', label: t('diagnostics_category') },
    { value: 'Wellness', label: t('wellness_category') }
  ];

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
    if (!user) {
      navigate('/login');
      return;
    }
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
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#0a0a0a] text-[#111111] dark:text-[#F4F4F0] flex flex-col transition-colors duration-300">
      <GlobalNavbar />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 pt-32 lg:pt-40 pb-20 border-x border-black/10 dark:border-white/10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Categories */}
          <aside className="w-full lg:w-80 space-y-12">
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Filter className="w-4 h-4" /> {t('catalog_filter')}
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`w-full text-left px-6 py-4 rounded-sm text-lg font-medium transition-all flex items-center justify-between group ${
                      category === cat.value 
                        ? 'bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111]' 
                        : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                    <ChevronRight className={`w-4 h-4 transition-transform ${category === cat.value ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] p-10 rounded-sm">
              <ShieldCheck className="w-12 h-12 mb-8" strokeWidth={1} />
              <h4 className="text-2xl font-medium tracking-tight mb-4">{t('trade_assurance')}</h4>
              <p className="text-sm font-light opacity-60 leading-relaxed mb-8">
                {t('trade_assurance_desc')}
              </p>
              <button className="w-full py-4 border border-white/20 dark:border-black/20 text-xs font-mono uppercase tracking-widest hover:bg-white/10 dark:hover:bg-black/10 transition-all">
                {t('learn_more')}
              </button>
            </div>
          </aside>

          {/* Catalog Area */}
          <div className="flex-1 space-y-12">
            {/* Search and Stats */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-black/20 dark:text-white/20 group-focus-within:text-[#0033A0] transition-colors" />
                <input 
                  type="text"
                  placeholder={t('search_catalog')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-sm py-5 pl-16 pr-6 text-xl outline-none focus:border-[#0033A0] dark:focus:border-[#3b82f6] transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-sm border ${viewMode === 'grid' ? 'bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] border-transparent' : 'border-black/10 dark:border-white/10 text-black/40 dark:text-white/40'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-sm border ${viewMode === 'list' ? 'bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] border-transparent' : 'border-black/10 dark:border-white/10 text-black/40 dark:text-white/40'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <Loader2 className="w-16 h-16 text-[#0033A0] animate-spin" strokeWidth={1} />
                <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-40">{t('synchronizing_clinical_catalog')}</span>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"}>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    whileHover={{ y: -10 }}
                    className={`bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 p-6 group transition-all duration-500 hover:shadow-2xl hover:shadow-[#0033A0]/10 ${
                      viewMode === 'list' ? 'flex flex-row items-center gap-8' : 'flex flex-col'
                    }`}
                  >
                    <div className={`relative overflow-hidden mb-8 bg-[#F4F4F0] dark:bg-[#050505] border border-black/5 dark:border-white/5 ${viewMode === 'list' ? 'w-48 h-48 mb-0' : 'aspect-square'}`}>
                      <img 
                        src={product.image_url || `https://picsum.photos/seed/${product.name}/600/600`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-[#0033A0] dark:bg-[#3b82f6] text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 shadow-xl">
                          <ShieldCheck className="w-4 h-4" /> {t('verified')}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[10px] font-mono text-[#0033A0] dark:text-[#3b82f6] uppercase tracking-widest">{translateDynamic(t, product.category)}</span>
                          <span className="w-1 h-1 bg-black/10 dark:border-white/10 rounded-full" />
                          <span className="text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">{product.manufacturer}</span>
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight line-clamp-2">{translateDynamic(t, product.name)}</h3>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-black/5 dark:border-white/5 pt-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-medium">¥{product.price}</span>
                          <span className="text-xs font-mono uppercase tracking-widest opacity-40">CNY</span>
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-14 h-14 bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] flex items-center justify-center hover:bg-[#0033A0] dark:hover:bg-[#3b82f6] dark:hover:text-white transition-all shadow-xl group/btn"
                        >
                          <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Slider */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#F4F4F0] dark:bg-[#0a0a0a] border-l border-black/10 dark:border-white/10 z-[120] flex flex-col p-12"
            >
              <div className="flex items-center justify-between mb-16">
                <div>
                  <h2 className="text-4xl font-medium tracking-tight mb-2">{t('your_cart')}</h2>
                  <p className="text-sm font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">{cart.length} {t('clinical_items')}</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-8 opacity-20">
                    <ShoppingBag className="w-32 h-32" strokeWidth={0.5} />
                    <span className="font-mono text-xs uppercase tracking-[0.5em]">{t('cart_is_empty')}</span>
                  </div>
                ) : checkoutSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/20 p-8 text-center rounded-sm">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-medium mb-4">{t('order_successful')}</h3>
                    <p className="text-sm opacity-60 leading-relaxed mb-8">{t('thank_you_order')}</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product._id} className="flex gap-8 group">
                      <div className="w-24 h-24 bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-2 shrink-0">
                        <img src={item.product.image_url || `https://picsum.photos/seed/${item.product.name}/200/200`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-medium tracking-tight leading-tight">{item.product.name}</h4>
                          <button onClick={() => removeFromCart(item.product._id)} className="text-black/20 dark:text-white/20 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-black/10 dark:border-white/10">
                            <button onClick={() => updateQuantity(item.product._id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 h-8 flex items-center justify-center font-mono text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="text-xl font-medium tracking-tight">¥{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-16 pt-16 border-t border-black/10 dark:border-white/10 space-y-12">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] opacity-40">{t('total_amount')}</span>
                  <span className="text-6xl font-medium tracking-tighter leading-none">¥{cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || checkoutSuccess}
                  className="w-full py-8 bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] text-xl font-medium tracking-tight uppercase hover:bg-[#0033A0] dark:hover:bg-[#3b82f6] dark:hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-6 group"
                >
                  {t('confirm_clinical_sourcing')} <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Tooltip */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-12 right-12 z-[100] w-20 h-20 bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] flex items-center justify-center shadow-2xl shadow-blue-500/20 group"
      >
        <ShoppingCart className="w-8 h-8" />
        {cart.length > 0 && (
          <span className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-4 border-[#F4F4F0] dark:border-[#0a0a0a]">
            {cart.length}
          </span>
        )}
      </motion.button>
    </div>
  );
}
