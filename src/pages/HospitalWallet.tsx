import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileText, 
  Download, 
  Filter, 
  Plus, 
  PieChart,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import GlobalNavbar from '../components/GlobalNavbar';

export default function HospitalWallet() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeStatus, setRechargeStatus] = useState<null | 'success' | 'error'>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, [user]);

  const fetchBalance = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/finance/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    // We'll use the recharge requests as history for now
    if (!token) return;
    try {
      const res = await fetch('/api/finance/recharge', { // Assuming GET returns user requests if we implement it, but for now we'll mock or wait for better endpoint
        headers: { Authorization: `Bearer ${token}` }
      });
      // For now, if no GET route exists, we'll keep history empty or handled by a real endpoint later
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) return;
    
    setIsRecharging(true);
    setRechargeStatus(null);
    try {
      const res = await fetch('/api/finance/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(rechargeAmount) })
      });

      if (res.ok) {
        setRechargeStatus('success');
        setRechargeAmount('');
        // We don't update balance yet because it needs admin approval
      } else {
        setRechargeStatus('error');
      }
    } catch (err) {
      setRechargeStatus('error');
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#0a0a0a] text-[#111111] dark:text-[#F4F4F0] flex flex-col transition-colors duration-300">
      <GlobalNavbar />
      
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 pt-32 lg:pt-40 pb-20">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 border-b border-black/10 dark:border-white/10">
            <div className="flex flex-col gap-4">
              <h1 className="text-6xl lg:text-8xl font-display font-black tracking-tighter uppercase italic">{t('financial_hub')}</h1>
              <p className="text-black/40 dark:text-white/40 font-mono text-xs uppercase tracking-[0.3em]">{t('manage_credits_payments')}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Column: Balance & Recharge */}
            <div className="lg:col-span-8 space-y-12">
              <div className="grid sm:grid-cols-2 gap-8">
                {/* Balance Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black dark:bg-[#111111] text-white p-12 rounded-sm relative overflow-hidden group"
                >
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <Wallet className="w-10 h-10 text-white/40" strokeWidth={1} />
                      <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest">{t('active_wallet')}</div>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">{t('current_balance')}</p>
                      <h2 className="text-6xl font-display font-bold tabular-nums">¥{balance.toLocaleString()}</h2>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-xs font-mono">+CNY 1,200</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/20">
                        <span className="text-[10px] font-mono uppercase tracking-widest">{t('last_30_days')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                </motion.div>

                {/* Quick Stats Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 p-12 rounded-sm space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-10 h-10 text-blue-600" strokeWidth={1} />
                    <PieChart className="w-5 h-5 text-black/20 dark:text-white/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{t('total_earnings')}</p>
                      <p className="text-2xl font-display font-bold">¥8,450</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 dark:text-white/40 mb-2">{t('total_spending')}</p>
                      <p className="text-2xl font-display font-bold">¥4,320</p>
                    </div>
                  </div>
                  <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-2/3" />
                  </div>
                </motion.div>
              </div>

              {/* Recharge Section */}
              <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-sm p-12 space-y-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-display font-bold uppercase tracking-tight mb-2">{t('request_top_up')}</h3>
                    <p className="text-sm font-light opacity-60 leading-relaxed max-w-md">{t('top_up_desc')}</p>
                  </div>
                  <CreditCard className="w-12 h-12 opacity-10" strokeWidth={1} />
                </div>

                <form onSubmit={handleRecharge} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">{t('amount_to_recharge')}</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-display font-bold opacity-20">¥</span>
                        <input 
                          type="number" 
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-[#F4F4F0] dark:bg-black/20 border border-black/10 dark:border-white/10 py-6 pl-12 pr-6 text-3xl font-display font-bold outline-none focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">{t('payment_method')}</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="py-6 border-2 border-blue-600 bg-blue-600/5 text-blue-600 font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-5 h-5" />
                          Alipay
                        </button>
                        <button type="button" className="py-6 border border-black/10 dark:border-white/10 hover:border-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 opacity-40">
                          <div className="w-5 h-5 rounded-full border border-black/20" />
                          WeChat
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-blue-600/5 text-blue-600 border border-blue-600/20 text-xs leading-relaxed">
                    <Info className="w-5 h-5 shrink-0" />
                    <p>{t('recharge_notice')}</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isRecharging || !rechargeAmount}
                    className="w-full py-8 bg-black dark:bg-[#F4F4F0] text-white dark:text-black text-xl font-display font-bold uppercase tracking-tight transition-all hover:bg-blue-600 hover:text-white disabled:opacity-20 flex items-center justify-center gap-4"
                  >
                    {isRecharging ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                    {isRecharging ? t('submitting_request') : t('submit_recharge_request')}
                  </button>
                </form>

                {rechargeStatus === 'success' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/10 border border-green-500/20 p-6 flex items-center gap-4 text-green-600 rounded-sm">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-sm font-bold uppercase tracking-wide">{t('recharge_submitted_success')}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column: Transactions */}
            <div className="lg:col-span-4 space-y-12">
              <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-sm p-10 flex flex-col h-full sticky top-32 lg:top-40">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{t('transactions')}</h3>
                  <Filter className="w-5 h-5 text-black/20 dark:text-white/20 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                </div>
                
                <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                  {/* Empty state for now or map history */}
                  <div className="p-12 border border-dashed border-black/10 dark:border-white/10 rounded-sm text-center flex flex-col items-center gap-6 opacity-20">
                    <Download className="w-12 h-12" strokeWidth={0.5} />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em]">{t('no_transaction_logs')}</span>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <button className="w-full py-5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-widest border border-black/5 dark:border-white/5 transition-all">
                    {t('download_financial_report')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
