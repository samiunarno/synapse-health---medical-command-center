import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
}

export default function EcommerceSlider() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data.slice(0, 8)); // Get first 8 products
      }
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(products.length / 4));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(products.length / 4)) % Math.ceil(products.length / 4));
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (products.length === 0) return null;

  return (
    <div className="relative group/slider">
      <div className="flex items-center justify-between mb-8 px-12">
        <div>
          <h3 className="text-3xl font-medium tracking-tight mb-2">{t('medical_marketplace_slider')}</h3>
          <p className="text-sm text-black/60 dark:text-white/60 font-light">{t('medical_marketplace_desc_slider')}</p>
        </div>
        <Link 
          to="/ecommerce"
          className="group flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#0033A0] dark:text-[#3b82f6] hover:gap-4 transition-all"
        >
          {t('view_all_products')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative overflow-visible">
        <div className="overflow-hidden px-12 pb-12">
          <motion.div 
            animate={{ x: `-${currentIndex * 25}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-6"
          >
            {products.map((product) => (
              <Link 
                key={product._id}
                to="/ecommerce"
                className="w-[300px] shrink-0 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 p-6 group transition-all duration-300 hover:shadow-2xl hover:shadow-[#0033A0]/10 dark:hover:shadow-[#3b82f6]/10 hover:-translate-y-1 block"
              >
                <div className="aspect-square overflow-hidden mb-6 relative border border-black/10 dark:border-white/10 bg-[#F4F4F0] dark:bg-[#050505]">
                  <img 
                    src={product.image_url || `https://picsum.photos/seed/${product.name}/400/400`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="px-2 py-1 bg-[#0033A0] dark:bg-[#3b82f6] text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 shadow-lg">
                      <ShieldCheck className="w-3 h-3" /> {t('verified')}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#0033A0] dark:text-[#3b82f6] uppercase tracking-widest">
                      {t(`category_${product.category.toLowerCase()}`, { defaultValue: product.category })}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-[10px] font-mono text-black/60 dark:text-white/60">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white line-clamp-1 group-hover:text-[#0033A0] dark:group-hover:text-[#3b82f6] transition-colors">
                    {t(`product_${product.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '')}`, { defaultValue: product.name })}
                  </h3>
                  <div className="flex items-baseline justify-between border-t border-black/5 dark:border-white/5 pt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-medium text-black dark:text-white">¥{product.price}</span>
                      <span className="text-xs font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">CNY</span>
                    </div>
                    <ShoppingBag className="w-5 h-5 text-black/20 dark:text-white/20 group-hover:text-[#0033A0] dark:group-hover:text-[#3b82f6] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Navigation Controls */}
        <button 
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-[#0033A0] dark:hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl z-20 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-[#0033A0] dark:hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl z-20 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
