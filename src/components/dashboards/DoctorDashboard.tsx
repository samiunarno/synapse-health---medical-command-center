import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  ArrowRight, 
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Edit,
  X,
  Save,
  ShieldCheck,
  Zap,
  ShieldAlert,
  Dna,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getCDSSInsights } from '../../services/aiService';

export default function DoctorDashboard({ user }: { user: any }) {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    specialization: '',
    contact: '',
    department_id: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [cdssInsights, setCdssInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [queue, setQueue] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [commissions, setCommissions] = useState<any>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchDepartments();
    fetchDashboardData();
    fetchQueue();
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/commissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCommissions(await res.json());
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!commissions?.commissionBalance || commissions.commissionBalance <= 0) return;
    setIsWithdrawing(true);
    try {
      const token = localStorage.getItem('token');
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
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/advanced/queue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleUpdateQueueStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/advanced/queue/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error updating queue status:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/doctors/dashboard-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const runCDSSAnalysis = async (patientId: string) => {
    if (!patientId) return;
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch patient data, records, and lab reports from backend first
      const [patientRes, recordsRes, labsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/medical-records/patient/${patientId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/lab-reports/patient/${patientId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (patientRes.ok && recordsRes.ok && labsRes.ok) {
        const [patient, records, labs] = await Promise.all([
          patientRes.json(),
          recordsRes.json(),
          labsRes.json()
        ]);

        // Call AI service directly from frontend
        const insights = await getCDSSInsights(patient, records, labs, i18n.language);
        setCdssInsights(insights);
      }
    } catch (error) {
      console.error('Error running CDSS analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          specialization: data.specialization || '',
          contact: data.contact || '',
          department_id: data.department_id?._id || data.department_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDepartments(data);
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/doctors/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setIsEditingProfile(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
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
        className="relative bg-gray-50 dark:bg-white/2 p-8 lg:p-16 rounded-[2rem] lg:rounded-[3rem] text-gray-900 dark:text-white overflow-hidden border border-gray-200 dark:border-white/5 group transition-colors duration-500"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-widest mb-6 border border-blue-500/20 backdrop-blur-sm">
              <Activity className="w-3 h-3" />
              {t('on_duty')} • {profile?.department_id?.name || 'General Medicine'}
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-display font-bold mb-6 tracking-tight leading-tight break-words">
              {t('welcome_back')}, <br />
              <span className="text-blue-600 dark:text-blue-500">Dr. {user?.username}</span>
            </h2>
            <div className="flex flex-col gap-2 mb-8 lg:mb-10">
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg font-medium leading-relaxed">
                {t('appointments_scheduled', { count: dashboardData?.stats?.totalAppointments || 0 })} 
                {t('first_patient_eta', { minutes: 15 })}
              </p>
              {profile && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {profile.specialization}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {profile.contact}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Link to="/records" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 lg:px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-black/10 dark:shadow-black/20 text-sm lg:text-base">
                <Plus className="w-5 h-5" />
                {t('new_medical_record')}
              </Link>
              <Link to="/patients" className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-6 lg:px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 text-sm lg:text-base">
                <Search className="w-5 h-5 text-gray-400" />
                {t('search_patients')}
              </Link>
              <div className="bg-blue-600/10 dark:bg-blue-600/20 px-6 lg:px-8 py-4 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                <div>
                  <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('commission_balance')}</p>
                  <p className="text-lg font-display font-bold text-gray-900 dark:text-white">¥{commissions?.commissionBalance?.toFixed(2) || '0.00'}</p>
                </div>
                <button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !commissions?.commissionBalance || commissions.commissionBalance <= 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : t('withdraw')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/5 dark:from-blue-600/10 to-transparent -z-0" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-5 dark:opacity-10 group-hover:translate-x-10 transition-transform duration-1000" />
        
        {/* Floating Stat Card */}
        <div className="absolute top-12 right-12 hidden xl:block">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-[2rem] w-64 shadow-xl dark:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400">+12%</span>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">{dashboardData?.stats?.recoveryRate || 0}%</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('recovery_rate')}</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Queue Section */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 bg-gray-50 dark:bg-white/2 rounded-[2.5rem] border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col group"
        >
          <div className="p-6 lg:p-10 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                {t('live_patient_queue')}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{t('manage_patients_waiting')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                {queue.filter(q => q.status === 'Waiting').length} {t('waiting')}
              </div>
              <button 
                onClick={fetchQueue}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-100/50 dark:bg-white/2">
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('token')}</th>
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('patient')}</th>
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('department')}</th>
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('priority')}</th>
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('wait_time')}</th>
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('status')}</th>
                  <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {loadingQueue ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">{t('loading_queue')}</td>
                  </tr>
                ) : queue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">{t('no_patients_in_queue')}</td>
                  </tr>
                ) : (
                  queue.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group/row">
                      <td className="p-6">
                        <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400">
                          #{item.token_number}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                            {item.patient_id?.fullName?.charAt(0) || 'P'}
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.patient_id?.fullName || t('unknown_patient')}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.department_id?.name || t('general')}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border ${
                          item.priority === 'Emergency' ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20' :
                          item.priority === 'Urgent' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20' :
                          'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'
                        }`}>
                          {t(item.priority.toLowerCase())}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 60000)}m
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-widest border flex items-center gap-2 w-fit ${
                          item.status === 'In Progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20' :
                          'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20'
                        }`}>
                          {item.status === 'Waiting' && <span className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-500 rounded-full animate-pulse" />}
                          {item.status === 'In Progress' && <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full animate-ping" />}
                          {t(item.status.toLowerCase().replace(/ /g, '_'))}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          {item.status === 'Waiting' && (
                            <button 
                              onClick={() => handleUpdateQueueStatus(item._id, 'In Progress')}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors"
                            >
                              {t('start_call')}
                            </button>
                          )}
                          {item.status === 'In Progress' && (
                            <button 
                              onClick={() => handleUpdateQueueStatus(item._id, 'Completed')}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                            >
                              {t('complete')}
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateQueueStatus(item._id, 'Cancelled')}
                            className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Clinical Decision Support System (CDSS) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-500/20 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden group mb-8 transition-colors duration-500"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shrink-0">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">{t('cdss_title')}</h3>
              <p className="text-blue-600/70 dark:text-blue-200/70 text-sm max-w-2xl leading-relaxed">
                {t('cdss_desc')}
              </p>
              {cdssInsights && (
                <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs text-blue-600 dark:text-blue-200 font-medium italic">"{cdssInsights.summary}"</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <select 
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSelectedPatientId(e.target.value)}
                value={selectedPatientId}
              >
                <option value="" disabled className="bg-white dark:bg-[#0a0a0a]">{t('select_patient_analyze')}</option>
                {dashboardData?.appointments?.map((apt: any) => (
                  <option key={apt.patientId} value={apt.patientId} className="bg-white dark:bg-[#0a0a0a]">{apt.patient}</option>
                ))}
              </select>
              <button 
                onClick={() => runCDSSAnalysis(selectedPatientId)}
                disabled={isAnalyzing || !selectedPatientId}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 shrink-0 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isAnalyzing ? t('analyzing') : t('run_analysis')}
              </button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {cdssInsights ? (
              (Array.isArray(cdssInsights?.suggestions) ? cdssInsights.suggestions : []).map((suggestion: any, index: number) => (
                <div key={index} className="bg-white dark:bg-black/20 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                    typeof suggestion.type === 'string' && suggestion.type === 'Diagnosis Suggestion' ? 'text-blue-600 dark:text-blue-400' : 
                    typeof suggestion.type === 'string' && suggestion.type === 'Treatment Guideline' ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>{typeof suggestion.type === 'string' ? t(suggestion.type.toLowerCase().replace(/ /g, '_')) : 'Unknown Type'}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {typeof suggestion.title === 'object' ? JSON.stringify(suggestion.title) : suggestion.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {typeof suggestion.description === 'object' ? JSON.stringify(suggestion.description) : suggestion.description}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white dark:bg-black/20 p-6 rounded-2xl border border-gray-200 dark:border-white/5 opacity-50 shadow-sm dark:shadow-none">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{t('diagnosis_suggestion')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('select_patient')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('analysis_placeholder')}</p>
                </div>
                <div className="bg-white dark:bg-black/20 p-6 rounded-2xl border border-gray-200 dark:border-white/5 opacity-50 shadow-sm dark:shadow-none">
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">{t('treatment_guideline')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('select_patient')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('analysis_placeholder')}</p>
                </div>
                <div className="bg-white dark:bg-black/20 p-6 rounded-2xl border border-gray-200 dark:border-white/5 opacity-50 shadow-sm dark:shadow-none">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">{t('preventive_care')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('select_patient')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('analysis_placeholder')}</p>
                </div>
              </>
            )}
          </div>
          
          {Array.isArray(cdssInsights?.alerts) && cdssInsights.alerts.length > 0 && (
            <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl relative z-10">
              <h4 className="text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                {t('clinical_alerts_detected')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Array.isArray(cdssInsights?.alerts) ? cdssInsights.alerts : []).map((alert: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      alert.severity === 'High' ? 'bg-red-500' : alert.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {typeof alert.title === 'object' ? JSON.stringify(alert.title) : alert.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {typeof alert.description === 'object' ? JSON.stringify(alert.description) : alert.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Critical Alerts Section */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 bg-red-600/5 border border-red-500/10 rounded-[2rem] p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group"
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-500 border border-red-500/20 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t('critical_alerts')}</h3>
              <p className="text-[10px] text-red-600/60 dark:text-red-400/60 font-bold uppercase tracking-[0.3em]">{t('immediate_action_required')} • {dashboardData?.alerts?.length || 0} {t('pending')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 relative z-10 w-full sm:w-auto flex-1">
            {dashboardData?.alerts?.map((alert: any) => (
              <div key={alert.id} className="p-4 bg-white dark:bg-black/40 border border-red-500/30 rounded-xl flex flex-col gap-2 shadow-lg shadow-red-500/5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-ping shrink-0 ${alert.type === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{alert.message}</span>
                </div>
                {alert.description && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 ml-6 border-l-2 border-red-500/20 pl-3">
                    {alert.description}
                  </p>
                )}
                {alert.recommendedAction && (
                  <div className="ml-6 mt-1 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    <span className="text-[10px] uppercase font-bold text-red-600/80 dark:text-red-400/80 block mb-1">Recommended Action</span>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                      {alert.recommendedAction}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {(!dashboardData?.alerts || dashboardData.alerts.length === 0) && (
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('no_active_alerts')}</span>
            )}
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col group"
        >
          <div className="p-6 lg:p-10 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                {t('today_schedule')}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{t('manage_daily_consultations')}</p>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline underline-offset-4 text-left">{t('view_full_calendar')}</button>
          </div>
          <motion.div 
            variants={containerVariants}
            className="divide-y divide-gray-200 dark:divide-white/5"
          >
            {dashboardData?.appointments?.map((apt: any, i: number) => (
              <AppointmentItem 
                key={i}
                time={apt.time} 
                patient={apt.patient} 
                type={apt.type} 
                status={apt.status} 
                color={apt.color}
                avatar={apt.avatar}
                variants={itemVariants}
                t={t}
              />
            ))}
            {(!dashboardData?.appointments || dashboardData.appointments.length === 0) && (
              <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">{t('no_appointments_scheduled')}</div>
            )}
          </motion.div>
          <div className="p-8 mt-auto bg-gray-100/50 dark:bg-white/2 text-center">
            <button className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 mx-auto">
              {t('load_more_appointments')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions & Stats */}
        <div className="space-y-8">
          <motion.div 
            variants={itemVariants}
            className="bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/20 p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] text-gray-900 dark:text-white relative overflow-hidden group backdrop-blur-sm"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-blue-500/20">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl lg:text-2xl font-display font-bold mb-4 leading-tight">
                {t('total_patients').includes(' ') ? (
                  <>{t('total_patients').split(' ')[0]} <br />{t('total_patients').split(' ')[1]}</>
                ) : t('total_patients')}
              </h3>
              <p className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white mb-2">
                {dashboardData?.stats?.patientsCount || 0}
              </p>
              <p className="text-blue-600/70 dark:text-blue-100/70 text-xs font-bold uppercase tracking-widest">{t('active_registrations')}</p>
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/20 p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] text-gray-900 dark:text-white relative overflow-hidden group backdrop-blur-sm"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-purple-500/20">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl lg:text-2xl font-display font-bold mb-4 leading-tight">
                {t('medical_records').includes(' ') ? (
                  <>{t('medical_records').split(' ')[0]} <br />{t('medical_records').split(' ')[1]}</>
                ) : t('medical_records')}
              </h3>
              <p className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white mb-2">
                {dashboardData?.stats?.recordsCount || 0}
              </p>
              <p className="text-purple-600/70 dark:text-purple-100/70 text-xs font-bold uppercase tracking-widest">{t('total_consultations')}</p>
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('edit_profile')}</h3>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('specialization')}</label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t('specialization_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('contact_number')}</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder={t('contact_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('department')}</label>
                  <select
                    value={editForm.department_id}
                    onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">{t('select_dept')}</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id} className="bg-white dark:bg-gray-900">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t('save_changes')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AppointmentItem({ time, patient, type, status, color, avatar, variants, t }: any) {
  const colors: any = {
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20',
    green: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20',
  };

  return (
    <motion.div 
      variants={variants}
      whileHover={{ x: 10, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      className="p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-600 gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8">
        <div className="flex sm:flex-col items-center justify-center sm:w-20 lg:w-24 gap-2 sm:gap-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{time.split(' ')[0]}</p>
          {time.includes(' ') && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{time.split(' ')[1]}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center font-bold text-gray-500 group-hover:bg-blue-600/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all text-xs lg:text-base border border-gray-200 dark:border-white/5">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm lg:text-base truncate">{patient}</p>
            <p className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-tight truncate">{type}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6">
        <span className={`px-3 lg:px-4 py-1.5 rounded-xl text-[8px] lg:text-[10px] font-bold uppercase tracking-widest border ${colors[color]} flex items-center gap-2`}>
          {status === 'Waiting' && <span className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-500 rounded-full animate-pulse" />}
          {t(status.toLowerCase())}
        </span>
        <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-all border border-gray-200 dark:border-white/5">
          <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
      </div>
    </motion.div>
  );
}

function QuickStat({ label, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-600/10 text-purple-500 border-purple-500/20',
    orange: 'bg-orange-600/10 text-orange-500 border-orange-500/20',
  };

  return (
    <div className="flex items-center justify-between group/stat">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${colors[color]} border group-hover/stat:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white truncate">{value}</span>
            <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`}>
              {trend}
            </span>
          </div>
        </div>
      </div>
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-lg text-gray-500 opacity-0 group-hover/stat:opacity-100 transition-all border border-gray-200 dark:border-white/10">
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}
