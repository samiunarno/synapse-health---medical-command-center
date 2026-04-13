import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Bed, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  ArrowRight,
  LayoutGrid,
  Filter,
  X,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import WardBedStats from '../components/WardBedStats';

import { useTranslation } from 'react-i18next';

export default function Wards() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [reassigningBed, setReassigningBed] = useState<any>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignSearch, setReassignSearch] = useState('');
  const [isAddWardModalOpen, setIsAddWardModalOpen] = useState(false);
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningBed, setAssigningBed] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [newWard, setNewWard] = useState({ type: 'General', associated_department_id: '' });
  const [newBed, setNewBed] = useState({ ward_id: '', status: 'Available' });
  const [assignPatientId, setAssignPatientId] = useState('');

  useEffect(() => {
    fetchBeds();
    fetchWards();
    fetchPatients();
    fetchDepartments();
    
    const socket = io(window.location.origin);
    
    socket.on('bed_updated', () => {
      fetchBeds();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchWards = async () => {
    try {
      const res = await fetch('/api/wards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setWards(data);
      }
    } catch (err) {
      console.error('Failed to fetch wards');
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (err) {
      console.error('Failed to fetch patients');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchBeds = async () => {
    try {
      const res = await fetch('/api/beds', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBeds(data);
      }
    } catch (err) {
      console.error('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/wards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newWard)
      });
      if (res.ok) {
        fetchWards();
        setIsAddWardModalOpen(false);
        setNewWard({ type: 'General', associated_department_id: '' });
      }
    } catch (err) {
      console.error('Failed to add ward');
    }
  };

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/wards/beds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBed)
      });
      if (res.ok) {
        fetchBeds();
        setIsAddBedModalOpen(false);
        setNewBed({ ward_id: '', status: 'Available' });
      }
    } catch (err) {
      console.error('Failed to add bed');
    }
  };

  const handleAssignPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBed || !assignPatientId) return;
    try {
      const res = await fetch('/api/beds/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bedId: assigningBed._id,
          patientId: assignPatientId
        })
      });
      if (res.ok) {
        fetchBeds();
        setIsAssignModalOpen(false);
        setAssigningBed(null);
        setAssignPatientId('');
      }
    } catch (err) {
      console.error('Failed to assign patient');
    }
  };

  const handleDischarge = async (bedId: string) => {
    if (!window.confirm('Are you sure you want to discharge this patient?')) return;
    try {
      const res = await fetch('/api/beds/discharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bedId })
      });
      if (res.ok) {
        fetchBeds();
      }
    } catch (err) {
      console.error('Failed to discharge patient');
    }
  };

  const filteredBeds = beds.filter(b => filter === 'All' || b.status === filter);

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'Available').length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    maintenance: beds.filter(b => b.status === 'Maintenance').length,
  };

  const handleReassign = async (newBedId: string) => {
    if (!reassigningBed) return;
    try {
      const res = await fetch('/api/beds/reassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldBedId: reassigningBed._id,
          newBedId,
          patientId: reassigningBed.patient_id?._id
        })
      });
      if (res.ok) {
        fetchBeds();
        setIsReassignModalOpen(false);
        setReassigningBed(null);
      }
    } catch (err) {
      console.error('Failed to reassign bed');
    }
  };

  const availableBeds = beds.filter(b => 
    b.status === 'Available' && 
    (reassignSearch === '' || b.ward_id?.name?.toLowerCase().includes(reassignSearch.toLowerCase()) || b._id.slice(-4).includes(reassignSearch))
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">{t('wards_beds')}</h1>
          <p className="text-gray-500 font-medium">{t('wards_desc')}</p>
        </div>
        {(user?.role === 'Admin') && (
          <div className="flex gap-4">
            <button 
              onClick={() => setIsAddWardModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              {t('add_new_ward')}
            </button>
            <button 
              onClick={() => setIsAddBedModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5" />
              {t('add_new_bed')}
            </button>
          </div>
        )}
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('total_beds')} value={stats.total} icon={Bed} color="blue" />
        <StatCard title={t('available_beds')} value={stats.available} icon={CheckCircle} color="emerald" />
        <StatCard title={t('occupied_beds')} value={stats.occupied} icon={Clock} color="sky" />
        <StatCard title={t('maintenance_beds')} value={stats.maintenance} icon={AlertCircle} color="rose" />
      </div>

      {/* Ward Bed Distribution Visualization */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">Ward Distribution</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time Bed Status by Ward</p>
          </div>
        </div>
        <WardBedStats />
      </div>

      {/* Filters */}
      <div className="bg-white/2 p-4 rounded-3xl border border-white/5 flex items-center gap-4">
        <LayoutGrid className="w-5 h-5 text-gray-500 ml-2" />
        <div className="flex gap-2">
          {['All', 'Available', 'Occupied', 'Maintenance'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === s 
                  ? s === 'Available' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' :
                    s === 'Occupied' ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' :
                    s === 'Maintenance' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' :
                    'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Loading beds...</div>
        ) : filteredBeds.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No beds found.</div>
        ) : (
          filteredBeds.map((bed) => (
            <motion.div
              key={bed.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-3xl border transition-all ${
                bed.status === 'Available' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' :
                bed.status === 'Occupied' ? 'bg-sky-500/5 border-sky-500/20 shadow-lg shadow-sky-500/5' :
                'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${
                  bed.status === 'Available' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                  bed.status === 'Occupied' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' :
                  'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                }`}>
                  <Bed className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">#{bed._id.slice(-4)}</span>
              </div>

              <h3 className="font-bold text-white mb-1 truncate">{bed.ward_id?.name || 'General'} Ward</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${
                bed.status === 'Available' ? 'text-emerald-400' :
                bed.status === 'Occupied' ? 'text-sky-400' :
                'text-rose-400'
              }`}>
                {bed.status}
              </p>

              {bed.status === 'Occupied' ? (
                <div className="pt-4 border-t border-sky-500/20">
                  <div className="flex items-center gap-2 text-sky-400 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold truncate">{bed.patient_id?.name || 'Unknown Patient'}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(user?.role === 'Admin' || user?.role === 'Staff' || user?.role === 'Doctor') && (
                      <button 
                        onClick={() => handleDischarge(bed._id)}
                        className="w-full py-2 bg-rose-600/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
                      >
                        Discharge Patient
                      </button>
                    )}
                    {(user?.role === 'Admin' || user?.role === 'Staff') && (
                      <button 
                        onClick={() => {
                          setReassigningBed(bed);
                          setIsReassignModalOpen(true);
                        }}
                        className="w-full py-2 bg-sky-600/20 text-sky-400 rounded-xl text-xs font-bold hover:bg-sky-600 hover:text-white transition-all border border-sky-500/20 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Re-assign Bed
                      </button>
                    )}
                  </div>
                </div>
              ) : bed.status === 'Available' ? (
                <div className="pt-4 border-t border-emerald-500/20">
                  <button 
                    onClick={() => {
                      setAssigningBed(bed);
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Assign Patient
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-rose-500/20">
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">Scheduled for maintenance</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Re-assign Modal */}
      <AnimatePresence>
        {isReassignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReassignModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Re-assign Patient</h2>
                  <p className="text-gray-500 text-sm font-medium">Select a new available bed for {reassigningBed?.patient_id?.name}.</p>
                </div>
                <button 
                  onClick={() => setIsReassignModalOpen(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search available beds by ward or ID..."
                    value={reassignSearch}
                    onChange={(e) => setReassignSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {availableBeds.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                      No available beds found matching your search.
                    </div>
                  ) : (
                    availableBeds.map((bed: any) => (
                      <button
                        key={bed._id}
                        onClick={() => handleReassign(bed._id)}
                        className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Bed className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{bed.ward_id?.name || 'General'} Ward</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bed ID: #{bed._id.slice(-4)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                          Select Bed
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Ward Modal */}
      <AnimatePresence>
        {isAddWardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddWardModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-white">Add New Ward</h2>
                <button onClick={() => setIsAddWardModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddWard} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ward Type</label>
                  <select
                    value={newWard.type}
                    onChange={(e) => setNewWard({ ...newWard, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="General">General</option>
                    <option value="ICU">ICU</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Associated Department</label>
                  <select
                    required
                    value={newWard.associated_department_id}
                    onChange={(e) => setNewWard({ ...newWard, associated_department_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">Create Ward</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Bed Modal */}
      <AnimatePresence>
        {isAddBedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddBedModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-white">Add New Bed</h2>
                <button onClick={() => setIsAddBedModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddBed} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Ward</label>
                  <select
                    required
                    value={newBed.ward_id}
                    onChange={(e) => setNewBed({ ...newBed, ward_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward._id} value={ward._id}>{ward.type} Ward ({ward.associated_department_id?.name})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">Create Bed</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Patient Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-white">Assign Patient</h2>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAssignPatient} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Patient</label>
                  <select
                    required
                    value={assignPatientId}
                    onChange={(e) => setAssignPatientId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Patient</option>
                    {patients.filter(p => !p.current_bed_id).map(patient => (
                      <option key={patient._id} value={patient._id}>{patient.name} ({patient.patient_id})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">Assign to Bed</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20',
    sky: 'bg-sky-600/10 text-sky-400 border-sky-500/20',
    rose: 'bg-rose-600/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="bg-white/2 p-6 rounded-3xl border border-white/5 shadow-sm group hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${colors[color]} border`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest truncate">{title}</p>
          <p className="text-2xl font-display font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}
