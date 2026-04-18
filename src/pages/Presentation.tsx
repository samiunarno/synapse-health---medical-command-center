import { useTranslation } from 'react-i18next';
// import { translateDynamic } from '../lib/i18n-utils'; // 假设的本地工具

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 根据现代标准更新为 framer-motion，如果严格使用 'motion/react' 请调整
import { useNavigate } from 'react-router-dom';
import {
  Activity, Brain, Globe, ChevronRight, ChevronLeft, Target,
  Users, X, Database, Network, Stethoscope, Truck,
  Smartphone, Server, Cloud, Code, QrCode, HeartPulse,
  FileText, MessageSquare, ShieldAlert, Pill, Map, Calendar,
  Video, Clock, Key, Hospital, ArrowRight, Play, Pause, Lock, Search
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';

// --- 3D 背景组件 ---
const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#4ade80" />
        <directionalLight position={[-10, -10, 5]} intensity={1} color="#3b82f6" />
        <Stars radius={100} depth={50} count={6000} factor={5} saturation={1} fade speed={2} />
        <Float speed={1} rotationIntensity={2} floatIntensity={3}>
          <Sphere args={[1.5, 128, 128]} position={[0, 0, -2]}>
            <MeshDistortMaterial color="#0f172a" emissive="#1e3a8a" emissiveIntensity={0.5} attach="material" distort={0.5} speed={1.5} roughness={0.1} metalness={0.9} wireframe={true} />
          </Sphere>
        </Float>
      </Canvas>
    </div>
  );
};

// --- 可复用的幻灯片布局层 ---
const SlideLayout = ({ children, step, totalSteps, script, title, isAutoPlaying, toggleAutoPlay }: { children: React.ReactNode, step: number, totalSteps: number, script: string, title?: boolean, isAutoPlaying: boolean, toggleAutoPlay: () => void }) => {
  const [showNotes, setShowNotes] = useState(false);
  
  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-center items-center p-8 lg:p-16 overflow-hidden bg-[#020617]">
      <ThreeBackground />
      {/* 网格图案覆盖层 */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none z-0" />
      
      {/* 顶部标题栏 */}
      {title && (
         <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-8 left-12 right-12 z-20 flex justify-between items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-blue-900/20">
           <div className="flex items-center gap-3">
             <Activity className="text-blue-500 w-6 h-6 animate-pulse" />
             <span className="text-white font-bold tracking-widest uppercase text-sm">SYNAPSE 计划</span>
           </div>
           <div className="flex items-center gap-6">
             <div className="text-blue-400/50 font-mono text-xs hidden md:block">总战略方案演示文稿</div>
             <button onClick={toggleAutoPlay} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isAutoPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/40'}`}>
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isAutoPlaying ? '暂停' : '自动播放'}
             </button>
           </div>
         </motion.div>
      )}

      {/* 内容区域 */}
      <div className="w-full max-w-7xl h-[85%] flex flex-col items-center justify-center relative z-10 p-4 pt-16">
        <AnimatePresence mode="wait">
           <motion.div 
             key={step}
             initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.9 }} 
             animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} 
             exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
             transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
             className="w-full h-full flex flex-col justify-center"
           >
             {children}
           </motion.div>
        </AnimatePresence>
      </div>

      {/* 演讲者备注浮层 */}
      <AnimatePresence>
        {showNotes && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl bg-black/90 backdrop-blur-2xl border border-blue-500/30 p-8 rounded-3xl z-50 text-center shadow-[0_20px_100px_rgba(37,99,235,0.3)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[40px] pointer-events-none" />
            <h4 className="flex items-center justify-center gap-2 text-sm font-bold text-blue-400 tracking-widest uppercase mb-4">
              <MessageSquare className="w-4 h-4" /> 提词器脚本
            </h4>
            <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">“{script}”</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全局控制与进度指示器 */}
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center z-40">
        <div className="text-white/40 font-mono text-xs tracking-widest font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          幻灯片_{step.toString().padStart(2, '0')} / {totalSteps.toString().padStart(2, '0')}
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => setShowNotes(!showNotes)} className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest backdrop-blur-md ${showNotes ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400' : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20'}`}>
             {showNotes ? '隐藏提词器' : '显示提词器'}
           </button>
        </div>

        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ease-out ${i === step - 1 ? 'w-10 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : i < step - 1 ? 'w-3 bg-blue-500/30' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================================================
// 演示文稿主组件
// =====================================================================================

export default function Presentation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const totalSlides = 12;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 1));
  }, []);

  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= totalSlides) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, navigate]);

  const renderSlide = () => {
    const layoutProps = {
      step: currentSlide,
      totalSteps: totalSlides,
      isAutoPlaying,
      toggleAutoPlay
    };

    switch(currentSlide) {
      case 1:
        return (
          <SlideLayout {...layoutProps} title script="Synapse 是一个完全集成、由 AI 驱动的医疗生态系统，旨在连接医疗旅程的各个环节。它无缝结合了临床工具、实时患者数据和物联网集成。">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center">
              <div className="relative mb-8">
                <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                <Globe className="w-32 h-32 text-blue-500 relative z-10" />
              </div>
              <h1 className="text-7xl font-display font-bold text-white mb-6 text-center tracking-tight">SYNAPSE</h1>
              <p className="text-2xl text-blue-400 font-medium tracking-wide uppercase">医疗健康的数字神经系统</p>
            </motion.div>
          </SlideLayout>
        );

      case 2:
        return (
          <SlideLayout {...layoutProps} script="数字健康 ID 是 Synapse 系统的基石，通过二维码扫描提供安全、统一的患者档案。患者数据受到军用级加密保护。">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-5xl font-bold text-white mb-16 text-center">1. 数字健康 ID</h2>
              <div className="flex items-center justify-center gap-12 w-full max-w-5xl">
                <div className="flex flex-col gap-6 w-1/3">
                   <div className="bg-[#0a0a0a] border border-blue-500/50 p-6 rounded-2xl flex items-center gap-4 hover:scale-105 transition-all"><QrCode className="text-blue-400 w-8 h-8"/><div><span className="text-white font-bold block">即时访问</span><span className="text-xs text-blue-400">基于二维码的全球档案</span></div></div>
                   <div className="bg-[#0a0a0a] border border-green-500/50 p-6 rounded-2xl flex items-center gap-4 hover:scale-105 transition-all"><ShieldAlert className="text-green-400 w-8 h-8"/><div><span className="text-white font-bold block">密码学安全</span><span className="text-xs text-green-400">军用级加密</span></div></div>
                </div>
                <div className="flex justify-center shrink-0">
                  <ArrowRight className="w-12 h-12 text-gray-500" />
                </div>
                <div className="w-1/3 bg-blue-900/20 border border-blue-500/30 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                   <Database className="w-16 h-16 text-white mb-4" />
                   <h3 className="text-2xl font-bold text-white">统一档案</h3>
                   <p className="text-gray-400 text-sm mt-2">病史、处方和化验结果，安全存放于同一数据保险库。</p>
                </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 3:
        return (
          <SlideLayout {...layoutProps} script="Synapse 采用 AI 驱动的分诊系统来优化患者旅程。患者描述症状，AI 评估紧急程度，并将其自动引导至合适的医疗服务提供者。">
             <div className="w-full flex flex-col items-center">
                <h2 className="text-5xl font-bold text-white mb-12">2. AI 智能分诊</h2>
                <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex items-stretch gap-8">
                   <div className="flex-1 space-y-4">
                     <span className="text-gray-500 font-bold text-xs uppercase tracking-widest block">症状检查器输入</span>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-gray-300 font-mono text-sm leading-relaxed">
                        “我过去 48 小时一直有轻微发烧和持续咳嗽。呼吸有些费力。”
                     </div>
                     <ArrowRight className="text-purple-500 w-8 h-8 rotate-90 mx-auto" />
                     <div className="bg-purple-900/20 border border-purple-500/50 p-4 rounded-xl flex items-center gap-4">
                        <Brain className="text-purple-400 w-8 h-8 shrink-0" />
                        <div><span className="text-white font-bold text-sm block">Synapse AI 引擎</span><span className="text-purple-400 text-xs">紧急程度评估与导诊</span></div>
                     </div>
                   </div>
                   
                   <div className="w-1 bg-white/5 rounded-full" />
                   
                   <div className="flex-1 space-y-4 flex flex-col justify-center">
                     <span className="text-gray-500 font-bold text-xs uppercase tracking-widest block">自动导诊结果</span>
                     <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-xl mb-4">
                        <div className="flex justify-between items-center mb-2"><span className="text-white font-bold">严重程度评分</span><span className="text-yellow-400 font-black">4.5 / 10</span></div>
                        <div className="w-full bg-black rounded-full h-2 mb-4"><div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div></div>
                     </div>
                     <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-xl flex items-center gap-3">
                        <Hospital className="text-blue-400 w-6 h-6" />
                        <span className="text-blue-400 font-bold text-sm">导诊至社区诊所</span>
                     </div>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 4:
        return (
          <SlideLayout {...layoutProps} script="通过与可穿戴设备集成，Synapse 实时监测生命体征。如果心率或血氧等指标超过安全阈值，将立即向急救团队发送警报，实现主动式护理。">
             <div className="flex flex-col items-center text-center">
              <h2 className="text-5xl font-bold text-white mb-16">3. 物联网集成与监测</h2>
              <div className="flex items-center gap-8 w-full max-w-5xl justify-center">
                 <div className="bg-[#0a0a0a] border border-blue-500/30 p-8 rounded-[2rem] shadow-2xl flex-1 hover:-translate-y-4 transition-all">
                    <Smartphone className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold text-white mb-2">可穿戴设备同步</h3>
                    <p className="text-sm text-gray-400">持续追踪来自消费级设备的心率、血压和血氧饱和度。</p>
                 </div>
                 <div className="bg-[#0a0a0a] border border-red-500/30 p-8 rounded-[2rem] shadow-2xl flex-1 hover:-translate-y-4 transition-all">
                    <HeartPulse className="w-12 h-12 text-red-500 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold text-white mb-2">即时警报</h3>
                    <p className="text-sm text-gray-400">一旦超出阈值，自动向初级保健医生发送触发通知。</p>
                 </div>
                 <div className="bg-[#0a0a0a] border border-green-500/30 p-8 rounded-[2rem] shadow-2xl flex-1 hover:-translate-y-4 transition-all">
                    <Activity className="w-12 h-12 text-green-500 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold text-white mb-2">主动式医疗</h3>
                    <p className="text-sm text-gray-400">在健康危机发生之前进行主动干预。</p>
                 </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 5:
        return (
          <SlideLayout {...layoutProps} script="我们的临床决策支持系统可检查药物相互作用（包括中草药），并提供基于证据的建议，以最大限度地减少人为错误。">
            <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-5xl">
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 text-left">
                  <h2 className="text-5xl font-bold text-white mb-6">4. 临床决策支持系统 (CDSS)</h2>
                  <p className="text-xl text-gray-400 leading-relaxed mb-8">由 AI 驱动的临床决策支持系统，为医疗专业人员提供实时辅助。</p>
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4"><Stethoscope className="text-blue-400 w-6 h-6 shrink-0"/><span className="text-white font-semibold">循证治疗方案</span></div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4"><Lock className="text-red-400 w-6 h-6 shrink-0"/><span className="text-white font-semibold">相互作用检测（药物与中草药）</span></div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4"><Brain className="text-green-400 w-6 h-6 shrink-0"/><span className="text-white font-semibold">AI 诊断准确性提升</span></div>
                  </div>
                </motion.div>
                <div className="flex-1 flex justify-center relative">
                   <div className="w-80 h-80 rounded-full border border-white/10 flex items-center justify-center relative bg-[#0a0a0a]">
                      <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} className="absolute w-full h-full rounded-full border-t-2 border-b-2 border-purple-500 opacity-50" />
                      <Stethoscope className="w-32 h-32 text-purple-500 animate-pulse relative z-10" />
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 6:
        return (
          <SlideLayout {...layoutProps} script="Synapse 将复杂的化验结果转化为用户友好的健康卡片，并将处方数字化，同时检查用药错误。">
             <div className="w-full flex flex-col text-center items-center">
                <h2 className="text-5xl font-bold text-white mb-12">5. 实时解读器</h2>
                <div className="flex justify-center gap-12 w-full max-w-4xl">
                   <div className="bg-[#0a0a0a] border border-blue-500/30 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center w-80">
                      <FileText className="w-16 h-16 text-blue-500 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">化验结果解读</h3>
                      <p className="text-gray-400 text-sm">将复杂的医学影像和报告转化为可操作的用户健康卡片。</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-green-500/30 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center w-80">
                      <Search className="w-16 h-16 text-green-500 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">处方扫描</h3>
                      <p className="text-gray-400 text-sm">将手写处方数字化，并核对附近药房的库存。</p>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 7:
        return (
          <SlideLayout {...layoutProps} script="我们的平台提供原生远程医疗服务。患者可以即时预约，在视频通话过程中，医生可以直接查看患者的实时物联网生命体征和化验历史记录。">
            <div className="flex flex-col items-center w-full text-center">
                <h2 className="text-5xl font-bold text-white mb-12">6. 远程医疗与虚拟问诊</h2>
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                   <div className="bg-[#0a0a0a] border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center hover:scale-105 transition-transform">
                      <Calendar className="w-12 h-12 text-indigo-500 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">智能预约安排</h3>
                      <p className="text-gray-400 text-sm">生态内可直接查看专科医生的实时可用时间并进行预约。</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-pink-500/30 rounded-3xl p-8 flex flex-col items-center hover:scale-105 transition-transform">
                      <Video className="w-12 h-12 text-pink-500 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">数据增强视频</h3>
                      <p className="text-gray-400 text-sm">医生在问诊屏幕上可同时查看患者的实时物联网生命体征和历史化验报告。</p>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 8:
        return (
          <SlideLayout {...layoutProps} script="在危急情况下，SOS 按钮可调度救护车，分享实时 GPS 路线以避开交通拥堵，并在患者到达前让急诊室做好即时救治准备。">
            <div className="flex flex-col md:flex-row gap-12 items-center w-full max-w-5xl justify-center">
              <div className="flex-1 text-right border-r border-white/20 pr-12 pb-12">
                 <Target className="w-16 h-16 text-red-500 ml-auto mb-6 animate-pulse" />
                 <h2 className="text-4xl font-bold text-white mb-2">7. 应急响应</h2>
                 <p className="text-gray-400 text-sm mt-4">以毫秒级精度协调重症监护物流。</p>
              </div>
              <div className="flex-1 w-full space-y-6">
                 <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 bottom-0 w-2 bg-red-500" />
                   <Smartphone className="text-red-400 w-8 h-8"/>
                   <div><span className="block text-white font-bold">SOS 触发</span><span className="text-xs text-gray-400">立即通知附近救护车</span></div>
                 </div>
                 <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 bottom-0 w-2 bg-yellow-500" />
                   <Map className="text-yellow-400 w-8 h-8"/>
                   <div><span className="block text-white font-bold">实时 GPS 导航</span><span className="text-xs text-gray-400">动态调整路线以避开拥堵</span></div>
                 </div>
                 <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 bottom-0 w-2 bg-blue-500" />
                   <Hospital className="text-blue-400 w-8 h-8"/>
                   <div><span className="block text-white font-bold">医院急诊室准备</span><span className="text-xs text-gray-400">患者抵达前完成医护人员准备</span></div>
                 </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 9:
        return (
          <SlideLayout {...layoutProps} script="Synapse 实现医院 ERP 现代化。实时床位管理用颜色编码病区状态，同时根据实时患者需求动态分配工作人员。">
            <div className="flex flex-col items-center">
              <h2 className="text-5xl font-bold text-white mb-16">8. 医院 ERP 与病区管理</h2>
              <div className="relative w-full max-w-4xl flex flex-col gap-6">
                 <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center shrink-0 border border-green-500/50"><Clock className="text-green-400 w-6 h-6" /></div>
                    <div className="flex-1 ml-4">
                      <h4 className="text-white font-bold">实时床位管理</h4>
                      <p className="text-sm text-gray-400">颜色编码病区：绿色（可用），红色（已占用），黄色（维护中）。</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/50"><Users className="text-blue-400 w-6 h-6" /></div>
                    <div className="flex-1 ml-4">
                      <h4 className="text-white font-bold">动态人员分配</h4>
                      <p className="text-sm text-gray-400">根据患者流量和病房可用性，动态分配护士和管理人员。</p>
                    </div>
                 </div>
              </div>
            </div>
          </SlideLayout>
        );

      case 10:
        return (
          <SlideLayout {...layoutProps} script="通过连接电子药房网络，Synapse 将处方与本地库存匹配，并协调直接送货上门服务，提供实时追踪。">
             <div className="w-full flex flex-col items-center">
                <h2 className="text-5xl font-bold text-white mb-16">9. 电子药房与配送</h2>
                <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl p-8 shadow-2xl relative flex items-center gap-12">
                   <div className="flex-1 space-y-8">
                     <div className="flex items-center gap-4">
                        <Pill className="text-purple-500 w-8 h-8" />
                        <div><h4 className="text-white font-bold">处方匹配</h4><p className="text-xs text-gray-400">导诊至库存充足的最近药房。</p></div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Truck className="text-yellow-500 w-8 h-8" />
                        <div><h4 className="text-white font-bold">直接派送</h4><p className="text-xs text-gray-400">自动指派配送员。</p></div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Map className="text-blue-500 w-8 h-8" />
                        <div><h4 className="text-white font-bold">实时追踪</h4><p className="text-xs text-gray-400">患者可全程查看直至送达家门口。</p></div>
                     </div>
                   </div>
                   <div className="flex-1 flex justify-center">
                     <div className="relative w-48 h-48">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full" />
                        <Truck className="w-24 h-24 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                     </div>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 11:
        return (
          <SlideLayout {...layoutProps} script="Synapse 采用模块化微服务架构，利用 React、Node.js、MongoDB 和 Zhipu AI，实现毫秒级医疗遥测数据的全球扩展。">
             <div className="w-full flex flex-col text-center items-center">
                <h2 className="text-5xl font-bold text-white mb-12">10. 架构与可扩展性</h2>
                <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
                   <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:border-blue-500/50 transition-colors">
                      <Server className="w-10 h-10 text-blue-500 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">微服务</h3>
                      <p className="text-gray-400 text-xs">模块化设计，支持各服务零停机更新。</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:border-green-500/50 transition-colors">
                      <Cloud className="w-10 h-10 text-green-500 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">实时引擎</h3>
                      <p className="text-gray-400 text-xs">Node.js + MongoDB，为毫秒级医疗遥测优化。</p>
                   </div>
                   <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:border-purple-500/50 transition-colors">
                      <Code className="w-10 h-10 text-purple-500 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">Zhipu AI 集成</h3>
                      <p className="text-gray-400 text-xs">先进的本地化自然语言处理，用于复杂的诊断推理。</p>
                   </div>
                </div>
             </div>
          </SlideLayout>
        );

      case 12:
        return (
          <SlideLayout {...layoutProps} script="Synapse 基于信任构建。它采用零知识加密，并完全符合中国的《个人信息保护法》（PIPL）和《数据安全法》（DSL）。">
             <div className="flex flex-col items-center justify-center text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-64 h-64 border border-blue-500/30 rounded-full flex items-center justify-center mb-12 relative overflow-hidden bg-[#0a0a0a]">
                   <ShieldAlert className="w-32 h-32 text-blue-500 opacity-80" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-600/20 to-transparent" />
                </motion.div>
                <h2 className="text-5xl font-black text-white mb-6 tracking-tight">11. 数据安全与合规</h2>
                <div className="flex gap-8 mb-12">
                   <span className="text-xl text-blue-400 font-medium px-4 py-2 border border-blue-500/30 rounded-full bg-blue-900/20">零知识加密</span>
                   <span className="text-xl text-blue-400 font-medium px-4 py-2 border border-blue-500/30 rounded-full bg-blue-900/20">符合 PIPL 与 DSL 标准</span>
                </div>
                
                <button onClick={() => navigate('/')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold transition-all relative z-50 mt-4">
                  结束演示
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
       {/* 背景元素 */}
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
       
       {/* 导航层 */}
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