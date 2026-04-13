import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Watch, 
  Smartphone, 
  Activity, 
  Heart, 
  Flame, 
  Footprints, 
  Moon, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ArrowUpRight,
  Bluetooth,
  Wifi,
  Battery
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Wearables() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [connectedDevices, setConnectedDevices] = useState([
    { id: 'apple', name: 'Apple Watch Series 9', type: 'Watch', status: 'Connected', battery: 82, icon: Watch, color: 'text-rose-500' },
    { id: 'fitbit', name: 'Fitbit Charge 6', type: 'Tracker', status: 'Disconnected', battery: 0, icon: Activity, color: 'text-teal-500' },
  ]);

  const [healthData, setHealthData] = useState({
    steps: 8432,
    calories: 1240,
    heartRate: 72,
    sleep: '7h 20m',
    oxygen: 98,
    stress: 'Low'
  });

  const syncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setHealthData(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 100),
        heartRate: 68 + Math.floor(Math.random() * 10),
      }));
      setLastSync(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Wearable <span className="text-blue-500">Sync</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Real-time health telemetry from your connected devices.</p>
        </div>
        
        <button
          onClick={syncData}
          disabled={isSyncing}
          className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
        >
          {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isSyncing ? 'Syncing...' : 'Sync All Data'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Device Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-display font-bold text-white mb-8">Connected Devices</h3>
            <div className="space-y-4">
              {connectedDevices.map((device) => (
                <div key={device.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${device.color}`}>
                      <device.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {device.status === 'Connected' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Offline</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">{device.name}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Battery className={`w-3 h-3 ${device.battery > 20 ? 'text-emerald-500' : 'text-rose-500'}`} />
                        <span className="text-[10px] font-bold text-gray-500">{device.battery}%</span>
                      </div>
                      <Bluetooth className="w-3 h-3 text-blue-500" />
                      <Wifi className="w-3 h-3 text-blue-500" />
                    </div>
                    <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                      Settings
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3">
                <Smartphone className="w-4 h-4" /> Pair New Device
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">Sync Status</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-medium">Last updated</span>
              <span className="text-sm text-blue-100/70 font-mono">{lastSync}</span>
            </div>
            <div className="mt-6 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs text-gray-300 font-medium">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Steps */}
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
                  <Footprints className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Daily Steps</span>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <h2 className="text-5xl font-display font-bold text-white tracking-tighter">{healthData.steps.toLocaleString()}</h2>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">/ 10,000</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(healthData.steps / 10000) * 100}%` }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                />
              </div>
              <div className="flex items-center gap-2 text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">12% more than yesterday</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 rounded-full blur-[60px]" />
          </div>

          {/* Heart Rate */}
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Heart Rate</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-5xl font-display font-bold text-white tracking-tighter">{healthData.heartRate}</h2>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">BPM</span>
              </div>
              <div className="h-16 flex items-end gap-1 px-1">
                {[40, 60, 45, 70, 55, 80, 65, 90, 75, 85, 60, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-rose-500/20 rounded-t-sm relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-t-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/5 rounded-full blur-[60px]" />
          </div>

          {/* Calories */}
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Activity Burn</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-5xl font-display font-bold text-white tracking-tighter">{healthData.calories.toLocaleString()}</h2>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">KCAL</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['M', 'T', 'W', 'T'].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full h-12 bg-white/5 rounded-lg relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 bg-amber-500/40 h-3/4" />
                    </div>
                    <span className="text-[8px] font-bold text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sleep Quality</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-5xl font-display font-bold text-white tracking-tighter">{healthData.sleep}</h2>
                <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Optimal</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <Zap className="w-4 h-4 text-indigo-400" />
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Deep sleep increased by 45m</p>
              </div>
            </div>
          </div>

          {/* Stress & Oxygen */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stress Level</p>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{healthData.stress}</h3>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-500">LOW</span>
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Blood Oxygen</p>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{healthData.oxygen}%</h3>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-500">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
