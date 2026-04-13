import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Phone,
  User,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { io } from 'socket.io-client';

export default function DriverDashboard() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    const socket = io(window.location.origin);
    
    socket.on('new_ambulance_request', (request) => {
      setRequests(prev => [request, ...prev]);
    });

    socket.on('ambulance_request_updated', (updated) => {
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      if (activeRequest?._id === updated._id) {
        setActiveRequest(updated);
        if (updated.status === 'Completed' || updated.status === 'Cancelled') {
          setActiveRequest(null);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/advanced/ambulances/all-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        const active = data.find((r: any) => 
          r.driver_id?._id === user?.id && 
          ['Accepted', 'Dispatched', 'Arrived'].includes(r.status)
        );
        setActiveRequest(active);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/advanced/ambulances/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'Accepted',
          driver_id: user?.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept request');
      }
      
      setActiveRequest(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateStatus = async (status: string) => {
    if (!activeRequest) return;
    try {
      const res = await fetch(`/api/advanced/ambulances/requests/${activeRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        if (status === 'Completed' || status === 'Cancelled') {
          setActiveRequest(null);
        } else {
          setActiveRequest(data);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Driver Dashboard</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Ambulance & Emergency Response</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border ${activeRequest ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
            {activeRequest ? 'On Active Mission' : 'Available for Dispatch'}
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Mission */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-500" />
            Active Mission
          </h2>
          
          <AnimatePresence mode="wait">
            {activeRequest ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Emergency Call</h3>
                      <p className="text-blue-500 font-bold uppercase tracking-widest text-[10px]">{activeRequest.service_type} Service</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {activeRequest.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <div className="text-xs font-bold uppercase tracking-widest">Pickup</div>
                    </div>
                    <p className="text-white font-medium pl-8">{activeRequest.pickup_location.address || 'Coordinates Provided'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Navigation className="w-5 h-5 text-emerald-500" />
                      <div className="text-xs font-bold uppercase tracking-widest">Destination</div>
                    </div>
                    <p className="text-white font-medium pl-8">{activeRequest.destination_location?.address || 'Hospital Emergency'}</p>
                  </div>
                </div>

                <div className="p-6 bg-white/2 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold uppercase tracking-tight">{activeRequest.patient_id?.name || 'Emergency Patient'}</p>
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <Phone className="w-3 h-3" /> {activeRequest.patient_id?.contact || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <button className="p-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-all">
                    <Phone className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex gap-4">
                  {activeRequest.status === 'Accepted' && (
                    <button 
                      onClick={() => updateStatus('Dispatched')}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
                    >
                      Dispatch Vehicle
                    </button>
                  )}
                  {activeRequest.status === 'Dispatched' && (
                    <button 
                      onClick={() => updateStatus('Arrived')}
                      className="flex-1 py-5 bg-amber-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-all"
                    >
                      Mark as Arrived
                    </button>
                  )}
                  {activeRequest.status === 'Arrived' && (
                    <button 
                      onClick={() => updateStatus('Completed')}
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all"
                    >
                      Complete Mission
                    </button>
                  )}
                  <button 
                    onClick={() => updateStatus('Cancelled')}
                    className="px-8 py-5 bg-red-600/20 border border-red-500/30 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mx-auto">
                  <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-tight">No Active Mission</h3>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Waiting for emergency dispatch...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nearby Requests */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Activity className="w-5 h-5 text-red-500" />
            Incoming Requests
          </h2>
          <div className="space-y-4">
            {requests.filter(r => r.status === 'Pending').length > 0 ? (
              requests.filter(r => r.status === 'Pending').map((request) => (
                <motion.div
                  key={request._id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-tight text-sm">Emergency</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{new Date(request.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-bold uppercase tracking-widest text-gray-400">
                      {request.service_type}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin className="w-3 h-3" /> {request.pickup_location.address || 'Location Provided'}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAccept(request._id)}
                    disabled={!!activeRequest}
                    className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    Accept Request <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center bg-white/2 border border-white/5 rounded-3xl">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
