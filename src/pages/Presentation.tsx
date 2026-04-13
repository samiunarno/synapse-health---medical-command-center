import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope, 
  ShieldCheck, 
  CheckCircle2,
  Zap, 
  Activity, 
  Globe, 
  Cpu, 
  Users, 
  TrendingUp,
  MessageSquare,
  QrCode,
  ShoppingBag,
  Brain,
  Layers,
  DollarSign,
  Truck
} from 'lucide-react';

interface SlideProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  bg?: string;
}

const Slide = ({ title, subtitle, content, icon, bg = "bg-[#050505]" }: SlideProps) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
    className={`absolute inset-0 flex flex-col p-12 sm:p-20 ${bg}`}
  >
    <div className="flex items-center gap-6 mb-12">
      <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
        {icon}
      </div>
      <div>
        <h2 className="text-5xl sm:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-blue-500 font-bold uppercase tracking-[0.3em] mt-4 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      {content}
    </div>
  </motion.div>
);

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Synapse Health",
      subtitle: "The Future of Integrated Care",
      icon: <Activity className="w-10 h-10" />,
      content: (
        <div className="text-center space-y-8 max-w-4xl">
          <p className="text-2xl text-gray-400 font-medium leading-relaxed">
            A next-generation healthcare ecosystem designed to bridge the gap between patients, practitioners, and global medical sourcing.
          </p>
          <div className="grid grid-cols-3 gap-8 pt-12">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Patient Centric</h4>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <Globe className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Global Scale</h4>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <Brain className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">AI Driven</h4>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Problem",
      subtitle: "Healthcare Fragmentation",
      icon: <Layers className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl">
          <div className="space-y-6">
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem]">
              <h4 className="text-red-400 font-bold text-xl mb-4 uppercase tracking-tight">Data Silos</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Patient records are scattered across disconnected systems, leading to diagnostic delays and errors.</p>
            </div>
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem]">
              <h4 className="text-red-400 font-bold text-xl mb-4 uppercase tracking-tight">Inefficient Sourcing</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Clinics struggle to source certified medical equipment and medicines directly from global manufacturers.</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-full border-4 border-red-500/20 animate-ping absolute inset-0" />
              <div className="w-64 h-64 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 relative z-10">
                <Zap className="w-20 h-20" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Solution",
      subtitle: "A Unified Ecosystem",
      icon: <ShieldCheck className="w-10 h-10" />,
      content: (
        <div className="space-y-12 max-w-4xl text-center">
          <p className="text-3xl text-white font-display font-bold uppercase tracking-tight">
            One Platform. <span className="text-blue-500">Infinite Connections.</span>
          </p>
          <div className="relative h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {['TeleHealth', 'Pharmacy', 'Marketplace', 'AI Diagnostics'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest text-xs"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "QR Login",
      subtitle: "Instant Digital Identity",
      icon: <QrCode className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">No Passwords. <br />Just Access.</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full" /> Secure Biometric Alternative
              </li>
              <li className="flex items-center gap-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full" /> Digital Health ID Integration
              </li>
              <li className="flex items-center gap-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full" /> Instant Profile Synchronization
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-500/20">
            <QrCode className="w-full h-full text-black" />
          </div>
        </div>
      )
    },
    {
      title: "Kimi AI Hub",
      subtitle: "Intelligent Diagnostics",
      icon: <Brain className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-3 gap-8 max-w-6xl">
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
            <Activity className="w-10 h-10 text-blue-500" />
            <h4 className="text-white font-bold uppercase tracking-tight text-xl">Mood Analysis</h4>
            <p className="text-gray-500 text-sm">Real-time emotional tracking and mental health support powered by Kimi AI.</p>
          </div>
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
            <Stethoscope className="w-10 h-10 text-purple-500" />
            <h4 className="text-white font-bold uppercase tracking-tight text-xl">Prescription AI</h4>
            <p className="text-gray-500 text-sm">Instant scanning and analysis of medical prescriptions to prevent dosage errors.</p>
          </div>
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
            <TrendingUp className="w-10 h-10 text-emerald-500" />
            <h4 className="text-white font-bold uppercase tracking-tight text-xl">Nutrition Plans</h4>
            <p className="text-gray-500 text-sm">Personalized dietary recommendations based on clinical data and AI insights.</p>
          </div>
        </div>
      )
    },
    {
      title: "Global Marketplace",
      subtitle: "Alibaba-Style Sourcing",
      icon: <ShoppingBag className="w-10 h-10" />,
      content: (
        <div className="space-y-12 max-w-5xl">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 flex items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Direct-to-Clinic <br />Sourcing</h3>
              <p className="text-gray-400 leading-relaxed">Eliminating middlemen to provide high-quality medical supplies at manufacturer prices.</p>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Verified Suppliers</span>
                <span className="px-4 py-2 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Trade Assurance</span>
              </div>
            </div>
            <div className="w-64 h-64 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center">
              <Globe className="w-32 h-32 text-blue-500/20" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "TeleHealth 2.0",
      subtitle: "Real-Time Remote Care",
      icon: <MessageSquare className="w-10 h-10" />,
      content: (
        <div className="max-w-4xl text-center space-y-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white relative z-10 mx-auto">
              <Activity className="w-16 h-16" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div className="text-right">
              <h4 className="text-white font-bold text-2xl mb-2 uppercase tracking-tight">Live Waveforms</h4>
              <p className="text-gray-500 text-sm">Real-time visualization of patient vitals during consultations.</p>
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold text-2xl mb-2 uppercase tracking-tight">Secure Data Exchange</h4>
              <p className="text-gray-500 text-sm">Encrypted peer-to-peer communication for clinical data.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tech Stack",
      subtitle: "The Foundation",
      icon: <Cpu className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-4 gap-6 max-w-6xl">
          {[
            { name: 'MERN Stack', desc: 'MongoDB, Express, React, Node.js' },
            { name: 'Kimi AI', desc: 'Advanced LLM for Medical Insights' },
            { name: 'Socket.io', desc: 'Real-time Communication' },
            { name: 'Motion', desc: 'Fluid Interactive Experiences' }
          ].map((tech) => (
            <div key={tech.name} className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-4">
              <h4 className="text-blue-500 font-bold uppercase tracking-widest text-sm">{tech.name}</h4>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "The Journey",
      subtitle: "Development Phases",
      icon: <TrendingUp className="w-10 h-10" />,
      content: (
        <div className="relative w-full max-w-5xl h-2 bg-white/5 rounded-full flex items-center justify-between px-12">
          <div className="absolute inset-0 bg-blue-600 rounded-full w-3/4" />
          {[
            { label: 'Concept', date: 'Phase 1' },
            { label: 'Architecture', date: 'Phase 2' },
            { label: 'AI Integration', date: 'Phase 3' },
            { label: 'Global Launch', date: 'Phase 4' }
          ].map((step, i) => (
            <div key={step.label} className="relative flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full border-4 border-[#050505] relative z-10 ${i < 3 ? 'bg-blue-600' : 'bg-gray-800'}`} />
              <div className="absolute top-10 text-center whitespace-nowrap">
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-1">{step.label}</h4>
                <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Market Opportunity",
      subtitle: "The Digital Health Revolution",
      icon: <TrendingUp className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">A $600B+ <br />Global Market</h3>
            <p className="text-gray-400 leading-relaxed">The intersection of Telehealth, E-commerce, and AI Diagnostics represents the fastest-growing sector in modern technology.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-blue-600 rounded-full" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">18% CAGR in Digital Health</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-purple-600 rounded-full" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Rising Demand for Remote Care</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center">
              <p className="text-3xl font-display font-black text-blue-500 mb-2">85%</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Patient Adoption</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center">
              <p className="text-3xl font-display font-black text-purple-500 mb-2">2.4x</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Efficiency Gain</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Revenue Model",
      subtitle: "Sustainable Monetization",
      icon: <DollarSign className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-3 gap-8 max-w-6xl">
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold uppercase tracking-tight text-xl">SaaS for Clinics</h4>
            <p className="text-gray-500 text-sm">Tiered subscription models for hospitals and private clinics to manage operations, EHR, and AI diagnostics.</p>
          </div>
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold uppercase tracking-tight text-xl">Marketplace Fee</h4>
            <p className="text-gray-500 text-sm">A 5-15% transaction commission on medical equipment sourcing and pharmaceutical B2B sales.</p>
          </div>
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-500">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold uppercase tracking-tight text-xl">Data Insights</h4>
            <p className="text-gray-500 text-sm">Anonymized, aggregated health trend data for research institutions and pharmaceutical R&D.</p>
          </div>
        </div>
      )
    },
    {
      title: "Why Trust Us?",
      subtitle: "Security & Compliance",
      icon: <ShieldCheck className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Enterprise-Grade <br />Security</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm uppercase tracking-widest">Global Compliance</h5>
                  <p className="text-gray-500 text-xs mt-1">Full adherence to HIPAA, GDPR, and local medical data protection laws.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm uppercase tracking-widest">Zero-Trust Architecture</h5>
                  <p className="text-gray-500 text-xs mt-1">Every access request is verified, ensuring 100% data integrity and privacy.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Military-Grade Encryption</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Practitioners</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blockchain Audit Logs</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Journey",
      subtitle: "From Vision to Reality",
      icon: <TrendingUp className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-4 gap-4 w-full max-w-6xl">
          {[
            { phase: 'Phase 1', title: 'Conceptualization', desc: 'Defining the core ecosystem and identifying market gaps in global medical sourcing.', status: 'Completed' },
            { phase: 'Phase 2', title: 'Core Infrastructure', desc: 'Building the MERN foundation with real-time Socket.io integration and secure auth.', status: 'Completed' },
            { phase: 'Phase 3', title: 'AI Integration', desc: 'Implementing Kimi & Gemini AI for clinical diagnostics and patient support.', status: 'In Progress' },
            { phase: 'Phase 4', title: 'Global Scaling', desc: 'Onboarding international suppliers and expanding TeleHealth reach.', status: 'Upcoming' }
          ].map((step, i) => (
            <div key={step.title} className="relative group">
              <div className={`p-8 rounded-[2.5rem] border h-full transition-all duration-500 ${
                step.status === 'Completed' ? 'bg-blue-600/10 border-blue-500/30' : 
                step.status === 'In Progress' ? 'bg-amber-600/10 border-amber-500/30 animate-pulse' : 'bg-white/5 border-white/10'
              }`}>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 block">{step.phase}</span>
                <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">{step.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                <div className={`mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                  step.status === 'Completed' ? 'bg-blue-500 text-white' : 
                  step.status === 'In Progress' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-500'
                }`}>
                  {step.status}
                </div>
              </div>
              {i < 3 && (
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white/10 rounded-full hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "The Team",
      subtitle: "Experts in Innovation",
      icon: <Users className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-3 gap-8 max-w-5xl">
          {[
            { role: 'Lead Architect', name: 'Samiun Arnouk', bio: 'Visionary behind the Synapse ecosystem, specializing in full-stack healthcare solutions.' },
            { role: 'AI Specialist', name: 'AI Core Team', bio: 'Experts in integrating LLMs for clinical decision support and predictive analytics.' },
            { role: 'Medical Advisor', name: 'Clinical Board', bio: 'Ensuring all digital solutions meet the highest standards of medical accuracy.' }
          ].map((member) => (
            <div key={member.name} className="text-center space-y-4 p-8 bg-white/5 border border-white/10 rounded-[3rem] group hover:bg-white/10 transition-all">
              <div className="w-24 h-24 bg-blue-600/20 rounded-full mx-auto flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-blue-500" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xl uppercase tracking-tight">{member.name}</h4>
                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mt-1">{member.role}</p>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Future Scope",
      subtitle: "Beyond the Horizon",
      icon: <Globe className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-8 max-w-6xl">
          <div className="p-10 bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-[3rem] space-y-6">
            <h4 className="text-white font-display font-bold text-3xl uppercase tracking-tighter">Global Expansion</h4>
            <p className="text-gray-400 leading-relaxed">Expanding our marketplace to connect with manufacturers in 50+ countries, ensuring medical equity worldwide.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Multi-currency Support
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Localized AI Models
              </li>
            </ul>
          </div>
          <div className="p-10 bg-gradient-to-br from-purple-600/20 to-transparent border border-purple-500/20 rounded-[3rem] space-y-6">
            <h4 className="text-white font-display font-bold text-3xl uppercase tracking-tighter">Predictive Care</h4>
            <p className="text-gray-400 leading-relaxed">Using long-term data trends to predict and prevent health issues before they become critical.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs font-bold text-purple-400 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> IoT Wearable Integration
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-purple-400 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Genomic Data Analysis
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Join the Future",
      subtitle: "Call to Action",
      icon: <Zap className="w-10 h-10" />,
      content: (
        <div className="text-center space-y-12 max-w-4xl">
          <h3 className="text-6xl font-display font-black text-white uppercase tracking-tighter">Ready to Transform <br />Healthcare?</h3>
          <p className="text-xl text-gray-400 font-medium leading-relaxed">
            Whether you are a patient seeking better care, a doctor looking for intelligent tools, or a supplier aiming for global reach—Synapse Health is your partner.
          </p>
          <div className="flex justify-center gap-8">
            <button className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20">
              Partner With Us
            </button>
            <button className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
              Request Demo
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Sourcing Solutions",
      subtitle: "Direct Global Trade",
      icon: <Globe className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Direct-to-Clinic <br />Sourcing</h3>
            <p className="text-gray-400 leading-relaxed">Eliminating middlemen to provide high-quality medical supplies at manufacturer prices. Our platform handles all international trade protocols.</p>
            <div className="flex gap-4">
              <span className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Verified Suppliers</span>
              <span className="px-4 py-2 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Trade Assurance</span>
            </div>
          </div>
          <div className="p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden">
            <Truck className="w-32 h-32 text-blue-500/20 mx-auto" />
            <div className="mt-8 space-y-4">
              <div className="h-1 bg-blue-500/30 rounded-full w-full" />
              <div className="h-1 bg-blue-500/30 rounded-full w-2/3" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Services & Membership",
      subtitle: "Tiered Access",
      icon: <Users className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-3 gap-6 max-w-6xl">
          {[
            { name: 'Standard', price: '$0', features: ['Basic EHR', 'TeleHealth'] },
            { name: 'Professional', price: '$199', features: ['Full Suite', 'AI Diagnostics'] },
            { name: 'Enterprise', price: 'Custom', features: ['Global Network', 'Dedicated Support'] }
          ].map((plan) => (
            <div key={plan.name} className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-6">
              <h4 className="text-blue-500 font-bold uppercase tracking-widest text-sm">{plan.name}</h4>
              <p className="text-3xl font-display font-black text-white">{plan.price}</p>
              <ul className="text-[10px] font-bold text-gray-500 uppercase tracking-widest space-y-2">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Help Center",
      subtitle: "AI-Powered Support",
      icon: <MessageSquare className="w-10 h-10" />,
      content: (
        <div className="max-w-4xl text-center space-y-12">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/20">
            <MessageSquare className="w-12 h-12" />
          </div>
          <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Instant Answers. <br />Expert Guidance.</h3>
          <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">Our Help Center integrates Kimi AI to provide instant solutions to your technical and clinical queries, 24/7.</p>
        </div>
      )
    },
    {
      title: "Digital Health ID",
      subtitle: "Biometric Identity",
      icon: <QrCode className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl items-center">
          <div className="p-12 bg-white rounded-[3rem] shadow-2xl shadow-blue-500/20">
            <QrCode className="w-full h-full text-black" />
          </div>
          <div className="space-y-8">
            <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Your Health. <br />Your ID.</h3>
            <p className="text-gray-400 leading-relaxed">A secure, biometric-linked digital identity that carries your entire medical history across the global Synapse network.</p>
          </div>
        </div>
      )
    },
    {
      title: "IoT Integration",
      subtitle: "Real-Time Telemetry",
      icon: <Cpu className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-2 gap-12 max-w-5xl items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Connected <br />Care</h3>
            <p className="text-gray-400 leading-relaxed">Seamlessly sync data from wearables and medical IoT devices directly into your clinical records for real-time monitoring.</p>
          </div>
          <div className="relative">
            <div className="w-64 h-64 rounded-full border-4 border-blue-500/20 animate-ping absolute inset-0" />
            <div className="w-64 h-64 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 relative z-10 mx-auto">
              <Activity className="w-20 h-20" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Scalability",
      subtitle: "Cloud-Native Power",
      icon: <Layers className="w-10 h-10" />,
      content: (
        <div className="grid grid-cols-4 gap-6 max-w-6xl">
          {[
            { name: 'Microservices', desc: 'Modular architecture for rapid scaling.' },
            { name: 'Global CDN', desc: 'Low-latency access from any continent.' },
            { name: 'Auto-Scaling', desc: 'Dynamic resource allocation based on load.' },
            { name: 'Multi-Region', desc: 'High availability and disaster recovery.' }
          ].map((tech) => (
            <div key={tech.name} className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-4">
              <h4 className="text-blue-500 font-bold uppercase tracking-widest text-sm">{tech.name}</h4>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "The Vision",
      subtitle: "Healthcare Without Borders",
      icon: <Globe className="w-10 h-10" />,
      content: (
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          <h3 className="text-6xl font-display font-black text-white uppercase tracking-tighter italic">One World. <br />One Synapse.</h3>
          <p className="text-xl text-gray-400 font-medium leading-relaxed">
            We are building a future where quality healthcare is a global right, not a local privilege. Through technology, we bridge every gap.
          </p>
        </div>
      )
    },
    {
      title: "Thank You",
      subtitle: "Questions & Discussion",
      icon: <Activity className="w-10 h-10" />,
      content: (
        <div className="text-center space-y-8">
          <h3 className="text-8xl font-display font-black text-white uppercase tracking-tighter italic">Synapse Health</h3>
          <p className="text-blue-500 font-bold uppercase tracking-[0.5em] text-xl">Integrated. Intelligent. Global.</p>
          <div className="pt-12">
            <button 
              onClick={() => setCurrentSlide(0)}
              className="px-12 py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/10"
            >
              Restart Presentation
            </button>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden">
      <AnimatePresence mode="wait">
        <Slide 
          key={currentSlide}
          title={slides[currentSlide].title}
          subtitle={slides[currentSlide].subtitle}
          icon={slides[currentSlide].icon}
          content={slides[currentSlide].content}
        />
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 z-50">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-20"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <div className="flex items-center gap-3">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-12 bg-blue-600' : 'w-3 bg-white/10'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-20"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-12 right-12 text-gray-500 font-bold uppercase tracking-widest text-xs z-50">
        Slide {currentSlide + 1} / {slides.length}
      </div>

      {/* Exit Button */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-12 left-12 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all z-50"
      >
        Exit Presentation
      </button>
    </div>
  );
}
