import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Package, 
  Phone, 
  AlertCircle,
  Loader2,
  History,
  ArrowRight,
  Map as MapIcon,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthContext';
import { io } from 'socket.io-client';
import AMapLoader from '@amap/amap-jsapi-loader';
import AMapSetupGuide from '../components/AMapSetupGuide';

export default function DeliveryRider() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);
  const socketRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any>({});
  const routeRef = useRef<any>(null);

  useEffect(() => {
    fetchOrders();
    
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      if (activeOrder?._id === updatedOrder._id) {
        setActiveOrder(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const amapKey = (import.meta as any).env.VITE_AMAP_KEY;
    if (amapKey && mapRef.current) {
      AMapLoader.load({
        key: amapKey,
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Driving', 'AMap.MoveAnimation'],
      }).then((AMap) => {
        const map = new AMap.Map(mapRef.current, {
          zoom: 14,
          center: [116.397428, 39.90923], // Default center
          theme: 'dark',
          viewMode: '3D'
        });
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
        mapInstance.current = map;
        updateMarkers(AMap);
      });
    }
  }, [activeOrder, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pharmacy/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const pending = data.filter(o => o.status === 'Shipped' || o.status === 'Processing');
        const active = data.find(o => o.rider_id === user?.id && ['Picked Up', 'Out for Delivery'].includes(o.status));
        const completed = data.filter(o => o.rider_id === user?.id && o.status === 'Delivered');
        
        setOrders(pending);
        setActiveOrder(active || null);
        setHistory(completed);
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = (AMap: any) => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: any) => map.remove(m));
    markersRef.current = {};

    if (activeOrder) {
      // Pharmacy Marker (Pickup)
      const pharmacyMarker = new AMap.Marker({
        position: [116.397428, 39.90923], // Simulated Pharmacy Location
        content: '<div class="bg-blue-600 p-2 rounded-xl border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>',
        title: 'Pharmacy'
      });
      map.add(pharmacyMarker);
      markersRef.current.pharmacy = pharmacyMarker;

      // Delivery Marker (Destination)
      if (activeOrder.delivery_location) {
        const destMarker = new AMap.Marker({
          position: [activeOrder.delivery_location.lng, activeOrder.delivery_location.lat],
          content: '<div class="bg-red-600 p-2 rounded-xl border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>',
          title: 'Delivery Destination'
        });
        map.add(destMarker);
        markersRef.current.dest = destMarker;
        
        map.setFitView();
      }
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Picked Up', rider_id: user?.id })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error('Failed to accept order');
    }
  };

  const updateStatus = async (status: string) => {
    if (!activeOrder) return;
    try {
      const res = await fetch(`/api/pharmacy/orders/${activeOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const simulateDelivery = async () => {
    if (!activeOrder) return;
    setSimulating(true);
    // Simulate movement logic here
    setTimeout(() => {
      setSimulating(false);
      updateStatus('Delivered');
    }, 5000);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest">Loading Logistics Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
          Delivery <br />
          <span className="text-transparent stroke-text">Rider Hub</span>
        </h1>
        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-4 flex items-center gap-3">
          <Truck className="w-4 h-4 text-blue-500" />
          Manage medicine deliveries and routes
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Delivery & Map */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden relative h-[500px] shadow-2xl">
            <div ref={mapRef} className="w-full h-full" />
            
            {!(import.meta as any).env.VITE_AMAP_KEY && (
              <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center p-8 z-10">
                <AMapSetupGuide />
              </div>
            )}

            {activeOrder && (
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-black/90 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl flex items-center justify-between shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-blue-600/20">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold uppercase tracking-tight">Active Delivery</p>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">ID: {activeOrder._id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {activeOrder.status === 'Picked Up' ? (
                      <button 
                        onClick={() => updateStatus('Out for Delivery')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                      >
                        Start Delivery
                      </button>
                    ) : (
                      <button 
                        onClick={simulateDelivery}
                        disabled={simulating}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                      >
                        {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Complete Delivery
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {activeOrder && (
            <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight mb-8">Delivery Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Destination</p>
                      <p className="text-white font-bold">{activeOrder.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</p>
                      <p className="text-white font-bold">{activeOrder.patient_id?.phone || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Items to Deliver</p>
                  <div className="space-y-2">
                    {activeOrder.medicines.map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{m.medicine_id?.brand_name}</span>
                        <span className="text-white font-bold">x{m.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Available & History */}
        <div className="space-y-8">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight mb-6">Available Orders</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">No orders available</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                        {order.service_type || 'Standard'}
                      </span>
                      <p className="text-[10px] text-gray-600 font-mono">#{order._id.slice(-6)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                        <p className="text-xs text-gray-300 font-medium line-clamp-2">{order.delivery_address}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => acceptOrder(order._id)}
                      disabled={!!activeOrder}
                      className="w-full py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight mb-6">Delivery History</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {history.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600/10 text-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white font-bold uppercase tracking-tight">Delivered</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(order.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
