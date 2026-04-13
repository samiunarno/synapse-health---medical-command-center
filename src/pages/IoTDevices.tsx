import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Activity, 
  Thermometer, 
  MapPin, 
  Bed, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Cpu,
  Battery,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';

export default function IoTDevices() {
  const { token, user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDevices();
    
    const socket = io(window.location.origin);
    
    socket.on('iot_alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5));
      fetchDevices();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/iot', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error('Failed to fetch IoT devices');
    } finally {
      setLoading(false);
    }
  };

  const seedDevices = async () => {
    try {
      await fetch('/api/iot/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDevices();
    } catch (err) {
      console.error('Failed to seed devices');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Vital Monitor': return Activity;
      case 'Room Sensor': return Thermometer;
      case 'Asset Tracker': return MapPin;
      case 'Smart Bed': return Bed;
      default: return Cpu;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">Smart Hospital IoT</h1>
          <p className="text-gray-500 font-medium">Real-time device monitoring and asset tracking</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={seedDevices}
            className="flex items-center gap-2 bg-white/5 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10"
          >
            <RefreshCw className="w-5 h-5" />
            Sync Devices
          </button>
          <div className="flex items-center gap-2 bg-blue-600/10 text-blue-400 px-6 py-3 rounded-2xl font-bold border border-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
            Active Monitoring
          </div>
        </div>
      </header>

      {/* Alerts Section */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4"
          >
            {alerts.map((alert, i) => (
              <div key={i} className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-500 text-white rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Critical Alert: {alert.device}</h4>
                    <p className="text-xs text-rose-400 font-medium">Abnormal reading detected in {alert.location}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-white bg-rose-600 px-4 py-2 rounded-lg">Acknowledge</button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Loading smart devices...</div>
        ) : devices.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No IoT devices found. Click Sync to initialize.</div>
        ) : (
          devices.map((device) => {
            const Icon = getIcon(device.type);
            return (
              <motion.div
                key={device._id}
                whileHover={{ y: -5 }}
                className="bg-white/2 p-6 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${getStatusColor(device.status)} border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(device.status)}`}>
                    {device.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{device.name}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{device.type}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Location</p>
                      <p className="text-xs text-white font-bold truncate">{device.location}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Last Sync</p>
                      <p className="text-xs text-white font-bold">{new Date(device.updatedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {device.patient_id && (
                    <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/10 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">Monitoring Patient</p>
                        <p className="text-xs text-white font-bold">{device.patient_id.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-3">Live Telemetry</p>
                    <div className="space-y-2">
                      {Object.entries(device.lastReading || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-xs text-white font-mono font-bold">
                            {typeof value === 'number' ? value.toFixed(1) : value}
                            {key === 'temp' ? '°C' : key === 'hr' ? ' bpm' : key === 'spo2' ? '%' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
