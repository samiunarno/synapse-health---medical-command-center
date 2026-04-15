import React from 'react';
import { 
  Bed, 
  Pill, 
  Users, 
  Activity, 
  Clock, 
  ArrowRight, 
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Package,
  Star,
  Trophy,
  Heart
} from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import WardBedStats from '../WardBedStats';
import { useTranslation } from 'react-i18next';

export default function StaffDashboard({ user, stats, activityStream }: any) {
  const { t } = useTranslation();
  const iconMap: any = {
    Plus,
    Package,
    AlertCircle,
    Bed,
    Activity,
    Users,
    Clock,
    CheckCircle2
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
      className="relative space-y-10 pb-12"
    >
      {/* Welcome Header */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-emerald-900 p-12 lg:p-16 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-emerald-100 group"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3" />
              {t('system_status_operational')}
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-display font-bold mb-6 tracking-tight leading-tight break-words">
              {t('welcome_back')}, <br />
              <span className="text-emerald-400">{user?.username}</span>
            </h2>
            <p className="text-emerald-100/70 text-lg font-medium mb-10 leading-relaxed">
              {t('hospital_ops_smooth')} 
              {t('new_registrations_pending')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/patients" className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-black/20">
                <Plus className="w-5 h-5" />
                {t('register_patient')}
              </Link>
              <Link to="/wards" className="bg-emerald-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-700 transition-all border border-emerald-700">
                <Bed className="w-5 h-5 text-emerald-400" />
                {t('manage_beds')}
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-600/20 to-transparent -z-0" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-30 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-teal-600 rounded-full blur-[100px] opacity-20 group-hover:translate-x-10 transition-transform duration-1000" />
        
        {/* Floating Stat Card */}
        <div className="absolute top-12 right-12 hidden xl:block">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] w-64 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-emerald-300">{t('active')}</span>
            </div>
            <p className="text-2xl font-display font-bold text-white mb-1">{stats?.totalStaff || 0}</p>
            <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">{t('total_staff')}</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bed Status Summary */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 dark:bg-white/2 p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/5 flex flex-col group transition-colors duration-500"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('bed_status')}</h3>
            <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <motion.div 
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 group hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-sm font-bold text-emerald-400 uppercase tracking-tight">{t('available')}</span>
              </div>
              <span className="text-2xl font-display font-bold text-emerald-400">{(stats?.totalBeds || 0) - (stats?.occupiedBeds || 0)}</span>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 group hover:bg-blue-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-bold text-blue-400 uppercase tracking-tight">{t('occupied')}</span>
              </div>
              <span className="text-2xl font-display font-bold text-blue-400">{stats?.occupiedBeds || 0}</span>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-6 bg-orange-500/10 rounded-3xl border border-orange-500/20 group hover:bg-orange-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm font-bold text-orange-400 uppercase tracking-tight">{t('maintenance')}</span>
              </div>
              <span className="text-2xl font-display font-bold text-orange-400">{stats?.maintenanceBeds || 0}</span>
            </motion.div>
          </motion.div>
          <Link to="/wards" className="mt-10 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-black/20">
            {t('view_all_wards')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 rounded-[2.5rem] border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col group transition-colors duration-500"
        >
          <div className="p-10 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Activity className="w-6 h-6 text-emerald-600" />
                {t('recent_activity')}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{t('real_time_log')}</p>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:underline underline-offset-4">{t('view_full_log')}</button>
          </div>
          <motion.div 
            variants={containerVariants}
            className="divide-y divide-gray-200 dark:divide-white/5"
          >
            {activityStream?.map((item: any, i: number) => (
              <ActivityItem 
                key={i}
                icon={iconMap[item.icon] || Activity} 
                title={item.user || 'System'} 
                desc={item.action || 'No description'} 
                time={item.time} 
                color={item.color || 'emerald'}
                variants={itemVariants}
              />
            ))}
            {(!activityStream || activityStream.length === 0) && (
              <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">{t('no_recent_activity')}</div>
            )}
          </motion.div>
          <div className="p-8 mt-auto bg-gray-100/50 dark:bg-white/2 text-center">
            <button className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 mx-auto">
              {t('load_more_activity')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Ward Bed Status Visualization */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('ward_bed_distribution')}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t('real_time_status_by_ward')}</p>
          </div>
        </div>
        <WardBedStats />
      </motion.div>
    </motion.div>
  );
}

function ActivityItem({ icon: Icon, title, desc, time, color, variants }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    gray: 'bg-white/5 text-gray-400 border-white/10',
  };

  return (
    <motion.div 
      variants={variants}
      whileHover={{ x: 10, backgroundColor: 'rgba(0,0,0,0.02)' }}
      className="p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-emerald-600 gap-6 dark:hover:bg-white/5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8">
        <div className={`p-4 rounded-2xl ${colors[color]} border group-hover:scale-110 transition-transform duration-300 w-fit`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{title}</p>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-tight truncate">{desc}</p>
        </div>
      </div>
      <div className="text-right flex items-center justify-between sm:justify-end gap-6">
        <div className="sm:block">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{time}</p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl text-gray-500 group-hover:bg-emerald-600 group-hover:text-white transition-all border border-gray-200 dark:border-white/5">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
