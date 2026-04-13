import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Bed, 
  Calendar, 
  FileText,
  Filter,
  ChevronRight,
  MessageSquare,
  Activity,
  Hospital,
  Phone,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatModal from '../components/ChatModal';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    type: 'Outpatient',
    department_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatReceiver, setChatReceiver] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactValue, setEditContactValue] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchDepartments();
    
    const socket = io(window.location.origin);
    
    socket.on('patient_updated', () => {
      fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
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
          patient_id: '',
          name: '',
          age: '',
          gender: 'Male',
          contact: '',
          type: 'Outpatient',
          department_id: ''
        });
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    try {
      const res = await fetch(`/api/patients/${patientToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setPatientToDelete(null);
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to delete patient');
    }
  };

  const handleUpdateContact = async (patientId: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contact: editContactValue })
      });
      if (res.ok) {
        setEditingContactId(null);
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to update contact');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.patient_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">{t('patients')}</h1>
          <p className="text-gray-500 font-medium">Manage and view all patient records.</p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white/2 p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder={t('search_patients_placeholder')} 
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5">
          <Filter className="w-5 h-5" />
          {t('filters')}
        </button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">{t('loading_patients')}</div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">{t('no_patients_found')}</div>
        ) : (
          filteredPatients.map((patient) => (
            <motion.div
              key={patient._id}
              whileHover={{ y: -5 }}
              className="bg-white/2 p-6 rounded-3xl border border-white/5 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold">
                    {patient.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors truncate">{patient.name}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-tight truncate">{patient.patient_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(user?.role === 'Admin') && (
                    <button 
                      onClick={() => {
                        setPatientToDelete(patient);
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
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Type</span>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest truncate ${
                    patient.type === 'Inpatient' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {patient.type}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl gap-2">
                  <div className="flex items-center gap-2 text-gray-500 shrink-0">
                    <Hospital className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Dept</span>
                  </div>
                  <span className="text-sm font-bold text-white truncate">{patient.department_id?.name || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bed className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Bed</span>
                  </div>
                  <span className="text-sm font-bold text-blue-400">#{patient.current_bed_id?._id?.slice(-4) || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500 shrink-0">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Contact</span>
                  </div>
                  {editingContactId === patient._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editContactValue}
                        onChange={(e) => setEditContactValue(e.target.value)}
                        className="w-24 sm:w-32 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateContact(patient._id)} className="p-1 text-green-400 hover:bg-green-400/10 rounded">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setEditingContactId(null)} className="p-1 text-red-400 hover:bg-red-400/10 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{patient.contact || 'N/A'}</span>
                      {(user?.role === 'Admin' || user?.role === 'Staff' || user?.role === 'Doctor') && (
                        <button 
                          onClick={() => {
                            setEditingContactId(patient._id);
                            setEditContactValue(patient.contact || '');
                          }}
                          className="p-1 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => navigate(`/records?patient=${patient._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  <FileText className="w-4 h-4" />
                  {t('records_btn')}
                </button>
                <button 
                  onClick={() => {
                    setChatReceiver(patient);
                    setIsChatOpen(true);
                  }}
                  className="p-3 bg-white/5 text-gray-500 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">{t('contact_patient')}</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Patient Modal */}
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
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">{t('add_new_patient')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Plus className="w-6 h-6 text-gray-500 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Patient ID</label>
                    <input
                      required
                      type="text"
                      value={formData.patient_id}
                      onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="P-1001"
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
                      placeholder="John Doe"
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
                      placeholder="25"
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Patient Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="Outpatient" className="bg-gray-900">Outpatient</option>
                      <option value="Inpatient" className="bg-gray-900">Inpatient</option>
                    </select>
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
                  {isSubmitting ? 'Registering...' : t('add_new_patient')}
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
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Delete Patient?</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">
                Are you sure you want to delete <span className="text-white font-bold">{patientToDelete?.name}</span>? This action cannot be undone.
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

      {chatReceiver && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          receiverId={chatReceiver.user_id || chatReceiver._id}
          receiverName={chatReceiver.name}
        />
      )}
    </div>
  );
}
