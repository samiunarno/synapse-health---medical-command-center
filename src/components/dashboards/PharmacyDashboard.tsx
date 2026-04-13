import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  Truck
} from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function PharmacyDashboard() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        fetch('/api/pharmacy/orders/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/pharmacy/medicines', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (inventoryRes.ok) setInventory(await inventoryRes.json());
    } catch (err) {
      console.error('Failed to fetch pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
            <Store className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">{user?.fullName || 'Pharmacy Hub'}</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Certified Medical Supply Vendor</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center gap-3">
            <Search className="w-4 h-4" /> Inventory
          </button>
          <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all flex items-center gap-3">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            Active Orders
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Order ID</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Items</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Rider</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-8 py-6 text-xs font-bold text-white uppercase tracking-tight">#{order._id.slice(-6)}</td>
                    <td className="px-8 py-6 text-xs text-gray-400">{order.medicines.length} Items</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-400">{order.rider_id?.fullName || 'Assigning...'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-white">${order.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="w-full py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all bg-white/2">
              View All Orders
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Inventory Alerts
          </h2>
          <div className="space-y-4">
            {inventory.filter(m => m.stock_quantity < 20).map((item) => (
              <div key={item._id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group hover:bg-white/10 transition-all">
                <div>
                  <h4 className="text-white font-bold uppercase tracking-tight text-sm">{item.brand_name}</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{item.generic_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-500 font-bold text-lg">{item.stock_quantity}</p>
                  <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">Units Left</p>
                </div>
              </div>
            ))}
            <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white space-y-4">
              <TrendingUp className="w-10 h-10" />
              <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">Sales Performance</h3>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest leading-relaxed">Your sales are up 24% this week. Keep up the great work!</p>
              <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
