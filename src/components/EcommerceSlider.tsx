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
    <section className="py-24 sm:py-32 lg:py-48 px-4 sm:px-6 relative overflow-hidden bg-[#050505]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-6">
              <ShoppingBag className="w-3 h-3" />
              {t('synapse_marketplace')}
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-tighter leading-none">
              {t('global')} <br />
              <span className="text-blue-500">{t('medical_sourcing')}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={prev}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={next}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Link 
              to="/ecommerce"
              className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 group"
            >
              {t('view_all_products')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <motion.div 
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-6"
          >
            {products.map((product) => (
              <div 
                key={product._id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 bg-white/2 border border-white/5 rounded-[2.5rem] p-6 group hover:bg-white/5 transition-all duration-500"
              >
                <div className="aspect-square rounded-3xl overflow-hidden mb-6 relative">
                  <img 
                    src={product.image_url || `https://picsum.photos/seed/${product.name}/400/400`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="px-2 py-1 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t('verified')}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-2 h-2 text-amber-500 fill-current" />
                      <span className="text-[8px] font-bold text-gray-500">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-black text-white">${product.price}</span>
                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">/ {t('unit')}</span>
                  </div>
                  <Link 
                    to="/ecommerce"
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {t('source_now')}
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
