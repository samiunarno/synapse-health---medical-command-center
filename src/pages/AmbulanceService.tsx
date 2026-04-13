import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Map as MapIcon,
  X,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import AMapLoader from '@amap/amap-jsapi-loader';
import AMapSetupGuide from '../components/AMapSetupGuide';

export default function AmbulanceService() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<[number, number]>([23.8103, 90.4125]); // Default to Dhaka
  const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [serviceType, setServiceType] = useState<'Standard' | 'Fast' | 'Express'>('Standard');
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [assignedAmbulanceId, setAssignedAmbulanceId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const [showNearbyHospitals, setShowNearbyHospitals] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [pickingMode, setPickingMode] = useState<'pickup' | 'destination'>('pickup');
  const pickingModeRef = useRef(pickingMode);
  const autoCompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    pickingModeRef.current = pickingMode;
  }, [pickingMode]);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any>({});
  const routeRef = useRef<any>(null);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPickupLocation([latitude, longitude]);
        if (mapInstance.current) {
          mapInstance.current.setCenter([longitude, latitude]);
          mapInstance.current.setZoom(15);
        }
        setLocating(false);
        
        // Reverse geocoding if AMap is available
        if ((window as any).AMap) {
          const AMap = (window as any).AMap;
          AMap.plugin('AMap.Geocoder', () => {
            const geocoder = new AMap.Geocoder();
            geocoder.getAddress([longitude, latitude], (status: string, result: any) => {
              if (status === 'complete' && result.regeocode) {
                setAddress(result.regeocode.formattedAddress);
              }
            });
          });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert('Geolocation permission denied. Please enable location services to use this feature.');
        } else {
          console.error('Geolocation error:', error.message || 'Unknown error');
        }
        setLocating(false);
      }
    );
  };

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
        plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar', 'AMap.MoveAnimation', 'AMap.Driving', 'AMap.AutoComplete', 'AMap.PlaceSearch'],
      }).then((AMap) => {
        if (!mapRef.current) {
          console.error('Map container div not found');
          return;
        }
        const map = new AMap.Map(mapRef.current, {
          zoom: 15,
          center: [pickupLocation[1], pickupLocation[0]], // AMap uses [lng, lat]
          viewMode: '3D',
          theme: 'dark',
          pitch: 45,
          features: ['bg', 'road', 'building', 'point']
        });

        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
        mapInstance.current = map;
        (window as any).AMap = AMap; // Make AMap available globally for other functions
        
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

        // Initial markers
        updateMarkers(AMap);
        
        // Locate user after map is ready
        handleLocateMe();
      }).catch(e => {
        console.error('AMap load failed', e);
      });
    }

    fetchRequests();
    fetchAmbulances();
    fetchDoctors();
    fetchHospitals();

    const socket = io(window.location.origin);
    socketRef.current = socket;
    
    socket.on('ambulance_updated', (updatedAmbulance) => {
      setAmbulances(prev => prev.map(a => a._id === updatedAmbulance._id ? updatedAmbulance : a));
    });

    socket.on('ambulance_location_changed', (data) => {
      // data: { ambulanceId: string, location: { lat: number, lng: number }, requestId?: string }
      setAmbulances(prev => prev.map(a => 
        a._id === data.ambulanceId 
          ? { ...a, current_location: data.location } 
          : a
      ));
    });

    socket.on('ambulance_request_updated', (updatedRequest) => {
      setRequests(prev => prev.map(r => r._id === updatedRequest._id ? updatedRequest : r));
      if (activeRequest?._id === updatedRequest._id) {
        setActiveRequest(updatedRequest);
      }
    });

    // Auto-detect location on mount
    handleLocateMe();

    return () => {
      socket.disconnect();
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (user?.role === 'Driver' && assignedAmbulanceId && socketRef.current) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socketRef.current.emit('driver_location_update', {
            ambulanceId: assignedAmbulanceId,
            location: { lat: latitude, lng: longitude }
          });
        },
        (error) => console.error('Error watching position:', error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user?.role, assignedAmbulanceId]);

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

    // Patient Marker
    if (!markersRef.current.patient) {
      markersRef.current.patient = new AMap.Marker({
        position: [pickupLocation[1], pickupLocation[0]],
        content: `
          <div class="relative">
            <div class="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="relative bg-blue-600 p-2.5 rounded-2xl border-2 border-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        `,
        offset: new AMap.Pixel(-18, -18),
        title: 'Your Location',
        zIndex: 100
      });
      map.add(markersRef.current.patient);
    } else {
      markersRef.current.patient.setPosition([pickupLocation[1], pickupLocation[0]]);
    }

    // Destination Marker
    if (destinationLocation) {
      if (!markersRef.current.destination) {
        markersRef.current.destination = new AMap.Marker({
          position: [destinationLocation[1], destinationLocation[0]],
          content: `
            <div class="bg-red-600 p-2.5 rounded-2xl border-2 border-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          `,
          offset: new AMap.Pixel(-18, -18),
          title: 'Destination',
          zIndex: 90
        });
        map.add(markersRef.current.destination);
      } else {
        markersRef.current.destination.setPosition([destinationLocation[1], destinationLocation[0]]);
      }
      
      drawRoute(AMap);
    }

    // Ambulance Markers
    ambulances.forEach(amb => {
      if (amb.current_location) {
        const key = `amb_${amb._id}`;
        if (!markersRef.current[key]) {
          markersRef.current[key] = new AMap.Marker({
            position: [amb.current_location.lng, amb.current_location.lat],
            content: `
              <div class="bg-white p-1.5 rounded-xl border-2 border-red-600 shadow-xl transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-4.293-1.43a2 2 0 0 1-1.023-1.1l-1.023-2.046A2 2 0 0 0 13.191 6H12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
              </div>
            `,
            offset: new AMap.Pixel(-15, -15),
            title: amb.vehicle_number
          });
          map.add(markersRef.current[key]);
        } else {
          markersRef.current[key].setPosition([amb.current_location.lng, amb.current_location.lat]);
        }
      }
    });

    // Hospitals
    if (showNearbyHospitals) {
      hospitals.forEach(hosp => {
        if (hosp.location) {
          const key = `hosp_${hosp._id}`;
          if (!markersRef.current[key]) {
            markersRef.current[key] = new AMap.Marker({
              position: [hosp.location.lng || 90.4125, hosp.location.lat || 23.8103],
              content: `<div class="bg-emerald-600 p-2 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7a5 5 0 0 0-5 5v3h16v-3a5 5 0 0 0-5-5h-3V7a5 5 0 0 1 5-5h3V2Z"/><path d="M12 14v7"/><path d="M9 21h6"/></svg></div>`,
              offset: new AMap.Pixel(-16, -16),
              title: hosp.name
            });
            markersRef.current[key].on('click', () => {
              const lat = hosp.location.lat || 23.8103;
              const lng = hosp.location.lng || 90.4125;
              setDestinationLocation([lat, lng]);
              setDestinationAddress(hosp.name);
              if (mapInstance.current) {
                mapInstance.current.setCenter([lng, lat]);
                mapInstance.current.setZoom(15);
              }
            });
            map.add(markersRef.current[key]);
          }
        }
      });
    }

    // Auto-center on active request if it moves
    if (activeRequest?.ambulance_id?.current_location) {
      map.setCenter([activeRequest.ambulance_id.current_location.lng, activeRequest.ambulance_id.current_location.lat]);
    }
  };

  const drawRoute = (AMap: any) => {
    if (!mapInstance.current || !destinationLocation) return;
    const map = mapInstance.current;

    if (routeRef.current) {
      routeRef.current.clear();
    }

    AMap.plugin('AMap.Driving', () => {
      const driving = new AMap.Driving({
        map: map,
        panel: '',
        hideMarkers: true
      });
      driving.search(
        new AMap.LngLat(pickupLocation[1], pickupLocation[0]),
        new AMap.LngLat(destinationLocation[1], destinationLocation[0]),
        (status: string, result: any) => {
          if (status === 'complete') {
            routeRef.current = driving;
          }
        }
      );
    });
  };

  const trafficLayerRef = useRef<any>(null);

  useEffect(() => {
    if (mapInstance.current && (window as any).AMap) {
      const AMap = (window as any).AMap;
      if (showTraffic) {
        if (!trafficLayerRef.current) {
          trafficLayerRef.current = new AMap.TileLayer.Traffic({
            zIndex: 10
          });
        }
        mapInstance.current.add(trafficLayerRef.current);
      } else if (trafficLayerRef.current) {
        mapInstance.current.remove(trafficLayerRef.current);
      }
    }
  }, [showTraffic]);

  useEffect(() => {
    if ((window as any).AMap && mapInstance.current) {
      updateMarkers((window as any).AMap);
    }
  }, [ambulances, doctors, hospitals, activeRequest, pickupLocation, destinationLocation, showNearbyHospitals]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Failed to fetch doctors');
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

  const fetchRequests = async () => {
    try {
      const endpoint = user?.role === 'Patient' 
        ? '/api/advanced/ambulances/my-requests' 
        : '/api/advanced/ambulances/all-requests';
        
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
        let active;
        if (user?.role === 'Driver') {
          active = data.find((r: any) => 
            (r.driver_id?._id === user.id || r.driver_id === user.id) && 
            ['Accepted', 'Dispatched', 'Arrived'].includes(r.status)
          );
          if (active && active.ambulance_id) {
            setAssignedAmbulanceId(typeof active.ambulance_id === 'object' ? active.ambulance_id._id : active.ambulance_id);
          }
        } else {
          active = data.find((r: any) => ['Pending', 'Accepted', 'Dispatched', 'Arrived'].includes(r.status));
        }
        setActiveRequest(active || null);
      } else {
        console.error('Failed to fetch requests:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbulances = async () => {
    try {
      const res = await fetch('/api/advanced/ambulances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAmbulances(data);
    } catch (err) {
      console.error('Failed to fetch ambulances');
    }
  };

  const handleSearch = (query: string, type: 'pickup' | 'destination') => {
    if (!(window as any).AMap || !query) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    const AMap = (window as any).AMap;
    
    // Filter local hospitals
    const localHospMatches = hospitals
      .filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
      .map(h => ({
        name: h.name,
        district: 'Local Hospital',
        location: h.location ? new AMap.LngLat(h.location.lng, h.location.lat) : null,
        isLocal: true
      }))
      .filter(h => h.location !== null);

    AMap.plugin('AMap.AutoComplete', () => {
      const autoOptions = { city: 'Dhaka' };
      const autoComplete = new AMap.AutoComplete(autoOptions);
      autoComplete.search(query, (status: string, result: any) => {
        let suggestions = localHospMatches;
        if (status === 'complete' && result.tips) {
          // Merge and avoid duplicates
          const amapTips = result.tips.filter((tip: any) => 
            !localHospMatches.some(lh => lh.name === tip.name)
          );
          suggestions = [...localHospMatches, ...amapTips];
        }
        
        if (type === 'pickup') setPickupSuggestions(suggestions);
        else setDestSuggestions(suggestions);
      });
    });
  };

  const selectSuggestion = (tip: any, type: 'pickup' | 'destination') => {
    if (!tip.location) return;
    const { lng, lat } = tip.location;
    if (type === 'pickup') {
      setPickupLocation([lat, lng]);
      setAddress(tip.name);
      setPickupSuggestions([]);
    } else {
      setDestinationLocation([lat, lng]);
      setDestinationAddress(tip.name);
      setDestSuggestions([]);
    }
    if (mapInstance.current) {
      mapInstance.current.setCenter([lng, lat]);
      mapInstance.current.setZoom(16);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationLocation) return alert('Please select a destination hospital');
    setRequesting(true);
    try {
      const res = await fetch('/api/advanced/ambulances/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pickup_location: {
            lat: pickupLocation[0],
            lng: pickupLocation[1],
            address
          },
          destination_location: {
            lat: destinationLocation[0],
            lng: destinationLocation[1],
            address: destinationAddress
          },
          service_type: serviceType,
          notes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRequest(data);
        fetchRequests();
        setAddress('');
        setDestinationAddress('');
        setDestinationLocation(null);
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to request ambulance');
    } finally {
      setRequesting(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const availableAmb = ambulances.find(a => a.status === 'Available');
      if (!availableAmb) return alert('No available ambulances found in system');

      const res = await fetch(`/api/advanced/ambulances/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'Accepted',
          ambulance_id: availableAmb._id,
          driver_id: user?.id
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAssignedAmbulanceId(availableAmb._id);
        fetchRequests();
      }
    } catch (err) {
      console.error('Accept failed');
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/advanced/ambulances/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error('Update status failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'Accepted': return 'text-blue-500 bg-blue-500/10';
      case 'Dispatched': return 'text-purple-500 bg-purple-500/10';
      case 'Arrived': return 'text-orange-500 bg-orange-500/10';
      case 'Completed': return 'text-green-500 bg-green-500/10';
      case 'Cancelled': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const simulateMovement = async () => {
    if (!activeRequest?.ambulance_id?._id) return;
    setSimulating(true);
    try {
      await fetch(`/api/advanced/ambulances/${activeRequest.ambulance_id._id}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          target_lat: activeRequest.pickup_location.lat,
          target_lng: activeRequest.pickup_location.lng
        })
      });
    } catch (err) {
      console.error('Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">Ambulance Service</h2>
          <p className="text-gray-400 font-medium">Real-time emergency response and tracking</p>
        </div>
      </div>

      {/* Driver View */}
      {user?.role === 'Driver' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] md:h-[600px] bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl">
            <div ref={mapRef} className="w-full h-full z-0" />
            
            <div className="absolute top-4 right-4 z-[100]">
               <button 
                onClick={handleLocateMe}
                className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all shadow-xl"
                title="Locate Me"
              >
                <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {!(import.meta as any).env.VITE_AMAP_KEY && (
              <div className="absolute inset-0 bg-[#050505] backdrop-blur-sm flex items-center justify-center p-8 overflow-y-auto z-[100]">
                <AMapSetupGuide />
              </div>
            )}
          </div>
          <div className="space-y-6">
            {activeRequest && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Active Request</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(activeRequest.status)}`}>
                    {activeRequest.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pickup</p>
                      <p className="text-sm text-white font-medium">{activeRequest.pickup_location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                      <Navigation className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Destination</p>
                      <p className="text-sm text-white font-medium">{activeRequest.destination_location?.address}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {activeRequest.status === 'Accepted' && (
                    <button 
                      onClick={() => updateRequestStatus(activeRequest._id, 'Dispatched')}
                      className="col-span-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      Mark as Dispatched
                    </button>
                  )}
                  {activeRequest.status === 'Dispatched' && (
                    <button 
                      onClick={() => updateRequestStatus(activeRequest._id, 'Arrived')}
                      className="col-span-2 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Mark as Arrived
                    </button>
                  )}
                  {activeRequest.status === 'Arrived' && (
                    <button 
                      onClick={() => updateRequestStatus(activeRequest._id, 'Completed')}
                      className="col-span-2 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Complete Trip
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white/2 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-tight">Pending Requests</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {requests.filter(r => r.status === 'Pending').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending requests</p>
                ) : (
                  requests.filter(r => r.status === 'Pending').map(req => (
                    <div key={req._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                          {req.service_type || 'Standard'}
                        </span>
                        <p className="text-[10px] text-gray-500 font-mono">{req._id.slice(-6)}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-xs text-white font-medium">{req.pickup_location.address}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 mt-1.5 shrink-0" />
                          <p className="text-xs text-gray-400">{req.destination_location?.address}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => acceptRequest(req._id)}
                        className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Accept Request
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role !== 'Driver' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-6 relative h-[600px] md:h-[700px] lg:h-[800px]">
            <div className="bg-[#0a0a0a] rounded-[3rem] border border-white/10 overflow-hidden h-full relative shadow-2xl group">
              <div ref={mapRef} className="w-full h-full z-0" />
              
              {/* Map Controls Overlay */}
              <div className="absolute top-8 right-8 flex flex-col gap-3 z-[100]">
                <button 
                  onClick={handleLocateMe}
                  className="w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl text-white hover:bg-white hover:text-black transition-all shadow-2xl flex items-center justify-center group/btn"
                  title="Locate Me"
                >
                  <Navigation className={`w-5 h-5 ${locating ? 'animate-spin' : 'group-hover/btn:rotate-45 transition-transform'}`} />
                </button>
                <button 
                  onClick={() => setShowNearbyHospitals(!showNearbyHospitals)}
                  className={`w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all shadow-2xl flex items-center justify-center ${showNearbyHospitals ? 'text-emerald-500' : 'text-white'}`}
                  title="Toggle Hospitals"
                >
                  <MapIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowTraffic(!showTraffic)}
                  className={`w-12 h-12 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all shadow-2xl flex items-center justify-center ${showTraffic ? 'text-blue-500' : 'text-white'}`}
                  title="Toggle Traffic"
                >
                  <Activity className="w-5 h-5" />
                </button>
              </div>

              {/* Status Indicator Overlay */}
              <div className="absolute bottom-8 left-8 z-[100] flex flex-col gap-3">
                <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex items-center gap-5 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">System Live</span>
                  </div>
                  <div className="w-px h-5 bg-white/10" />
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{ambulances.filter(a => a.status === 'Available').length} Ready</span>
                  </div>
                </div>
              </div>

              {!(import.meta as any).env.VITE_AMAP_KEY && (
                <div className="absolute inset-0 bg-[#050505] backdrop-blur-sm flex items-center justify-center p-8 overflow-y-auto z-[100]">
                  <AMapSetupGuide />
                </div>
              )}

              {/* Floating Booking Status (Uber Style) */}
              {!activeRequest || activeRequest.status === 'Completed' || activeRequest.status === 'Cancelled' ? (
                <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[380px] z-[100]">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-black/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">Book Ambulance</h3>
                      <div className="flex gap-1.5 bg-white/5 p-1 rounded-full">
                        <button 
                          onClick={() => setPickingMode('pickup')}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${pickingMode === 'pickup' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          Pickup
                        </button>
                        <button 
                          onClick={() => setPickingMode('destination')}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${pickingMode === 'destination' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          Dest
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleRequest} className="space-y-4">
                      <div className="space-y-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 z-10 rounded-full" />
                        <input 
                          type="text"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            handleSearch(e.target.value, 'pickup');
                          }}
                          placeholder="Pickup Location"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-10 pr-12 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                          required
                        />
                        <button 
                          type="button"
                          onClick={handleLocateMe}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400"
                        >
                          <MapPin className="w-5 h-5" />
                        </button>
                        
                        {/* Pickup Suggestions */}
                        <AnimatePresence>
                          {pickupSuggestions.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-[1100] shadow-2xl"
                            >
                              {pickupSuggestions.map((tip, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => selectSuggestion(tip, 'pickup')}
                                  className="w-full p-4 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                                >
                                  <p className="text-sm text-white font-bold">{tip.name}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{tip.district || tip.address}</p>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 z-10" />
                        <input 
                          type="text"
                          value={destinationAddress}
                          onChange={(e) => {
                            setDestinationAddress(e.target.value);
                            handleSearch(e.target.value, 'destination');
                          }}
                          placeholder="Destination Hospital"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                          required
                        />
                        
                        {/* Destination Suggestions */}
                        <AnimatePresence>
                          {destSuggestions.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-[1100] shadow-2xl"
                            >
                              {destSuggestions.map((tip, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => selectSuggestion(tip, 'destination')}
                                  className="w-full p-4 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                                >
                                  <p className="text-sm text-white font-bold">{tip.name}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{tip.district || tip.address}</p>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Service Type Selection */}
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {(['Standard', 'Fast', 'Express'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setServiceType(type)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                              serviceType === type 
                                ? 'bg-blue-600/10 border-blue-500 text-blue-500' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            <Truck className={`w-5 h-5 ${type === 'Express' ? 'animate-bounce' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{type}</span>
                          </button>
                        ))}
                      </div>

                      <button 
                        type="submit"
                        disabled={requesting || !!activeRequest}
                        className="w-full py-5 bg-white text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-white/5 flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                        {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : activeRequest ? 'Request Active' : 'Confirm Booking'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </form>
                  </motion.div>
                </div>
              ) : (
                <div className="absolute bottom-4 left-4 right-4 z-[100]">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-black/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-red-600/20">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <p className="text-white font-black uppercase tracking-widest text-[10px]">Ambulance {activeRequest.status}</p>
                        </div>
                        <p className="text-gray-400 text-[10px] font-bold">
                          {activeRequest.ambulance_id ? `Driver: ${activeRequest.ambulance_id.driver_name} • ${activeRequest.ambulance_id.vehicle_number}` : 'Optimizing route & assigning driver...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      {(activeRequest.status === 'Dispatched' || activeRequest.status === 'Accepted') && (
                        <button 
                          onClick={simulateMovement}
                          disabled={simulating}
                          className="flex-1 md:flex-none px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-gray-200 shadow-xl"
                        >
                          {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                          Live Tracking
                        </button>
                      )}
                      {activeRequest.ambulance_id?.eta && (
                        <div className="text-right min-w-[60px]">
                          <p className="text-red-500 font-display font-black text-3xl tracking-tighter leading-none">{activeRequest.ambulance_id.eta}m</p>
                          <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">ETA</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <div className="bg-red-600/10 rounded-[2rem] border border-red-500/20 p-8">
              <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Emergency Contacts
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-white font-bold">Hospital Emergency</p>
                    <p className="text-gray-400 text-xs">+1 (555) 000-911</p>
                  </div>
                  <button className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors">
                    <Phone className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white/5 rounded-[2rem] border border-white/10 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {requests.map((req) => (
                  <div key={req._id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(req.status)}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-xs truncate">{req.pickup_location.address || 'Emergency'}</p>
                        <p className="text-gray-500 text-[10px] truncate">To: {req.destination_location?.address || 'Hospital'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
