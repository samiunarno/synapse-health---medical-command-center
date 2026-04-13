import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { Shield, Heart, AlertCircle, Download, Share2, User, Phone, Droplet, RefreshCw } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function DigitalHealthID() {
  const { user, token } = useAuth();
  const [qrToken, setQrToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchQrToken();
  }, []);

  const fetchQrToken = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/qr-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQrToken(data.qrLoginToken);
      }
    } catch (err) {
      console.error('Failed to fetch QR token');
    } finally {
      setLoading(false);
    }
  };

  // Mock patient data - in a real app, this would come from an API
  const patientData = {
    id: user?.id?.substring(0, 8).toUpperCase() || "SYN-8829-X",
    name: user?.fullName || user?.username || "John Doe",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    emergencyContact: "+880 1712-345678",
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">Digital Health ID</h1>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Your secure medical identity in a QR code</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="p-8 bg-white rounded-[2rem] shadow-2xl shadow-white/10 relative">
                {loading ? (
                  <div className="w-[250px] h-[250px] flex items-center justify-center bg-gray-100 rounded-xl">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <QRCode value={qrToken} size={250} />
                )}
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-display font-bold uppercase tracking-tight">{patientData.id}</h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-500 rounded-lg border border-green-500/20">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Profile</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg border border-blue-500/20">
                    <Droplet className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{patientData.bloodGroup}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={fetchQrToken}
                  className="flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh ID
                </button>
                <button className="flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all">
                  <Share2 className="w-4 h-4" />
                  Share ID
                </button>
              </div>
            </div>
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-red-600/10 border border-red-600/20 rounded-3xl p-8 flex gap-6 items-start">
            <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest">Emergency Protocol</h4>
              <p className="text-xs text-red-600/60 font-medium leading-relaxed">
                In case of emergency, medical personnel can scan this code to access your critical health data instantly. Keep this ID accessible on your phone's lock screen or as a printed card.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 space-y-10">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight border-b border-white/5 pb-6">Profile Details</h3>
            
            <div className="grid gap-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</p>
                  <p className="text-lg font-bold text-white uppercase tracking-tight">{patientData.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-red-500">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Allergies</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patientData.allergies.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Medical History</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patientData.medicalHistory.map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-green-500">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Emergency Contact</p>
                  <p className="text-lg font-bold text-white uppercase tracking-tight">{patientData.emergencyContact}</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">
                Last Synchronized: {patientData.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
