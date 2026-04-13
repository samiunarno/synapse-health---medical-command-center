import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  ShieldCheck, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  ChevronRight,
  Loader2,
  Bell,
  Syringe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VaccinationTracker() {
  const { user, token } = useAuth();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    vaccineName: '',
    doseNumber: 1,
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/advanced/vaccinations/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVaccinations(data);
    } catch (err) {
      console.error('Failed to fetch vaccinations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/advanced/vaccinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchVaccinations();
      }
    } catch (err) {
      console.error('Failed to add vaccination:', err);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Vaccination <span className="text-blue-500">Tracker</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage your immunization schedule and stay protected.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Add Vaccination
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Summary Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-[2.5rem] p-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Immunity Status</h3>
            <p className="text-sm text-blue-100/70 leading-relaxed font-medium">
              You have {vaccinations.filter(v => v.status === 'Administered').length} completed vaccinations. Stay up to date for maximum protection.
            </p>
          </div>

          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Upcoming Reminders</h4>
            <div className="space-y-4">
              {vaccinations.filter(v => v.status === 'Scheduled').slice(0, 2).map((v, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{v.vaccineName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Due: {new Date(v.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {vaccinations.filter(v => v.status === 'Scheduled').length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">No upcoming vaccinations.</p>
              )}
            </div>
          </div>
        </div>

        {/* Vaccination List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-display font-bold text-white mb-8 flex items-center gap-3">
              <Syringe className="w-5 h-5 text-blue-500" />
              Immunization History
            </h3>

            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading Records...</p>
              </div>
            ) : vaccinations.length > 0 ? (
              <div className="space-y-4">
                {vaccinations.map((v) => (
                  <div key={v._id} className="group relative bg-white/2 border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          v.status === 'Administered' ? 'bg-emerald-500/20 text-emerald-500' : 
                          v.status === 'Overdue' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{v.vaccineName}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dose {v.doseNumber}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              v.status === 'Administered' ? 'text-emerald-400' : 
                              v.status === 'Overdue' ? 'text-rose-400' : 'text-blue-400'
                            }`}>{v.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                          {v.status === 'Administered' ? 'Administered On' : 'Due Date'}
                        </p>
                        <p className="text-sm text-white font-medium">
                          {new Date(v.status === 'Administered' ? v.dateAdministered : v.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                <Calendar className="w-12 h-12 text-gray-700 mb-4" />
                <h4 className="text-lg font-display font-bold text-gray-700">No Records Found</h4>
                <p className="text-gray-600 text-xs mt-2">Start tracking your vaccinations today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-tighter">Add <span className="text-blue-500">Vaccination</span></h3>
                <p className="text-gray-500 text-sm mb-8">Record a new immunization entry.</p>

                <form onSubmit={handleAdd} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Vaccine Name</label>
                    <input
                      required
                      type="text"
                      value={formData.vaccineName}
                      onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                      placeholder="e.g. COVID-19, Hepatitis B"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Dose Number</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.doseNumber}
                        onChange={(e) => setFormData({ ...formData, doseNumber: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Due Date</label>
                      <input
                        required
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Provider, batch number, etc."
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -z-0" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
