import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Shield, 
  Zap, 
  Activity, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  Target,
  TrendingUp,
  Rocket,
  Users,
  CheckCircle2,
  X,
  ArrowRight,
  Cpu,
  Database,
  Lock,
  BarChart3,
  Network,
  Workflow,
  Stethoscope,
  Truck,
  Layers,
  Terminal,
  MessageSquare,
  Smartphone,
  Server,
  Cloud,
  Code,
  Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

// --- Marketing Video Component (Animated Storytelling) ---
const MarketingVideo = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();
  
  const steps = [
    {
      title: t("future_healthcare"),
      subtitle: t("engineered_precision"),
      icon: Brain,
      color: "from-blue-600 to-indigo-600",
      bg: "bg-black"
    },
    {
      title: t("zero_latency_care"),
      subtitle: t("realtime_telemetry_desc"),
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      bg: "bg-gray-950"
    },
    {
      title: t("atmospheric_security"),
      subtitle: t("military_encryption_desc"),
      icon: Shield,
      color: "from-purple-600 to-pink-600",
      bg: "bg-black"
    },
    {
      title: t("synapse_health"),
      subtitle: t("os_modern_medicine"),
      icon: Activity,
      color: "from-green-500 to-teal-600",
      bg: "bg-gray-950"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev === steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[200] ${steps[step].bg} flex items-center justify-center overflow-hidden transition-colors duration-1000`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-6"
        >
          <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br ${steps[step].color} flex items-center justify-center mx-auto mb-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group`}>
            {React.createElement(steps[step].icon, { className: "w-12 h-12 lg:w-16 lg:h-16 text-white animate-pulse" })}
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
          </div>
          
          <h1 className="text-4xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter mb-6 leading-none">
            {steps[step].title}
          </h1>
          <p className="text-lg lg:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {steps[step].subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
        {steps.map((_, i) => (
          <div key={i} className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={step === i ? { width: '100%' } : step > i ? { width: '100%' } : { width: 0 }}
              transition={{ duration: step === i ? 4 : 0.5, ease: "linear" }}
              className="h-full bg-white"
            />
          </div>
        ))}
      </div>

      <button 
        onClick={onComplete}
        className="absolute top-12 right-12 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
      >
        {t('skip_intro')} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- Pitch Deck Component (Professional Slides) ---
const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const script = [
    "Good morning everyone. My name is Samiun Arnouk, Lead Architect of Synapse Health. Today, I am defending the architecture of our Unified Medical Operating System.",
    "Synapse Health is not just a dashboard; it is the infrastructure for zero-latency care. We are building the foundational layer for modern medicine.",
    "Our mission is to eliminate medical latency and democratize precision healthcare globally through a unified neural infrastructure.",
    "We face a systemic crisis with legacy websites: fragmented data, slow response times, and a total lack of real-time integration. In healthcare, this latency costs lives.",
    "Synapse OS is the definitive solution. We've built a unified, AI-first platform that connects every node in the healthcare value chain in real-time, eliminating silos forever.",
    "Our ecosystem creates a unified network between patients, doctors, hospitals, and pharmacies, ensuring a continuous feedback loop of care.",
    "The workflow is seamless: from IoT telemetry to AI-driven diagnostics and automated prescription fulfillment. End-to-end precision.",
    "At our core is the Neural Engine—an advanced Clinical Decision Support System that augments medical expertise with deep learning insights.",
    "We integrate real-time IoT telemetry directly into clinical charts, shifting healthcare from reactive treatment to proactive monitoring.",
    "Our global sourcing marketplace eliminates middlemen, connecting institutions to manufacturers and reducing costs by up to 40%.",
    "Security is our priority. We use Zero Trust Architecture and military-grade encryption to ensure total data sovereignty and compliance.",
    "We are targeting a $10 trillion global market. Synapse is built to scale as the primary infrastructure for digital-first healthcare.",
    "Our business model combines sustainable SaaS subscriptions with transactional marketplace commissions for diversified growth.",
    "Our core innovation is the Neural Infrastructure. Unlike legacy EHRs, we don't just store data; we predict needs, automate logistics, and secure sovereignty.",
    "The impact is clear: 30% faster diagnostics and 50% faster emergency response. We are setting a new standard for clinical excellence.",
    "Our roadmap takes us from Core Beta to global launch by Q4, establishing Synapse as the global standard for medical OS.",
    "We are implementing Blockchain for decentralized health records, giving patients absolute control over their medical data sovereignty.",
    "Future updates include AI-driven autonomous ambulance routing and real-time emergency resource allocation to save more lives.",
    "Synapse is built for the next billion users. We are committed to green infrastructure and healthcare equity in emerging markets.",
    "In conclusion, Synapse Health is the future of medicine. Join us in building a world where precision care is a global right. Thank you."
  ];

  const impactData = [
    { name: 'Diagnostic Time', current: 100, synapse: 70 },
    { name: 'Emergency Resp', current: 100, synapse: 50 },
    { name: 'Data Accuracy', current: 85, synapse: 99 },
    { name: 'Supply Cost', current: 100, synapse: 65 },
  ];

  const marketData = [
    { year: '2024', value: 4.2 },
    { year: '2025', value: 5.8 },
    { year: '2026', value: 7.5 },
    { year: '2027', value: 10.2 },
  ];

  const businessModelData = [
    { name: t('business_model_saas'), value: 45 },
    { name: t('business_model_comm'), value: 35 },
    { name: t('business_model_data'), value: 20 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
  
  const slides = [
    {
      id: "presenter",
      title: t("slide_1_title"),
      subtitle: t("presenter_title"),
      content: t("presenter_bio"),
      type: "profile",
      icon: Briefcase,
      color: "blue"
    },
    {
      id: "title",
      title: t("slide_2_title"),
      subtitle: t("slide_2_subtitle"),
      content: t("os_modern_medicine"),
      type: "hero",
      icon: Brain,
      color: "blue"
    },
    {
      id: "mission",
      title: t("slide_3_title"),
      subtitle: t("engineered_precision"),
      content: t("slide_3_content"),
      type: "text",
      icon: Rocket,
      color: "purple"
    },
    {
      id: "problem",
      title: t("slide_4_title"),
      subtitle: t("slide_4_subtitle"),
      content: t("slide_4_content"),
      type: "text",
      icon: Target,
      color: "red"
    },
    {
      id: "solution",
      title: t("slide_5_title"),
      subtitle: t("slide_5_subtitle"),
      content: t("slide_5_content"),
      type: "text",
      icon: Zap,
      color: "yellow"
    },
    {
      id: "ecosystem",
      title: t("slide_6_title"),
      subtitle: t("slide_6_subtitle"),
      content: t("slide_6_content"),
      type: "infographic",
      icon: Network,
      color: "blue"
    },
    {
      id: "workflow",
      title: t("slide_7_title"),
      subtitle: t("slide_7_subtitle"),
      content: t("slide_7_content"),
      type: "infographic",
      icon: Workflow,
      color: "green"
    },
    {
      id: "ai",
      title: t("slide_8_title"),
      subtitle: t("slide_8_subtitle"),
      content: t("slide_8_content"),
      type: "text",
      icon: Cpu,
      color: "purple"
    },
    {
      id: "iot",
      title: t("slide_9_title"),
      subtitle: t("slide_9_subtitle"),
      content: t("slide_9_content"),
      type: "text",
      icon: Smartphone,
      color: "blue"
    },
    {
      id: "sourcing",
      title: t("slide_10_title"),
      subtitle: t("slide_10_subtitle"),
      content: t("slide_10_content"),
      type: "text",
      icon: Truck,
      color: "orange"
    },
    {
      id: "security",
      title: t("slide_11_title"),
      subtitle: t("slide_11_subtitle"),
      content: t("slide_11_content"),
      type: "text",
      icon: Shield,
      color: "emerald"
    },
    {
      id: "market",
      title: t("slide_12_title"),
      subtitle: t("slide_12_subtitle"),
      content: t("slide_12_content"),
      type: "chart",
      chartType: "area",
      data: marketData,
      icon: Globe,
      color: "blue"
    },
    {
      id: "business",
      title: t("slide_13_title"),
      subtitle: t("slide_13_subtitle"),
      content: t("slide_13_content"),
      type: "chart",
      chartType: "pie",
      data: businessModelData,
      icon: BarChart3,
      color: "purple"
    },
    {
      id: "competition",
      title: t("slide_14_title"),
      subtitle: t("slide_14_subtitle"),
      content: t("slide_14_content"),
      type: "text",
      icon: Layers,
      color: "blue"
    },
    {
      id: "impact",
      title: t("slide_15_title"),
      subtitle: t("slide_15_subtitle"),
      content: t("slide_15_content"),
      type: "chart",
      chartType: "bar",
      data: impactData,
      icon: Activity,
      color: "green"
    },
    {
      id: "roadmap",
      title: t("slide_16_title"),
      subtitle: t("slide_16_subtitle"),
      content: t("slide_16_content"),
      type: "roadmap",
      icon: TrendingUp,
      color: "blue"
    },
    {
      id: "blockchain",
      title: t("slide_17_title"),
      subtitle: t("slide_17_subtitle"),
      content: t("slide_17_content"),
      type: "text",
      icon: Database,
      color: "purple"
    },
    {
      id: "autonomous",
      title: t("slide_18_title"),
      subtitle: t("slide_18_subtitle"),
      content: t("slide_18_content"),
      type: "text",
      icon: Cpu,
      color: "red"
    },
    {
      id: "sustainability",
      title: t("slide_19_title"),
      subtitle: t("slide_19_subtitle"),
      content: t("slide_19_content"),
      type: "text",
      icon: Globe,
      color: "emerald"
    },
    {
      id: "conclusion",
      title: t("slide_20_title"),
      subtitle: t("slide_20_subtitle"),
      content: t("slide_20_content"),
      type: "hero",
      icon: CheckCircle2,
      color: "blue"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  };

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'profile':
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-1 mb-8">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-black">
                SA
              </div>
            </div>
            <h3 className="text-4xl font-display font-black uppercase mb-2">{t('presenter_name')}</h3>
            <p className="text-blue-500 font-bold uppercase tracking-widest mb-6">{t('presenter_title')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {t('presenter_skills_list').split(' • ').map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="w-full h-[400px] bg-white/5 rounded-3xl p-8 border border-white/10">
            <ResponsiveContainer width="100%" height="100%">
              {slide.chartType === 'bar' ? (
                <BarChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} tick={{ fill: '#666' }} />
                  <YAxis stroke="#666" fontSize={10} tick={{ fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="current" fill="#ffffff20" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="synapse" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : slide.chartType === 'area' ? (
                <AreaChart data={slide.data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="year" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              ) : (
                <PieChart>
                  <Pie
                    data={slide.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {slide.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        );
      case 'infographic':
        return (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Node {i + 1}</p>
                  <p className="text-xs font-bold uppercase">Active Stream</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'roadmap':
        return (
          <div className="space-y-6">
            {[t('roadmap_q1'), t('roadmap_q2'), t('roadmap_q3'), t('roadmap_q4')].map((milestone, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-mono text-xs group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                  0{i + 1}
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <div className="text-right">
                  <p className="text-sm font-bold uppercase tracking-widest">{milestone}</p>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <p className="text-lg lg:text-xl text-gray-400 leading-relaxed">
            {slide.content}
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <header className="p-8 lg:p-12 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold tracking-tighter uppercase">{t('synapse_pitch')}</span>
              <span className="text-[8px] font-mono text-blue-500 uppercase tracking-[0.3em]">Doc ID: SYN-2026-ALPHA // CLASSIFIED</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <button 
            onClick={() => setShowPresenterNotes(!showPresenterNotes)}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
              showPresenterNotes ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            {showPresenterNotes ? 'Hide Script' : 'Show Script'}
          </button>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Secure Link Active</span>
          </div>
          <span>{t('slide')} {currentSlide + 1} / {slides.length}</span>
          <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showPresenterNotes && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed left-8 top-32 bottom-32 w-80 bg-black/80 backdrop-blur-2xl border border-blue-500/30 rounded-[2rem] p-8 z-40 hidden xl:flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.1)]"
            >
              <div className="flex items-center gap-3 mb-6 text-blue-500">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Presenter Script</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
                  "{script[currentSlide]}"
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>Tone: Professional</span>
                  <span>Pace: Moderate</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl w-full relative z-10"
          >
            <div>
              <div className={`w-16 h-16 rounded-2xl ${colors[slides[currentSlide].color]} border flex items-center justify-center mb-8`}>
                {React.createElement(slides[currentSlide].icon, { className: "w-8 h-8" })}
              </div>
              <h2 className="text-6xl lg:text-8xl font-display font-black uppercase tracking-tighter mb-6 leading-none">
                {slides[currentSlide].title}
              </h2>
              <p className="text-2xl lg:text-3xl text-blue-500 font-bold uppercase tracking-widest mb-12">
                {slides[currentSlide].subtitle}
              </p>
              
              {slides[currentSlide].type === 'profile' && (
                <p className="text-lg lg:text-xl text-gray-400 leading-relaxed mb-12">
                  {slides[currentSlide].content}
                </p>
              )}

              {/* Hero tags removed for minimalist look */}
            </div>

            <div className="relative aspect-square lg:aspect-video rounded-[3rem] bg-white/5 border border-white/10 overflow-hidden group p-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {renderSlideContent(slides[currentSlide])}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      </main>

      <footer className="p-8 lg:p-12 flex items-center justify-between border-t border-white/5">
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={nextSlide}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/10"
        >
          {t('explore_platform')}
        </button>
      </footer>
    </div>
  );
};

export default function Presentation() {
  const [showVideo, setShowVideo] = useState(true);
  const [showPitch, setShowPitch] = useState(false);

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence>
        {showVideo && (
          <MarketingVideo onComplete={() => {
            setShowVideo(false);
            setShowPitch(true);
          }} />
        )}
      </AnimatePresence>

      {showPitch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <PitchDeck />
        </motion.div>
      )}
    </div>
  );
}
