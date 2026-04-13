import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  UserRound, 
  Search, 
  Plus, 
  Stethoscope, 
  Phone, 
  Mail, 
  Hospital,
  ChevronRight,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatModal from '../components/ChatModal';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

export default function Doctors() {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    specialization: '',
    department_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
    
    const socket = io(window.location.origin);
    
    socket.on('doctor_updated', () => {
      fetchDoctors();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDepartments(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          doctor_id: '',
          name: '',
          age: '',
          gender: 'Male',
          contact: '',
          specialization: '',
          department_id: ''
        });
        fetchDoctors();
      }
    } catch (err) {
      console.error('Failed to create doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    try {
      const res = await fetch(`/api/doctors/${doctorToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setDoctorToDelete(null);
        fetchDoctors();
      }
    } catch (err) {
      console.error('Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    (d.department_id?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">{t('doctors')}</h1>
          <p className="text-gray-500 font-medium">Manage medical staff and specializations.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white/2 p-4 rounded-3xl border border-white/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder={t('search_doctors_placeholder')} 
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">{t('loading_doctors')}</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">{t('no_doctors_found')}</div>
        ) : (
          filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor._id}
              whileHover={{ y: -5 }}
              className="bg-white/2 p-6 rounded-3xl border border-white/5 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-bold">
                    {doctor.name.split(' ').pop()?.[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors truncate">{doctor.name}</h3>
                    <p className="text-sm font-bold text-blue-500 uppercase tracking-tight truncate">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={() => {
                        setDoctorToDelete(doctor);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl gap-2">
                  <div className="flex items-center gap-2 text-gray-500 shrink-0">
                    <Hospital className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Dept</span>
                  </div>
                  <span className="text-sm font-bold text-white truncate">{doctor.department_id?.name || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl gap-2">
                  <div className="flex items-center gap-2 text-gray-500 shrink-0">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Contact</span>
                  </div>
                  <span className="text-sm font-bold text-white truncate">{doctor.contact}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl gap-2">
                  <div className="flex items-center gap-2 text-gray-500 shrink-0">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Doctor ID</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">{doctor.doctor_id}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  {t('view_profile')}
                </button>
                <button 
                  onClick={() => {
                    // For now, we assume the doctor has a user account with the same name or we'd need a mapping
                    // In a real app, we'd have doctor.user_id
                    // For demo, we'll just use a placeholder or the doctor's name to find a user
                    setSelectedDoctor(doctor);
                    setIsChatOpen(true);
                  }}
                  className="p-3 bg-white/5 text-gray-500 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">{t('contact_doctor')}</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">{t('add_new_doctor')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Plus className="w-6 h-6 text-gray-500 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Doctor ID</label>
                    <input
                      required
                      type="text"
                      value={formData.doctor_id}
                      onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="D-1001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Age</label>
                    <input
                      required
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="35"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="Male" className="bg-gray-900">Male</option>
                      <option value="Female" className="bg-gray-900">Female</option>
                      <option value="Other" className="bg-gray-900">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Specialization</label>
                  <input
                    required
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Cardiology"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Contact Number</label>
                    <input
                      required
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Department</label>
                    <select
                      required
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-gray-900">Select Dept</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id} className="bg-gray-900">{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : t('add_new_doctor')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-red-500 rotate-45" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Delete Doctor?</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">
                Are you sure you want to delete <span className="text-white font-bold">{doctorToDelete?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedDoctor && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          receiverId={selectedDoctor.user_id || selectedDoctor._id} // Fallback to doctor ID if user_id not present
          receiverName={selectedDoctor.name}
        />
      )}
    </div>
  );
}
