import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Smartphone,
  ChevronRight,
  QrCode
} from 'lucide-react';

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: string) => void;
  amount: number;
  description: string;
  appointmentId: string;
}

type PaymentMethod = 'Alipay' | 'WeChat' | 'Card';

export default function PaymentGateway({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  description,
  appointmentId 
}: PaymentGatewayProps) {
  const [step, setStep] = useState<'select' | 'processing' | 'success' | 'qr'>('select');
  const [method, setMethod] = useState<PaymentMethod>('Alipay');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setError(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (method === 'Alipay' || method === 'WeChat') {
      setStep('qr');
      return;
    }

    setStep('processing');
    // Simulate processing
    setTimeout(async () => {
      try {
        onSuccess(method);
        setStep('success');
      } catch (err) {
        setError('Transaction failed. Please try again.');
        setStep('select');
      }
    }, 2000);
  };

  const handleQRConfirmed = () => {
    setStep('processing');
    setTimeout(() => {
      onSuccess(method);
      setStep('success');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-white font-bold">Secure Gateway</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">256-bit SSL Encrypted</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            {step === 'select' && (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Payment for</p>
                  <p className="text-white font-bold">{description}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Amount Due</span>
                    <span className="text-2xl font-display font-bold text-blue-500">${amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Method</p>
                  {(['Alipay', 'WeChat', 'Card'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        method === m 
                          ? 'bg-blue-600/10 border-blue-500/40' 
                          : 'bg-white/2 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          method === m ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'
                        }`}>
                          {m === 'Card' ? <CreditCard className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        </div>
                        <span className="font-bold text-sm text-white">{m} {m !== 'Card' && 'Pay'}</span>
                      </div>
                      {method === m && <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                >
                  <Lock className="w-4 h-4" />
                  Pay ${amount.toFixed(2)}
                </button>
              </div>
            )}

            {step === 'qr' && (
              <div className="text-center space-y-6">
                <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl shadow-white/10">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SynapseHealth_SecurePay_${method}_${appointmentId}`}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Scan with {method}</h4>
                  <p className="text-gray-500 text-sm mt-1">Please complete the payment on your mobile device.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep('select')} className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Back</button>
                  <button onClick={handleQRConfirmed} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">I have paid</button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="py-12 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">Verifying Transaction</h4>
                  <p className="text-gray-500 text-sm mt-2">Securing your payment with 256-bit encryption...</p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-12 text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <div>
                  <h4 className="text-white font-bold text-2xl">Payment Successful</h4>
                  <p className="text-gray-500 text-sm mt-2">Your appointment has been confirmed.</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-30 grayscale" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-30 grayscale" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-30 grayscale" referrerPolicy="no-referrer" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
