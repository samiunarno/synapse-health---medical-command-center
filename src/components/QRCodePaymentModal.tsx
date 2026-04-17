import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  planName?: string;
}

export default function QRCodePaymentModal({ isOpen, onClose, amount = 0, planName = 'Premium' }: QRCodePaymentModalProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'request_sent' | 'success'>('pending');
  const [method, setMethod] = useState<'WeChat' | 'Alipay'>('Alipay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/membership/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planName,
          amount,
          paymentMethod: method
        })
      });

      if (res.ok) {
        setPaymentStatus('request_sent');
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to submit membership request');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {paymentStatus === 'request_sent' ? t('payment_success') : t('scan_to_pay')}
            </h3>
            <p className="text-black/60 dark:text-white/60 text-sm mb-6">
              {paymentStatus === 'request_sent' 
                ? t('payment_request_sent')
                : t('upgrade_membership', { plan: planName })}
            </p>

            {paymentStatus === 'pending' && (
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setMethod('Alipay')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    method === 'Alipay' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10'
                  }`}
                >
                  {t('alipay')}
                </button>
                <button
                  onClick={() => setMethod('WeChat')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    method === 'WeChat' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10'
                  }`}
                >
                  {t('wechat_pay')}
                </button>
              </div>
            )}

            <div className="relative flex justify-center mb-6">
              {paymentStatus === 'request_sent' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-48 h-48 flex items-center justify-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                </motion.div>
              ) : (
                <div className="relative p-3 bg-white rounded-2xl border border-black/10 shadow-sm">
                  {/* Mock QR Code */}
                  <div className="w-40 h-40 bg-black/5 flex items-center justify-center rounded-xl overflow-hidden relative">
                    <QrCode className={`w-24 h-24 ${method === 'Alipay' ? 'text-blue-600' : 'text-emerald-600'}`} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                  </div>
                  
                  {/* Scanning Animation */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className={`absolute left-0 right-0 h-0.5 shadow-lg z-10 ${
                      method === 'Alipay' ? 'bg-blue-500/50' : 'bg-emerald-500/50'
                    }`}
                  />
                </div>
              )}
            </div>

            {paymentStatus === 'pending' && (
              <>
                <div className="flex items-center justify-center gap-2 text-4xl font-display font-black tracking-tighter mb-8">
                  {amount === 0 ? (
                    <span className="text-4xl">{t('free')}</span>
                  ) : (
                    <>
                      <span className="text-lg text-black/40 dark:text-white/40 font-medium">¥</span>
                      {amount}
                    </>
                  )}
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black dark:bg-[#F4F4F0] text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  {t('confirm_payment_user')}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
