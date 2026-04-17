import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download,
  Loader2,
  Wallet,
  User as UserIcon,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import GlobalNavbar from '../components/GlobalNavbar';

export default function AdminFinance() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recharge' | 'membership'>('recharge');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchMembershipRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/finance/admin/recharge-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipRequests = async () => {
    try {
      const res = await fetch('/api/membership/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMembershipRequests(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch membership requests');
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActioningId(id);
    try {
      const endpoint = activeTab === 'recharge' 
        ? `/api/finance/admin/recharge-action/${id}`
        : `/api/membership/${action}/${id}`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: activeTab === 'recharge' ? JSON.stringify({ action }) : undefined
      });

      if (res.ok) {
        if (activeTab === 'recharge') {
          setRequests(prev => prev.map(r => r._id === id ? { ...r, status: action === 'approve' ? 'Approved' : 'Rejected' } : r));
        } else {
          setMembershipRequests(prev => prev.map(r => r._id === id ? { ...r, status: action === 'approve' ? 'Approved' : 'Rejected' } : r));
        }
      }
    } catch (err) {
      console.error('Action failed');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#0a0a0a] text-[#111111] dark:text-[#F4F4F0] flex flex-col transition-colors duration-300">
      <GlobalNavbar />
      
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 pt-32 lg:pt-40 pb-20">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 border-b border-black/10 dark:border-white/10">
            <div className="flex flex-col gap-4">
              <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">
                {activeTab === 'recharge' ? t('recharge_requests') : t('membership_requests')}
              </h1>
              <p className="text-black/40 dark:text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
                {activeTab === 'recharge' ? t('manage_user_recharges') : t('manage_membership_requests')}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-sm p-1">
                <button
                  onClick={() => setActiveTab('recharge')}
                  className={`px-6 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all ${
                    activeTab === 'recharge' ? 'bg-black text-white dark:bg-[#F4F4F0] dark:text-black shadow-lg' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {t('recharge')}
                </button>
                <button
                  onClick={() => setActiveTab('membership')}
                  className={`px-6 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all ${
                    activeTab === 'membership' ? 'bg-black text-white dark:bg-[#F4F4F0] dark:text-black shadow-lg' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {t('membership')}
                </button>
              </div>
              <button className="p-4 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search user..."
                className="w-full bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 py-4 pl-12 pr-4 text-sm font-mono outline-none focus:border-blue-600 transition-all rounded-sm"
              />
            </div>
            {/* Other filters */}
          </div>

          {/* Request List */}
          <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="p-6 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">{t('user')}</th>
                    <th className="p-6 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">{t('amount')}</th>
                    <th className="p-6 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">{t('date')}</th>
                    <th className="p-6 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">{t('status')}</th>
                    <th className="p-6 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-[0.2em] text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Loading records...</span>
                      </td>
                    </tr>
                  ) : (activeTab === 'recharge' ? requests : membershipRequests).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <Wallet className="w-16 h-16 text-black/5 dark:text-white/5 mx-auto mb-6" strokeWidth={0.5} />
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">No pending requests</span>
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'recharge' ? requests : membershipRequests).map((req) => (
                      <tr key={req._id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F4F4F0] dark:bg-black/20 rounded-sm flex items-center justify-center text-black/20 dark:text-white/20">
                              <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold uppercase tracking-tight">{req.userId?.username || 'Unknown User'}</p>
                              <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{req.userId?.email || 'No Email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-display font-bold">¥{req.amount}</span>
                              <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 rounded-full text-[8px] font-mono uppercase tracking-widest">
                                {activeTab === 'recharge' ? req.currency : req.paymentMethod}
                              </span>
                            </div>
                            {activeTab === 'membership' && (
                                  <p className="text-[10px] font-mono text-purple-600 uppercase font-bold tracking-widest">
                                    Plan: {req.planName}
                                  </p>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-xs font-mono opacity-60 uppercase">
                            {new Date(req.createdAt || req.requestDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-full text-[8px] font-mono uppercase tracking-widest border ${
                            req.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                            req.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-6">
                          {req.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => handleAction(req._id, 'approve')}
                                disabled={actioningId === req._id}
                                className="px-6 py-2 bg-black dark:bg-[#F4F4F0] text-white dark:text-black hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition-all text-[8px] font-mono uppercase tracking-[0.2em] rounded-sm flex items-center gap-2 disabled:opacity-20"
                              >
                                {actioningId === req._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                {t('confirm_payment')}
                              </button>
                              <button 
                                onClick={() => handleAction(req._id, 'reject')}
                                disabled={actioningId === req._id}
                                className="p-2 border border-black/10 dark:border-white/10 hover:bg-red-500 hover:text-white transition-all rounded-sm text-black/40 dark:text-white/40 disabled:opacity-20 flex items-center gap-2"
                              >
                                {actioningId === req._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                <span className="text-[8px] font-mono uppercase tracking-[0.2em]">{t('reject')}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end pr-4">
                              <ChevronRight className="w-5 h-5 opacity-10" />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
