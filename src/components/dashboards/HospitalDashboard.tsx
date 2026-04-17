import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  Bed, 
  Activity, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  Heart,
  DollarSign,
  Loader2,
  Clock,
  Battery,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function HospitalDashboard() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'financial'>('overview');

  useEffect(() => {
    fetchHospitalStats();
    fetchCommissions();
    const interval = setInterval(fetchHospitalStats, 30000); // Live refresh every 30s
    return () => clearInterval(interval);
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

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#050505]"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div></div>;

  const stats = dashboardData?.stats;

  // Mock Data for charts if API doesn't provide
  const revenueData = [
    { time: '08:00', value: 1200 }, { time: '10:00', value: 2400 },
    { time: '12:00', value: 3800 }, { time: '14:00', value: 2900 },
    { time: '16:00', value: 4500 }, { time: '18:00', value: 5200 },
    { time: '20:00', value: 6100 }
  ];

  const attendanceData = [
    { dept: 'Cardiology', present: 45, absent: 2 },
    { dept: 'Neurology', present: 32, absent: 1 },
    { dept: 'ER', present: 68, absent: 0 },
    { dept: 'Pediatrics', present: 28, absent: 3 }
  ];

  const cards = [
    { label: t('total_patients'), value: stats?.totalPatients || 1245, icon: Users, color: 'blue', trend: '+12%', sub: t('hd_vs_last_week') },
    { label: t('active_doctors'), value: stats?.totalStaff || 184, icon: Stethoscope, color: 'purple', trend: '+5%', sub: t('hd_98_attendance') },
    { label: t('bed_occupancy'), value: '84%', icon: Bed, color: 'emerald', trend: '-2%', sub: `${t('hd_available')} 42` },
    { label: t('hd_today_revenue'), value: `¥${commissions?.totalSales?.toLocaleString() || '142,500'}`, icon: TrendingUp, color: 'amber', trend: '+18%', sub: `${t('hd_target')} 120k` }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter mb-2">
              {user?.fullName || t('hd_central_erp')}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-2 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> {t('hd_system_online')}</span>
              <span className="text-gray-500 border-l border-gray-700 pl-4">ID: {user?.id?.slice(-8).toUpperCase() || 'SYS-99'}</span>
              <span className="text-gray-500 border-l border-gray-700 pl-4">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-4 bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <ClipboardList className="w-4 h-4" /> {t('hd_reports')}
          </button>
          <button className="flex-1 md:flex-none px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-bold uppercase tracking-widest text-white transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {t('hd_add_staff')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: t('hd_live_overview'), icon: Activity },
          { id: 'staff', label: t('hd_staff_attendance'), icon: Users },
          { id: 'financial', label: t('hd_revenue_billing'), icon: DollarSign }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-8">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, i) => (
                <div key={card.label} className="p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-colors">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-500/10 rounded-full blur-[40px] group-hover:bg-${card.color}-500/20 transition-colors`} />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`w-12 h-12 bg-${card.color}-500/20 rounded-2xl flex items-center justify-center text-${card.color}-400 border border-${card.color}-500/30`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${card.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {card.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {card.trend}
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-1">{card.value}</h3>
                    <p className="text-gray-500 text-xs">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Graphs & Alerts area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Telemetry Chart */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Live Patient Influx</h3>
                    <p className="text-xs text-gray-500 font-mono">Real-time OPD Registrations vs Time</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
                    <Activity className="w-4 h-4 animate-pulse" /> Live
                  </div>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#4b5563" tick={{fontSize: 10}} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#4b5563" tick={{fontSize: 10}} tickMargin={10} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Critical Alerts Pipeline */}
              <div className="bg-red-950/20 border border-red-500/20 rounded-3xl p-6 md:p-8 flex flex-col">
                 <div className="flex items-center gap-3 mb-8">
                   <AlertTriangle className="w-6 h-6 text-red-500" />
                   <h3 className="text-xl font-bold text-white">System Alerts</h3>
                   <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
                 </div>
                 <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                   {[
                     { type: 'CRITICAL', msg: 'Oxygen Supply Low in ICU (Ward B)', time: 'Just now', color: 'red' },
                     { type: 'WARNING', msg: 'ER Capacity exceeding 90%. Divert ambulances.', time: '12 mins ago', color: 'orange' },
                     { type: 'INFO', msg: 'Dr. Zhang (Surgery) marked as Absent.', time: '1 hr ago', color: 'blue' }
                   ].map((alert, i) => (
                     <div key={i} className={`p-4 rounded-2xl border ${alert.color === 'red' ? 'bg-red-500/10 border-red-500/30' : alert.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                       <div className="flex justify-between items-center mb-2">
                         <span className={`text-[9px] font-black uppercase tracking-widest ${alert.color === 'red' ? 'text-red-400' : alert.color === 'orange' ? 'text-orange-400' : 'text-blue-400'}`}>{alert.type}</span>
                         <span className="text-[9px] text-gray-500">{alert.time}</span>
                       </div>
                       <p className="text-sm font-medium text-gray-200 leading-snug">{alert.msg}</p>
                     </div>
                   ))}
                 </div>
                 <button className="uppercase text-[10px] tracking-widest text-gray-500 hover:text-white font-bold mt-6 text-center w-full transition-colors">
                   View All Logs &rarr;
                 </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <motion.div key="staff" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               
               {/* Attendance Chart */}
               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                 <h3 className="text-xl font-bold text-white mb-6">Department Attendance (Today)</h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="dept" stroke="#6b7280" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                        <YAxis stroke="#6b7280" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                        <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                        <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               {/* Shift Roster */}
               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-white">Active Shift Roster</h3>
                   <span className="text-xs bg-white/10 px-3 py-1 rounded-lg text-gray-400 font-mono">Shift: 08:00 - 16:00</span>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {[
                      { name: 'Dr. Sarah Chen', role: 'Head of Surgery', dept: 'Surgery', status: 'In OR', time: 'Since 09:30' },
                      { name: 'Dr. Michael Wang', role: 'Attending ER', dept: 'ER', status: 'Active', time: 'Since 08:00' },
                      { name: 'Nurse Li Wei', role: 'ICU Charge Nurse', dept: 'ICU', status: 'On Break', time: '15 mins left' },
                      { name: 'Dr. James Smith', role: 'Neurologist', dept: 'Neurology', status: 'Active', time: 'Since 08:00' },
                    ].map((staff, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                         <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold border border-white/10">
                           {staff.name.charAt(4)}
                         </div>
                         <div className="flex-1">
                           <h4 className="text-sm font-bold text-white">{staff.name}</h4>
                           <p className="text-[10px] text-gray-400 uppercase tracking-widest">{staff.role} &bull; {staff.dept}</p>
                         </div>
                         <div className="text-right">
                           <span className={`text-xs font-bold px-2 py-1 rounded-lg ${staff.status === 'Active' ? 'bg-green-500/20 text-green-400' : staff.status === 'In OR' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                             {staff.status}
                           </span>
                           <p className="text-[9px] text-gray-500 mt-1">{staff.time}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>

             </div>
          </motion.div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === 'financial' && (
          <motion.div key="financial" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Master Wallet Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.15)] flex flex-col justify-between min-h-[300px]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                 <div className="relative z-10 flex justify-between items-start">
                   <div>
                     <p className="text-indigo-200/60 font-bold uppercase tracking-widest text-xs mb-2">Available Synapse Commission</p>
                     <h2 className="text-5xl font-black text-white">¥{commissions?.commissionBalance?.toFixed(2) || '0.00'}</h2>
                   </div>
                   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                     <DollarSign className="w-6 h-6 text-white" />
                   </div>
                 </div>
                 
                 <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="text-[10px] text-indigo-200/50 uppercase tracking-widest mb-1">Total Network Sales</p>
                      <p className="text-xl font-bold text-white">¥{commissions?.totalSales?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-200/50 uppercase tracking-widest mb-1">Pending Clearance</p>
                      <p className="text-xl font-bold text-white">¥4,250.00</p>
                    </div>
                 </div>

                 <button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !commissions?.commissionBalance || commissions.commissionBalance <= 0}
                  className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative z-10"
                 >
                  {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw to Corporate Account'}
                 </button>
              </div>

              {/* Transactions Log */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col min-h-[300px]">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-white">Recent Payouts</h3>
                   <button className="text-xs text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase">Export CSV</button>
                 </div>
                 <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 opacity-50">
                   <Clock className="w-12 h-12 text-gray-500 mb-2" />
                   <p className="text-sm font-medium text-gray-400">No recent withdrawal history.</p>
                   <p className="text-xs text-gray-600 max-w-[200px]">Withdrawals will appear here once funds are transferred to the bank.</p>
                 </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
