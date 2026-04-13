import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AlertTriangle, Clock, ShieldCheck, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VerificationBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (user && ['Hospital', 'Pharmacy', 'Rider', 'Lab', 'Driver'].includes(user.role)) {
      fetchStatus();
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/verification/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    }
  };

  if (!user || !['Hospital', 'Pharmacy', 'Rider', 'Lab', 'Driver'].includes(user.role)) return null;
  if (!status || status.status === 'Approved') return null;
  if (!isVisible) return null;

  const isBanned = status.status === 'Banned';
  const hasDocuments = status.documents && status.documents.length > 0;
  const deadline = new Date(status.deadline);
  const timeLeft = Math.max(0, deadline.getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`w-full ${isBanned ? 'bg-red-600' : hasDocuments ? 'bg-blue-600' : 'bg-amber-600'} text-white px-4 py-3 relative z-[100]`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isBanned ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : hasDocuments ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
            <div className="text-xs font-bold uppercase tracking-widest">
              {isBanned ? (
                <span>Account Restricted: {status.banReason}</span>
              ) : hasDocuments ? (
                <span>Verification in Progress: AI is currently analyzing your documents.</span>
              ) : (
                <span>
                  Action Required: Please upload your verification documents within {hoursLeft}h {minutesLeft}m. 
                  Failure to do so will result in account restriction.
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!hasDocuments && !isBanned && (
              <button 
                onClick={() => window.location.href = '/profile'}
                className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Upload Now
              </button>
            )}
            <button onClick={() => setIsVisible(false)} className="hover:rotate-90 transition-transform">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
