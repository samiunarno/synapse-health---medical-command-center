import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {}
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('join_user_room', user.id);

      socket.on('new_notification', (data: NotificationItem) => {
        setNotifications(prev => [data, ...prev]);
        showToast(data);
        
        // Browser notification if allowed
        if (Notification.permission === 'granted') {
          new Notification(data.title, { body: data.message });
        }
      });

      socket.on('emergency_alert', (data: any) => {
        // Broadcasted SOS
        const alertNotif = {
          _id: Math.random().toString(),
          title: data.title || 'EMERGENCY SOS',
          message: data.message || 'A patient has triggered an SOS alert!',
          type: 'sos',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        // Don't show if it's our own
        if (data.patientId !== user.id) {
          showToast(alertNotif);
          if (Notification.permission === 'granted') {
            new Notification(alertNotif.title, { body: alertNotif.message });
          }
        }
      });

      return () => {
        socket.off('new_notification');
        socket.off('emergency_alert');
      };
    }
  }, [socket, isConnected, user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:3000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:3000/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (notif: NotificationItem) => {
    setActiveToasts(prev => [...prev, notif]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t._id !== notif._id));
    }, 8000);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      markAsRead,
      markAllAsRead
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {activeToasts.map(toast => (
            <motion.div
              key={toast._id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-lg shadow-2xl border flex items-start gap-4 min-w-[300px] max-w-sm
                ${toast.type === 'sos' ? 'bg-red-900/90 border-red-500 text-white' 
                  : (toast.type === 'lab' ? 'bg-orange-900/90 border-orange-500 text-white' : 'bg-gray-900/90 border-gray-700 text-white')}`}
            >
              {toast.type === 'sos' ? <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" /> : <Bell className="w-6 h-6 text-blue-400 shrink-0" />}
              <div className="flex-1">
                <h4 className="font-bold">{toast.title}</h4>
                <p className="text-sm opacity-80 mt-1">{toast.message}</p>
              </div>
              <button onClick={() => setActiveToasts(prev => prev.filter(t => t._id !== toast._id))}>
                <X className="w-4 h-4 opacity-50 hover:opacity-100" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
