import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, DollarSign, FileText, CheckCircle2, Clock, ShieldCheck, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function Billing() {
  const { user, token } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/advanced/billing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // If patient, filter their bills. If admin/staff, show all.
        if (user?.role === 'Patient') {
          setBills(data.filter((b: any) => b.patient_id?.user_id === user.id || b.patient_id?.patient_id === user.reference_id));
        } else {
          setBills(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bills', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/advanced/billing/${selectedBill._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payment_method: paymentMethod })
      });
      if (res.ok) {
        alert('Payment successful!');
        setSelectedBill(null);
        fetchBills();
      }
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white flex items-center gap-4">
            <CreditCard className="w-10 h-10 text-blue-600" />
            Billing & Payments
          </h1>
          <p className="text-gray-500 font-medium">Manage your invoices, insurance claims, and secure payments.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-emerald-600/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Insurance Verified</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bills List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400">Loading billing records...</div>
          ) : bills.length === 0 ? (
            <div className="text-center p-12 bg-white/2 rounded-[2rem] border border-white/5">
              <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">No billing records found.</p>
            </div>
          ) : (
            bills.map((bill: any) => (
              <motion.div
                key={bill._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/2 p-6 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    bill.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {bill.status === 'Paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">{bill.description}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{new Date(bill.createdAt).toLocaleDateString()}</p>
                      {bill.insurance_covered && (
                        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 text-[8px] font-bold uppercase rounded-full border border-blue-500/20">
                          Insurance Covered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-white">${bill.amount.toFixed(2)}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      bill.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>{bill.status}</p>
                  </div>
                  {bill.status === 'Pending' && (
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Payment Gateway Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/2 rounded-[2.5rem] p-8 border border-white/5 sticky top-8">
            <h3 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-500" />
              Secure Checkout
            </h3>

            {selectedBill ? (
              <div className="space-y-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Invoice for</p>
                  <p className="font-bold text-white text-lg">{selectedBill.description}</p>
                  <div className="mt-6 flex justify-between items-end border-t border-white/5 pt-6">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-display font-bold text-blue-500">${selectedBill.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Payment Method</p>
                  {['Card', 'UPI', 'Wallet', 'Insurance', 'WeChat', 'Alipay'].map((method) => (
                    <label key={method} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === method 
                        ? 'bg-blue-600/10 border-blue-500/40' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}>
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="hidden"
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-white">{method}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method ? 'border-blue-500' : 'border-gray-500'
                      }`}>
                        {paymentMethod === method && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </div>
                    </label>
                  ))}
                </div>

                {(paymentMethod === 'WeChat' || paymentMethod === 'Alipay') && (
                  <div className="bg-white p-4 rounded-xl mb-6 flex flex-col items-center justify-center shadow-2xl shadow-white/10">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Scan with {paymentMethod}</p>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SynapseHealth_Payment_${paymentMethod}_${Date.now()}`}
                      alt="Payment QR Code"
                      className="w-48 h-48"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-blue-500/20"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Pay ${selectedBill.amount.toFixed(2)}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="w-full py-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel Transaction
                </button>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <DollarSign className="w-10 h-10 text-gray-700" />
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Select a pending bill to proceed</p>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <Lock className="w-4 h-4" />
              256-bit SSL Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
