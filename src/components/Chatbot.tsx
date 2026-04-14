import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios, { AxiosError } from 'axios';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am Synapse Health, your virtual assistant powered by DeepSeek AI. How can I assist you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [quickRepliesLoading, setQuickRepliesLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async (text: string = message) => {
    const messageToSend = text || message;
    if (!messageToSend.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageToSend };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setQuickRepliesLoading(true);

    try {
      const response = await axios.post('/api/chatbot/chat', {
        message: messageToSend,
        systemPrompt: "You are a helpful and professional healthcare assistant for Synapse Health. You can answer general health questions, explain medical terms, and provide wellness tips. Always state that you are an AI and not a doctor. If a user describes an emergency, tell them to call emergency services immediately."
      }, { timeout: 5000 });

      const modelMessage: ChatMessage = { role: 'model', text: response.data.response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected Error:', error);
      }
      setChatHistory(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting to my neural network. Please try again later." }]);
    } finally {
      setLoading(false);
      setQuickRepliesLoading(false);
    }
  };

  const quickReplies = [
    "Book an appointment",
    "Visiting hours",
    "Emergency ambulance",
    "Track my order"
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-blue-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white">Synapse Health</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    AI Assistant Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                aria-label="Close chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#050505]"
            >
              {chatHistory.map((chat, i) => (
                <div
                  key={i}
                  className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-4 rounded-2xl max-w-[85%] ${
                    chat.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-gray-300 rounded-tl-none border border-white/5'
                  }`}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{chat.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {!loading && !quickRepliesLoading && chatHistory[chatHistory.length - 1]?.role === 'model' && (
              <div className="px-6 py-3 bg-[#050505] border-t border-white/5 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 whitespace-nowrap transition-colors"
                    aria-label={`Quick reply: ${reply}`}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="px-6 py-2 bg-black border-t border-white/5 flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-gray-600" />
              <p className="text-[8px] text-gray-600 font-medium italic">
                AI Assistant: Not a substitute for professional medical advice.
              </p>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!message.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 relative group"
        aria-label="Open chatbot"
      >
        <MessageSquare className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
      </motion.button>
    </div>
  );
}