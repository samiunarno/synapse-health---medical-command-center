import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Bed, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Zap,
  Shield,
  Package,
  FileText,
  Layers,
  Cpu,
  Terminal,
  Wifi,
  Database,
  Lock,
  Brain,
  Globe,
  Radio,
  Server,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WardBedStats from '../WardBedStats';

export default function AdminDashboard({ 
  stats, 
  trends, 
  pendingUsers, 
  pendingVerifications,
  activityStream,
  onApprove,
  onVerify 
}: any) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const filteredPendingUsers = pendingUsers?.filter((user: any) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!pendingUsers || !Array.isArray(pendingUsers)) return;
    const headers = ['ID', 'Username', 'Role', 'Status', 'Created At'];
    const csvData = pendingUsers.map((u: any) => [
      u._id,
      u.username,
      u.role,
      u.status,
      new Date(u.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pending_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieData = [
    { name: t('occupied'), value: stats?.occupiedBeds || 0 },
    { name: t('available'), value: (stats?.totalBeds || 0) - (stats?.occupiedBeds || 0) }
  ];

  const iconMap: any = {
    Zap,
    AlertCircle,
    CheckCircle2,
    FileText,
    Users,
    Bed,
    Calendar,
    Shield,
    ShoppingCart
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative space-y-16 pb-24"
    >
      {/* Header - Mission Control Style */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-gray-200 dark:border-white/5 pb-12 transition-colors duration-500"
      >
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-500 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] mb-6 border border-blue-500/20">
            <Cpu className="w-3 h-3" />
            {t('system_core')} v4.2.0
          </div>
          <h1 className="text-3xl sm:text-6xl lg:text-8xl font-display font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase leading-none break-words">
            {t('mission_control_line1')} <br />
            <span className="text-transparent stroke-text">{t('mission_control_line2')}</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t('all_systems_operational')} • 0.1s {t('latency')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-8 py-4 rounded-2xl font-mono text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-4 backdrop-blur-xl">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            {new Date().toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} • {new Date().toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-GB', { hour: '2-digit', minute: '2-digit' })} {t('utc')}
          </div>
          <button 
            onClick={handleExport}
            className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-black/10 dark:shadow-white/5 flex items-center gap-3"
          >
            {t('export_telemetry')}
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid - Hardware Style */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
      >
        <StatCard 
          title={t('total_patients')} 
          value={stats?.totalPatients || 0} 
          icon={Users} 
          trend="+12.5%" 
          trendUp={true}
          color="blue"
          variants={itemVariants}
        />
        <StatCard 
          title={t('active_doctors')} 
          value={stats?.totalDoctors || 0} 
          icon={Stethoscope} 
          trend="+2" 
          trendUp={true}
          color="purple"
          variants={itemVariants}
        />
        <StatCard 
          title={t('bed_occupancy')} 
          value={`${stats?.bedOccupancy || 0}%`} 
          icon={Bed} 
          trend="-3.2%" 
          trendUp={false}
          color="orange"
          variants={itemVariants}
        />
        <StatCard 
          title={t('total_revenue')} 
          value={`¥${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={DollarSign} 
          trend={t('optimal')} 
          trendUp={true}
          color="green"
          variants={itemVariants}
        />
        <StatCard 
          title={t('platform_commissions')} 
          value={`¥${(stats?.totalCommissionBalance || 0).toLocaleString()}`} 
          icon={DollarSign} 
          trend="+24.2%" 
          trendUp={true}
          color="amber"
          variants={itemVariants}
        />
        <StatCard 
          title={t('platform_sales')} 
          value={`¥${(stats?.totalPlatformSales || 0).toLocaleString()}`} 
          icon={ShoppingCart} 
          trend="+32.1%" 
          trendUp={true}
          color="rose"
          variants={itemVariants}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Chart - Immersive Dark */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
            <div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">{t('inpatient_trends')}</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">{t('telemetry_stream')} • {t('30_day_window')}</p>
            </div>
          </div>
          <div className="h-[300px] lg:h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-[rgba(255,255,255,0.03)]" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 800, fontFamily: 'Space Grotesk'}} 
                  dy={20} 
                  tickFormatter={(val) => t(val.toLowerCase())}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 800, fontFamily: 'Space Grotesk'}} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(0,0,0,0.05)', 
                    boxShadow: '0 40px 60px -15px rgba(0,0,0,0.1)',
                    padding: '20px 24px',
                    backdropFilter: 'blur(20px)'
                  }}
                  itemStyle={{color: '#3b82f6', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Space Grotesk'}}
                  labelStyle={{fontWeight: 'bold', color: '#111827', marginBottom: '8px', fontSize: '14px', fontFamily: 'Syne'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
        </motion.div>

        {/* Bed Distribution - Hardware Style */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 flex flex-col relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('bed_status')}</h3>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 border border-gray-200 dark:border-white/10 group-hover:text-blue-500 transition-colors">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="h-[250px] lg:h-[300px] relative mb-12 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={12}
                  dataKey="value"
                  animationDuration={2000}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="none"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-6xl font-display font-black text-gray-900 dark:text-white leading-none mb-2 tracking-tighter">{stats?.occupiedBeds || 0}</p>
              <p className="text-[8px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('occupied')}</p>
            </div>
          </div>
          <div className="space-y-4 mt-auto relative z-10">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-500 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i], boxShadow: `0 0 10px ${COLORS[i]}`}} />
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t(item.name.toLowerCase())}</span>
                </div>
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>
      </div>

      {/* Ward Bed Status Visualization */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('ward_bed_distribution')}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">{t('real_time_status_by_ward')}</p>
          </div>
        </div>
        <WardBedStats />
      </motion.div>

      {/* User Management Quick Access */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 gap-8 mb-12"
      >
        <Link to="/users" className="bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/20 p-10 rounded-[3rem] flex items-center justify-between group hover:bg-indigo-600/20 dark:hover:bg-indigo-600/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('user_management')}</h3>
              <p className="text-indigo-600/70 dark:text-indigo-200/70 text-xs font-bold uppercase tracking-widest">{t('user_management_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-indigo-500 group-hover:translate-x-2 transition-transform" />
        </Link>
      </motion.div>

      {/* System Monitor & Logs Section */}
      <div className="grid grid-cols-1 gap-12">
        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('activity_stream')}</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">{t('real_time_event_processing')}</p>
            </div>
            <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          
          <div className="space-y-4 relative z-10">
            {activityStream?.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 group/item shadow-sm dark:shadow-none">
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors`}>
                    {React.createElement(iconMap[activity.icon] || Zap, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{activity.user}</p>
                    <p className="text-[10px] font-medium text-gray-500">
                      {activity.action === 'New user registration' ? t('new_user_registration') :
                       activity.action.startsWith('Requested ambulance') ? t('requested_ambulance', { address: activity.action.split('at ')[1] }) :
                       activity.action.startsWith('Placed medicine order') ? t('placed_medicine_order', { price: activity.action.split('¥')[1] || activity.action.split('$')[1] }) :
                       activity.action}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-700 uppercase">{activity.time}</span>
              </div>
            ))}
          </div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-yellow-600/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>
      </div>

      {/* Verification Queue - AI Reports */}
      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden relative group transition-colors duration-500"
      >
        <div className="p-6 lg:p-12 border-b border-gray-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">{t('verification_queue')}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">{t('ai_powered_analysis')} • {t('professional_credentials')}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('ai_agent_online')}</span>
          </div>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-white/5">
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('provider_profile')}</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('ai_analysis_report')}</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('documents')}</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em] text-right">{t('decision')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {pendingVerifications?.map((vUser: any) => (
                <tr key={vUser._id} className="hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-500 group/row">
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600/10 text-blue-600 dark:text-blue-500 rounded-2xl flex items-center justify-center font-display font-bold text-2xl border border-blue-500/20">
                        {vUser.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg uppercase tracking-tighter">{vUser.username}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t(vUser.role.toLowerCase())}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10 max-w-md">
                    <div className="p-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl space-y-3 shadow-sm dark:shadow-none">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                          vUser.aiVerificationReport?.isAuthentic ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {vUser.aiVerificationReport?.isAuthentic ? t('authentic') : t('suspicious')}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                          {t('confidence')}: {vUser.aiVerificationReport?.confidenceScore}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                        "{vUser.aiVerificationReport?.summary}"
                      </p>
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <div className="flex flex-wrap gap-2">
                      {vUser.verificationDocuments?.map((doc: any, idx: number) => (
                        <a 
                          key={idx}
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 group/doc shadow-sm dark:shadow-none"
                        >
                          <FileText className="w-4 h-4 text-gray-400 group-hover/doc:text-blue-600 dark:group-hover/doc:text-blue-400" />
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('view_doc')}</span>
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onVerify(vUser._id, 'Approved')}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                      >
                        {t('approve')}
                      </button>
                      <button 
                        onClick={() => onVerify(vUser._id, 'Banned', 'Failed AI Verification')}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                      >
                        {t('ban')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!pendingVerifications || pendingVerifications.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-12 py-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-gray-700 border border-gray-200 dark:border-white/10">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-bold uppercase tracking-widest text-sm">{t('no_pending_verifications')}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-widest mt-2">{t('all_provider_credentials_processed')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pending Approvals - Data Grid Style */}
      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden relative group transition-colors duration-500"
      >
        <div className="p-6 lg:p-12 border-b border-gray-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">{t('queue_management')}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">{t('awaiting_authorization')} • {t('high_priority')}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input 
                type="text" 
                placeholder={t('scan_users')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-bold tracking-[0.2em] w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Link 
              to="/users"
              className="w-full sm:w-auto bg-blue-600/10 text-blue-400 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20 text-center"
            >
              {t('manage_all_users')}
            </Link>
            <Link 
              to="/admin/products"
              className="w-full sm:w-auto bg-purple-600/10 text-purple-400 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all border border-purple-500/20 text-center"
            >
              {t('manage_products')}
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-white/5">
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('provider_profile')}</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('classification')}</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">{t('timestamp')}</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em] text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredPendingUsers?.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-500 group/row">
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl flex items-center justify-center font-display font-bold text-xl lg:text-2xl border border-gray-200 dark:border-white/10 group-hover/row:bg-blue-600 group-hover/row:text-white group-hover/row:border-blue-500 transition-all duration-500 shadow-sm dark:shadow-none">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-base lg:text-lg uppercase tracking-tighter truncate">{user.username}</p>
                        <p className="text-[8px] font-mono font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest truncate">{t('id_label')}: {user._id.slice(-12)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <span className={`px-4 lg:px-6 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] border ${
                      user.role === 'Doctor' ? 'bg-purple-600/10 text-purple-500 border-purple-500/20' :
                      user.role === 'Patient' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' :
                      'bg-green-600/10 text-green-500 border-green-500/20'
                    }`}>
                      {t(user.role.toLowerCase())}
                    </span>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <div className="flex items-center gap-3 text-xs font-mono font-bold text-gray-500 dark:text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-700" />
                      {new Date(user.createdAt).toISOString().split('T')[0].replace(/-/g, ' / ')}
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10 text-right">
                    <div className="flex items-center justify-end gap-2 lg:gap-4">
                      <button 
                        onClick={() => onApprove(user._id, 'Approved')}
                        className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center bg-green-600/10 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all duration-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                        title="Authorize"
                      >
                        <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                      <button 
                        onClick={() => onApprove(user._id, 'Rejected')}
                        className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        title="Decline"
                      >
                        <XCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!pendingUsers || pendingUsers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-12 py-32 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-400 dark:text-gray-700 border border-gray-200 dark:border-white/10">
                        <Shield className="w-10 h-10" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-display font-bold text-2xl uppercase tracking-tighter mb-2">{t('queue_empty')}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">{t('no_pending_authorizations')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="absolute inset-0 bg-mesh opacity-10 -z-10 pointer-events-none" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
      `}} />
    </motion.div>
  );
}

function MonitorMetric({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
  };

  return (
    <div className="space-y-3 group/metric cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon className={`w-4 h-4 ${colors[color]} group-hover/metric:scale-125 transition-transform duration-300`} />
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 bg-current ${colors[color]} opacity-20 rounded-full`}
            />
          </div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/metric:text-white transition-colors">{label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-white group-hover/metric:text-blue-400 transition-colors">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: typeof value === 'string' && value.includes('%') ? value : '65%' }}
          transition={{ duration: 2, ease: "easeOut" }}
          className={`h-full bg-current ${colors[color]} relative`}
        >
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}

function InsightItem({ title, desc, icon: Icon, color }: any) {
  const colors: any = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all duration-300 group/insight cursor-pointer">
      <div className={`p-3 rounded-xl border ${colors[color]} group-hover/insight:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-tight mb-1">{title}</p>
        <p className="text-[10px] font-medium text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, variants }: any) {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-600/10 text-purple-500 border-purple-500/20',
    orange: 'bg-orange-600/10 text-orange-500 border-orange-500/20',
    green: 'bg-green-600/10 text-green-500 border-green-500/20',
    amber: 'bg-amber-600/10 text-amber-500 border-amber-500/20',
    rose: 'bg-rose-600/10 text-rose-500 border-rose-500/20',
  };

  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-gray-50 dark:bg-white/2 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-gray-200 dark:border-white/5 relative overflow-hidden group cursor-pointer transition-colors duration-500"
    >
      <div className="flex items-center justify-between mb-8 lg:mb-10 relative z-10">
        <div className={`p-4 lg:p-5 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform duration-700`}>
          <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
        </div>
        <div className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-widest ${trendUp ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4" /> : <ArrowDownRight className="w-3 h-3 lg:w-4 lg:h-4" />}
          {trend}
        </div>
      </div>
        <div className="relative z-10 min-w-0">
          <p className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase leading-none truncate">{value}</p>
          <p className="text-[8px] lg:text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] truncate">{title}</p>
        </div>
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/5 dark:bg-white/5 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-mesh opacity-10 -z-10" />
    </motion.div>
  );
}
