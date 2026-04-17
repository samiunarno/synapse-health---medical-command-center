import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Users, 
  CheckCircle, 
  CreditCard, 
  QrCode, 
  Loader2, 
  Brain, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns,
  Square,
  List as ListIcon,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { suggestDoctor } from '../services/aiService';
import { useTranslation } from 'react-i18next';
import PaymentGateway from '../components/PaymentGateway';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  parseISO,
  isToday,
  subDays
} from 'date-fns';

type ViewMode = 'month' | 'week' | 'day' | 'list';

export default function Appointments() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('In-Person');
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, appointmentId: string | null }>({ isOpen: false, appointmentId: null });
  const [paymentMethod, setPaymentMethod] = useState('Alipay');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ doctorId: string, reasoning: string, specialty: string } | null>(null);
  
  // Calendar States
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'Patient') {
      fetchDoctors();
    }
    
    const socket = io(window.location.origin);
    
    socket.on('appointment_created', (newAppointment) => {
      if (newAppointment.patient_id._id === user?.id || newAppointment.doctor_id._id === user?.id) {
        setAppointments(prev => [...prev, newAppointment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    });
    
    socket.on('appointment_updated', (updatedAppointment) => {
      if (updatedAppointment.patient_id._id === user?.id || updatedAppointment.doctor_id._id === user?.id) {
        setAppointments(prev => prev.map(a => a._id === updatedAppointment._id ? updatedAppointment : a));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors/approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor,
          date,
          time,
          type,
          fee: 150 // Fixed fee for demo
        })
      });
      if (res.ok) {
        const newAppt = await res.json();
        setIsBooking(false);
        fetchAppointments();
        setPaymentModal({ isOpen: true, appointmentId: newAppt._id });
      }
    } catch (error) {
      console.error('Failed to book appointment', error);
    }
  };

  const handlePay = async (method: string) => {
    if (!paymentModal.appointmentId) return;
    
    try {
      const res = await fetch(`/api/appointments/${paymentModal.appointmentId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Payment failed', error);
      throw error; // Let the gateway handle the error state if needed
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/done`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to mark done', error);
    }
  };

  const handleSmartMatch = async () => {
    if (!symptoms.trim()) return;
    setIsMatching(true);
    setMatchResult(null);
    try {
      const result = await suggestDoctor(symptoms, doctors);
      setMatchResult({
        doctorId: result.suggestedDoctorId,
        reasoning: result.reasoning,
        specialty: result.specialtyRecommended
      });
      setSelectedDoctor(result.suggestedDoctorId);
    } catch (error) {
      console.error('Smart match failed', error);
    } finally {
      setIsMatching(false);
    }
  };

  // Calendar Navigation
  const next = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const resetToToday = () => setCurrentDate(new Date());

  // Calendar Render Helpers
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">{t('appointments')}</h1>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
          <button 
            onClick={() => setViewMode('month')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Month View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Week View"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('day')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Day View"
          >
            <Square className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <button onClick={prev} className="p-1 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-bold min-w-[140px] text-center">
            {viewMode === 'day' ? format(currentDate, 'MMM d, yyyy') : format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={next} className="p-1 text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <button onClick={resetToToday} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-all">
          Today
        </button>

        {user?.role === 'Patient' && (
          <button
            onClick={() => setIsBooking(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('book_appointment')}
          </button>
        )}
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayAppointments = appointments.filter(a => {
          if (!a.date || !a.time) return false;
          try {
            return isSameDay(parseISO(a.date), cloneDay);
          } catch {
            return false;
          }
        });
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border border-white/5 transition-all ${
              !isSameMonth(day, monthStart) ? "bg-black/20 text-gray-600" : "bg-white/5 text-white"
            } ${isToday(day) ? "ring-1 ring-inset ring-blue-500/50" : ""}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold ${isToday(day) ? "bg-blue-600 text-white px-2 py-0.5 rounded-full" : ""}`}>
                {formattedDate}
              </span>
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map(appt => (
                <button
                  key={appt._id}
                  onClick={() => setSelectedAppointment(appt)}
                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-medium truncate border ${
                    appt.status === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    appt.status === 'Confirmed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {appt.time} - {user?.role === 'Patient' ? appt.doctor_id?.name : appt.patient_id?.name}
                </button>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-[10px] text-gray-500 text-center font-bold">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a]">
        <div className="grid grid-cols-7 bg-white/5 border-b border-white/10">
          {weekDays.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const days = eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, 6)
    });

    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

    return (
      <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] flex flex-col h-[700px]">
        <div className="grid grid-cols-8 bg-white/5 border-b border-white/10 sticky top-0 z-10">
          <div className="p-3 border-r border-white/10"></div>
          {days.map(day => (
            <div key={day.toString()} className={`p-3 text-center border-r border-white/10 last:border-0 ${isToday(day) ? "bg-blue-600/10" : ""}`}>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{format(day, 'EEE')}</div>
              <div className={`text-lg font-bold ${isToday(day) ? "text-blue-400" : "text-white"}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8">
            <div className="col-span-1 border-r border-white/10">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-white/5 p-2 text-[10px] font-bold text-gray-600 text-right">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
              ))}
            </div>
            {days.map(day => (
              <div key={day.toString()} className="col-span-1 border-r border-white/10 last:border-0 relative">
                {hours.map(hour => (
                  <div key={hour} className="h-20 border-b border-white/5"></div>
                ))}
                {appointments
                  .filter(a => {
                    if (!a.date || !a.time) return false;
                    try {
                      return isSameDay(parseISO(a.date), day);
                    } catch {
                      return false;
                    }
                  })
                  .map(appt => {
                    const timeStr = appt.time || "08:00";
                    const [h, m] = timeStr.split(':').map(Number);
                    if (isNaN(h) || isNaN(m)) return null;
                    if (h < 8 || h > 22) return null;
                    const top = ((h - 8) * 80) + (m / 60 * 80);
                    return (
                      <button
                        key={appt._id}
                        onClick={() => setSelectedAppointment(appt)}
                        className={`absolute left-1 right-1 p-2 rounded-xl text-[10px] font-bold border shadow-lg z-20 transition-all hover:scale-[1.02] ${
                          appt.status === 'Completed' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                          appt.status === 'Confirmed' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                          'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                        }`}
                        style={{ top: `${top}px`, height: '70px' }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          {appt.time}
                        </div>
                        <div className="truncate">
                          {user?.role === 'Patient' ? `Dr. ${appt.doctor_id?.name}` : appt.patient_id?.name}
                        </div>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8);
    const dayAppointments = appointments.filter(a => {
      if (!a.date || !a.time) return false;
      try {
        return isSameDay(parseISO(a.date), currentDate);
      } catch {
        return false;
      }
    });

    return (
      <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] flex flex-col h-[700px]">
        <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{format(currentDate, 'EEEE, MMMM d')}</h2>
            <p className="text-sm text-gray-400">{dayAppointments.length} appointments scheduled</p>
          </div>
          {isToday(currentDate) && (
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Today</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="flex items-start gap-4 h-24 border-b border-white/5 last:border-0">
                <span className="text-xs font-bold text-gray-600 w-16 text-right pt-1">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </span>
                <div className="flex-1"></div>
              </div>
            ))}
            {dayAppointments.map(appt => {
              const timeStr = appt.time || "08:00";
              const [h, m] = timeStr.split(':').map(Number);
              if (isNaN(h) || isNaN(m)) return null;
              if (h < 8 || h > 22) return null;
              const top = ((h - 8) * 96) + (m / 60 * 96);
              return (
                <motion.button
                  key={appt._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedAppointment(appt)}
                  className={`absolute left-20 right-0 p-4 rounded-2xl border shadow-xl flex items-center justify-between group transition-all hover:ring-2 hover:ring-white/20 ${
                    appt.status === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    appt.status === 'Confirmed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  }`}
                  style={{ top: `${top}px`, height: '80px' }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${appt.type === 'Virtual' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {appt.type === 'Virtual' ? <Video className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {user?.role === 'Patient' ? `Dr. ${appt.doctor_id?.name}` : `Patient: ${appt.patient_id?.name}`}
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <Clock className="w-3 h-3" /> {appt.time} • {appt.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold uppercase opacity-40">Status</p>
                      <p className="text-xs font-bold">{appt.status}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="grid gap-4">
      {appointments.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No appointments found.</p>
        </div>
      ) : (
        appointments.map((appt) => (
          <motion.div 
            key={appt._id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setSelectedAppointment(appt)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${appt.type === 'Virtual' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {appt.type === 'Virtual' ? <Video className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {user?.role === 'Patient' ? `Dr. ${appt.doctor_id?.name}` : `Patient: ${appt.patient_id?.name}`}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {new Date(appt.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {appt.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                <p className={`font-bold ${appt.status === 'Completed' ? 'text-green-400' : appt.status === 'Confirmed' ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {appt.status}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase">Payment</p>
                <p className={`font-bold ${appt.payment_status === 'Released' ? 'text-emerald-400' : appt.payment_status === 'Held' ? 'text-blue-400' : 'text-red-400'}`}>
                  {appt.payment_status}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {renderHeader()}

      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-400 animate-pulse">Synchronizing your medical schedule...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'list' && renderListView()}
          </motion.div>
        )}
      </div>

      {/* Appointment Details Sidebar/Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-[60] flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-[#0a0a0a] border-l border-white/10 h-full w-full max-w-md p-8 overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className={`p-6 rounded-3xl ${selectedAppointment.type === 'Virtual' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {selectedAppointment.type === 'Virtual' ? <Video className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {user?.role === 'Patient' ? `Dr. ${selectedAppointment.doctor_id?.name}` : `Patient: ${selectedAppointment.patient_id?.name}`}
                    </h3>
                    <p className="text-blue-400 font-medium">{selectedAppointment.type} Consultation</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-white font-bold">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time</p>
                    <p className="text-white font-bold">{selectedAppointment.time}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${selectedAppointment.status === 'Completed' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                      <span className="text-sm font-bold text-white">Status</span>
                    </div>
                    <span className={`text-sm font-bold ${selectedAppointment.status === 'Completed' ? 'text-green-400' : 'text-blue-400'}`}>{selectedAppointment.status}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-white">Payment</span>
                    </div>
                    <span className={`text-sm font-bold ${selectedAppointment.payment_status === 'Released' ? 'text-emerald-400' : 'text-blue-400'}`}>{selectedAppointment.payment_status}</span>
                  </div>
                </div>

                {selectedAppointment.status === 'Confirmed' && (
                  <div className="pt-8 space-y-4">
                    {selectedAppointment.type === 'Virtual' && (
                      <Link 
                        to={`/video-conference?room=${selectedAppointment._id}`} 
                        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
                      >
                        <Video className="w-5 h-5" />
                        Join Video Consultation
                      </Link>
                    )}
                    
                    {user?.role === 'Doctor' && !selectedAppointment.doctor_done && (
                      <button 
                        onClick={() => {
                          handleMarkDone(selectedAppointment._id);
                          setSelectedAppointment(null);
                        }} 
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Complete Consultation
                      </button>
                    )}

                    {user?.role === 'Patient' && !selectedAppointment.patient_done && (
                      <button 
                        onClick={() => {
                          handleMarkDone(selectedAppointment._id);
                          setSelectedAppointment(null);
                        }} 
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Confirm Completion
                      </button>
                    )}
                  </div>
                )}

                {selectedAppointment.status === 'Completed' && user?.role === 'Patient' && (
                  <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                    Leave a Review
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t('book_consultation')}</h2>
              
              {/* Smart Match Section */}
              <div className="mb-6 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  AI Smart Triage
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('describe_symptoms')}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSmartMatch}
                    disabled={isMatching || !symptoms.trim()}
                    className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50"
                  >
                    {isMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
                {matchResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5"
                  >
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">{t('ai_recommendation')}</p>
                    <p className="text-xs text-white font-medium mb-1">{t('recommended_specialty')} {matchResult.specialty}</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{matchResult.reasoning}</p>
                  </motion.div>
                )}
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('select_doctor')}</label>
                  <select
                    required
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="">Choose...</option>
                    {doctors.map(d => (
                      <option key={d.user_id._id} value={d.user_id._id}>{d.user_id.name} - {d.specialization}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Virtual">Virtual (Telemedicine)</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsBooking(false)} className="flex-1 py-3 bg-white/5 text-white rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Proceed to Pay</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Payment Gateway */}
      <PaymentGateway
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, appointmentId: null })}
        onSuccess={handlePay}
        amount={150}
        description={`Consultation with ${doctors.find(d => d.user_id._id === selectedDoctor)?.user_id.name || 'Specialist'}`}
        appointmentId={paymentModal.appointmentId || ''}
      />

      {/* Appointments List removed in favor of Calendar View */}
    </div>
  );
}
