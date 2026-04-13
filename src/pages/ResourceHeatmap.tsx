import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Activity, 
  LayoutGrid, 
  Map as MapIcon, 
  Bed, 
  Thermometer, 
  Wind, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ResourceHeatmap() {
  const { user, token } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/advanced/resources/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Resource <span className="text-blue-500">Heatmap</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Real-time monitoring of hospital beds, ICU, and critical equipment.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live System</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Global Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-display font-bold text-white mb-8">System Overview</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Bed Occupancy</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">78%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    className="h-full bg-blue-500" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ICU Capacity</span>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">92%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    className="h-full bg-rose-500" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ventilator Availability</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">12 Free</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] p-8">
            <TrendingUp className="w-10 h-10 text-blue-500 mb-4" />
            <h4 className="text-lg font-display font-bold text-white mb-2">Peak Hours</h4>
            <p className="text-xs text-blue-200/70 leading-relaxed">
              Current demand is trending 15% higher than average for this time of day.
            </p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center bg-white/2 border border-white/5 rounded-[2.5rem]">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Syncing Resources...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((dept, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-display font-bold text-white">{dept.department}</h4>
                    </div>
                    <div className={`px-3 py-1 rounded-full border ${
                      dept.availableBeds > 5 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                      dept.availableBeds > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <span className="text-[8px] font-bold uppercase tracking-widest">
                        {dept.availableBeds > 0 ? 'Available' : 'Full'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Bed className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">General Beds</span>
                      </div>
                      <p className="text-lg font-bold text-white">{dept.availableBeds} <span className="text-xs text-gray-600">/ {dept.totalBeds}</span></p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3 h-3 text-rose-500" />
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">ICU Capacity</span>
                      </div>
                      <p className="text-lg font-bold text-white">{dept.icuAvailable} <span className="text-xs text-gray-600">/ {dept.icuBeds}</span></p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-1">
                    {Array.from({ length: 20 }).map((_, j) => (
                      <div 
                        key={j} 
                        className={`flex-1 h-1 rounded-full ${
                          j < (dept.occupiedBeds / dept.totalBeds * 20) ? 'bg-blue-500' : 'bg-white/5'
                        }`} 
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
