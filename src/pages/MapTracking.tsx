import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Map as MapIcon, Navigation, Truck, Ambulance, Building2, Search, Clock, AlertTriangle, Package, MapPin } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { io } from 'socket.io-client';
import AMapLoader from '@amap/amap-jsapi-loader';
import AMapSetupGuide from '../components/AMapSetupGuide';

export default function MapTracking() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'hospital' | 'ambulance' | 'delivery'>('hospital');
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<[number, number] | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickingMode, setPickingMode] = useState<'pickup' | 'destination'>('pickup');
  const pickingModeRef = useRef(pickingMode);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    pickingModeRef.current = pickingMode;
  }, [pickingMode]);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any>({});

  useEffect(() => {
    const amapKey = (import.meta as any).env.VITE_AMAP_KEY;
    const amapSecurityCode = (import.meta as any).env.VITE_AMAP_SECURITY_JS_CODE;

    if (amapKey) {
      if (amapSecurityCode) {
        (window as any)._AMapSecurityConfig = {
          securityJsCode: amapSecurityCode,
        };
      }

      AMapLoader.load({
        key: amapKey,
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar', 'AMap.MoveAnimation'],
      }).then((AMap) => {
        const map = new AMap.Map(mapRef.current, {
          zoom: 13,
          center: [90.4125, 23.8103], // Dhaka
          viewMode: '3D',
          theme: 'dark',
          pitch: 45,
        });

        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
        mapInstance.current = map;
        
        // Map click listener
        map.on('click', (e: any) => {
          const { lng, lat } = e.lnglat;
          if (pickingModeRef.current === 'pickup') {
            setPickupLocation([lat, lng]);
            reverseGeocode([lng, lat], 'pickup');
          } else {
            setDestinationLocation([lat, lng]);
            reverseGeocode([lng, lat], 'destination');
          }
          map.setCenter([lng, lat]);
        });

        updateMarkers(AMap);
      }).catch(e => {
        console.error('AMap load failed', e);
      });
    }

    fetchAmbulances();
    fetchDeliveries();
    fetchHospitals();
    
    // Real-time updates via Socket.io
    const socket = io(window.location.origin);
    
    socket.on('ambulance_updated', (updatedAmbulance) => {
      setAmbulances(prev => prev.map(a => a._id === updatedAmbulance._id ? updatedAmbulance : a));
    });

    socket.on('medicine_order_updated', (updatedOrder) => {
      setDeliveries(prev => prev.map(d => d._id === updatedOrder._id ? updatedOrder : d));
    });

    socket.on('new_medicine_order', () => {
      fetchDeliveries();
    });

    return () => {
      socket.disconnect();
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPickupLocation([latitude, longitude]);
        reverseGeocode([longitude, latitude], 'pickup');
        if (mapInstance.current) {
          mapInstance.current.setCenter([longitude, latitude]);
          mapInstance.current.setZoom(15);
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const reverseGeocode = (lnglat: [number, number], type: 'pickup' | 'destination') => {
    if (!(window as any).AMap) return;
    const AMap = (window as any).AMap;
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(lnglat, (status: string, result: any) => {
        if (status === 'complete' && result.regeocode) {
          if (type === 'pickup') {
            setAddress(result.regeocode.formattedAddress);
          } else {
            setDestinationAddress(result.regeocode.formattedAddress);
          }
        }
      });
    });
  };

  const updateMarkers = (AMap: any) => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear all markers first for simplicity in this view
    Object.values(markersRef.current).forEach((m: any) => map.remove(m));
    markersRef.current = {};

    // Pickup Marker
    if (pickupLocation) {
      markersRef.current.pickup = new AMap.Marker({
        position: [pickupLocation[1], pickupLocation[0]],
        content: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
        offset: new AMap.Pixel(-16, -16),
        title: 'Pickup Location'
      });
      map.add(markersRef.current.pickup);
    }

    // Destination Marker
    if (destinationLocation) {
      markersRef.current.destination = new AMap.Marker({
        position: [destinationLocation[1], destinationLocation[0]],
        content: `<div class="bg-red-600 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        offset: new AMap.Pixel(-16, -16),
        title: 'Destination'
      });
      map.add(markersRef.current.destination);
    }

    // Hospital Marker (Center)
    const hospitalMarker = new AMap.Marker({
      position: [90.4125, 23.8103],
      content: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7a5 5 0 0 0-5 5v3h16v-3a5 5 0 0 0-5-5h-3V7a5 5 0 0 1 5-5h3V2Z"/><path d="M12 14v7"/><path d="M9 21h6"/></svg></div>`,
      offset: new AMap.Pixel(-16, -16),
      title: 'Synapse Health HQ'
    });
    map.add(hospitalMarker);
    markersRef.current.hospital = hospitalMarker;

    // Nearby Hospitals
    hospitals.forEach(hosp => {
      if (hosp.location) {
        const key = `hosp_${hosp._id}`;
        const isSelected = destinationAddress === hosp.name;
        const marker = new AMap.Marker({
          position: [hosp.location.lng || 90.4125, hosp.location.lat || 23.8103],
          content: `<div class="${isSelected ? 'bg-red-600 scale-125 ring-4 ring-red-500/30' : 'bg-emerald-600'} p-2 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-all duration-300 ${isSelected ? 'animate-bounce' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7a5 5 0 0 0-5 5v3h16v-3a5 5 0 0 0-5-5h-3V7a5 5 0 0 1 5-5h3V2Z"/><path d="M12 14v7"/><path d="M9 21h6"/></svg></div>`,
          offset: new AMap.Pixel(-16, -16),
          title: hosp.name,
          zIndex: isSelected ? 100 : 10
        });
        marker.on('click', () => {
          const lat = hosp.location.lat || 23.8103;
          const lng = hosp.location.lng || 90.4125;
          setDestinationLocation([lat, lng]);
          setDestinationAddress(hosp.name);
          map.setCenter([lng, lat]);
          map.setZoom(15);
        });
        map.add(marker);
        markersRef.current[key] = marker;
      }
    });

    if (activeTab === 'ambulance') {
      ambulances.forEach(amb => {
        if (amb.current_location) {
          const marker = new AMap.Marker({
            position: [amb.current_location.lng, amb.current_location.lat],
            content: `<div class="bg-red-600 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-4.293-1.43a2 2 0 0 1-1.023-1.1l-1.023-2.046A2 2 0 0 0 13.191 6H12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
            offset: new AMap.Pixel(-16, -16),
            title: amb.vehicle_number
          });
          map.add(marker);
          markersRef.current[`amb_${amb._id}`] = marker;
        }
      });
    }

    if (activeTab === 'delivery') {
      deliveries.forEach(del => {
        if (del.rider_location) {
          const marker = new AMap.Marker({
            position: [del.rider_location.lng, del.rider_location.lat],
            content: `<div class="bg-green-500 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/><path d="M18.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/><path d="M5.5 17h13"/><path d="M15 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M15 6.5 11 17"/><path d="M7 10h8l2 7H5l2-7Z"/></svg></div>`,
            offset: new AMap.Pixel(-16, -16),
            title: `Order #${del._id.slice(-6)}`
          });
          map.add(marker);
          markersRef.current[`del_${del._id}`] = marker;
        }
      });
    }
  };

  useEffect(() => {
    if ((window as any).AMap && mapInstance.current) {
      updateMarkers((window as any).AMap);
    }
  }, [ambulances, deliveries, hospitals, activeTab, pickupLocation, destinationLocation, destinationAddress]);

  const fetchAmbulances = async () => {
    try {
      const res = await fetch('/api/advanced/ambulances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAmbulances(data);
      }
    } catch (error) {
      console.error('Failed to fetch ambulances', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/pharmacy/orders/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Filter for active deliveries
        setDeliveries(data.filter((o: any) => ['Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.status)));
      }
    } catch (error) {
      console.error('Failed to fetch deliveries', error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white flex items-center gap-4">
            <MapIcon className="w-8 h-8 text-blue-500" />
            Map & Tracking
          </h1>
          <p className="text-gray-500 font-medium">Real-time location tracking and hospital navigation</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('hospital')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'hospital' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
          <Building2 className="w-5 h-5" />
          Hospital Floor Map
        </button>
        <button 
          onClick={() => setActiveTab('ambulance')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'ambulance' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
          <Ambulance className="w-5 h-5" />
          Ambulance Tracking
        </button>
        <button 
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'delivery' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
          <Truck className="w-5 h-5" />
          Medicine Delivery
        </button>
      </div>

      {/* Map Area */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden relative h-[600px] md:h-[700px] lg:h-[800px] flex flex-col lg:flex-row shadow-2xl group">
        
        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-black/60 backdrop-blur-2xl border-r border-white/5 p-8 flex flex-col gap-8 overflow-y-auto z-20 custom-scrollbar">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Search & Filter</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search location..." 
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-600 text-sm"
              />
            </div>
          </div>

          {activeTab === 'hospital' && (
            <div className="space-y-6">
              <div className="bg-blue-600/10 p-6 rounded-[2rem] border border-blue-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Navigation</h3>
                </div>
                <p className="text-[10px] text-blue-400 font-medium leading-relaxed">Click on an emerald hospital marker or anywhere on the map to set your destination.</p>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input 
                    type="text"
                    readOnly
                    value={destinationAddress}
                    placeholder="Select destination..."
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none font-medium"
                  />
                </div>
                <button 
                  onClick={() => {
                    setActiveTab('ambulance');
                    setPickingMode('pickup');
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Set Pickup Next
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Points of Interest</h3>
                {['Emergency Room', 'ICU', 'Pharmacy', 'Radiology', 'Cafeteria'].map((poi, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs font-bold text-white">{poi}</span>
                    </div>
                    <Navigation className="w-4 h-4 text-gray-600 group-hover/item:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ambulance' && (
            <div className="space-y-6">
              <div className="bg-red-600/10 p-6 rounded-[2rem] border border-red-500/20 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Quick Request</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPickingMode('pickup')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${pickingMode === 'pickup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-black/40 text-gray-500 border border-white/5'}`}
                  >
                    Pickup
                  </button>
                  <button 
                    onClick={() => setPickingMode('destination')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${pickingMode === 'destination' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-black/40 text-gray-500 border border-white/5'}`}
                  >
                    Dest
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <input 
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Pickup Address"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input 
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="Destination Hospital"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none font-medium"
                    />
                  </div>
                </div>
                <button 
                  disabled={!pickupLocation || !destinationLocation}
                  className="w-full py-4 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                  onClick={() => window.location.href = '/ambulance'}
                >
                  Continue Request
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Units</h3>
                {ambulances.length === 0 && !isLoading && (
                  <div className="text-center p-8 bg-white/2 rounded-2xl border border-white/5">
                    <p className="text-gray-500 text-xs font-medium">No active ambulances.</p>
                  </div>
                )}
                {ambulances.map((amb, i) => (
                  <div key={i} className="p-5 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group/amb">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white group-hover/amb:text-blue-400 transition-colors">{amb.vehicle_number}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${amb.status === 'Available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {amb.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <Clock className="w-3 h-3 text-blue-500" /> {amb.eta ? `${amb.eta}m` : '-'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <AlertTriangle className="w-3 h-3 text-red-500" /> {amb.driver_name?.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Deliveries</h3>
              {deliveries.length === 0 && (
                <div className="text-center p-8 bg-white/2 rounded-2xl border border-white/5">
                  <p className="text-gray-500 text-xs font-medium">No active deliveries.</p>
                </div>
              )}
              {deliveries.map((del, i) => (
                <div key={i} className="p-5 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group/del">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white group-hover/del:text-green-400 transition-colors">Order #{del._id.slice(-6)}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${del.status === 'Out for Delivery' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {del.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium truncate">
                      <Navigation className="w-3 h-3 text-blue-500" /> {del.delivery_address}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                      <Package className="w-3 h-3 text-green-500" /> {del.medicines.length} Items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Visualization */}
        <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
          <div ref={mapRef} className="w-full h-full z-0" />
          
          {/* Map Controls */}
          <div className="absolute top-8 right-8 flex flex-col gap-3 z-[100]">
            <button 
              onClick={handleLocateMe}
              disabled={locating}
              className="w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl text-blue-500 hover:bg-white hover:text-black transition-all shadow-2xl flex items-center justify-center group/btn"
              title="Locate Me"
            >
              <Navigation className={`w-5 h-5 ${locating ? 'animate-spin' : 'group-hover/btn:rotate-45 transition-transform'}`} />
            </button>
            <button 
              className="w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl text-white hover:bg-white hover:text-black transition-all shadow-2xl flex items-center justify-center"
              title="3D View"
              onClick={() => {
                if (mapInstance.current) {
                  const pitch = mapInstance.current.getPitch();
                  mapInstance.current.setPitch(pitch === 0 ? 45 : 0);
                }
              }}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Status Overlay */}
          <div className="absolute bottom-8 right-8 z-[100]">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Updates</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {activeTab === 'ambulance' ? `${ambulances.length} Units` : activeTab === 'delivery' ? `${deliveries.length} Orders` : 'Hospital View'}
              </div>
            </div>
          </div>

          {!(import.meta as any).env.VITE_AMAP_KEY && (
            <div className="absolute inset-0 bg-[#050505] backdrop-blur-sm flex items-center justify-center p-8 overflow-y-auto z-[100]">
              <AMapSetupGuide />
            </div>
          )}

          {activeTab === 'hospital' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[50]">
              <div className="bg-black/80 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest shadow-2xl">
                Switch to Ambulance or Delivery for City View
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
