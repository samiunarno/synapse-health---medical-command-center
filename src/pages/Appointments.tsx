import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Calendar, Clock, Video, Users, CheckCircle, CreditCard, QrCode, Loader2, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { suggestDoctor } from '../lib/kimi';

export default function Appointments() {
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

  const handlePay = async () => {
    if (!paymentModal.appointmentId) return;
    setProcessingPayment(true);
    
    // Simulate QR scan delay
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/appointments/${paymentModal.appointmentId}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ method: paymentMethod })
        });
        if (res.ok) {
          setPaymentModal({ isOpen: false, appointmentId: null });
          fetchAppointments();
        }
      } catch (error) {
        console.error('Payment failed', error);
      } finally {
        setProcessingPayment(false);
      }
    }, 2000);
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

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Appointments</h1>
          <p className="text-gray-400">Manage your consultations and payments.</p>
        </div>
        {user?.role === 'Patient' && (
          <button
            onClick={() => setIsBooking(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            Book Appointment
          </button>
        )}
      </header>

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
              <h2 className="text-2xl font-bold text-white mb-6">Book Consultation</h2>
              
              {/* Smart Match Section */}
              <div className="mb-6 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  AI Smart Triage
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Describe your symptoms..."
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
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">AI Recommendation:</p>
                    <p className="text-xs text-white font-medium mb-1">Recommended Specialty: {matchResult.specialty}</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{matchResult.reasoning}</p>
                  </motion.div>
                )}
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Doctor</label>
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

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Scan to Pay</h2>
              <p className="text-gray-400 mb-6">Fee: $150.00</p>
              
              <div className="flex justify-center gap-4 mb-6">
                <button 
                  onClick={() => setPaymentMethod('Alipay')}
                  className={`px-4 py-2 rounded-xl border ${paymentMethod === 'Alipay' ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 text-gray-400'}`}
                >
                  Alipay
                </button>
                <button 
                  onClick={() => setPaymentMethod('WeChat')}
                  className={`px-4 py-2 rounded-xl border ${paymentMethod === 'WeChat' ? 'border-green-500 bg-green-500/20 text-white' : 'border-white/10 text-gray-400'}`}
                >
                  WeChat Pay
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                {/* Mock QR Code */}
                <div className="w-48 h-48 bg-black flex items-center justify-center">
                  <span className="text-white text-xs">QR CODE</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={processingPayment}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {processingPayment ? 'Processing...' : 'I have paid'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointments List */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-400">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-400">No appointments found.</p>
        ) : (
          appointments.map((appt) => (
            <div key={appt._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${appt.type === 'Virtual' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {appt.type === 'Virtual' ? <Video className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {user?.role === 'Patient' ? `Dr. ${appt.doctor_id?.name}` : `Patient: ${appt.patient_id?.name}`}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(appt.date).toLocaleDateString()}</span>
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

                {/* Actions */}
                {appt.status === 'Confirmed' && (
                  <div className="flex gap-2 ml-4">
                    {appt.type === 'Virtual' && appt.meeting_link && (
                      <Link to={`/video-conference?room=${appt._id}`} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm">
                        Join Call
                      </Link>
                    )}
                    {appt.type === 'In-Person' && user?.role === 'Patient' && (
                      <button onClick={() => alert('Checked in successfully! Please wait in the lobby.')} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
                        Self Check-in
                      </button>
                    )}
                    
                    {user?.role === 'Doctor' && !appt.doctor_done && (
                      <button onClick={() => handleMarkDone(appt._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">
                        Mark Done
                      </button>
                    )}
                    {user?.role === 'Patient' && appt.status === 'Completed' && (
                      <button onClick={() => alert('Feedback form opened. Thank you for your feedback!')} className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold text-sm hover:bg-indigo-600/30 transition-colors">
                        Leave Feedback
                      </button>
                    )}
                    {user?.role === 'Patient' && !appt.patient_done && (
                      <button onClick={() => handleMarkDone(appt._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">
                        Mark Done
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
