import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  FlaskConical,
  Dna,
  Microscope,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthContext';
import { format } from 'date-fns';

const TEST_TYPES = [
  { id: 'blood', name: 'Blood Panel', icon: FlaskConical, price: 45, duration: '15m' },
  { id: 'dna', name: 'Genetic Screening', icon: Dna, price: 299, duration: '45m' },
  { id: 'urine', name: 'Urinalysis', icon: Microscope, price: 25, duration: '10m' },
  { id: 'covid', name: 'COVID-19 PCR', icon: AlertCircle, price: 60, duration: '5m' },
  { id: 'allergy', name: 'Allergy Testing', icon: Stethoscope, price: 120, duration: '30m' }
];

export default function LabAppointments() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(TEST_TYPES[0]);
  const [bookingDate, setBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bookingTime, setBookingTime] = useState('09:00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/lab-appointments/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch lab appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/lab-appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          test_type: selectedTest.name,
          appointment_date: `${bookingDate}T${bookingTime}:00`,
          price: selectedTest.price
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Lab <br />
            <span className="text-transparent stroke-text">Diagnostics</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-4 flex items-center gap-3">
            <FlaskConical className="w-4 h-4 text-blue-500" />
            Schedule diagnostic tests and screenings
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 shadow-2xl shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          Book New Test
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
            <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight mb-8">Your Appointments</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <Calendar className="w-12 h-12 text-gray-800 mx-auto" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No upcoming lab tests</p>
                </div>
              ) : (
                appointments.map((app) => (
                  <div key={app._id} className="bg-white/2 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <FlaskConical className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-white uppercase tracking-tight">{app.test_type}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(app.appointment_date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(app.appointment_date), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-white">${app.price}</p>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          app.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Test Types Info */}
        <div className="space-y-8">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight mb-8">Available Tests</h3>
            <div className="space-y-4">
              {TEST_TYPES.map((test) => (
                <div key={test.id} className="p-4 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                      <test.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">{test.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{test.duration}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-blue-500">${test.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
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
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tighter mb-8 text-center">Book Diagnostic Test</h2>
              
              <form onSubmit={handleBook} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Select Test Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {TEST_TYPES.map((test) => (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => setSelectedTest(test)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                          selectedTest.id === test.id 
                            ? 'bg-blue-600/10 border-blue-500 text-blue-500' 
                            : 'bg-white/2 border-white/5 text-gray-500 hover:bg-white/5'
                        }`}
                      >
                        <test.icon className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">{test.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Date</label>
                    <input
                      type="date"
                      required
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Price</p>
                    <p className="text-3xl font-display font-bold text-white">${selectedTest.price}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/5 flex items-center gap-3 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
