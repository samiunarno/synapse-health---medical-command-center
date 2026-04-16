import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, QrCode, Smartphone } from 'lucide-react';

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  planName?: string;
}

export default function QRCodePaymentModal({ isOpen, onClose, amount = 99, planName = 'Premium' }: QRCodePaymentModalProps) {
  const { t } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending');

  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('pending');
      // Simulate payment success after 5 seconds for demo purposes
      const timer = setTimeout(() => {
        setPaymentStatus('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 text-center">
            <h3 className="text-2xl font-medium tracking-tighter mb-2">
              {paymentStatus === 'success' ? t('payment_successful') : t('scan_to_pay')}
            </h3>
            <p className="text-black/60 dark:text-white/60 text-sm mb-8">
              {paymentStatus === 'success' 
                ? t('membership_active', { plan: planName })
                : t('upgrade_membership', { plan: planName })}
            </p>

            <div className="relative flex justify-center mb-8">
              {paymentStatus === 'success' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-48 h-48 flex items-center justify-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                </motion.div>
              ) : (
                <div className="relative p-4 bg-white rounded-2xl border border-black/10 shadow-sm">
                  {/* Mock QR Code */}
                  <div className="w-40 h-40 bg-black/5 flex items-center justify-center rounded-xl">
                    <QrCode className="w-24 h-24 text-black/80" />
                  </div>
                  
                  {/* Scanning Animation */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-blue-500/50 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)] z-10"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-3xl font-medium tracking-tighter mb-6">
              <span className="text-lg text-black/40 dark:text-white/40">¥</span>
              {amount}
            </div>

            <div className="flex justify-center gap-4 text-sm text-black/60 dark:text-white/60">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Alipay</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>WeChat Pay</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
