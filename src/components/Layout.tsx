import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import VerificationBanner from './VerificationBanner';
import { useTranslation } from 'react-i18next';
import GlobalNavbar from './GlobalNavbar';
import { io } from 'socket.io-client';
import { 
  Sun,
  Moon,
  LayoutDashboard, 
  Users, 
  UserRound, 
  Bed, 
  Pill, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  Star,
  Activity,
  Bell,
  Calendar,
  Map,
  Search,
  Settings,
  ChevronRight,
  Command,
  HelpCircle,
  Zap,
  Globe,
  Video,
  CheckSquare,
  Terminal,
  Brain,
  Shield,
  Cpu,
  Layers,
  Database,
  Lock,
  Radio,
  Wifi,
  Server,
  Bot,
  MessageSquare,
  CreditCard,
  Truck,
  Heart,
  AlertTriangle,
  Watch,
  Trophy,
  Sparkles,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CommandItem({ icon: Icon, label, shortcut, color = 'blue' }: any) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group/cmd">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl border ${colors[color]} group-hover/cmd:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-bold text-gray-300 group-hover/cmd:text-white transition-colors uppercase tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">⌘</span>
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{shortcut}</span>
      </div>
    </button>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
  const [emergencyAlert, setEmergencyAlert] = React.useState<any>(null);
  const socketRef = React.useRef<any>(null);

  // 语言列表
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  React.useEffect(() => {
    socketRef.current = io(window.location.origin);

    socketRef.current.on('emergency_alert', (data: any) => {
      setEmergencyAlert(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const triggerEmergency = () => {
    if (socketRef.current) {
      socketRef.current.emit('trigger_emergency', {
        title: '紧急协议 Alpha',
        message: '所有医务人员立即前往应急站点。红色代码已启动。',
        time: new Date().toLocaleTimeString(),
        sender: user?.username
      });
    }
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  const [searchQuery, setSearchQuery] = React.useState('');

  // 命令面板快捷键
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [notifications, setNotifications] = React.useState([
    { id: 1, title: '系统更新', message: '智医云 v3.1 现已上线，增强了遥测功能。', time: '2分钟前', read: false },
    { id: 2, title: '新患者入院', message: '张三已被安排至 4B 病房。', time: '15分钟前', read: false },
    { id: 3, title: '安全警报', message: '检测到来自不同终端的登录。', time: '1小时前', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 导航项 - 全部中文
  const navItems = [
    { label: '仪表盘', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Doctor', 'Patient', 'Staff', 'Pharmacist'] },
    { label: '预约管理', icon: Calendar, path: '/appointments', roles: ['Admin', 'Doctor', 'Patient'] },
    { label: '患者管理', icon: Users, path: '/patients', roles: ['Admin', 'Doctor', 'Staff'] },
    { label: '医生管理', icon: UserRound, path: '/doctors', roles: ['Admin', 'Staff'] },
    { label: '病房管理', icon: Bed, path: '/wards', roles: ['Admin', 'Staff'] },
    { label: '药房管理', icon: Pill, path: '/pharmacy', roles: ['Admin', 'Staff', 'Doctor', 'Pharmacist', 'Patient'] },
    { label: '病历记录', icon: FileText, path: '/records', roles: ['Admin', 'Doctor', 'Patient', 'Pharmacist'] },
    { label: '任务管理', icon: CheckSquare, path: '/tasks', roles: ['Admin', 'Doctor', 'Staff', 'Pharmacist'] },
    { label: '检验报告', icon: FileText, path: '/dashboard', roles: ['Lab'] },
    { label: '视频会诊', icon: Video, path: '/video-conference', roles: ['Admin', 'Doctor', 'Patient', 'Staff'] },
    { label: '地图追踪', icon: Map, path: '/map', roles: ['Admin', 'Doctor', 'Patient', 'Staff', 'Pharmacist'] },
    { label: '物联网设备', icon: Wifi, path: '/iot', roles: ['Admin', 'Doctor', 'Staff'] },
    { label: '救护车调度', icon: Truck, path: '/ambulance', roles: ['Admin', 'Patient', 'Staff'] },
    { label: '血液中心', icon: Heart, path: '/blood-hub', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '症状自查', icon: Activity, path: '/symptoms', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '疫苗接种', icon: Shield, path: '/vaccinations', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '远程医疗', icon: Video, path: '/tele-health', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '电子处方', icon: FileText, path: '/prescriptions', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '检验解读', icon: FileText, path: '/lab-interpreter', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '健康 ID', icon: Shield, path: '/health-id', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '药品库存', icon: Pill, path: '/medicine-inventory', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '智能预约', icon: Sparkles, path: '/appointment-optimizer', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '器官捐献', icon: Heart, path: '/organ-donation', roles: ['Admin', 'Patient', 'Doctor', 'Staff'] },
    { label: '处方 AI', icon: FileText, path: '/prescription-ai', roles: ['Admin', 'Patient', 'Doctor'] },
    { label: '健康 AI', icon: Brain, path: '/health-ai', roles: ['Admin', 'Patient', 'Doctor'] },
    { label: 'AI 聊天机器人', icon: MessageSquare, path: '/ai-chatbot', roles: ['Admin', 'Patient', 'Doctor', 'Staff', 'Pharmacist'] },
    { label: '可穿戴设备', icon: Watch, path: '/wearables', roles: ['Admin', 'Patient', 'Doctor'] },
    { label: '账单管理', icon: CreditCard, path: '/billing', roles: ['Admin', 'Patient'] },
    { label: '数据分析', icon: BarChart3, path: '/analytics', roles: ['Admin'] },
    { label: '用户管理', icon: Users, path: '/users', roles: ['Admin'] },
    { label: '系统设置', icon: Settings, path: '/settings', roles: ['Admin', 'Doctor', 'Patient', 'Staff', 'Pharmacist'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="relative flex flex-col h-screen bg-white dark:bg-[#050505] overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500">
      <GlobalNavbar />
      <VerificationBanner />
      <div className="relative flex flex-1 overflow-hidden pt-20">
        {/* 命令面板模态框 */}
        <AnimatePresence>
          {isSearchOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSearchOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-white/5 bg-white/2">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="执行全局命令..."
                      className="flex-1 bg-transparent border-none text-xl font-display font-bold text-white placeholder:text-gray-700 focus:ring-0 outline-none uppercase tracking-tighter"
                    />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ESC</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] px-4 mb-4">快捷命令</p>
                    <CommandItem icon={Users} label="搜索患者数据库" shortcut="P" />
                    <CommandItem icon={Pill} label="库存检查" shortcut="I" />
                    <CommandItem icon={Activity} label="系统遥测" shortcut="T" />
                    <CommandItem icon={Shield} label="安全覆盖" shortcut="S" color="red" />
                  </div>
                </div>
                <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">系统核心运行中</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">v4.2.0-stable</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 噪点覆盖层 */}
        <div className="fixed inset-0 noise z-50 pointer-events-none" />

        {/* 侧边栏 - 沉浸式暗色主题 */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <>
              {/* 移动端覆盖层 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="fixed lg:relative w-80 h-[calc(100vh-80px)] top-20 bg-white/80 dark:bg-black/40 backdrop-blur-3xl border-r border-gray-200 dark:border-white/5 flex-shrink-0 flex flex-col z-50 lg:z-30"
              >
                <div className="p-10 flex items-center gap-4">
                  <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl shadow-white/10 group-hover:rotate-12 transition-transform duration-500">
                      <Brain className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-display font-bold tracking-tighter uppercase">智医云</span>
                  </Link>
                </div>

                <nav className="flex-1 px-6 space-y-3 overflow-y-auto custom-scrollbar pt-4">
                  {filteredNavItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                          isActive
                            ? 'text-white dark:text-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.15)]'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <motion.div
                            initial={false}
                            animate={isActive ? { x: 0, opacity: 1, scale: 1.1 } : { x: -10, opacity: 0.5, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'group-hover:text-blue-500'} transition-colors duration-500`} />
                          </motion.div>
                          <span className="font-bold text-sm uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        )}
                        {isActive && (
                          <>
                            <motion.div 
                              layoutId="nav-active"
                              className="absolute inset-0 bg-gray-900 dark:bg-white"
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            />
                            <motion.div
                              animate={{
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent pointer-events-none"
                            />
                          </>
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:via-blue-600/5 transition-all duration-700" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-8">
                  <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xl shadow-2xl">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate uppercase tracking-widest overflow-hidden text-ellipsis">{user?.username}</p>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] truncate">
                            {user?.role === 'Admin' ? '管理员' : 
                             user?.role === 'Doctor' ? '医生' : 
                             user?.role === 'Patient' ? '患者' : 
                             user?.role === 'Staff' ? '员工' : 
                             user?.role === 'Pharmacist' ? '药剂师' : 
                             user?.role === 'Lab' ? '检验科' : 
                             user?.role === 'Driver' ? '司机' : 
                             user?.role === 'Rider' ? '骑手' : 
                             user?.role === 'Hospital' ? '医院' : 
                             user?.role === 'Pharmacy' ? '药店' : user?.role}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gray-200 dark:bg-white/5 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500 border border-gray-300 dark:border-white/5"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 紧急警报横幅 - 仅管理员可见 */}
        {user?.role === 'Admin' && (
          <div className="fixed top-20 left-0 right-0 z-[90] bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm uppercase tracking-widest">紧急广播系统</span>
            </div>
            <button 
              onClick={triggerEmergency}
              className="px-4 py-1 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
            >
              触发警报
            </button>
          </div>
        )}

        {/* 紧急警报模态框 */}
        <AnimatePresence>
          {emergencyAlert && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEmergencyAlert(null)}
                className="absolute inset-0 bg-red-950/80 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-black border-2 border-red-600 rounded-[2.5rem] shadow-[0_0_50px_rgba(220,38,38,0.5)] overflow-hidden p-12 text-center"
              >
                <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <AlertTriangle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-4">{emergencyAlert.title}</h2>
                <p className="text-red-500 font-bold text-sm uppercase tracking-widest mb-8">{emergencyAlert.message}</p>
                <div className="flex items-center justify-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-12">
                  <span>发出时间: {emergencyAlert.time}</span>
                  <span className="w-1 h-1 bg-gray-800 rounded-full" />
                  <span>发送者: {emergencyAlert.sender}</span>
                </div>
                <button
                  onClick={() => setEmergencyAlert(null)}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all"
                >
                  确认协议
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 主要内容区域 */}
        <main className={`relative flex-1 flex flex-col min-w-0 overflow-hidden ${user?.role === 'Admin' ? 'pt-10' : ''}`}>
          <header className="h-20 lg:h-28 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
            <div className="flex items-center gap-4 lg:gap-10">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl text-gray-600 dark:text-white transition-all duration-500 border border-gray-200 dark:border-white/5"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="hidden md:flex items-center bg-gray-100 dark:bg-white/5 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-white/5 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all duration-500 w-[300px] lg:w-[400px]"
              >
                <Search className="w-4 h-4 text-gray-400 mr-4" />
                <input 
                  type="text" 
                  placeholder="执行搜索..." 
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-bold tracking-[0.2em] w-full placeholder:text-gray-400 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10 ml-2">
                  <Command className="w-3 h-3 text-gray-400" />
                  <span className="text-[8px] font-bold text-gray-400">K</span>
                </div>
              </form>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              <div className="hidden xl:flex items-center gap-8 px-8 border-r border-gray-200 dark:border-white/5">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">系统健康度</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">99.9% 运行时间</span>
                </div>
              </div>

              {/* 主题切换 */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl text-gray-600 dark:text-white transition-all duration-500 border border-gray-200 dark:border-white/5"
                title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
              </button>

              {/* 语言切换器 */}
              <div className="relative">
                <button 
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-2xl text-gray-600 dark:text-white transition-all duration-500 border border-gray-200 dark:border-white/5 ${isLanguageOpen ? 'bg-gray-200 dark:bg-white/10' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                >
                  <Globe className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isLanguageOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsLanguageOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-48 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40"
                      >
                        <div className="p-2">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                i18n.changeLanguage(lang.code);
                                setIsLanguageOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                i18n.language === lang.code 
                                  ? 'bg-blue-600 text-white' 
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="text-base">{lang.flag}</span>
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl text-gray-600 dark:text-white relative transition-all duration-500 border border-gray-200 dark:border-white/5 ${isNotificationsOpen ? 'bg-gray-200 dark:bg-white/10' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-16 right-0 w-80 bg-white dark:bg-black/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">通知</h3>
                          <button 
                            onClick={markAllRead}
                            className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            全部标记已读
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-6 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read ? 'bg-blue-500/5' : ''}`}
                            >
                              {!n.read && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                              )}
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{n.title}</h4>
                                <span className="text-[8px] font-bold text-gray-400 dark:text-gray-600 uppercase">{n.time}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{n.message}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 text-center">
                          <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            查看全部活动
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <button className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl text-gray-600 dark:text-white transition-all duration-500 border border-gray-200 dark:border-white/5">
                  <Zap className="w-5 h-5" />
                </button>
              </div>
              <div className="h-10 w-px bg-gray-200 dark:bg-white/10 mx-4" />
              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">系统操作员</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">{user?.username}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-2xl">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 lg:p-20 custom-scrollbar relative">
            <div className="max-w-[1400px] mx-auto relative z-10">
              {children}
            </div>
            
            {/* 背景大气元素 */}
            <div className="fixed top-1/4 right-0 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse" />
            <div className="fixed bottom-1/4 left-0 w-[30vw] h-[30vw] bg-purple-600/5 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse delay-1000" />
            <div className="fixed inset-0 bg-mesh opacity-20 -z-20 pointer-events-none" />
          </div>
        </main>
      </div>
    </div>
  );
}