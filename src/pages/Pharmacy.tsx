import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Pill, 
  Search, 
  Plus, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Tag,
  ArrowRight,
  ShoppingCart,
  X,
  Truck,
  History,
  Clock,
  MapPin,
  Navigation,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import AMapLoader from '@amap/amap-jsapi-loader';

import { useTranslation } from 'react-i18next';

export default function Pharmacy() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [newMedicine, setNewMedicine] = useState({
    brand_name: '',
    generic_name: '',
    stock_quantity: 0,
    price: 0,
    aliases: [] as string[]
  });
  const [aliasInput, setAliasInput] = useState('');
  const [interactionAlert, setInteractionAlert] = useState<{message: string, severity: 'warning' | 'danger'} | null>(null);
  
  // Ordering State
  const [cart, setCart] = useState<{medicine: any, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAllOrdersOpen, setIsAllOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState<'Standard' | 'Fast' | 'Express'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'WeChat' | 'Alipay'>('Cash');
  const [showQR, setShowQR] = useState(false);
  const [qrType, setQrType] = useState<'WeChat' | 'Alipay' | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [assignedOrderId, setAssignedOrderId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const [eta, setEta] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any>({});
  const drivingRef = useRef<any>(null);

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  useEffect(() => {
    if (user?.role === 'Patient') {
      fetchMyOrders();
    }
    if (['Admin', 'Staff', 'Pharmacist'].includes(user?.role || '')) {
      fetchAllOrders();
    }
    
    const socket = io(window.location.origin);
    socketRef.current = socket;
    
    socket.on('pharmacy_updated', () => {
      fetchMedicines();
    });

    socket.on('rider_location_changed', (data) => {
      // data: { orderId: string, location: { lat: number, lng: number } }
      setOrders(prev => prev.map(o => 
        o._id === data.orderId 
          ? { ...o, rider_location: data.location } 
          : o
      ));
      setAllOrders(prev => prev.map(o => 
        o._id === data.orderId 
          ? { ...o, rider_location: data.location } 
          : o
      ));
      if (trackingOrder?._id === data.orderId) {
        setTrackingOrder((prev: any) => ({ ...prev, rider_location: data.location }));
      }
    });

    socket.on('medicine_order_updated', (updatedOrder: any) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setAllOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      if (trackingOrder?._id === updatedOrder._id) {
        setTrackingOrder(updatedOrder);
      }
    });

    socket.on('new_medicine_order', () => {
      if (['Admin', 'Staff', 'Pharmacist'].includes(user?.role || '')) {
        fetchAllOrders();
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
    if (user?.role === 'Rider' && assignedOrderId && socketRef.current) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socketRef.current.emit('rider_location_update', {
            orderId: assignedOrderId,
            location: { lat: latitude, lng: longitude }
          });
        },
        (error) => console.error('Error watching position:', error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user?.role, assignedOrderId]);

  useEffect(() => {
    if (trackingOrder && mapRef.current) {
      const amapKey = (import.meta as any).env.VITE_AMAP_KEY;
      const amapSecurityCode = (import.meta as any).env.VITE_AMAP_SECURITY_JS_CODE;

      if (amapKey && !mapInstance.current) {
        if (amapSecurityCode) {
          (window as any)._AMapSecurityConfig = { securityJsCode: amapSecurityCode };
        }

        AMapLoader.load({
          key: amapKey,
          version: '2.0',
          plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.MoveAnimation', 'AMap.Driving'],
        }).then((AMap) => {
          const map = new AMap.Map(mapRef.current, {
            zoom: 14,
            center: [trackingOrder.rider_location?.lng || 90.4125, trackingOrder.rider_location?.lat || 23.8103],
            theme: 'dark'
          });
          mapInstance.current = map;
          updateTrackingMarkers(AMap);
        });
      } else if (mapInstance.current) {
        updateTrackingMarkers((window as any).AMap);
      }
    }
  }, [trackingOrder]);

  const updateTrackingMarkers = (AMap: any) => {
    if (!mapInstance.current || !trackingOrder) return;
    const map = mapInstance.current;

    // Rider Marker
    if (trackingOrder.rider_location) {
      if (!markersRef.current.rider) {
        markersRef.current.rider = new AMap.Marker({
          position: [trackingOrder.rider_location.lng, trackingOrder.rider_location.lat],
          content: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/><path d="M18.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/><path d="M5.5 17h13"/><path d="M15 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M15 6.5 11 17"/><path d="M7 10h8l2 7H5l2-7Z"/></svg></div>`,
          offset: new AMap.Pixel(-16, -16),
          title: 'Rider'
        });
        map.add(markersRef.current.rider);
      } else {
        markersRef.current.rider.setPosition([trackingOrder.rider_location.lng, trackingOrder.rider_location.lat]);
      }
      
      // Calculate ETA if we have destination (simulated for now as we don't store delivery coords in model yet, 
      // but we can use the address or a default point)
      // For this demo, let's assume a target point in Dhaka
      const targetLng = 90.4125;
      const targetLat = 23.8103;

      if (!drivingRef.current) {
        AMap.plugin('AMap.Driving', () => {
          drivingRef.current = new AMap.Driving({ map: map, hideMarkers: true });
          calculateEta(targetLng, targetLat);
        });
      } else {
        calculateEta(targetLng, targetLat);
      }

      map.setCenter([trackingOrder.rider_location.lng, trackingOrder.rider_location.lat]);
    }
  };

  const calculateEta = (targetLng: number, targetLat: number) => {
    if (!drivingRef.current || !trackingOrder.rider_location) return;
    drivingRef.current.search(
      [trackingOrder.rider_location.lng, trackingOrder.rider_location.lat],
      [targetLng, targetLat],
      (status: string, result: any) => {
        if (status === 'complete' && result.routes && result.routes[0]) {
          const duration = Math.ceil(result.routes[0].time / 60);
          setEta(`${duration} mins`);
        }
      }
    );
  };

  const simulateRiderMovement = async () => {
    if (!trackingOrder) return;
    try {
      await fetch(`/api/pharmacy/orders/${trackingOrder._id}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          target_lat: 23.8103, // Simulate moving towards a fixed point for now
          target_lng: 90.4125
        })
      });
    } catch (err) {
      console.error('Simulation failed');
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/pharmacy/orders/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const fetchAllOrders = async () => {
    try {
      const res = await fetch('/api/pharmacy/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch all orders');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAllOrders();
      }
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const checkInteractions = (newCart: any[]) => {
    // Simulated interaction rules
    const interactionRules = [
      { drugs: ['Aspirin', 'Warfarin'], message: 'High risk of bleeding. Consult your doctor.', severity: 'danger' as const },
      { drugs: ['Ibuprofen', 'Aspirin'], message: 'May reduce effectiveness of Aspirin.', severity: 'warning' as const },
      { drugs: ['Amoxicillin', 'Birth Control'], message: 'May reduce effectiveness of oral contraceptives.', severity: 'warning' as const }
    ];

    const drugNames = newCart.map(item => item.medicine.brand_name);
    
    for (const rule of interactionRules) {
      if (rule.drugs.every(drug => drugNames.some(name => name.toLowerCase().includes(drug.toLowerCase())))) {
        setInteractionAlert(rule);
        return;
      }
    }
    setInteractionAlert(null);
  };

  const addToCart = (medicine: any, openCart = true) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicine._id === medicine._id);
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          item.medicine._id === medicine._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        newCart = [...prev, { medicine, quantity: 1 }];
      }
      checkInteractions(newCart);
      return newCart;
    });
    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.medicine._id !== medicineId);
      checkInteractions(newCart);
      return newCart;
    });
  };

  const updateCartQuantity = (medicineId: string, delta: number) => {
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.medicine._id === medicineId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      checkInteractions(newCart);
      return newCart;
    });
  };

  const handleAddressSearch = (query: string) => {
    if (!(window as any).AMap || !query) {
      setAddressSuggestions([]);
      return;
    }
    const AMap = (window as any).AMap;
    AMap.plugin('AMap.AutoComplete', () => {
      const autoComplete = new AMap.AutoComplete({ city: 'Dhaka' });
      autoComplete.search(query, (status: string, result: any) => {
        if (status === 'complete' && result.tips) {
          setAddressSuggestions(result.tips);
        }
      });
    });
  };

  const selectAddress = (tip: any) => {
    setDeliveryAddress(tip.name);
    setAddressSuggestions([]);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please log in to place an order.');
      window.location.href = '/login';
      return;
    }
    if (!deliveryAddress) return alert('Please provide a delivery address');
    
    if ((paymentMethod === 'WeChat' || paymentMethod === 'Alipay') && !showQR) {
      setQrType(paymentMethod);
      setShowQR(true);
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const totalPrice = cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
      const res = await fetch('/api/pharmacy/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          medicines: cart.map(item => ({ medicine_id: item.medicine._id, quantity: item.quantity })),
          total_price: totalPrice,
          delivery_address: deliveryAddress,
          service_type: serviceType,
          payment_method: paymentMethod
        })
      });
      if (res.ok) {
        setCart([]);
        setIsCartOpen(false);
        setDeliveryAddress('');
        setShowQR(false);
        setQrType(null);
        fetchMyOrders();
        alert('Order placed successfully!');
      }
    } catch (err) {
      console.error('Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
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
        body: JSON.stringify({ 
          status: 'Processing',
          rider_id: user?._id,
          rider_status: 'GoingToPharmacy'
        })
      });
      if (res.ok) {
        setAssignedOrderId(orderId);
        const data = await res.json();
        setTrackingOrder(data);
        fetchAllOrders();
      }
    } catch (err) {
      console.error('Accept failed');
    }
  };

  const updateRiderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rider_status: status, rider_id: user?.id })
      });
      if (res.ok) {
        setAssignedOrderId(orderId);
        fetchAllOrders();
      }
    } catch (err) {
      console.error('Update status failed');
    }
  };

  // Simulate automated drug interaction check
  const checkDrugInteractions = async (medicineName: string) => {
    try {
      const res = await fetch('/api/pharmacy/check-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ medicineName, searchTerm: search })
      });
      if (res.ok) {
        const data = await res.json();
        setInteractionAlert(data);
      }
    } catch (err) {
      console.error('Failed to check interactions');
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`/api/pharmacy/medicines?q=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pharmacy/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMedicine)
      });
      if (res.ok) {
        fetchMedicines();
        setIsAddModalOpen(false);
        setNewMedicine({ brand_name: '', generic_name: '', stock_quantity: 0, price: 0, aliases: [] });
      }
    } catch (err) {
      console.error('Failed to add medicine');
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    try {
      const res = await fetch(`/api/pharmacy/medicines/${selectedMedicine._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedMedicine)
      });
      if (res.ok) {
        fetchMedicines();
        setIsEditModalOpen(false);
        setSelectedMedicine(null);
      }
    } catch (err) {
      console.error('Failed to update medicine');
    }
  };

  const addAlias = (isEdit = false) => {
    if (!aliasInput) return;
    
    // Support comma-separated aliases
    const newAliases = aliasInput
      .split(',')
      .map(a => a.trim())
      .filter(a => a !== '');

    if (isEdit && selectedMedicine) {
      const currentAliases = selectedMedicine.aliases || [];
      const updatedAliases = [...new Set([...currentAliases, ...newAliases])];
      setSelectedMedicine({ ...selectedMedicine, aliases: updatedAliases });
    } else {
      const currentAliases = newMedicine.aliases || [];
      const updatedAliases = [...new Set([...currentAliases, ...newAliases])];
      setNewMedicine({ ...newMedicine, aliases: updatedAliases });
    }
    setAliasInput('');
  };

  const removeAlias = (alias: string, isEdit = false) => {
    if (isEdit && selectedMedicine) {
      setSelectedMedicine({ ...selectedMedicine, aliases: selectedMedicine.aliases.filter((a: string) => a !== alias) });
    } else {
      setNewMedicine({ ...newMedicine, aliases: newMedicine.aliases.filter(a => a !== alias) });
    }
  };

  return (
    <div className="space-y-8">
      {/* Rider View */}
      {user?.role === 'Rider' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[600px] bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden relative">
              <div ref={mapRef} className="w-full h-full" />
              {trackingOrder && (
                <div className="absolute top-6 left-6 z-[1000] bg-black/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Active Delivery</p>
                  <p className="text-white font-bold mb-4">{trackingOrder.delivery_address}</p>
                  <div className="flex flex-wrap gap-2">
                    {['GoingToPharmacy', 'AtPharmacy', 'PickedUp', 'Delivering', 'Arrived'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateRiderStatus(trackingOrder._id, status)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                          trackingOrder.rider_status === status ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-white/2 border border-white/10 rounded-[2rem] p-8">
                <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-tight">Available Orders</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {allOrders.filter(o => o.status === 'Pending').length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No pending orders</p>
                  ) : (
                    allOrders.filter(o => o.status === 'Pending').map(order => (
                      <div key={order._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                            {order.service_type || 'Standard'}
                          </span>
                          <p className="text-[10px] text-gray-500 font-mono">¥{order.total_price}</p>
                        </div>
                        <p className="text-xs text-white font-medium">{order.delivery_address}</p>
                        <button 
                          onClick={() => acceptOrder(order._id)}
                          className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Accept Order
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role !== 'Rider' && (
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">{t('pharmacy_title')}</h1>
          <p className="text-gray-500 font-medium">{t('pharmacy_desc')}</p>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'Patient' && (
            <>
              <button 
                onClick={() => setIsOrderHistoryOpen(true)}
                className="flex items-center gap-2 bg-white/5 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10"
              >
                <History className="w-5 h-5" />
                Orders
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </>
          )}
          {['Admin', 'Staff', 'Pharmacist'].includes(user?.role || '') && (
            <button 
              onClick={() => setIsAllOrdersOpen(true)}
              className="flex items-center gap-2 bg-white/5 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10"
            >
              <Package className="w-5 h-5" />
              Manage Orders
            </button>
          )}
          {(user?.role === 'Admin') && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              {t('add_new_medicine')}
            </button>
          )}
        </div>
      </header>

      {/* Low Stock Alert Summary */}
      {medicines.some(m => m.stock_quantity < 10) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-4 flex items-center gap-4 text-red-400">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="font-bold">{t('low_stock_warning')}</p>
            <p className="text-xs font-medium opacity-80">
              {t('low_stock_desc', { count: medicines.filter(m => m.stock_quantity < 10).length })}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white/2 p-4 rounded-3xl border border-white/5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by brand, generic name, or alias..." 
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-700"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              checkDrugInteractions(e.target.value);
            }}
          />
        </div>
        
        {/* Drug Interaction Alert */}
        {interactionAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border flex items-start gap-4 ${
              interactionAlert.severity === 'danger' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}
          >
            <AlertTriangle className={`w-6 h-6 shrink-0 ${interactionAlert.severity === 'danger' ? 'animate-pulse' : ''}`} />
            <div>
              <p className="font-bold text-sm uppercase tracking-widest mb-1">Drug Interaction Detected</p>
              <p className="text-sm font-medium opacity-90">{interactionAlert.message}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Loading medicines...</div>
        ) : medicines.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No medicines found.</div>
        ) : (
          medicines.map((med) => (
            <motion.div
              key={med.id}
              whileHover={{ y: -5 }}
              className={`bg-white/2 p-6 rounded-3xl border ${med.stock_quantity < 10 ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/5'} shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all group`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-600/10 border border-green-500/20 text-green-400 flex items-center justify-center relative">
                    <Pill className="w-8 h-8" />
                    {med.stock_quantity < 10 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0a0a] animate-pulse shadow-lg shadow-red-500/50" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors truncate">{med.brand_name}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-tight truncate">{med.generic_name}</p>
                  </div>
                </div>
                {med.stock_quantity < 10 && (
                  <div className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20" title="Low Stock">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">In Stock</span>
                  </div>
                  <span className={`text-sm font-bold ${med.stock_quantity < 10 ? 'text-red-400' : 'text-white'}`}>
                    {med.stock_quantity} units
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Price</span>
                  </div>
                  <span className="text-sm font-bold text-white">¥{med.price.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Aliases</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(med.aliases || []).map((alias: string) => (
                      <span key={alias} className="text-[10px] font-bold px-2 py-1 bg-white/5 text-gray-500 rounded-lg border border-white/5">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {(user?.role === 'Admin' || user?.role === 'Staff') && (
                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedMedicine({ ...med });
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600/10 border border-green-500/20 text-green-400 rounded-2xl font-bold hover:bg-green-600 hover:text-white transition-all"
                  >
                    Edit Medicine
                  </button>
                  <button className="p-3 bg-white/5 text-gray-500 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {user?.role === 'Patient' && (
                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                  <button 
                    onClick={() => addToCart(med, false)}
                    disabled={med.stock_quantity === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add
                  </button>
                  <button 
                    onClick={() => addToCart(med, true)}
                    disabled={med.stock_quantity === 0}
                    className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:bg-gray-800 disabled:shadow-none"
                  >
                    <Truck className="w-5 h-5" />
                    {med.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {/* Cart Sidebar */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-display font-bold text-white">Your Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {interactionAlert && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border flex items-start gap-4 ${
                      interactionAlert.severity === 'danger' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Drug Interaction Alert</p>
                      <p className="text-xs font-medium">{interactionAlert.message}</p>
                    </div>
                  </motion.div>
                )}
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Your cart is empty</p>
                      <p className="text-sm text-gray-500">Add some medicines to get started</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.medicine._id} className="bg-white/2 border border-white/5 rounded-2xl p-4 flex gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-white">{item.medicine.brand_name}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{item.medicine.generic_name}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.medicine._id)} className="text-gray-600 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1">
                            <button onClick={() => updateCartQuantity(item.medicine._id, -1)} className="text-gray-400 hover:text-white">-</button>
                            <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.medicine._id, 1)} className="text-gray-400 hover:text-white">+</button>
                          </div>
                          <p className="text-sm font-bold text-white">¥{(item.medicine.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-white/5 bg-black/40 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      <span>Subtotal</span>
                      <span className="text-white text-sm">¥{cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Delivery Address
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => {
                            setDeliveryAddress(e.target.value);
                            handleAddressSearch(e.target.value);
                          }}
                          placeholder="Enter your full address"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <AnimatePresence>
                          {addressSuggestions.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-[1100] shadow-2xl"
                            >
                              {addressSuggestions.map((tip, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => selectAddress(tip)}
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
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Truck className="w-3 h-3" />
                        Service Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Standard', 'Fast', 'Express'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setServiceType(type)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                              serviceType === type 
                                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-500' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            <Truck className={`w-4 h-4 ${type === 'Express' ? 'animate-bounce' : ''}`} />
                            <span className="text-[8px] font-bold uppercase tracking-widest">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Cash', 'WeChat', 'Alipay'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                              paymentMethod === method 
                                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-500' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-[10px] font-bold">{method === 'Cash' ? '💵' : method === 'WeChat' ? '💬' : '💳'}</div>
                            <span className="text-[8px] font-bold uppercase tracking-widest">{method}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isSubmittingOrder}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmittingOrder ? <Plus className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
                    {isSubmittingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              )}

              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <button 
                      onClick={() => setShowQR(false)}
                      className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
                      {qrType === 'WeChat' ? (
                        <div className="text-4xl">💬</div>
                      ) : (
                        <div className="text-4xl">💳</div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-display font-bold text-white mb-2">
                      Scan with {qrType}
                    </h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">
                      Total: ¥{cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0).toFixed(2)}
                    </p>
                    
                    <div className="bg-white p-4 rounded-3xl mb-8 shadow-2xl shadow-white/10">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SynapseHealth_Payment_${qrType}_${Date.now()}`}
                        alt="Payment QR Code"
                        className="w-48 h-48"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-4 w-full">
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={isSubmittingOrder}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
                      >
                        {isSubmittingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Confirm Payment Complete
                      </button>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        Scan the QR code above to complete your transaction
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Order History Modal */}
        {isOrderHistoryOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-display font-bold text-white">Order History</h2>
                </div>
                <button onClick={() => setIsOrderHistoryOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No orders found.</div>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                          <p className="text-xs font-mono text-white">{order._id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-500">Payment: {order.payment_method}</span>
                        <span className={order.payment_status === 'Paid' ? 'text-green-500' : 'text-red-500'}>
                          {order.payment_status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.medicines.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{item.medicine_id?.brand_name} x {item.quantity}</span>
                            <span className="text-white font-bold">¥{(item.medicine_id?.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Clock className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-4">
                          {order.status === 'Shipped' && (
                            <button 
                              onClick={() => setTrackingOrder(order)}
                              className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" />
                              Track Rider
                            </button>
                          )}
                          <p className="text-lg font-display font-bold text-white">Total: ¥{order.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Tracking Modal */}
        {trackingOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-display font-bold text-white">Live Tracking</h2>
                </div>
                <button onClick={() => setTrackingOrder(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 relative">
                <div ref={mapRef} className="w-full h-full" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold">Rider is on the way</p>
                        <p className="text-gray-400 text-sm">Estimated arrival: {eta || 'Calculating...'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={simulateRiderMovement}
                      className="px-6 py-3 bg-white text-black text-xs font-bold rounded-xl transition-all hover:bg-gray-200"
                    >
                      Simulate Movement
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {/* All Orders Modal (Pharmacist View) */}
        {isAllOrdersOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-display font-bold text-white">Order Management</h2>
                </div>
                <button onClick={() => setIsAllOrdersOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {allOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No orders to manage.</div>
                ) : (
                  allOrders.map((order) => (
                    <div key={order._id} className="bg-white/2 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-500">#{order._id.slice(-8)}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-2">Patient: {order.patient_id?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {order.delivery_address}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {order.medicines.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-400">
                              {item.medicine_id?.brand_name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                              <button
                                key={s}
                                onClick={() => updateOrderStatus(order._id, s)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                                  order.status === s ? 'bg-white text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-display font-bold text-white">¥{order.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white">Add New Medicine</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddMedicine} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Brand Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newMedicine.brand_name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, brand_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Generic Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newMedicine.generic_name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, generic_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Stock Quantity</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newMedicine.stock_quantity}
                    onChange={(e) => setNewMedicine({ ...newMedicine, stock_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Price (¥)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine({ ...newMedicine, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Aliases (Optional - Comma separated)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlias())}
                    placeholder="e.g. Tylenol, Paracetamol"
                  />
                  <button type="button" onClick={() => addAlias()} className="px-4 bg-blue-600 text-white rounded-xl font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newMedicine.aliases.map(alias => (
                    <span key={alias} className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-400">
                      {alias}
                      <button type="button" onClick={() => removeAlias(alias)} className="text-red-500 hover:text-red-400">
                        <Plus className="w-3 h-3 rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                Create Medicine
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {isEditModalOpen && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white">Edit Medicine</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpdateMedicine} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Brand Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedMedicine.brand_name}
                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, brand_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Generic Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedMedicine.generic_name}
                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, generic_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Stock Quantity</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedMedicine.stock_quantity}
                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, stock_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Price (¥)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedMedicine.price}
                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Aliases (Optional - Comma separated)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlias(true))}
                    placeholder="e.g. Tylenol, Paracetamol"
                  />
                  <button type="button" onClick={() => addAlias(true)} className="px-4 bg-blue-600 text-white rounded-xl font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedMedicine.aliases || []).map((alias: string) => (
                    <span key={alias} className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-400">
                      {alias}
                      <button type="button" onClick={() => removeAlias(alias, true)} className="text-red-500 hover:text-red-400">
                        <Plus className="w-3 h-3 rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
