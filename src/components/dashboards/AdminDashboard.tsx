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
  Truck,
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
  predictiveData,
  systemMonitor,
  activityStream,
  systemInsights,
  iotDevices,
  onApprove,
  onVerify 
}: any) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const iotStats = {
    total: iotDevices?.length || 0,
    active: iotDevices?.filter((d: any) => d.status === 'Active').length || 0,
    warning: iotDevices?.filter((d: any) => d.status === 'Warning').length || 0,
    error: iotDevices?.filter((d: any) => d.status === 'Error').length || 0,
  };

  const filteredPendingUsers = pendingUsers?.filter((user: any) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!pendingUsers || !Array.isArray(pendingUsers)) return;
    const headers = ['ID', '用户名', '角色', '状态', '创建时间'];
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
    { name: '已占用', value: stats?.occupiedBeds || 0 },
    { name: '可用', value: (stats?.totalBeds || 0) - (stats?.occupiedBeds || 0) }
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
    ShoppingCart,
    Truck
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
      {/* 页眉 - 任务控制中心风格 */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-gray-200 dark:border-white/5 pb-12 transition-colors duration-500"
      >
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-500 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] mb-6 border border-blue-500/20">
            <Cpu className="w-3 h-3" />
            系统核心 v4.2.0
          </div>
          <h1 className="text-3xl sm:text-6xl lg:text-8xl font-display font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase leading-none break-words">
            任务 <br />
            <span className="text-transparent stroke-text">控制中心</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            所有系统运行正常 • 0.1秒 延迟
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-8 py-4 rounded-2xl font-mono text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-4 backdrop-blur-xl">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()} • {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} UTC
          </div>
          <button 
            onClick={handleExport}
            className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-black/10 dark:shadow-white/5 flex items-center gap-3"
          >
            导出遥测数据
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* 统计卡片 - 硬件风格 */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
      >
        <StatCard 
          title="患者总数" 
          value={stats?.totalPatients || 0} 
          icon={Users} 
          trend="+12.5%" 
          trendUp={true}
          color="blue"
          variants={itemVariants}
        />
        <StatCard 
          title="在职医生" 
          value={stats?.totalDoctors || 0} 
          icon={Stethoscope} 
          trend="+2" 
          trendUp={true}
          color="purple"
          variants={itemVariants}
        />
        <StatCard 
          title="病床占用率" 
          value={`${stats?.bedOccupancy || 0}%`} 
          icon={Bed} 
          trend="-3.2%" 
          trendUp={false}
          color="orange"
          variants={itemVariants}
        />
        <StatCard 
          title="总收入" 
          value={`¥${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={DollarSign} 
          trend="最优" 
          trendUp={true}
          color="green"
          variants={itemVariants}
        />
      </motion.div>

      {/* IoT 与预测摘要 - AI 驱动 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 lg:mb-12 relative z-10 gap-4">
            <div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">资源管理</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">容量管理模型</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-500/20 shrink-0">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
          <div className="h-[250px] lg:h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-[rgba(255,255,255,0.03)]" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 800}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 800}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', padding: '20px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  className="dark:!bg-black dark:!border-white/10 dark:!shadow-black/50"
                />
                <Bar dataKey="predicted" name="预测入院人数" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="staffNeeded" name="所需医护人员" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="medicineStockNeeded" name="药品需求预测" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
        </motion.div>

        <div className="space-y-8 lg:space-y-12">
          <motion.div 
            variants={itemVariants}
            className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 flex flex-col relative overflow-hidden group transition-colors duration-500"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 lg:mb-12 relative z-10 gap-4">
              <div>
                <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">智能资产</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">物联网设备网络</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 shrink-0">
                <Wifi className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <div className="space-y-4 lg:space-y-6 relative z-10">
              <div className="flex items-center justify-between p-4 lg:p-6 bg-white dark:bg-white/5 rounded-2xl lg:rounded-3xl border border-gray-200 dark:border-white/5 group/item hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">活跃节点</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">所有系统运行正常</p>
                  </div>
                </div>
                <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">{iotStats.active}</span>
              </div>
              <div className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 group/item hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">警告</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">需要注意</p>
                  </div>
                </div>
                <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">{iotStats.warning}</span>
              </div>
              <div className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 group/item hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">严重错误</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">需立即处理</p>
                  </div>
                </div>
                <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">{iotStats.error}</span>
              </div>
              <Link 
                to="/iot"
                className="mt-4 block w-full py-5 text-center bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
              >
                管理物联网网络
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px]" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[3rem] p-12 relative overflow-hidden group transition-colors duration-500"
          >
            <div>
              <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">运营洞察</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">性能分析</p>
            </div>
            <div className="space-y-6 relative z-10">
              {systemInsights?.map((insight: any, i: number) => (
                <InsightItem 
                  key={i}
                  title={insight.title} 
                  desc={insight.desc} 
                  icon={iconMap[insight.icon] || Zap} 
                  color={insight.color} 
                />
              ))}
            </div>
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 主图表 - 沉浸式暗色主题 */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
            <div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">住院趋势</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">遥测数据流 • 30天窗口</p>
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
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 800, fontFamily: 'Space Grotesk'}} 
                  dy={20} 
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
                  className="dark:!bg-black dark:!border-white/10 dark:!shadow-black/50 dark:!label-style:color-white"
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

        {/* 床位分布 - 硬件风格 */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 flex flex-col relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">床位状态</h3>
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
                  className="dark:!bg-black dark:!border-white/10 dark:!shadow-black/50"
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-6xl font-display font-black text-gray-900 dark:text-white leading-none mb-2 tracking-tighter">{stats?.occupiedBeds || 0}</p>
              <p className="text-[8px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">已占用</p>
            </div>
          </div>
          <div className="space-y-4 mt-auto relative z-10">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-500 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i], boxShadow: `0 0 10px ${COLORS[i]}`}} />
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>
      </div>

      {/* 病房床位状态可视化 */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">病房床位分布</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">按病房实时状态</p>
          </div>
        </div>
        <WardBedStats />
      </motion.div>

      {/* 用户管理快速入口 */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
      >
        <Link to="/users" className="bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/20 p-10 rounded-[3rem] flex items-center justify-between group hover:bg-indigo-600/20 dark:hover:bg-indigo-600/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">用户管理</h3>
              <p className="text-indigo-600/70 dark:text-indigo-200/70 text-xs font-bold uppercase tracking-widest">管理系统用户、角色和权限</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-indigo-500 group-hover:translate-x-2 transition-transform" />
        </Link>
        <Link to="/iot" className="bg-emerald-600/10 dark:bg-emerald-600/20 border border-emerald-500/20 p-10 rounded-[3rem] flex items-center justify-between group hover:bg-emerald-600/20 dark:hover:bg-emerald-600/30 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Wifi className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">物联网网络</h3>
              <p className="text-emerald-600/70 dark:text-emerald-200/70 text-xs font-bold uppercase tracking-widest">监控和管理物联网设备</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-emerald-500 group-hover:translate-x-2 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 mb-12">
        {/* 实时库存管理 */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 dark:bg-white/2 rounded-[3rem] border border-gray-200 dark:border-white/5 overflow-hidden relative group transition-colors duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="p-12 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-4">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                库存管理
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">实时追踪医疗物资、药品和设备</p>
            </div>
            <Link to="/admin/products" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 shrink-0">
              管理库存
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-white/5 relative z-10">
            <div className="p-8 bg-white dark:bg-white/2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">关键物资</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">N95口罩</p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">库存不足 (剩余150)</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
              </div>
              <button className="mt-6 w-full py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors border border-gray-200 dark:border-white/10">
                已触发自动补货
              </button>
            </div>
            <div className="p-8 bg-white dark:bg-white/2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">药品</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">阿莫西林</p>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">库存充足 (5000单位)</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-500 font-medium">预计14天后需补货</p>
            </div>
            <div className="p-8 bg-white dark:bg-white/2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">手术设备</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">手术刀片</p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">库存充足 (剩余800)</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-500 font-medium">日均消耗: 50个</p>
            </div>
            <div className="p-8 bg-white dark:bg-white/2 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-4">
                <Activity className="w-8 h-8 text-purple-600 dark:text-purple-500" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">系统洞察</p>
              <p className="text-xs text-gray-500">预测下周流感药品需求将增加20%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 系统监控与日志区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">系统监控</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">实时</span>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <MonitorMetric label="CPU负载" value={systemMonitor?.cpu || '0%'} icon={Cpu} color="blue" />
            <MonitorMetric label="内存" value={systemMonitor?.memory || '0GB / 16GB'} icon={Database} color="purple" />
            <MonitorMetric label="网络" value={systemMonitor?.network || '0 MB/S'} icon={Wifi} color="green" />
            <MonitorMetric label="安全状态" value={systemMonitor?.security || '已加密'} icon={Lock} color="orange" />
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-white/5 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">内核日志</span>
            </div>
            <div className="font-mono text-[9px] text-gray-500 dark:text-gray-600 space-y-2">
              <p className="flex gap-2"><span className="text-blue-600/50 dark:text-blue-500/50">[05:59:49]</span> AUTH_SERVICE: 用户登录验证成功</p>
              <p className="flex gap-2"><span className="text-blue-600/50 dark:text-blue-500/50">[05:59:42]</span> DB_SYNC: 已更新12条记录</p>
              <p className="flex gap-2"><span className="text-blue-600/50 dark:text-blue-500/50">[05:59:35]</span> ANALYTICS: 已生成快照</p>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden group transition-colors duration-500"
        >
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">活动流</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">实时事件处理</p>
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
                    <p className="text-[10px] font-medium text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-700 uppercase">{activity.time}</span>
              </div>
            ))}
          </div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-yellow-600/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>
      </div>

      {/* 验证队列 - AI报告 */}
      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden relative group transition-colors duration-500"
      >
        <div className="p-6 lg:p-12 border-b border-gray-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">验证队列</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">AI 驱动分析 • 专业资质审核</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">AI 代理在线</span>
          </div>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-white/5">
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">申请者档案</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">AI 分析报告</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em]">证明材料</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em] text-right">审核决策</th>
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
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{vUser.role === 'Doctor' ? '医生' : vUser.role === 'Patient' ? '患者' : '其他'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10 max-w-md">
                    <div className="p-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl space-y-3 shadow-sm dark:shadow-none">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                          vUser.aiVerificationReport?.isAuthentic ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {vUser.aiVerificationReport?.isAuthentic ? '真实可信' : '可疑'}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                          置信度: {vUser.aiVerificationReport?.confidenceScore}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                        “{vUser.aiVerificationReport?.summary}”
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
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">查看文件</span>
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
                        批准
                      </button>
                      <button 
                        onClick={() => onVerify(vUser._id, 'Banned', 'AI验证未通过')}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                      >
                        封禁
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
                      <p className="text-gray-900 dark:text-white font-bold uppercase tracking-widest text-sm">暂无待验证申请</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-widest mt-2">所有机构资质均已处理</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 待审批队列 - 数据网格风格 */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/2 border border-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden relative group"
      >
        <div className="p-6 lg:p-12 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-white mb-2 uppercase tracking-tighter">队列管理</h3>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">等待授权 • 高优先级</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                type="text" 
                placeholder="搜索用户" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold tracking-[0.2em] w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-700"
              />
            </div>
            <Link 
              to="/users"
              className="w-full sm:w-auto bg-blue-600/10 text-blue-400 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20 text-center"
            >
              管理所有用户
            </Link>
            <Link 
              to="/admin/products"
              className="w-full sm:w-auto bg-purple-600/10 text-purple-400 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all border border-purple-500/20 text-center"
            >
              管理产品
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">用户资料</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">角色分类</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">注册时间</th>
                <th className="px-6 lg:px-12 py-6 lg:py-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPendingUsers?.map((user: any) => (
                <tr key={user._id} className="hover:bg-white/5 transition-all duration-500 group/row">
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/5 text-white rounded-2xl flex items-center justify-center font-display font-bold text-xl lg:text-2xl border border-white/10 group-hover/row:bg-blue-600 group-hover/row:border-blue-500 transition-all duration-500">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-base lg:text-lg uppercase tracking-tighter truncate">{user.username}</p>
                        <p className="text-[8px] font-mono font-bold text-gray-600 uppercase tracking-widest truncate">ID: {user._id.slice(-12)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <span className={`px-4 lg:px-6 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] border ${
                      user.role === 'Doctor' ? 'bg-purple-600/10 text-purple-500 border-purple-500/20' :
                      user.role === 'Patient' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' :
                      'bg-green-600/10 text-green-500 border-green-500/20'
                    }`}>
                      {user.role === 'Doctor' ? '医生' : user.role === 'Patient' ? '患者' : '其他'}
                    </span>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10">
                    <div className="flex items-center gap-3 text-xs font-mono font-bold text-gray-500">
                      <Clock className="w-4 h-4 text-gray-700" />
                      {new Date(user.createdAt).toISOString().split('T')[0].replace(/-/g, ' / ')}
                    </div>
                  </td>
                  <td className="px-6 lg:px-12 py-6 lg:py-10 text-right">
                    <div className="flex items-center justify-end gap-2 lg:gap-4">
                      <button 
                        onClick={() => onApprove(user._id, 'Approved')}
                        className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center bg-green-600/10 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all duration-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                        title="批准"
                      >
                        <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                      <button 
                        onClick={() => onApprove(user._id, 'Rejected')}
                        className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        title="拒绝"
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
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-700 border border-white/10">
                        <Shield className="w-10 h-10" />
                      </div>
                      <p className="text-white font-display font-bold text-2xl uppercase tracking-tighter mb-2">队列为空</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">未检测到待授权申请</p>
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