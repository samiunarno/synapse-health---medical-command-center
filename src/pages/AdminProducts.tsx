import React from 'react';
import ProductManagement from '../components/ProductManagement';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminProducts() {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">{t('ecommerce_management')}</h1>
          <p className="text-gray-500 font-medium">{t('ecommerce_management_desc')}</p>
        </div>
      </header>

      <ProductManagement />
    </motion.div>
  );
}
