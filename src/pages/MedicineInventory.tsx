import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Plus, Minus, AlertTriangle, RefreshCw, ShoppingCart, Calendar, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function MedicineInventory() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/medicine-inventory/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, delta: number) => {
    try {
      const res = await fetch(`/api/medicine-inventory/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ delta })
      });
      if (res.ok) {
        setInventory(prev => prev.map(item => 
          item._id === id ? { ...item, currentStock: Math.max(0, item.currentStock + delta) } : item
        ));
      }
    } catch (err) {
      console.error('Failed to update stock');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/medicine-inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setInventory(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete item');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">Medicine Inventory</h1>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Track your personal medicine stock & auto-refills</p>
        </div>
        <button className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 flex items-center gap-3">
          <Plus className="w-4 h-4" />
          Add Medicine
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest">No medicine in inventory</div>
        ) : (
          inventory.map((item) => {
            const isLowStock = item.currentStock <= item.minStockLevel;
            return (
              <motion.div
                key={item._id}
                layout
                className={`bg-white/5 border rounded-[2rem] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all duration-500 ${
                  isLowStock ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border ${
                    isLowStock ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-blue-600/20 text-blue-500 border-blue-500/20'
                  }`}>
                    <Pill className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{item.medicineName}</h3>
                      {isLowStock && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded-lg border border-red-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Low Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <RefreshCw className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.dosage} • {item.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Expires: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 lg:gap-12">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Stock</p>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => updateStock(item._id, -1)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`text-3xl font-display font-bold ${isLowStock ? 'text-red-500' : 'text-white'}`}>
                        {item.currentStock}
                      </span>
                      <button 
                        onClick={() => updateStock(item._id, 1)}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="h-12 w-px bg-white/10 hidden lg:block" />

                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Auto-Refill</p>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${item.autoRefill ? 'bg-blue-600' : 'bg-gray-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${item.autoRefill ? 'left-7' : 'left-1'}`} />
                      </div>
                      {item.autoRefill && isLowStock && (
                        <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Order Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="p-4 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/5">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteItem(item._id)}
                      className="p-4 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2.5rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center lg:text-left">
          <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Pharmacy Integration</h3>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest max-w-xl">
            Your inventory is synced with Synapse Pharmacy. Auto-refills are automatically processed and delivered when your stock reaches the minimum level.
          </p>
        </div>
        <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20">
          Sync with Pharmacy
        </button>
      </div>
    </div>
  );
}
