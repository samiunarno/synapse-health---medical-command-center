import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Brain, Globe, ChevronRight, ChevronLeft, Target, TrendingUp,
  Rocket, Users, X, Cpu, Database, Network, Stethoscope, Truck, Layers, 
  Terminal, Smartphone, Server, Cloud, Code, Briefcase, QrCode, HeartPulse, 
  FileText, MessageSquare, ShieldAlert, Pill, Wallet, Map, Calendar, Video, Clock, Key,
  Heart, Hospital, CheckCircle2, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

// --- Simple ThreeBackground Component (replacement for missing import) ---
const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-blue-950/20 to-black" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
    </div>
  );
};

// --- Reusable Slide Layout Layer ---
const SlideLayout = ({ children, step, totalSteps, script }: { children: React.ReactNode, step: number, totalSteps: number, script: string }) => {
  const [showNotes, setShowNotes] = useState(false);
  
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-8 lg:p-16">
      {/* Content Area */}
      <div className="w-full max-w-6xl h-[80%] flex flex-col justify-center items-center relative z-10">
        {children}
      </div>

      {/* Presenter Notes Overlay */}
      <AnimatePresence>
        {showNotes && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl z-50 text-center"
          >
            <h4 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2">Speaker Script</h4>
            <p className="text-lg text-white font-medium italic leading-relaxed">"{script}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Controls & Progress */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-20">
        <div className="text-white/40 font-mono text-sm tracking-widest font-bold">
          SYNAPSE.OS_{step.toString().padStart(2, '0')}
        </div>
        
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${showNotes ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
        >
          {showNotes ? 'Hide Script' : 'Speaker Script'}
        </button>

        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === step - 1 ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 25;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, navigate]);

  // =============== ALL 25 SLIDES ===============

  const renderSlide = () => {
    switch(currentSlide) {
      case 1:
        return (
          <SlideLayout step={1} totalSteps={totalSlides} script="Good morning. Imagine a world where your healthcare is as connected and responsive as your smartphone. Today, I am thrilled to introduce you to Synapse—not just a new app, but the definitive digital nervous system for modern healthcare.">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center">
              <div className="relative mb-8">
                <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                <Activity className="w-32 h-32 text-blue-500 relative z-10" />
              </div>
              <h1 className="text-7xl font-display font-bold text-white mb-6 text-center tracking-tight">SYNAPSE</h1>
              <p className="text-2xl text-blue-400 font-medium tracking-wide uppercase">The Digital Nervous System for Modern Healthcare</p>
            </motion.div>
          </SlideLayout>
        );

      case 2:
        return (
          <SlideLayout step={2} totalSteps={totalSlides} script="Let's look at reality. Healthcare today is completely shattered. Patients use one app for telemedicine, another to order pills, and rely on physical paper files for labs. Hospitals use isolated software. The supply chain of human life is disconnected.">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-5xl font-bold text-white mb-16 text-center">The Status Quo</h2>
              <div className="flex flex-wrap justify-center gap-8 relative w-full max-w-4xl">
                {[ 
                  { icon: Hospital, label: 'Hospitals' }, 
                  { icon: Users, label: 'Patients' }, 
                  { icon: Pill, label: 'Pharmacies' }, 
                  { icon: Terminal, label: 'Diagnostic Labs' }, 
                  { icon: Truck, label: 'Ambulance' }
                ].map((item, i) => (
                  <motion.div key={i} initial={{ x: Math.random() * 100 - 50, y: Math.random() * 100 - 50, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }} className="bg-red-950/30 border border-red-500/30 p-8 rounded-2xl flex flex-col items-center gap-4 relative z-10 backdrop-blur-sm">
                    <item.icon className="w-12 h-12 text-red-500" />
                    <span className="text-red-200 font-bold">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </SlideLayout>
        );

      case 3:
        return (
          <SlideLayout step={3} totalSteps={totalSlides} script="This fragmentation isn't just an inconvenience; it costs lives and billions of dollars. When a doctor can't see your history instantly, or when an ambulance gets lost because of a bad dispatcher call, the system has failed the patient.">
             <div className="w-full flex flex-col items-center text-center">
                <h2 className="text-5xl font-bold text-white mb-20">The Cost of Disconnection</h2>
                <div className="grid grid-cols-2 gap-12 w-full max-w-4xl">
                  {[
                    { val: "30%", desc: "Delays in Diagnosis", color: "text-orange-500" },
                    { val: "1 in 10", desc: "Suffer from Medication Errors", color: "text-red-500" },
                    { val: "Millions", desc: "Wasted Hours in Queues", color: "text-yellow-500" },
                    { val: "Countless", desc: "Lost Medical Histories", color: "text-pink-500" },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.3 }} className="bg-white/5 border border-white/10 p-10 rounded-3xl">
                      <h3 className={`text-6xl font-black mb-4 ${stat.color}`}>{stat.val}</h3>
                      <p className="text-xl text-gray-300 font-medium">{stat.desc}</p>
                    </motion.div>
                  ))}
                </div>
             </div>
          </SlideLayout>
        );

      case 4:
        return (
          <SlideLayout step={4} totalSteps={totalSlides} script="So we asked ourselves: What if healthcare acted like a single, living organism? What if every doctor, pharmacy, lab, and ambulance could talk to each other in real-time, centered entirely around the patient?">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="flex justify-center items-center h-full">
                <h2 className="text-6xl md:text-8xl font-display font-bold text-white text-center leading-tight tracking-tight">
                  <motion.span animate={{ textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 40px rgba(255,255,255,0.5)", "0px 0px 0px rgba(255,255,255,0)"] }} transition={{ duration: 3, repeat: Infinity }}>
                    What if healthcare acted like a single, <span className="text-blue-500">living organism?</span>
                  </motion.span>
                </h2>
             </motion.div>
          </SlideLayout>
        );

      case 5:
        return (
          <SlideLayout step={5} totalSteps={totalSlides} script="Enter Synapse. The ultimate, AI-powered healthcare ecosystem. We bring every single aspect of the medical journey under one unified, interconnected platform. We connect the digital to the physical.">
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 1.5 }} className="relative mb-12">
                <div className="absolute inset-0 bg-blue-600/30 blur-[120px] rounded-full" />
                <div className="w-64 h-64 border border-blue-500/50 rounded-full flex items-center justify-center relative">
                   <Activity className="w-24 h-24 text-blue-400 relative z-20" />
                   {[Hospital, Pill, Truck, Server].map((Icon, i) => (
                     <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 10, ease: "linear", repeat: Infinity }} className="absolute inset-0" style={{ transformOrigin: "center" }}>
                        <div className="absolute top-0 left-1/2 -ml-6 -mt-6 bg-[#0a0a0a] border border-blue-500/50 p-3 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                          <Icon className="w-6 h-6 text-blue-400" />
                        </div>
                     </motion.div>
                   ))}
                </div>
              </motion.div>
              <h2 className="text-6xl font-bold text-white mb-4">Synapse Ecosystem</h2>
              <p className="text-2xl text-blue-400 font-medium">The Ultimate Unification</p>
            </div>
          </SlideLayout>
        );

      case 6:
        return (
          <SlideLayout step={6} totalSteps={totalSlides} script="It begins with the Digital Health ID. Every user gets a unique, secure QR profile. Gone are the days of carrying thick folders of prescriptions. One scan, and authorized medical staff instantly access your entire medical timeline.">
             <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-5xl">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 text-left">
                  <h2 className="text-5xl font-bold text-white mb-6">Digital Health ID</h2>
                  <p className="text-xl text-gray-400 leading-relaxed mb-8">A universal, secure identifier for every patient. Instant access to your clinical history, medications, and labs with a single scan.</p>
                  <ul className="space-y-4">
                    {['Universal Medical History', 'Instant QR Scanning', 'Cross-Hospital Unification'].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-blue-400 font-bold text-lg">
                        <CheckCircle2 className="w-6 h-6" /> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <div className="flex-1 flex justify-center">
                   <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="w-80 h-auto aspect-[3/4] bg-gradient-to-br from-blue-900 to-[#0a0a0a] border border-blue-500/50 rounded-3xl p-8 flex flex-col items-center justify-between shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                      <div className="w-24 h-24 rounded-full bg-white/10 mb-4" />
                      <div className="text-center w-full">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Samiun A.</h3>
                        <p className="text-blue-400 text-sm mb-4">ID: SYN-8829-10</p>
                        <div className="bg-white p-4 rounded-xl inline-block">
                           <QrCode className="w-32 h-32 text-black" />
                        </div>
                      </div>
                   </motion.div>
                </div>
             </div>
          </SlideLayout>
        );

      case 7:
        return (
          <SlideLayout step={7} totalSteps={totalSlides} script="When a patient feels sick, Synapse is the first line of defense. Our AI Symptom Checker analyzes inputs, asks clinical follow-up questions, and immediately routes the patient to the right specialist or emergency service. It's triage, evolved.">
             <div className="w-full flex flex-col text-center items-center">
               <h2 className="text-5xl font-bold text-white mb-12">AI Triage & Symptom Checker</h2>
               <div className="w-full max-w-2xl bg-black border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                 <div className="space-y-6 text-left">
                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex justify-end">
                     <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%]">I've been having sharp chest pains since morning.</div>
                   </motion.div>
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="flex justify-start">
                     <div className="bg-white/10 border border-white/10 text-gray-200 p-4 rounded-2xl rounded-tl-sm max-w-[80%] flex items-start gap-3">
                       <Brain className="w-6 h-6 text-purple-400 shrink-0" />
                       <p>Based on your symptoms, this could be urgent. Does the pain radiate to your arm or jaw? <span className="block mt-2 font-bold text-purple-400">I strongly recommend routing to a Cardiologist immediately.</span></p>
                     </div>
                   </motion.div>
                 </div>
               </div>
             </div>
          </SlideLayout>
        );

      case 8:
        return (
          <SlideLayout step={8} totalSteps={totalSlides} script="We integrate seamlessly with IoT and wearables. Synapse constantly tracks vital signs. If your heart rate spikes dangerously, your connected doctor is alerted instantly. Healthcare shifts from reactive to beautifully proactive.">
            <div className="flex flex-col items-center">
              <h2 className="text-5xl font-bold text-white mb-16">Real-Time IoT & Wearables</h2>
              <div className="relative w-full max-w-4xl flex justify-center items-center">
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute z-0 w-64 h-64 bg-red-500/20 blur-[80px] rounded-full" />
                 
                 <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[3rem] z-10 flex items-center gap-12 shadow-2xl">
                    <HeartPulse className="w-32 h-32 text-red-500" />
                    <div>
                      <h3 className="text-6xl font-black text-white mb-2">115 <span className="text-2xl text-gray-500">BPM</span></h3>
                      <p className="text-red-400 font-bold tracking-widest uppercase text-sm">Heart Rate Spike Detected</p>
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity }} className="h-1 bg-red-500 mt-6" />
                    </div>
                 </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 9:
        return (
          <SlideLayout step={9} totalSteps={totalSlides} script="Medical data is intimidating. Synapse uses pure AI to fix this. Upload a dense lab report, and our AI translates it into simple language you can understand. Scan a doctor's handwritten note, and the AI automatically carts the exact medicines.">
            <div className="flex flex-col md:flex-row gap-12 items-center w-full max-w-6xl">
              <div className="flex-1 flex flex-col gap-6 w-full">
                <h2 className="text-5xl font-bold text-white mb-4">AI Clinical Interpreters</h2>
                <div className="bg-white text-black p-6 rounded-xl font-mono text-xs opacity-50 relative overflow-hidden">
                  <p>HAEMATOLOGY REPORT - PATIENT SR029</p>
                  <p>WBC: 12.5 x10^9/L (REF 4.0-10.0) [HIGH]</p>
                  <p>HGB: 11.2 g/dL (REF 12.0-16.0) [LOW]</p>
                  <p>PLT: 150 x10^9/L (REF 150-400) [NORMAL]</p>
                  
                  <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_blue] z-20" />
                </div>
              </div>
              <div className="flex justify-center shrink-0">
                <ArrowRight className="w-12 h-12 text-blue-500" />
              </div>
              <div className="flex-1 w-full bg-blue-900/20 border border-blue-500/30 p-8 rounded-3xl backdrop-blur-xl">
                 <div className="mb-6">
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">Elevated White Blood Cells</span>
                    <p className="text-white mt-3 leading-relaxed">Your body is likely fighting an infection. The slightly low hemoglobin means mild anemia. <span className="text-blue-300 font-bold">Recommendation: Dr. Smith has been notified for a follow-up.</span></p>
                 </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 10:
        return (
          <SlideLayout step={10} totalSteps={totalSlides} script="Patients can seamlessly book in-person or virtual consultations. Our built-in video telehealth requires no external links or downloads, and doctors can view the patient's real-time IoT vitals *during* the video call.">
             <div className="flex flex-col items-center w-full max-w-5xl text-center">
                <h2 className="text-5xl font-bold text-white mb-12">Seamless Tele-Health</h2>
                <div className="grid grid-cols-2 gap-8 w-full">
                   <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl">
                      <Calendar className="w-16 h-16 text-blue-500 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">Smart Scheduling</h3>
                      <p className="text-gray-400">AI-optimized calendars that prevent double bookings and minimize waiting times.</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-purple-600/20 to-transparent" />
                      <Video className="w-16 h-16 text-purple-500 mb-6 relative z-10" />
                      <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Native WebRTC Video</h3>
                      <p className="text-gray-400 relative z-10">Secure, high-definition video calls natively embedded. No zoom links needed.</p>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 11:
        return (
          <SlideLayout step={11} totalSteps={totalSlides} script="For doctors, Synapse is a superpower. Alongside full EHR access, we provide an AI Clinical Decision Support System (CDSS). As a doctor prescribes a drug, the AI instantly cross-references the patient's history to warn of dangerous drug interactions before they happen.">
            <div className="w-full flex flex-col md:flex-row items-center gap-12 max-w-6xl">
              <div className="flex-1 text-left">
                 <h2 className="text-5xl font-bold text-white mb-6">Doctor's CDSS Command Center</h2>
                 <p className="text-xl text-gray-400 leading-relaxed mb-8">Clinical Decision Support System. An AI co-pilot that watches over every prescription and diagnosis in real time.</p>
              </div>
              <div className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
                  <h4 className="text-white font-bold mb-4">Prescribing: <span className="text-blue-400">Warfarin 5mg</span></h4>
                  
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} className="bg-red-500/10 border border-red-500 p-6 rounded-xl relative overflow-hidden mt-6">
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                    <div className="flex items-start gap-4 relative z-10">
                       <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                       <div>
                         <h5 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">AI CRITICAL WARNING</h5>
                         <p className="text-red-200">Patient is currently taking Aspirin (prescribed 10 days ago). Severe risk of internal bleeding. Suggesting alternative anticoagulant.</p>
                       </div>
                    </div>
                  </motion.div>
              </div>
            </div>
          </SlideLayout>
        );

      case 12:
        return (
          <SlideLayout step={12} totalSteps={totalSlides} script="Hospitals get a complete enterprise upgrade. Live queue management, instant token generation, and real-time visualization of ward and bed availability. Staff can assign patients to an ICU bed with a single drag-and-drop.">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-5xl font-bold text-white mb-12">Hospital ERP & Live Wards</h2>
              <div className="flex gap-4 w-full max-w-4xl">
                 <div className="flex-1 border border-white/10 rounded-2xl p-6 bg-white/5">
                    <h4 className="text-gray-400 font-bold uppercase text-xs mb-4">General Ward A</h4>
                    <div className="grid grid-cols-4 gap-2">
                       {Array.from({ length: 8 }).map((_, i) => (
                         <div key={i} className={`h-16 rounded-lg border ${i < 6 ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-green-500/20 border-green-500/30 text-green-400'} flex items-center justify-center font-bold text-xs`}>
                           {i < 6 ? 'OCCUPIED' : 'FREE'}
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="flex-1 border border-white/10 rounded-2xl p-6 bg-white/5">
                    <h4 className="text-gray-400 font-bold uppercase text-xs mb-4">Urgent ICU</h4>
                    <div className="grid grid-cols-2 gap-4">
                       {Array.from({ length: 4 }).map((_, i) => (
                         <div key={i} className={`h-24 rounded-lg border ${i === 3 ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-red-500/20 border-red-500/30 text-red-400'} flex flex-col items-center justify-center font-bold text-xs`}>
                           <HeartPulse className="w-6 h-6 mb-2 opacity-50" />
                           {i === 3 ? 'AVAILABLE' : 'CRITICAL'}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 13:
        return (
          <SlideLayout step={13} totalSteps={totalSlides} script="To eliminate billing friction, we built a closed-loop smart wallet. Patients recharge their balance securely. Every consultation fee, lab test, and pharmacy order is deducted automatically in milliseconds. No more waiting at the billing counter.">
            <div className="flex flex-col items-center">
              <h2 className="text-5xl font-bold text-white mb-16">The Closed-Loop Smart Wallet</h2>
              <div className="bg-gradient-to-br from-indigo-900 to-black border border-indigo-500/30 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[60px]" />
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <Wallet className="w-8 h-8 text-indigo-400" />
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase">Synapse Pay</span>
                </div>
                <div className="mb-10 relative z-10">
                   <p className="text-indigo-200/60 font-medium mb-2">Available Balance</p>
                   <h3 className="text-5xl font-black text-white">$1,240.00</h3>
                </div>
                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between items-center text-sm border-t border-indigo-500/20 pt-4">
                     <span className="text-white/60">Dr. Smith Consultation</span>
                     <span className="text-red-400 font-bold">-$150.00</span>
                   </div>
                   <div className="flex justify-between items-center text-sm border-t border-indigo-500/20 pt-4">
                     <span className="text-white/60">Pharmacy Order #84</span>
                     <span className="text-red-400 font-bold">-$45.50</span>
                   </div>
                </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 14:
        return (
          <SlideLayout step={14} totalSteps={totalSlides} script="We handle the logistics of life and death. If a patient triggers the SOS, nearby ambulance drivers get pinged instantly. Patients and hospitals track the ambulance live via GPS, ensuring the ER is prepped exactly when the patient arrives.">
            <div className="w-full flex flex-col md:flex-row items-center gap-12 max-w-5xl">
               <div className="flex-1">
                 <h2 className="text-5xl font-bold text-white mb-6">Emergency Dispatch</h2>
                 <p className="text-xl text-gray-400 mb-8">The "Uber" model for critical care. Instant SOS broadcasting and live GPS tracking saves vital minutes.</p>
                 <button className="bg-red-600 border border-red-500 hover:bg-red-500 text-white font-black text-2xl py-6 px-12 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center gap-4 transition-all hover:scale-105">
                   <ShieldAlert className="w-8 h-8" /> 
                   EMERGENCY SOS
                 </button>
               </div>
               <div className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-4 overflow-hidden relative h-96">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  
                  <motion.div initial={{ y: 200, x: -100 }} animate={{ y: 0, x: 50 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute z-20 flex flex-col items-center">
                    <div className="bg-red-500 rounded-full p-3 shadow-[0_0_20px_red]">
                       <Truck className="w-8 h-8 text-white" />
                    </div>
                    <span className="mt-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">2 mins away</span>
                  </motion.div>

                  <div className="absolute top-[40%] left-[60%] z-10 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_blue] animate-pulse" />
               </div>
            </div>
          </SlideLayout>
        );

      case 15:
        return (
          <SlideLayout step={15} totalSteps={totalSlides} script="And finally, prescriptions. E-commerce is natively built-in. Pharmacies receive digital orders instantly. A dedicated Synapse delivery rider picks up the medication and drops it at the patient's door, tracked end-to-end on a live map.">
            <div className="flex flex-col items-center text-center">
               <h2 className="text-5xl font-bold text-white mb-16">E-Pharmacy & Last-Mile Delivery</h2>
               <div className="flex items-center gap-8 w-full max-w-4xl justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                       <Pill className="w-10 h-10 text-green-400" />
                    </div>
                    <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Pharmacy</span>
                  </div>
                  <motion.div animate={{ x: [-10, 10, -10] }} transition={{ duration: 2, repeat: Infinity }} className="flex-1 h-[2px] bg-gradient-to-r from-green-500/50 to-blue-500/50 relative">
                     <Truck className="w-6 h-6 text-white absolute -top-3 left-1/2 -ml-3" />
                  </motion.div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                       <Users className="w-10 h-10 text-blue-400" />
                    </div>
                    <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Patient Doorstep</span>
                  </div>
               </div>
            </div>
          </SlideLayout>
        );

      case 16:
        return (
          <SlideLayout step={16} totalSteps={totalSlides} script="Synapse isn't just for patients or doctors. It is a multi-tenant platform featuring 11 distinct, secure user roles. Every stakeholder logs into an interface custom-built specifically for their operational needs.">
             <div className="flex flex-col items-center w-full">
               <h2 className="text-5xl font-bold text-white mb-12">An Ecosystem of 11 User Roles</h2>
               <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                 {['Admin', 'Hospital', 'Doctor', 'Patient', 'Staff', 'Pharmacy', 'Pharmacist', 'Lab', 'Lab Tech', 'Driver', 'Rider'].map((role, i) => (
                   <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 px-6 py-4 rounded-full font-bold text-lg text-white hover:bg-blue-600 hover:border-blue-500 transition-all cursor-default">
                     {role}
                   </motion.div>
                 ))}
               </div>
             </div>
          </SlideLayout>
        );

      case 17:
        return (
          <SlideLayout step={17} totalSteps={totalSlides} script="Our business model is highly lucrative and diversified. We charge a micro-commission on every appointment, lab test, and medicine delivery. We charge ongoing B2B SaaS fees to hospitals and pharmacies, and patients can subscribe to Synapse Premium for prioritized care.">
            <div className="flex flex-col items-center text-center">
               <h2 className="text-5xl font-bold text-white mb-16">The Revenue Engine</h2>
               <div className="grid grid-cols-3 gap-8 w-full max-w-5xl">
                 {[
                   { title: "Marketplace Commissions", desc: "10-15% cut on appointments, labs, and medicine deliveries.", icon: TrendingUp, color: "text-green-400", border: 'border-green-500/30' },
                   { title: "B2B SaaS Subscriptions", desc: "Monthly enterprise fees for Hospital and Lab ERP systems.", icon: Briefcase, color: "text-blue-400", border: 'border-blue-500/30' },
                   { title: "Premium Patient Memberships", desc: "Tiered consumer subscriptions for 0 wait times & free delivery.", icon: Target, color: "text-purple-400", border: 'border-purple-500/30' }
                 ].map((box, i) => (
                    <motion.div key={i} whileHover={{ y: -10 }} className={`bg-white/5 border ${box.border} p-8 rounded-3xl`}>
                      <box.icon className={`w-12 h-12 mb-6 ${box.color} mx-auto`} />
                      <h3 className="text-2xl font-bold text-white mb-4">{box.title}</h3>
                      <p className="text-gray-400">{box.desc}</p>
                    </motion.div>
                 ))}
               </div>
            </div>
          </SlideLayout>
        );

      case 18:
        return (
          <SlideLayout step={18} totalSteps={totalSlides} script="Under the hood, Synapse is built on cutting-edge technology. Powered by React and Node.js with MongoDB. We utilize Socket.io for instantaneous real-time updates and ZHIPU AI for unparalleled, logical reasoning. It is built to scale globally.">
             <div className="flex flex-col items-center">
               <h2 className="text-5xl font-bold text-white mb-16">Engineered for Global Scale</h2>
               <div className="flex flex-wrap justify-center gap-12 max-w-4xl">
                 {[
                   { label: "React 18", icon: Code },
                   { label: "Node.js", icon: Terminal },
                   { label: "MongoDB", icon: Database },
                   { label: "Socket.io", icon: Network },
                   { label: "ZHIPU AI", icon: Brain },
                   { label: "WebRTC", icon: Video }
                 ].map((tech, i) => (
                   <div key={i} className="flex flex-col items-center gap-4">
                     <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <tech.icon className="w-10 h-10 text-blue-400" />
                     </div>
                     <span className="text-white font-bold">{tech.label}</span>
                   </div>
                 ))}
               </div>
             </div>
          </SlideLayout>
        );

      case 19:
        return (
          <SlideLayout step={19} totalSteps={totalSlides} script="Our Go-To-Market strategy is aggressive but calculated. We start with local pilots by offering the software free to select clinics to test logistics. We then acquire patients heavily relying on our unique AI tools, and finally pivot to locking in major hospital enterprises.">
            <div className="flex flex-col items-center w-full">
               <h2 className="text-5xl font-bold text-white mb-16">Go-To-Market Strategy</h2>
               <div className="flex flex-col w-full max-w-4xl gap-4 relative">
                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-500/20" />
                  {[
                    { phase: "PHASE 1 (M 1-3)", title: "Local Pilot", desc: "Partner with 3 minor clinics & 5 pharmacies. Test logistics free of charge." },
                    { phase: "PHASE 2 (M 4-6)", title: "Aggressive Patient Acquisition", desc: "Marketing highlighting AI interpreters and fast medicine delivery. Build the base." },
                    { phase: "PHASE 3 (M 7-12)", title: "B2B Enterprise Push", desc: "Target mid-large tier hospitals. Pitch as total infrastructure upgrade." }
                  ].map((step, i) => (
                    <motion.div key={i} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.3 }} className="ml-16 bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl relative">
                       <div className="absolute -left-[43px] top-1/2 -mt-3 w-6 h-6 bg-blue-600 rounded-full border-4 border-[#0a0a0a]" />
                       <span className="text-blue-500 font-black text-xs uppercase tracking-widest">{step.phase}</span>
                       <h3 className="text-2xl font-bold text-white mt-2 mb-2">{step.title}</h3>
                       <p className="text-gray-400">{step.desc}</p>
                    </motion.div>
                  ))}
               </div>
            </div>
          </SlideLayout>
        );

      case 20:
        return (
          <SlideLayout step={20} totalSteps={totalSlides} script="Security and Compliance are non-negotiable. Synapse is designed from the ground up to be fully compliant with China's MLPS and Personal Information Protection Law (PIPL). End-to-end encryption, multi-factor authentication, and blockchain-inspired audit trails ensure the absolute privacy of patient data across all regions.">
             <div className="flex flex-col items-center w-full">
                <h2 className="text-5xl font-bold text-white mb-16">Military-Grade Compliance</h2>
                <div className="flex gap-12 max-w-5xl w-full justify-center">
                   <div className="flex-1 bg-[#0a0a0a] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent" />
                      <Key className="w-16 h-16 text-blue-400 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-4">Zero-Trust Architecture</h3>
                      <p className="text-gray-400">Strict internal access boundaries. Data is decoupled and encrypted at rest and in transit.</p>
                   </div>
                   <div className="flex-1 bg-[#0a0a0a] border border-green-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-transparent" />
                      <ShieldAlert className="w-16 h-16 text-green-400 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-4">MLPS & PIPL Ready</h3>
                      <p className="text-gray-400">Automated regulatory adherence, rigorous data localization protocols, and decentralized audit nodes.</p>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 21:
        return (
          <SlideLayout step={21} totalSteps={totalSlides} script="Let's visualize the explosive growth path specifically localized for the Chinese market. Year over year, we project massive adoption stemming from our unique B2B2C model. As Tier-3A hospitals onboard our ERP, they instantly bring millions of users into the ecosystem via integrated WeChat interfaces.">
            <div className="w-full flex justify-center items-center h-full flex-col">
              <h2 className="text-5xl font-bold text-white mb-12">Projected User Adoption (APAC)</h2>
              <div className="w-full max-w-4xl h-96 bg-[#0a0a0a] p-6 rounded-3xl border border-white/10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { year: '2026', users: 50 },
                    { year: '2027', users: 350 },
                    { year: '2028', users: 1200 },
                    { year: '2029', users: 4500 },
                    { year: '2030', users: 15000 }
                  ]}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#ffffff55" />
                    <YAxis stroke="#ffffff55" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff22' }} />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SlideLayout>
        );

      case 22:
        return (
          <SlideLayout step={22} totalSteps={totalSlides} script="Revenue scales dynamically across three distinct pillars tailored for China: Enterprise Tier-3A hospital software subscriptions, consumer premium health memberships integrated with Alipay/WeChat Pay, and high-frequency transaction fees from local marketplace volume.">
            <div className="w-full flex justify-center items-center h-full flex-col">
              <h2 className="text-5xl font-bold text-white mb-12">Dynamic Revenue Streams</h2>
              <div className="w-full max-w-4xl h-96 bg-[#0a0a0a] p-6 rounded-3xl border border-white/10 flex gap-8 py-8 items-center justify-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Enterprise Public Hospital SaaS', value: 45 },
                        { name: 'Marketplace Fees (Alipay/WeChat)', value: 35 },
                        { name: 'B2C VIP Premium', value: 20 }
                      ]}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#a855f7" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff22' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-6 w-1/2">
                   <div className="flex items-center gap-4"><div className="w-6 h-6 rounded-full bg-blue-500" /><span className="text-xl text-white font-bold">45% Enterprise Public Hospital SaaS</span></div>
                   <div className="flex items-center gap-4"><div className="w-6 h-6 rounded-full bg-purple-500" /><span className="text-xl text-white font-bold">35% Marketplace (Alipay/WeChat)</span></div>
                   <div className="flex items-center gap-4"><div className="w-6 h-6 rounded-full bg-green-500" /><span className="text-xl text-white font-bold">20% B2C VIP Premium</span></div>
                </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 23:
        return (
          <SlideLayout step={23} totalSteps={totalSlides} script="Let us observe a competitive landscape matrix against massive Chinese competitors like Ping An Good Doctor and AliHealth. Legacy players remain siloed—they act as e-pharmacies or telehealth hubs, but not deep IT infrastructure. Because we designed the 11-role centralized architecture from day one with ZHIPU AI, we are the only entity that unifies all vectors into one seamless closed-loop.">
             <div className="w-full flex flex-col items-center">
                <h2 className="text-5xl font-bold text-white mb-16">The Regional Disruption</h2>
                <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 indent-4">Feature</th>
                            <th className="p-4 text-center">Legacy Telehealth (e.g., Ping An)</th>
                            <th className="p-4 text-center">Legacy Pharmacy (e.g., JD Health)</th>
                            <th className="p-4 text-center bg-blue-900/30 text-blue-400 font-black">SYNAPSE OS</th>
                          </tr>
                      </thead>
                      <tbody className="text-gray-400">
                         <tr className="border-b border-white/5"><td className="p-4 indent-4 font-bold text-white">Video Consultations</td><td className="p-4 text-center text-green-500">Yes</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-green-400 bg-blue-900/10">Yes</td></tr>
                         <tr className="border-b border-white/5"><td className="p-4 indent-4 font-bold text-white">Last-Mile Medicine Delivery</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-green-500">Yes</td><td className="p-4 text-center text-green-400 bg-blue-900/10">Yes</td></tr>
                         <tr className="border-b border-white/5"><td className="p-4 indent-4 font-bold text-white">Core Tier-3A Hospital ERP Integration</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-green-400 bg-blue-900/10">Yes</td></tr>
                         <tr className="border-b border-white/5"><td className="p-4 indent-4 font-bold text-white">Live Wearable Vital Streaming</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-green-400 bg-blue-900/10">Yes</td></tr>
                         <tr><td className="p-4 indent-4 font-bold text-white">Native ZHIPU LLM Triage & CDSS</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-red-500">No</td><td className="p-4 text-center text-green-400 bg-blue-900/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]">Yes</td></tr>
                      </tbody>
                    </table>
                </div>
             </div>
          </SlideLayout>
        );

      case 24:
        return (
          <SlideLayout step={24} totalSteps={totalSlides} script="We have built a platform that not only solves immediate regional frictions—such as hospital over-crowding and fragmented patient data—but anticipates the future of Chinese medicine through the localized intelligence of ZHIPU AI and full ecosystem unification.">
            <div className="flex flex-col items-center text-center h-full justify-center">
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, type: "spring" }} className="relative mb-12">
                 <div className="absolute inset-0 bg-blue-500/30 blur-[120px] rounded-full" />
                 <Brain className="w-48 h-48 text-white relative z-10" />
                 <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute -inset-8 border-2 border-dashed border-blue-500/50 rounded-full" />
               </motion.div>
               <h2 className="text-6xl font-bold text-white leading-tight mb-6">
                 Powered by <span className="text-blue-500">ZHIPU AI</span>
                 <br/>
                 Built for <span className="text-purple-500">China.</span>
               </h2>
               <p className="text-2xl text-gray-400 max-w-3xl">Synapse is the catalyst for the next generation of APAC health infrastructure.</p>
            </div>
          </SlideLayout>
        );

      case 25:
        return (
          <SlideLayout step={25} totalSteps={totalSlides} script="In conclusion, Synapse is more than an application. It is the infrastructure for a smarter, faster, and more unified era of medicine. Thank you for your time. Let's connect healthcare. I am now open for your questions.">
             <div className="flex flex-col items-center justify-center text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-64 h-64 border border-blue-500/30 rounded-full flex items-center justify-center mb-12 relative overflow-hidden">
                   <Globe className="w-32 h-32 text-blue-500 opacity-50" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-600/20 to-transparent" />
                </motion.div>
                <h2 className="text-6xl font-black text-white mb-6 tracking-tight">Invest in the Future of Healthcare.</h2>
                <p className="text-2xl text-blue-400 font-medium mb-12">Thank You.</p>
                
                <button onClick={() => navigate('/')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold transition-all">
                  Exit Presentation
                </button>
             </div>
          </SlideLayout>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col font-sans select-none">
       {/* React Three Fiber Background */}
       <ThreeBackground />
       
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
       
       {/* Navigation Layer */}
       <div className="absolute inset-y-0 w-full flex justify-between items-center px-4 pointer-events-none z-50">
          <button 
            onClick={prevSlide} 
            disabled={currentSlide === 1}
            className="w-16 h-16 pointer-events-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all backdrop-blur-md"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={nextSlide} 
            disabled={currentSlide === totalSlides}
            className="w-16 h-16 pointer-events-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all backdrop-blur-md"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
       </div>
       
       <button onClick={() => navigate('/')} className="absolute top-8 right-8 p-3 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-red-500/20 transition-all z-50">
         <X className="w-6 h-6" />
       </button>
       
       <AnimatePresence mode="wait">
         <motion.div 
           key={currentSlide}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 1.05 }}
           transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
           className="w-full h-full"
         >
           {renderSlide()}
         </motion.div>
       </AnimatePresence>
    </div>
  );
}