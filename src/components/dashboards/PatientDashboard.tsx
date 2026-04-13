import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Pill, 
  Clock, 
  ArrowRight, 
  Heart,
  Thermometer,
  Droplets,
  Wind,
  ChevronRight,
  Plus,
  Bell,
  CheckCircle2,
  TrendingUp,
  Search,
  Star,
  User,
  MessageSquare,
  Loader2,
  ArrowUpRight,
  Stethoscope,
  Shield,
  BookOpen,
  Ambulance,
  Navigation,
  Truck,
  Package
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { io } from 'socket.io-client';
import HealthInsights from '../HealthInsights';

export default function PatientDashboard({ user }: any) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [patientData, setPatientData] = React.useState<any>(null);
  const [labReports, setLabReports] = React.useState<any[]>([]);
  const [iotDevices, setIotDevices] = React.useState<any[]>([]);
  const [queueStatus, setQueueStatus] = React.useState<any>(null);
  const [ambulanceRequests, setAmbulanceRequests] = React.useState<any[]>([]);
  const [medicineOrders, setMedicineOrders] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loadingDoctors, setLoadingDoctors] = React.useState(false);
  const [ratingDoctor, setRatingDoctor] = React.useState<any>(null);
  const [ratingValue, setRatingValue] = React.useState(5);
  const [ratingComment, setRatingComment] = React.useState('');
  const [isSubmittingRating, setIsSubmittingRating] = React.useState(false);

  React.useEffect(() => {
    fetchDoctors();
    fetchPatientData();
    fetchLabReports();
    fetchMyIoTDevices();
    fetchQueueStatus();
    fetchAmbulanceRequests();
    fetchMedicineOrders();
    
    const socket = io(window.location.origin);
    
    socket.on('lab_report_updated', () => {
      fetchLabReports();
    });
    
    socket.on('patient_updated', () => {
      fetchPatientData();
    });

    socket.on('iot_device_updated', (updatedDevice: any) => {
      setIotDevices(prev => prev.map(d => d._id === updatedDevice._id ? updatedDevice : d));
    });

    socket.on('queue_updated', () => {
      fetchQueueStatus();
    });

    socket.on('ambulance_request_updated', () => {
      fetchAmbulanceRequests();
    });

    socket.on('medicine_order_updated', () => {
      fetchMedicineOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchQueueStatus = async () => {
    try {
      const res = await fetch('/api/advanced/queue/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQueueStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch queue status:', err);
    }
  };

  const fetchAmbulanceRequests = async () => {
    try {
      const res = await fetch('/api/advanced/ambulances/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAmbulanceRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch ambulance requests:', err);
    }
  };

  const fetchMedicineOrders = async () => {
    try {
      const res = await fetch('/api/pharmacy/orders/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMedicineOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch medicine orders:', err);
    }
  };

  const fetchMyIoTDevices = async () => {
    try {
      const res = await fetch('/api/iot/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIotDevices(data);
      }
    } catch (err) {
      console.error('Failed to fetch IoT devices:', err);
    }
  };

  const fetchLabReports = async () => {
    try {
      const res = await fetch('/api/lab-reports/my-reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLabReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch lab reports:', err);
    }
  };

  const fetchPatientData = async () => {
    try {
      const res = await fetch('/api/patients/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      }
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await fetch('/api/doctors/approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctors(data);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleRateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingDoctor) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch('/api/auth/rate-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: ratingDoctor._id,
          rating: ratingValue,
          comment: ratingComment
        })
      });
      if (res.ok) {
        setRatingDoctor(null);
        setRatingComment('');
        setRatingValue(5);
        fetchDoctors();
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.doctorType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-600 dark:text-indigo-200 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-500/20 backdrop-blur-sm">
              <Activity className="w-3 h-3" />
              Health Summary • {iotDevices.some(d => d.status === 'Warning' || d.status === 'Error') ? 'Attention Required' : (patientData?.vitals?.status || 'Good')}
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-display font-bold mb-6 tracking-tight leading-tight break-words">
              Hello, <br />
              <span className="text-indigo-600 dark:text-indigo-400">{user?.username}</span>
            </h2>
            <p className="text-gray-600 dark:text-indigo-100/70 text-base lg:text-lg font-medium mb-8 lg:mb-10 leading-relaxed">
              Your health summary is looking <span className="text-gray-900 dark:text-white font-bold">{patientData?.vitals?.status === 'Normal' ? 'excellent' : 'stable'}</span> today. 
              {patientData?.appointments?.[0] ? (
                <>
                  You have a follow-up appointment with <span className="text-indigo-600 dark:text-indigo-300 font-bold underline underline-offset-4">{patientData.appointments[0].doctorName}</span> at <span className="text-gray-900 dark:text-white font-bold">{patientData.appointments[0].time}</span>.
                </>
              ) : (
                <>No appointments scheduled for today.</>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/records" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 lg:px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-black/10 dark:shadow-black/20 text-sm lg:text-base">
                <FileText className="w-5 h-5" />
                View My Records
              </Link>
              <Link to="/pharmacy" className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-6 lg:px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 text-sm lg:text-base">
                <Pill className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                My Prescriptions
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/5 dark:from-indigo-600/10 to-transparent -z-0" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-5 dark:opacity-10 group-hover:translate-x-10 transition-transform duration-1000" />
        
        {/* Floating Stat Card */}
        <div className="absolute top-12 right-12 hidden xl:block">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-[2rem] w-64 shadow-xl dark:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className={`text-[10px] font-bold ${iotDevices.find(d => d.vitals?.hr)?.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {iotDevices.find(d => d.vitals?.hr)?.status || 'Normal'}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
              {iotDevices.find(d => d.vitals?.hr)?.vitals.hr ? `${iotDevices.find(d => d.vitals?.hr).vitals.hr} bpm` : (patientData?.vitals?.heartRate || '72 bpm')}
            </p>
            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">Real-time Heart Rate</p>
          </motion.div>
        </div>
      </motion.div>

      {/* AI Health Insights */}
      <motion.div variants={itemVariants}>
        <HealthInsights patientData={patientData} />
      </motion.div>

      {/* Virtual Queue Management */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Queue Status */}
        <div className="bg-blue-600/5 dark:bg-blue-900/20 rounded-[3rem] border border-blue-500/20 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="p-8 border-b border-blue-500/20 flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500 animate-pulse" />
                Queue Status
              </h3>
              <p className="text-[8px] text-blue-600 dark:text-blue-200/70 font-bold uppercase tracking-widest">Real-time wait times</p>
            </div>
            <Link to="/map" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] transition-colors shadow-lg shadow-blue-500/20 shrink-0">
              Check-in
            </Link>
          </div>
          <div className="grid grid-cols-2 divide-x divide-blue-500/20 relative z-10">
            <div className="p-6 bg-gray-100/50 dark:bg-black/20">
              <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Position</p>
              <p className="text-lg font-display font-bold text-gray-900 dark:text-white">
                {queueStatus?.inQueue ? `#${queueStatus.position}` : 'None'}
              </p>
            </div>
            <div className="p-6 bg-gray-100/50 dark:bg-black/20">
              <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Wait Time</p>
              <p className="text-lg font-display font-bold text-gray-900 dark:text-white">
                {queueStatus?.inQueue ? `${queueStatus.estimatedWait}m` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Active Ambulance */}
        <div className="bg-red-600/5 dark:bg-red-900/20 rounded-[3rem] border border-red-500/20 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="p-8 border-b border-red-500/20 flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Ambulance className="w-6 h-6 text-red-600 dark:text-red-500 animate-pulse" />
                Ambulance Tracking
              </h3>
              <p className="text-[8px] text-red-600 dark:text-red-200/70 font-bold uppercase tracking-widest">Emergency Assistance</p>
            </div>
            <Link to="/ambulance" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-[10px] transition-colors shadow-lg shadow-red-500/20 shrink-0">
              Call Now
            </Link>
          </div>
          <div className="p-6 bg-gray-100/50 dark:bg-black/20 relative z-10">
            {ambulanceRequests.find(r => ['Pending', 'Accepted', 'Dispatched', 'Arrived'].includes(r.status)) ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <Navigation className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-gray-900 dark:text-white">
                      {ambulanceRequests.find(r => ['Pending', 'Accepted', 'Dispatched', 'Arrived'].includes(r.status)).status}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ambulanceRequests.find(r => ['Pending', 'Accepted', 'Dispatched', 'Arrived'].includes(r.status)).ambulance_id?.vehicle_number || 'Assigning...'}
                    </p>
                  </div>
                </div>
                <Link to="/ambulance" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">Track on Map</Link>
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-500 text-center py-2">No active ambulance requests</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Medicine Delivery Tracking */}
      {medicineOrders.some(o => ['Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.status)) && (
        <motion.div 
          variants={itemVariants}
          className="bg-green-600/5 dark:bg-green-900/20 rounded-[3rem] border border-green-500/20 overflow-hidden relative group mb-8"
        >
          <div className="p-8 border-b border-green-500/20 flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Truck className="w-6 h-6 text-green-600 dark:text-green-500" />
                Medicine Delivery
              </h3>
              <p className="text-[8px] text-green-600 dark:text-green-200/70 font-bold uppercase tracking-widest">Track your orders</p>
            </div>
            <Link to="/pharmacy" className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">View All Orders</Link>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {medicineOrders.filter(o => ['Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.status)).slice(0, 3).map((order) => (
              <div key={order._id} className="bg-gray-100/50 dark:bg-black/40 p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500">#{order._id.slice(-6)}</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-green-500/20">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {order.medicines.map((m: any) => m.medicine_id?.brand_name).join(', ')}
                    </p>
                    <p className="text-[10px] text-gray-500">ETA: {order.status === 'Out for Delivery' ? '15-30 mins' : 'Today'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Health Vitals */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <VitalCard 
          icon={Heart} 
          label="Heart Rate" 
          value={iotDevices.find(d => d.lastReading?.hr)?.lastReading.hr ? `${iotDevices.find(d => d.lastReading?.hr).lastReading.hr} bpm` : (patientData?.vitals?.heartRate || "72 bpm")} 
          status={iotDevices.find(d => d.lastReading?.hr)?.status || (patientData?.vitals?.status || "Normal")} 
          color="red" 
          variants={itemVariants} 
        />
        <VitalCard 
          icon={Thermometer} 
          label="Body Temp" 
          value={iotDevices.find(d => d.lastReading?.temp)?.lastReading.temp ? `${iotDevices.find(d => d.lastReading?.temp).lastReading.temp} °C` : (patientData?.vitals?.bodyTemp || "36.6 °C")} 
          status={iotDevices.find(d => d.lastReading?.temp)?.status || (patientData?.vitals?.status || "Normal")} 
          color="orange" 
          variants={itemVariants} 
        />
        <VitalCard 
          icon={Droplets} 
          label="Blood Pressure" 
          value={iotDevices.find(d => d.lastReading?.bp)?.lastReading.bp || (patientData?.vitals?.bloodPressure || "120/80")} 
          status={iotDevices.find(d => d.lastReading?.bp)?.status || (patientData?.vitals?.status || "Normal")} 
          color="blue" 
          variants={itemVariants} 
        />
        <VitalCard 
          icon={Wind} 
          label="Oxygen Level" 
          value={iotDevices.find(d => d.lastReading?.spo2)?.lastReading.spo2 ? `${iotDevices.find(d => d.lastReading?.spo2).lastReading.spo2}%` : (patientData?.vitals?.oxygenLevel || "98%")} 
          status={iotDevices.find(d => d.lastReading?.spo2)?.status || (patientData?.vitals?.status || "Normal")} 
          color="green" 
          variants={itemVariants} 
        />
      </motion.div>

      {/* Lab Reports Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 dark:bg-white/2 rounded-[2rem] lg:rounded-[3rem] border border-gray-200 dark:border-white/5 overflow-hidden"
      >
        <div className="p-8 lg:p-12 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter flex items-center gap-4">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              {t('lab_reports')}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">Your diagnostic history and results</p>
          </div>
        </div>
        <div className="p-8 lg:p-12">
          {labReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {labReports.map((report) => (
                <motion.div 
                  key={report._id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm dark:shadow-none"
                >
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-display font-bold text-xl">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                      report.status === 'Completed' 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{report.test_name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 mb-6">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">"{report.result_details}"</p>
                    </div>
                    <button className="w-full py-4 bg-gray-900 dark:bg-white/5 border border-gray-900 dark:border-white/10 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-blue-600 hover:border-blue-500 transition-all flex items-center justify-center gap-3">
                      <ArrowUpRight className="w-4 h-4" />
                      View Full Report
                    </button>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No lab reports found.</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Prescriptions */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-gray-50 dark:bg-white/2 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col group"
        >
          <div className="p-6 lg:p-10 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                <Pill className="w-6 h-6 text-indigo-600" />
                Active Prescriptions
              </h3>
              <p className="text-sm text-gray-500 font-medium">Your current medication schedule.</p>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline underline-offset-4 text-left">View All</button>
          </div>
          <motion.div 
            variants={containerVariants}
            className="divide-y divide-gray-200 dark:divide-white/5"
          >
            {patientData?.prescriptions?.length > 0 ? (
              patientData.prescriptions.map((p: any, i: number) => (
                <PrescriptionItem 
                  key={i}
                  medicine={p.medicine} 
                  dosage={p.dosage} 
                  duration={p.duration} 
                  status={p.status} 
                  color={p.color || 'blue'}
                  variants={itemVariants}
                />
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">No active prescriptions</div>
            )}
          </motion.div>
          <div className="p-8 mt-auto bg-gray-100/30 dark:bg-white/2 text-center">
            <button className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 mx-auto">
              Request Refill
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 dark:bg-white/2 p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-200 dark:border-white/5 flex flex-col group"
        >
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white">Appointments</h3>
            <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <motion.div 
            variants={containerVariants}
            className="space-y-6"
          >
            {patientData?.appointments?.length > 0 ? (
              patientData.appointments.map((a: any, i: number) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className={`p-6 lg:p-8 ${i === 0 ? 'bg-indigo-600/5 dark:bg-indigo-900/20 border-indigo-500/20' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5'} border rounded-[2rem] text-gray-900 dark:text-white relative overflow-hidden group/card backdrop-blur-sm shadow-sm dark:shadow-none`}
                >
                  <div className="relative z-10">
                    <p className={`text-[10px] font-bold ${i === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'} uppercase tracking-widest mb-4`}>{a.time}</p>
                    <p className="text-xl lg:text-2xl font-display font-bold mb-1">{a.doctorName}</p>
                    <p className={`text-sm ${i === 0 ? 'text-indigo-600/70 dark:text-indigo-200/70' : 'text-gray-500'} mb-8 font-medium`}>{a.type}</p>
                    {i === 0 && (
                      <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-indigo-900 rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all">
                        Reschedule
                      </button>
                    )}
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700" />
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem]">
                No upcoming appointments
              </div>
            )}
          </motion.div>
          <button className="mt-8 w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-sm font-bold text-gray-500 dark:text-gray-600 hover:border-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Book New Appointment
          </button>
        </motion.div>
      </div>

      {/* Find Doctors Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gray-50 dark:bg-white/2 rounded-[2rem] lg:rounded-[3rem] border border-gray-200 dark:border-white/5 overflow-hidden"
      >
        <div className="p-8 lg:p-12 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter flex items-center gap-4">
              <Stethoscope className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
              Find Specialists
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.3em]">Browse and rate our medical professionals</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR TYPE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-bold tracking-[0.2em] focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="p-8 lg:p-12">
          {loadingDoctors ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-500 animate-spin" />
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest">Scanning Medical Registry...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredDoctors.map((doc) => (
                <motion.div 
                  key={doc._id}
                  whileHover={{ y: -10 }}
                  className="bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm dark:shadow-none"
                >
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-display font-bold text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {doc.fullName?.[0] || doc.username[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">{doc.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <span className="text-[8px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">({doc.ratings?.length || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mb-8">
                    <h4 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{doc.fullName || doc.username}</h4>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4">{doc.doctorType || 'General Practitioner'}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {doc.gender}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {doc.age} Years
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setRatingDoctor(doc)}
                    className="w-full py-4 bg-gray-900 dark:bg-white/5 border border-gray-900 dark:border-white/10 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-500 transition-all flex items-center justify-center gap-3 relative z-10"
                  >
                    <Star className="w-4 h-4" />
                    Rate Doctor
                  </button>

                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Rate Experience</h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Dr. {ratingDoctor.fullName || ratingDoctor.username}</p>
                </div>
                <button onClick={() => setRatingDoctor(null)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleRateDoctor} className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Select Rating</label>
                  <div className="flex items-center justify-center gap-4 py-6 bg-white/2 rounded-[2rem] border border-white/5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingValue(star)}
                        className={`p-2 transition-all ${ratingValue >= star ? 'text-amber-400 scale-125' : 'text-gray-800 hover:text-gray-600'}`}
                      >
                        <Star className={`w-8 h-8 ${ratingValue >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Your Feedback</label>
                  <textarea
                    required
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[150px] resize-none"
                    placeholder="Describe your experience with this doctor..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmittingRating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VitalCard({ icon: Icon, label, value, status, color, variants }: any) {
  const colors: any = {
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/2 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-white/5 relative overflow-hidden group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-3 lg:p-4 rounded-2xl ${colors[color]} border group-hover:scale-110 transition-transform duration-300 relative`}>
          <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
          {label === 'Heart Rate' && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 bg-red-500/20 rounded-2xl -z-10"
            />
          )}
        </div>
        <span className="text-[8px] lg:text-[10px] font-bold text-green-500 bg-green-500/10 px-2 lg:px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">{status}</span>
      </div>
      <div className="relative z-10 min-w-0">
        <p className="text-2xl lg:text-3xl font-display font-bold text-white mb-1 tracking-tight truncate">{value}</p>
        <p className="text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{label}</p>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
    </motion.div>
  );
}

function PrescriptionItem({ medicine, dosage, duration, status, color, variants }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  return (
    <motion.div 
      variants={variants}
      whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-600 gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8">
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all border border-white/5">
          <Pill className="w-6 h-6 lg:w-7 lg:h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base lg:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{medicine}</p>
          <p className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-tight truncate">{dosage} • {duration}</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6">
        <span className={`px-3 lg:px-4 py-1.5 rounded-xl text-[8px] lg:text-[10px] font-bold uppercase tracking-widest border ${colors[color]}`}>
          {status}
        </span>
        <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/5">
          <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
      </div>
    </motion.div>
  );
}
