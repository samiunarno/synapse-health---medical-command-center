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
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '../../lib/i18n-utils';

export default function PharmacyDashboard() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const res = await fetch('/api/analytics/pharmacy-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDashboardData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const balance = dashboardData?.pharmacy?.commissionBalance || 0;
    if (balance <= 0) return;
    
    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/commissions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: balance })
      });
      
      if (res.ok) {
        fetchPharmacyData();
        alert(t('withdrawal_success'));
      }
    } catch (err) {
      console.error('Withdrawal failed:', err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const pharmacy = dashboardData?.pharmacy;
  const stats = dashboardData?.stats;
  const orders = dashboardData?.recentOrders || [];
  const lowStockItems = dashboardData?.lowStockItems || [];

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
            <Store className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{user?.fullName || t('pharmacy_hub')}</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">{t('certified_medical_vendor')}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-3">
            <Search className="w-4 h-4" /> {t('inventory')}
          </button>
          <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all flex items-center gap-3">
            <Plus className="w-4 h-4" /> {t('add_product')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            {t('active_orders')}
          </h2>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[3rem] overflow-hidden transition-colors duration-500">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('order_id')}</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('items')}</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('status')}</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('rider')}</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/2 transition-colors">
                    <td className="px-8 py-6 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">#{order._id.slice(-6)}</td>
                    <td className="px-8 py-6 text-xs text-gray-500 dark:text-gray-400">{order.medicines.length} {t('items')}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                      }`}>
                        {t(order.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{order.rider_id?.fullName || t('assigning')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-900 dark:text-white">¥{order.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="w-full py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all bg-gray-100/50 dark:bg-white/2">
              {t('view_all_orders')}
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            {t('inventory_alerts')}
          </h2>
          <div className="space-y-4">
            {lowStockItems.map((item: any) => (
              <div key={item._id} className="p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                <div>
                  <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-tight text-sm">{translateDynamic(t, item.brand_name)}</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{translateDynamic(t, item.generic_name)}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-600 dark:text-amber-500 font-bold text-lg">{item.stock_quantity}</p>
                  <p className="text-gray-500 dark:text-gray-600 text-[8px] font-bold uppercase tracking-widest">{t('units_left')}</p>
                </div>
              </div>
            ))}
              <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white space-y-4">
                <div className="flex justify-between items-start">
                  <TrendingUp className="w-10 h-10" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t('commission_balance')}</p>
                    <p className="text-2xl font-display font-bold">¥{pharmacy?.commissionBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">{t('sales_performance')}</h3>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest leading-relaxed">{t('total_sales')}: ¥{pharmacy?.totalSales?.toFixed(2) || '0.00'}</p>
                <button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !pharmacy?.commissionBalance || pharmacy.commissionBalance <= 0}
                  className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                  {isWithdrawing ? t('processing') : t('withdraw_funds')}
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
