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
    <section className="py-24 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] overflow-hidden transition-colors duration-300">
      <div className="px-12 mb-12 flex justify-between items-end">
        <h2 className="text-2xl font-medium tracking-tight">{t('trusted_by_leaders')}</h2>
        <span className="font-mono text-xs uppercase tracking-widest text-black/40 dark:text-white/40">{t('network_partners')}</span>
      </div>
      <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 dark:opacity-40 dark:hover:opacity-100 transition-all duration-500">
        <div className="relative overflow-hidden">
          <motion.div 
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-6 px-12"
          >
            {products.map((product) => (
              <div 
                key={product._id}
                className="w-[300px] shrink-0 bg-[#F4F4F0] dark:bg-[#050505] border border-black/10 dark:border-white/10 p-6 group transition-colors duration-300"
              >
                <div className="aspect-square overflow-hidden mb-6 relative border border-black/10 dark:border-white/10">
                  <img 
                    src={product.image_url || `https://picsum.photos/seed/${product.name}/400/400`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="px-2 py-1 bg-[#0033A0] dark:bg-[#3b82f6] text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t('verified')}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#0033A0] dark:text-[#3b82f6] uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-black dark:text-white fill-current" />
                      <span className="text-[10px] font-mono text-black/60 dark:text-white/60">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white line-clamp-1 group-hover:text-[#0033A0] dark:group-hover:text-[#3b82f6] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-medium text-black dark:text-white">${product.price}</span>
                    <span className="text-[10px] font-mono text-black/60 dark:text-white/60 uppercase tracking-widest">/ {t('unit')}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
