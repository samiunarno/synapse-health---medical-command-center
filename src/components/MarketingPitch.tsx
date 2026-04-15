import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Brain, 
  Shield, 
  Zap, 
  Activity, 
  Globe, 
  ArrowRight, 
  Play, 
  ChevronRight, 
  ChevronLeft,
  Target,
  TrendingUp,
  Rocket,
  Users,
  Lock,
  Cpu,
  Database,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Progress Bar */}
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
  const { t } = useTranslation();
  
  const slides = [
    {
      id: "vision",
      title: t("vision_title"),
      subtitle: t("vision_subtitle"),
      content: t("vision_content"),
      points: [
        t("vision_point1"),
        t("vision_point2"),
        t("vision_point3")
      ],
      icon: Rocket,
      color: "blue"
    },
    {
      id: "problem",
      title: t("problem_title"),
      subtitle: t("problem_subtitle"),
      content: t("problem_content"),
      points: [
        t("problem_point1"),
        t("problem_point2"),
        t("problem_point3")
      ],
      icon: Target,
      color: "red"
    },
    {
      id: "solution",
      title: t("solution_title"),
      subtitle: t("solution_subtitle"),
      content: t("solution_content"),
      points: [
        t("solution_point1"),
        t("solution_point2"),
        t("solution_point3")
      ],
      icon: Zap,
      color: "yellow"
    },
    {
      id: "business",
      title: t("business_title"),
      subtitle: t("business_subtitle"),
      content: t("business_content"),
      points: [
        t("business_point1"),
        t("business_point2"),
        t("business_point3")
      ],
      icon: TrendingUp,
      color: "green"
    },
    {
      id: "future",
      title: t("future_scope_title"),
      subtitle: t("future_scope_subtitle"),
      content: t("future_scope_content"),
      points: [
        t("future_scope_point1"),
        t("future_scope_point2"),
        t("future_scope_point3")
      ],
      icon: Globe,
      color: "purple"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <header className="p-8 lg:p-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            <Brain className="w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold tracking-tighter uppercase">{t('synapse_pitch')}</span>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span>{t('slide')} {currentSlide + 1} / {slides.length}</span>
          <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Slide Content */}
      <main className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
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
              <h2 className="text-5xl lg:text-8xl font-display font-black uppercase tracking-tighter mb-4 leading-none">
                {slides[currentSlide].title}
              </h2>
              <p className="text-xl lg:text-2xl text-blue-500 font-bold uppercase tracking-widest mb-8">
                {slides[currentSlide].subtitle}
              </p>
              <p className="text-lg lg:text-xl text-gray-400 leading-relaxed mb-12">
                {slides[currentSlide].content}
              </p>
              
              <div className="space-y-4">
                {slides[currentSlide].points.map((point, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    {point}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-video rounded-[3rem] bg-white/5 border border-white/10 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center"
                >
                  <div className="w-48 h-48 border-2 border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-white/40 rounded-full flex items-center justify-center">
                      {React.createElement(slides[currentSlide].icon, { className: "w-12 h-12 text-white animate-pulse" })}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Abstract Data Visualization */}
              <div className="absolute bottom-8 left-8 right-8 h-32 flex items-end gap-2">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [20, Math.random() * 100 + 20, 20] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    className="flex-1 bg-white/10 rounded-t-lg"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Background Mesh */}
        <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      </main>

      {/* Navigation Controls */}
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
        
        <Link 
          to="/"
          className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-white/10"
        >
          {t('explore_platform')}
        </Link>
      </footer>
    </div>
  );
};

export default function MarketingPitch() {
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
