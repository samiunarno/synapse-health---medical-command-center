import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Bell, 
  Shield, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  Search,
  Filter,
  X,
  Loader2,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthContext';

export default function SendNotification() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info', // info, warning, success, alert
    priority: 'normal', // normal, high, critical
    channels: ['push'] // push, email, sms
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          ...notification
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setNotification({ title: '', message: '', type: 'info', priority: 'normal', channels: ['push'] });
        setSelectedUsers([]);
      }
    } catch (err) {
      console.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase())) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
          Notification <br />
          <span className="text-transparent stroke-text">Broadcaster</span>
        </h1>
        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-4 flex items-center gap-3">
          <Bell className="w-4 h-4 text-blue-500" />
          Send targeted alerts and updates to users
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recipient Selection */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Recipients</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select users to notify</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={selectAll}
                className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline"
              >
                {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-bold border border-blue-500/20">
                {selectedUsers.length} Selected
              </span>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input 
              type="text" 
              placeholder="SEARCH USERS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-800"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 custom-scrollbar pr-2">
            {filteredUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => toggleUser(u._id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedUsers.includes(u._id) 
                    ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                    : 'bg-white/2 border-white/5 text-gray-500 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    selectedUsers.includes(u._id) ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-600'
                  }`}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase tracking-tight">{u.fullName || u.username}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{u.role}</p>
                  </div>
                </div>
                {selectedUsers.includes(u._id) && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Content */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Message</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Compose your notification</p>
            </div>
            <Send className="w-6 h-6 text-blue-500" />
          </div>

          <form onSubmit={handleSend} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Title</label>
              <input
                type="text"
                required
                placeholder="NOTIFICATION TITLE"
                value={notification.title}
                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="ENTER MESSAGE CONTENT..."
                value={notification.message}
                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-800 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Alert Type</label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification({ ...notification, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="info" className="bg-[#0a0a0a]">INFO</option>
                  <option value="warning" className="bg-[#0a0a0a]">WARNING</option>
                  <option value="success" className="bg-[#0a0a0a]">SUCCESS</option>
                  <option value="alert" className="bg-[#0a0a0a]">CRITICAL ALERT</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Priority</label>
                <select
                  value={notification.priority}
                  onChange={(e) => setNotification({ ...notification, priority: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="normal" className="bg-[#0a0a0a]">NORMAL</option>
                  <option value="high" className="bg-[#0a0a0a]">HIGH</option>
                  <option value="critical" className="bg-[#0a0a0a]">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Delivery Channels</label>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'push', icon: Smartphone, label: 'Push' },
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'sms', icon: MessageSquare, label: 'SMS' }
                ].map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => {
                      setNotification(prev => ({
                        ...prev,
                        channels: prev.channels.includes(channel.id) 
                          ? prev.channels.filter(c => c !== channel.id) 
                          : [...prev.channels, channel.id]
                      }));
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
                      notification.channels.includes(channel.id)
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                        : 'bg-white/2 border-white/5 text-gray-600 hover:bg-white/5'
                    }`}
                  >
                    <channel.icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{channel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Broadcast Notification
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 right-12 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200]"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold uppercase tracking-widest text-xs">Broadcast Successful</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
