import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  manufacturer: string;
  specifications: Record<string, string>;
}

export default function ProductManagement() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    stock_quantity: 0,
    manufacturer: '',
    specifications: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('API returned non-array data:', data);
          setProducts([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        manufacturer: product.manufacturer,
        specifications: product.specifications ? Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join(', ') : ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        stock_quantity: 0,
        manufacturer: '',
        specifications: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const specs: Record<string, string> = {};
    formData.specifications.split(',').forEach(s => {
      const [key, val] = s.split(':').map(x => x.trim());
      if (key && val) specs[key] = val;
    });

    const payload = {
      ...formData,
      specifications: specs
    };

    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchProducts();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('delete_product_confirm'))) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">{t('product_inventory')}</h2>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">{t('manage_medical_supplies')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder={t('search_products_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold tracking-widest text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('add_product')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/2 border border-white/5 rounded-3xl p-6 group hover:bg-white/5 transition-all duration-500"
            >
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img 
                    src={product.image_url || 'https://picsum.photos/seed/medical/200/200'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 mb-2 inline-block">
                        {product.category}
                      </span>
                      <h4 className="text-lg font-display font-bold text-white truncate">{product.name}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 bg-white/5 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-white/5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{t('price')}</span>
                      <span className="text-xl font-display font-bold text-white">${product.price}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{t('stock')}</span>
                      <span className={`text-sm font-bold ${product.stock_quantity < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {product.stock_quantity} {t('units')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">
                    {editingProduct ? t('edit_product') : t('add_new_product')}
                  </h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">{t('system_entry_protocol')}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> {t('product_name')}
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. Digital Stethoscope"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-3 h-3" /> {t('category')}
                    </label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">{t('select_category')}</option>
                      <option value="Diagnostics">{t('category_diagnostics')}</option>
                      <option value="Surgical">{t('category_surgical')}</option>
                      <option value="Monitoring">{t('category_monitoring')}</option>
                      <option value="Emergency">{t('category_emergency')}</option>
                      <option value="Personal Care">{t('category_personal_care')}</option>
                      <option value="Supplies">{t('category_supplies')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> {t('description')}
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder={t('enter_product_details')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> {t('price_label')}
                    </label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" /> {t('stock_quantity')}
                    </label>
                    <input 
                      required
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> {t('image_url')}
                  </label>
                  <input 
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> {t('manufacturer')}
                    </label>
                    <input 
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. MedTech Global"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {t('specifications_label')}
                    </label>
                    <input 
                      type="text"
                      value={formData.specifications}
                      onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. Wireless, Rechargeable, 4K Display"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-white text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-3"
                  >
                    <Save className="w-4 h-4" />
                    {editingProduct ? t('update_product') : t('initialize_product')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
