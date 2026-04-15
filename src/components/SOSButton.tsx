import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, MapPin, Phone, Send, Loader2, CheckCircle2, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

export default function SOSButton() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(window.location.origin);
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleSOS = async () => {
    setIsSending(true);
    
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          sendAlert(loc);
        },
        (error) => {
          console.error('Error getting location:', error);
          sendAlert(null);
        }
      );
    } else {
      sendAlert(null);
    }
  };

  const sendAlert = (loc: { lat: number; lng: number } | null) => {
    if (socketRef.current) {
      socketRef.current.emit('trigger_emergency', {
        title: t('sos_alert_title'),
        message: t('sos_alert_message', { username: user?.username }),
        location: loc,
        time: new Date().toLocaleTimeString(),
        sender: user?.username,
        type: 'SOS'
      });
    }

    // Simulate sending SMS/Email to family
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setIsOpen(false);
      }, 3000);
    }, 2000);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-[60] w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(225,29,72,0.5)] border-4 border-white/20 group interactive"
      >
        <div className="absolute inset-0 bg-rose-600 rounded-full animate-ping opacity-20" />
        <AlertTriangle className="w-10 h-10 relative z-10 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-12 left-0 bg-rose-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t('emergency_sos')}
        </span>
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSending && setIsOpen(false)}
              className="absolute inset-0 bg-rose-950/90 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-black border-2 border-rose-600 rounded-[3rem] shadow-[0_0_100px_rgba(225,29,72,0.4)] overflow-hidden p-10 text-center"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-24 h-24 bg-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-rose-600/40">
                <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
              </div>

              <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-4">{t('emergency_sos')}</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
                {t('sos_description')}
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  <div className="text-left">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{t('live_location')}</p>
                    <p className="text-xs font-bold text-white uppercase">{t('transmitting_gps')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Phone className="w-5 h-5 text-rose-500" />
                  <div className="text-left">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{t('family_contacts')}</p>
                    <p className="text-xs font-bold text-white uppercase">
                      {t('contacts_notified', { count: user?.emergencyContacts?.length || 0 })}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <p className="text-emerald-500 font-bold uppercase tracking-widest">{t('alerts_dispatched')}</p>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleSOS}
                    disabled={isSending}
                    className="w-full bg-rose-600 text-white py-6 rounded-2xl font-black text-lg uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-4 group"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {t('transmitting')}
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        {t('confirm_sos')}
                      </>
                    )}
                  </button>
                )}
              </AnimatePresence>

              <p className="mt-8 text-[8px] font-bold text-gray-700 uppercase tracking-widest">
                {t('misuse_warning')}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
