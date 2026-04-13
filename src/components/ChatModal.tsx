import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Send, X, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

export default function ChatModal({ isOpen, onClose, receiverId, receiverName }: ChatModalProps) {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && receiverId) {
      fetchMessages();
      
      const socket = io(window.location.origin);
      
      socket.on('new_message', (newMessage) => {
        if (
          (newMessage.sender_id === user?.id && newMessage.receiver_id === receiverId) ||
          (newMessage.sender_id === receiverId && newMessage.receiver_id === user?.id)
        ) {
          setMessages(prev => [...prev, newMessage]);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isOpen, receiverId, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch messages');
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: receiverId, content: input })
      });
      if (res.ok) {
        setInput('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[600px]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {receiverName ? receiverName[0].toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">{receiverName || 'Unknown'}</h3>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{t('secure_channel')}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{t('no_messages')}</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={msg._id || i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                    msg.sender_id === user?.id 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'
                  }`}>
                    <p>{msg.content}</p>
                    <p className="text-[8px] mt-1 opacity-50 text-right">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/2">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('type_message')}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
