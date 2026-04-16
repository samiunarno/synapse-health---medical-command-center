import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Bot, 
  User, 
  AlertCircle, 
  Brain, 
  MessageSquare,
  Trash2,
  Download,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { getAIResponse } from '../services/aiService';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function AIChatbot() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: `Hello ${user?.username || 'there'}! I am Synapse Health AI, powered by Zhipu AI. I can help you with medical queries, wellness tips, or navigating our platform. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const responseText = await getAIResponse(
        message,
        "You are Synapse Health AI, a professional and empathetic healthcare assistant. Provide accurate medical information while always including a disclaimer that you are an AI and the user should consult a doctor for serious concerns. Use a clean, structured tone."
      );
      
      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: "I'm sorry, I'm experiencing some neural interference. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setChatHistory([{ 
        role: 'model', 
        text: 'Chat history cleared. How can I help you now?',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Synapse <span className="text-blue-500">AI Chat</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Advanced healthcare assistance powered by Zhipu AI.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="p-3 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl border border-white/5 transition-all"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl border border-white/5 transition-all">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] -z-10" />

        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
        >
          {chatHistory.map((chat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  chat.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-500 border border-white/10'
                }`}>
                  {chat.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className="space-y-2">
                  <div className={`p-6 rounded-3xl ${
                    chat.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5 backdrop-blur-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.text}</p>
                  </div>
                  <p className={`text-[10px] font-bold text-gray-600 uppercase tracking-widest ${chat.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {chat.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-500 border border-white/10 animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white/5 p-6 rounded-3xl rounded-tl-none border border-white/5 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about your health, symptoms, or medications..."
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-8 pr-24 text-sm text-white placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none h-20"
            />
            <button 
              onClick={handleSend}
              disabled={!message.trim() || loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-gray-600" />
              <p className="text-[10px] text-gray-600 font-medium">Not a substitute for medical diagnosis</p>
            </div>
            <div className="w-1 h-1 bg-gray-800 rounded-full" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-500/50" />
              <p className="text-[10px] text-gray-600 font-medium">Powered by Zhipu AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
