import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { 
  Send, 
  Search, 
  User, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  ShieldCheck, 
  Clock, 
  Package, 
  Truck, 
  Stethoscope,
  ChevronLeft,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import io from 'socket.io-client';

interface Message {
  _id: string;
  sender_id: any;
  receiver_id: string;
  content: string;
  read: boolean;
  order_id?: string;
  order_type?: string;
  created_at: string;
}

interface Conversation {
  contact: {
    _id: string;
    username: string;
    fullName: string;
    role: string;
    status: string;
    isBanned: boolean;
  };
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if we have a contact passed from navigation state
    const state = location.state as { contactId?: string };
    if (state?.contactId) {
      fetchContactById(state.contactId);
      // Clear the state so it doesn't re-trigger on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    // Setup Socket.io
    socketRef.current = io(window.location.origin);
    
    socketRef.current.on('new_message', (message: Message) => {
      // If message is for the current user, refresh conversations
      if (message.receiver_id === user?.id || message.sender_id._id === user?.id) {
        fetchConversations();
        
        // If message is from the currently selected contact, add to messages
        if (selectedContact && (message.sender_id._id === selectedContact._id || message.receiver_id === selectedContact._id)) {
          setMessages(prev => [...prev, message]);
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.id, selectedContact?._id]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const res = await fetch(`/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const fetchContactById = async (userId: string) => {
    try {
      // Find from existing conversations first
      const existing = conversations.find(c => c.contact._id === userId);
      if (existing) {
        setSelectedContact(existing.contact);
        setShowMobileList(false);
        return;
      }

      // If not in conversations, fetch user details (assuming there's an endpoint or we just wait for conversations to load)
      // For now, let's just wait for conversations to load and look again
      if (conversations.length > 0) {
        const found = conversations.find(c => c.contact._id === userId);
        if (found) {
          setSelectedContact(found.contact);
          setShowMobileList(false);
        }
      } else {
        // Fetch specific user
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await res.json();
        if (userData) {
          setSelectedContact(userData);
          setShowMobileList(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contact');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedContact._id,
          content: newMessage
        })
      });

      if (res.ok) {
        setNewMessage('');
        // Optimization: Socket will receive the message and update state
      }
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.contact.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.username.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Doctor': return <Stethoscope className="w-3 h-3" />;
      case 'Admin': return <ShieldCheck className="w-3 h-3" />;
      case 'Driver': return <Truck className="w-3 h-3" />;
      case 'Pharmacy': return <Package className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
      {/* Contact List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-white/2 transition-all duration-300 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-display font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <MessageSquare className="w-8 h-8 animate-pulse mb-2" />
              <span className="text-sm font-bold uppercase tracking-widest">Loading Chats...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 opacity-30">
              <MessageSquare className="w-12 h-12 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No Conversations</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.contact._id}
                onClick={() => {
                  setSelectedContact(conv.contact);
                  setShowMobileList(false);
                }}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                  selectedContact?._id === conv.contact._id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                    selectedContact?._id === conv.contact._id ? 'bg-white/20 border-white/20' : 'bg-white/5 border-white/5'
                  }`}>
                    {conv.contact.fullName ? conv.contact.fullName[0] : conv.contact.username[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${
                    conv.contact.isBanned ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                </div>
                
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold truncate pr-2">{conv.contact.fullName || conv.contact.username}</span>
                    <span className={`text-[9px] font-bold opacity-50 ${selectedContact?._id === conv.contact._id ? 'text-white' : ''}`}>
                      {conv.lastMessage ? format(new Date(conv.lastMessage.created_at), 'HH:mm') : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 opacity-60">
                      {getRoleIcon(conv.contact.role)}
                      <span className="text-[9px] font-bold uppercase tracking-widest">{conv.contact.role}</span>
                    </div>
                    {conv.unreadCount > 0 && selectedContact?._id !== conv.contact._id && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-1 opacity-50 ${selectedContact?._id === conv.contact._id ? 'text-blue-100' : ''}`}>
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white/1 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowMobileList(true)}
                  className="p-2 md:hidden hover:bg-white/5 rounded-xl text-gray-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-lg text-white">
                  {selectedContact.fullName ? selectedContact.fullName[0] : selectedContact.username[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {selectedContact.fullName || selectedContact.username}
                    {selectedContact.isBanned && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-lg border border-red-500/20">BANNED</span>}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 bg-white/2 hover:bg-white/5 text-gray-400 rounded-2xl border border-white/5 transition-all">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/2 hover:bg-white/5 text-gray-400 rounded-2xl border border-white/5 transition-all">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/2 hover:bg-white/5 text-gray-400 rounded-2xl border border-white/5 transition-all">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent"
            >
              <div className="flex flex-col items-center justify-center py-10">
                <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">
                  This chat is between {user?.fullName} and {selectedContact.fullName}.<br/>Started on {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>

              {messages.map((msg, index) => {
                const isMine = msg.sender_id === user?.id || msg.sender_id?._id === user?.id;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isMine && (
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                        {showAvatar ? (selectedContact.fullName ? selectedContact.fullName[0] : selectedContact.username[0]) : ''}
                      </div>
                    )}
                    <div className={`max-w-[70%] group`}>
                      <div className={`p-4 rounded-[1.5rem] relative ${
                        isMine 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white/5 text-gray-200 border border-white/5 rounded-bl-none'
                      }`}>
                        {msg.order_id && (
                          <div className={`mb-2 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                            isMine ? 'bg-black/20 text-blue-200' : 'bg-white/5 text-blue-400'
                          }`}>
                            <Package className="w-3 h-3" />
                            Ref: {msg.order_type} #{msg.order_id.substring(0, 8)}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <div className={`mt-1.5 flex items-center gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        {isMine && (
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${msg.read ? 'text-blue-500' : 'text-gray-700'}`}>
                            {msg.read ? 'Read' : 'Sent'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white/2 border-t border-white/5">
              {selectedContact.isBanned ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <p className="flex-1 text-sm font-bold uppercase tracking-widest italic">
                    You cannot send messages to this restricted user ID.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-end gap-4 relative">
                  <div className="flex-1 relative group">
                    <textarea 
                      rows={1}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a secure message..."
                      className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-700 resize-none max-h-32"
                    />
                    <div className="absolute left-4 bottom-4">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:shadow-none"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              )}
              <div className="mt-4 flex items-center gap-4 text-gray-600">
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                  <Package className="w-3 h-3" /> Attach File
                </button>
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                  <Clock className="w-3 h-3" /> Quick Replies
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform">
              <MessageSquare className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">Synapse Secure Messaging</h2>
            <p className="text-gray-500 max-w-md mx-auto font-medium leading-relaxed">
              Select a professional to start a secure conversation. Chat with doctors, pharmacists, 
              or delivery personnel directly about your health services.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full">
              <div className="bg-white/2 border border-white/5 p-6 rounded-[2rem] text-left">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Encrypted Data</h4>
                <p className="text-xs text-gray-600 leading-normal">Your medical data and identity are protected by military-grade security layers.</p>
              </div>
              <div className="bg-white/2 border border-white/5 p-6 rounded-[2rem] text-left">
                <Clock className="w-6 h-6 text-amber-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Real-time ETA</h4>
                <p className="text-xs text-gray-600 leading-normal">Receive live updates on your deliveries and medical appointment statuses.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
