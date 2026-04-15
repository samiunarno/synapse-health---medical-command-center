import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Clock, 
  Package,
  Phone,
  User,
  ChevronRight,
  Zap,
  Store
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

export default function RiderDashboard() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    const socket = io(window.location.origin);
    
    socket.on('new_medicine_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on('medicine_order_updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      if (activeOrder?._id === updated._id) {
        setActiveOrder(updated);
        if (updated.status === 'Delivered' || updated.status === 'Cancelled') {
          setActiveOrder(null);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/pharmacy/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        const active = data.find((o: any) => 
          o.rider_id?._id === user?.id && 
          ['Processing', 'Shipped'].includes(o.status)
        );
        setActiveOrder(active);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/pharmacy/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'Processing',
          rider_id: user?.id,
          rider_status: 'GoingToPharmacy'
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept order');
      }
      
      setActiveOrder(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateStatus = async (status: string, riderStatus: string) => {
    if (!activeOrder) return;
    try {
      const res = await fetch(`/api/pharmacy/orders/${activeOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, rider_status: riderStatus })
      });
      if (res.ok) {
        const data = await res.json();
        if (status === 'Delivered' || status === 'Cancelled') {
          setActiveOrder(null);
        } else {
          setActiveOrder(data);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('rider_dashboard')}</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">{t('medical_delivery_network')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border ${activeOrder ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
            {activeOrder ? t('delivery_in_progress') : t('ready_for_pickup')}
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3"
        >
          <Zap className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Delivery */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            {t('active_delivery')}
          </h2>
          
          <AnimatePresence mode="wait">
            {activeOrder ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 space-y-8 transition-colors duration-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('order_hash')}{activeOrder._id.slice(-6)}</h3>
                      <p className="text-blue-600 dark:text-blue-500 font-bold uppercase tracking-widest text-[10px]">{activeOrder.medicines.length} {t('items')} • ${activeOrder.total_price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {activeOrder.rider_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <Store className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      <div className="text-xs font-bold uppercase tracking-widest">{t('pickup_from')}</div>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium pl-8">{t('central_pharmacy_hub')}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                      <div className="text-xs font-bold uppercase tracking-widest">{t('deliver_to')}</div>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium pl-8">{activeOrder.delivery_address}</p>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-white/2 rounded-3xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold uppercase tracking-tight">{activeOrder.patient_id?.name || t('customer')}</p>
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <Phone className="w-3 h-3" /> {activeOrder.patient_id?.contact || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <button className="p-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-all">
                    <Phone className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex gap-4">
                  {activeOrder.rider_status === 'GoingToPharmacy' && (
                    <button 
                      onClick={() => updateStatus('Processing', 'AtPharmacy')}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
                    >
                      {t('arrived_at_pharmacy')}
                    </button>
                  )}
                  {activeOrder.rider_status === 'AtPharmacy' && (
                    <button 
                      onClick={() => updateStatus('Shipped', 'PickedUp')}
                      className="flex-1 py-5 bg-amber-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-all"
                    >
                      {t('items_picked_up')}
                    </button>
                  )}
                  {activeOrder.rider_status === 'PickedUp' && (
                    <button 
                      onClick={() => updateStatus('Shipped', 'Delivering')}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
                    >
                      {t('start_delivery')}
                    </button>
                  )}
                  {activeOrder.rider_status === 'Delivering' && (
                    <button 
                      onClick={() => updateStatus('Delivered', 'Arrived')}
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all"
                    >
                      {t('confirm_delivery')}
                    </button>
                  )}
                  <button 
                    onClick={() => updateStatus('Cancelled', 'Idle')}
                    className="px-8 py-5 bg-red-600/20 border border-red-500/30 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 dark:bg-white/2 border border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem] p-20 text-center space-y-4 transition-colors duration-500"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-600 mx-auto">
                  <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-tight">{t('no_active_delivery')}</h3>
                <p className="text-gray-400 dark:text-gray-600 text-xs font-bold uppercase tracking-widest">{t('waiting_for_orders')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Available Orders */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            {t('new_orders')}
          </h2>
          <div className="space-y-4">
            {orders.filter(o => o.status === 'Pending').length > 0 ? (
              orders.filter(o => o.status === 'Pending').map((order) => (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl space-y-4 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-500">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-tight text-sm">{t('order_hash')}{order._id.slice(-6)}</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className="text-blue-600 dark:text-blue-500 font-bold text-sm">${order.total_price}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin className="w-3 h-3" /> {order.delivery_address}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAccept(order._id)}
                    disabled={!!activeOrder}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    {t('accept_delivery')} <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-3xl transition-colors duration-500">
                <p className="text-gray-500 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest">{t('no_pending_orders')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
