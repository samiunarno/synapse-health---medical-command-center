import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Book, 
  MessageSquare, 
  LifeBuoy, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Video,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const categories = [
    { title: "Getting Started", icon: Zap, count: 12, color: "blue" },
    { title: "EHR Management", icon: FileText, count: 24, color: "purple" },
    { title: "TeleHealth Guide", icon: Video, count: 15, color: "emerald" },
    { title: "Billing & Plans", icon: Book, count: 8, color: "amber" }
  ];

  const faqs = [
    {
      q: "How do I set up my Digital Health ID?",
      a: "Navigate to the Health ID section in your dashboard. Click 'Initialize ID' and follow the biometric verification steps. Once verified, your unique QR code will be generated instantly."
    },
    {
      q: "Can I source equipment internationally?",
      a: "Yes, the Sourcing Solutions module allows you to browse global manufacturers. Our system handles all international trade protocols, customs documentation, and logistics tracking."
    },
    {
      q: "Is my medical data secure?",
      a: "Synapse Health uses military-grade AES-256 encryption and a zero-trust architecture. All data is HIPAA and GDPR compliant, with immutable audit logs for every access request."
    },
    {
      q: "How does the AI Prescription scan work?",
      a: "Simply upload a clear photo of your physical prescription. Our Kimi-powered AI will analyze the text, verify dosage safety, and cross-reference it with your medical history for potential interactions."
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden rounded-[3rem] bg-white/5 border border-white/10">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 text-blue-400"
          >
            <LifeBuoy className="w-3 h-3" />
            Support Protocol v3.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-12"
          >
            How can we <span className="text-blue-500">Help?</span>
          </motion.h1>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for guides, tutorials, or FAQs..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-white font-bold uppercase tracking-widest text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 bg-white/2 border border-white/5 rounded-[2.5rem] hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-8 bg-${cat.color}-600/20 text-${cat.color}-500 group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-display font-bold uppercase tracking-tighter mb-2">{cat.title}</h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{cat.count} Articles</p>
          </motion.div>
        ))}
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="bg-white/2 border border-white/5 rounded-3xl overflow-hidden"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-bold uppercase tracking-widest text-white">{faq.q}</span>
                {activeFaq === i ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-8"
                  >
                    <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-widest border-t border-white/5 pt-6">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="space-y-6 text-center lg:text-left">
          <h3 className="text-3xl lg:text-5xl font-display font-black uppercase tracking-tighter leading-none">Still need help?</h3>
          <p className="text-gray-500 text-sm uppercase tracking-widest leading-relaxed max-w-md">
            Our support team is available 24/7 to assist you with any technical or clinical inquiries.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center gap-3">
            <MessageSquare className="w-4 h-4" /> Live Chat
          </button>
          <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center gap-3">
            <ArrowRight className="w-4 h-4" /> Submit Ticket
          </button>
        </div>
      </section>
    </div>
  );
}
