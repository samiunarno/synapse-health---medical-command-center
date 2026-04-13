import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Droplets, 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Heart,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BloodHub() {
  const { user, token } = useAuth();
  const [donors, setDonors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchGroup, setSearchGroup] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Registration Form
  const [formData, setFormData] = useState({
    bloodGroup: '',
    contactNumber: '',
    address: '',
    lastDonationDate: ''
  });

  useEffect(() => {
    fetchDonors();
  }, [searchGroup]);

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      const url = searchGroup ? `/api/advanced/blood-donors?bloodGroup=${encodeURIComponent(searchGroup)}` : '/api/advanced/blood-donors';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDonors(data);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await fetch('/api/advanced/blood-donors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          location: {
            address: formData.address,
            coordinates: [90.4125, 23.8103] // Default to Dhaka for demo
          }
        })
      });
      if (res.ok) {
        setShowRegisterModal(false);
        fetchDonors();
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Blood <span className="text-rose-500">Hub</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Connecting life-savers with those in need. Real-time donor network.</p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
        >
          <UserPlus className="w-5 h-5" />
          Register as Donor
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-3">
              <Filter className="w-5 h-5 text-rose-500" />
              Find Donors
            </h3>
            
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Blood Group</label>
              <div className="grid grid-cols-2 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                  <button
                    key={group}
                    onClick={() => setSearchGroup(searchGroup === group ? '' : group)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      searchGroup === group 
                        ? 'bg-rose-600 border-rose-600 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-rose-600/10 border border-rose-500/20 rounded-[2.5rem] p-8">
            <Heart className="w-10 h-10 text-rose-500 mb-4" />
            <h4 className="text-lg font-display font-bold text-white mb-2">Why Donate?</h4>
            <p className="text-xs text-rose-200/70 leading-relaxed">
              One single donation can save up to three lives. Your contribution matters more than you think.
            </p>
          </div>
        </div>

        {/* Donor List */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white/2 border border-white/5 rounded-[2.5rem]">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Searching Network...</p>
            </div>
          ) : donors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donors.map((donor) => (
                <motion.div
                  key={donor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/2 border border-white/5 rounded-[2rem] p-6 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-rose-600/20">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{donor.userId?.fullName || 'Anonymous Donor'}</h4>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{donor.location.address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Available</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-black/20 rounded-xl">
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Last Donation</p>
                      <p className="text-xs text-white font-medium">
                        {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div className="p-3 bg-black/20 rounded-xl">
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Contact</p>
                      <p className="text-xs text-white font-medium">{donor.contactNumber}</p>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Contact Donor
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-white/2 border border-white/5 rounded-[2.5rem] border-dashed">
              <Droplets className="w-12 h-12 text-gray-700 mb-4" />
              <h3 className="text-xl font-display font-bold text-gray-700 mb-2">No Donors Found</h3>
              <p className="text-gray-600 text-xs">Try searching for a different blood group or area.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-tighter">Become a <span className="text-rose-500">Donor</span></h3>
                <p className="text-gray-500 text-sm mb-8">Fill in your details to join our life-saving network.</p>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Blood Group</label>
                      <select
                        required
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                      >
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Contact Number</label>
                      <input
                        required
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="+880..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Location / Address</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Uttara, Dhaka"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Last Donation Date</label>
                    <input
                      type="date"
                      value={formData.lastDonationDate}
                      onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2"
                    >
                      {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Register Now
                    </button>
                  </div>
                </form>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px] -z-0" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
