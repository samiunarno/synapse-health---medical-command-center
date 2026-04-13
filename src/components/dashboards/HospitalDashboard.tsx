import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Users, 
  Bed, 
  Activity, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Heart
} from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function HospitalDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalStats();
  }, []);

  const fetchHospitalStats = async () => {
    try {
      const res = await fetch('/api/analytics/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch hospital stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const cards = [
    { label: 'Total Patients', value: stats?.totalPatients || 0, icon: Users, color: 'blue', trend: '+12%' },
    { label: 'Active Doctors', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'purple', trend: '+5%' },
    { label: 'Bed Occupancy', value: '84%', icon: Bed, color: 'emerald', trend: '-2%' },
    { label: 'Revenue', value: '$124.5k', icon: TrendingUp, color: 'blue', trend: '+18%' }
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">{user?.fullName || 'Hospital Center'}</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Enterprise Healthcare Management</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-${card.color}-600/20 rounded-2xl flex items-center justify-center text-${card.color}-500 mb-6 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tighter">{card.value}</h3>
                </div>
                <div className={`text-[10px] font-bold ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
                  {card.trend} <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Department Performance</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-6">
            {['Cardiology', 'Neurology', 'Pediatrics', 'Oncology'].map((dept, i) => (
              <div key={dept} className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-white">{dept}</span>
                  <span className="text-gray-500">{85 - i * 10}% Efficiency</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${85 - i * 10}%` }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">System Alerts</h3>
          <div className="space-y-4">
            {[
              { type: 'Critical', msg: 'Oxygen Supply Low in Ward B', time: '2m ago', color: 'red' },
              { type: 'Warning', msg: 'Staff Shortage in ICU', time: '15m ago', color: 'amber' },
              { type: 'Info', msg: 'New Equipment Delivered', time: '1h ago', color: 'blue' }
            ].map((alert, i) => (
              <div key={i} className="p-4 bg-white/2 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-1.5 bg-${alert.color}-500`} />
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-tight">{alert.msg}</p>
                  <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}
