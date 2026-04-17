import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Users, 
  Bed, 
  Activity, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Heart,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';

export default function HospitalDashboard() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchHospitalStats();
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const res = await fetch('/api/commissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCommissions(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch commissions:', err);
    }
  };

  const handleWithdraw = async () => {
    if (!commissions?.commissionBalance || commissions.commissionBalance <= 0) return;
    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/commissions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: commissions.commissionBalance })
      });
      if (res.ok) {
        fetchCommissions();
        alert(t('withdrawal_success'));
      }
    } catch (err) {
      console.error('Withdrawal failed:', err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const fetchHospitalStats = async () => {
    try {
      const res = await fetch('/api/analytics/hospital-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDashboardData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch hospital stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const stats = dashboardData?.stats;
  const hospital = dashboardData?.hospital;

  const cards = [
    { label: t('total_patients'), value: stats?.totalPatients || 0, icon: Users, color: 'blue', trend: '+12%' },
    { label: t('active_doctors'), value: stats?.totalStaff || 0, icon: Stethoscope, color: 'purple', trend: '+5%' },
    { label: t('bed_occupancy'), value: '84%', icon: Bed, color: 'emerald', trend: '-2%' },
    { label: t('revenue'), value: `¥${stats?.totalRevenue?.toLocaleString() || '0'}`, icon: TrendingUp, color: 'blue', trend: '+18%' }
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{user?.fullName || t('hospital_center')}</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">{t('enterprise_healthcare_mgmt')}</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
          <Plus className="w-4 h-4" /> {t('add_department')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden group transition-colors duration-500"
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-${card.color}-500/10 dark:bg-${card.color}-600/20 rounded-2xl flex items-center justify-center text-${card.color}-600 dark:text-${card.color}-500 mb-6 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tighter">{card.value}</h3>
                </div>
                <div className={`text-[10px] font-bold ${card.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'} flex items-center gap-1`}>
                  {card.trend} <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[3rem] p-10 space-y-8 transition-colors duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">{t('dept_performance')}</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-6">
            {['Cardiology', 'Neurology', 'Pediatrics', 'Oncology'].map((dept, i) => (
              <div key={dept} className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-900 dark:text-white">{t(dept.toLowerCase())}</span>
                  <span className="text-gray-500">{85 - i * 10}% {t('efficiency')}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${85 - i * 10}%` }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white space-y-6 shadow-2xl shadow-blue-500/20">
            <div className="flex justify-between items-start">
              <DollarSign className="w-12 h-12" />
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t('commission_balance')}</p>
                <p className="text-3xl font-display font-bold">¥{commissions?.commissionBalance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('total_platform_sales')}</p>
              <p className="text-xl font-display font-bold">¥{commissions?.totalSales?.toFixed(2) || '0.00'}</p>
            </div>
            <button 
              onClick={handleWithdraw}
              disabled={isWithdrawing || !commissions?.commissionBalance || commissions.commissionBalance <= 0}
              className="w-full py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : t('withdraw_funds')}
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[3rem] p-10 space-y-8 transition-colors duration-500">
            <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">{t('system_alerts')}</h3>
            <div className="space-y-4">
            {[
              { type: t('critical'), msg: t('oxygen_low_ward_b'), time: t('minutes_ago', { count: 2 }), color: 'red' },
              { type: t('warning'), msg: t('staff_shortage_icu'), time: t('minutes_ago', { count: 15 }), color: 'amber' },
              { type: t('info'), msg: t('new_equipment_delivered'), time: t('hours_ago', { count: 1 }), color: 'blue' }
            ].map((alert, i) => (
              <div key={i} className="p-4 bg-white dark:bg-white/2 rounded-2xl border border-gray-200 dark:border-white/5 flex items-start gap-4 shadow-sm dark:shadow-none">
                <div className={`w-2 h-2 rounded-full mt-1.5 bg-${alert.color}-500`} />
                <div>
                  <p className="text-gray-900 dark:text-white text-xs font-bold uppercase tracking-tight">{alert.msg}</p>
                  <p className="text-gray-500 dark:text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all">
            {t('view_all_logs')}
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
