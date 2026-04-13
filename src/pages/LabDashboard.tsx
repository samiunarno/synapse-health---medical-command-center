import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Activity,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';

interface LabReport {
  _id: string;
  patient_id: {
    _id: string;
    fullName: string;
    username: string;
    email: string;
  };
  test_name: string;
  test_date: string;
  result_details: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export default function LabDashboard() {
  const { t } = useTranslation();
  const [reports, setReports] = React.useState<LabReport[]>([]);
  const [loading, ReactSetLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [patients, setPatients] = React.useState<any[]>([]);
  
  const [formData, setFormData] = React.useState({
    patient_id: '',
    test_name: '',
    result_details: '',
    status: 'Pending'
  });

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/lab-reports/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      ReactSetLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data.filter((u: any) => u.role === 'Patient'));
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  React.useEffect(() => {
    fetchReports();
    fetchPatients();
    
    const socket = io(window.location.origin);
    
    socket.on('lab_report_updated', () => {
      fetchReports();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lab-reports/publish', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ patient_id: '', test_name: '', result_details: '', status: 'Pending' });
        fetchReports();
      }
    } catch (error) {
      console.error('Error publishing report:', error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      const res = await fetch(`/api/lab-reports/update-status/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredReports = reports.filter(r => 
    r.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient_id.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient_id.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: t('total_reports'), value: reports.length, icon: FileText, color: 'blue' },
    { label: t('completed'), value: reports.filter(r => r.status === 'Completed').length, icon: CheckCircle2, color: 'green' },
    { label: t('pending'), value: reports.filter(r => r.status === 'Pending').length, icon: Clock, color: 'yellow' },
    { label: t('critical_tests'), value: reports.filter(r => r.result_details.toLowerCase().includes('critical')).length, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase mb-2">
            {t('lab_reports')}
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            Diagnostic Interface v4.2
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-500 shadow-2xl shadow-white/10 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          {t('publish_report')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-dark p-8 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500 ${
                stat.color === 'blue' ? 'bg-blue-600/20 text-blue-500' :
                stat.color === 'green' ? 'bg-green-600/20 text-green-500' :
                stat.color === 'yellow' ? 'bg-yellow-600/20 text-yellow-500' :
                'bg-red-600/20 text-red-500'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-white tracking-tighter">{stat.value}</h3>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-transform duration-700 group-hover:scale-150 ${
              stat.color === 'blue' ? 'bg-blue-600' :
              stat.color === 'green' ? 'bg-green-600' :
              stat.color === 'yellow' ? 'bg-yellow-600' :
              'bg-red-600'
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="glass-dark rounded-[3rem] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight">{t('view_reports')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500/50 outline-none w-full md:w-64 transition-all"
              />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2">
                <th className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{t('patient_name')}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{t('test_name')}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{t('date')}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{t('status')}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report) => (
                  <motion.tr
                    key={report._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-500/20">
                          {report.patient_id.fullName?.[0] || report.patient_id.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">{report.patient_id.fullName || report.patient_id.username}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{report.patient_id.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{report.test_name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(report._id, report.status)}
                        className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${
                          report.status === 'Completed' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                        }`}
                      >
                        {report.status}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all group/btn">
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-dark rounded-[3rem] p-12 border border-white/10 shadow-2xl"
            >
              <h2 className="text-3xl font-display font-bold uppercase tracking-tighter mb-8">{t('publish_report')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">{t('patient_name')}</label>
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                  >
                    <option value="" className="bg-black text-white">SELECT PATIENT</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id} className="bg-black text-white">
                        {p.fullName || p.username} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">{t('test_name')}</label>
                  <input
                    required
                    type="text"
                    value={formData.test_name}
                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                    placeholder="E.G. BLOOD ANALYSIS, MRI SCAN..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500/50 outline-none uppercase tracking-widest"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">{t('result')}</label>
                  <textarea
                    required
                    value={formData.result_details}
                    onChange={(e) => setFormData({ ...formData, result_details: e.target.value })}
                    placeholder="ENTER DETAILED DIAGNOSTIC RESULTS..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500/50 outline-none uppercase tracking-widest resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">{t('status')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                    >
                      <option value="Pending" className="bg-black text-white">PENDING</option>
                      <option value="Completed" className="bg-black text-white">COMPLETED</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-500 transition-all duration-500 shadow-xl shadow-blue-600/20"
                    >
                      {t('publish_report')}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
