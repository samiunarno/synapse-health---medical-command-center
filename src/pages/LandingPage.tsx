import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Activity,
  Shield, 
  Zap, 
  ArrowRight, 
  Database, 
  Globe, 
  ChevronRight,
  Play,
  ShieldCheck,
  Terminal,
  Cpu,
  Network,
  Lock,
  BarChart3,
  Server,
  Layers,
  CheckCircle
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import CookieConsent from '../components/CookieConsent';
import GlobalNavbar from '../components/GlobalNavbar';
import EcommerceSlider from '../components/EcommerceSlider';
import Hero3D from '../components/Hero3D';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [stats, setStats] = React.useState<any>(null);

  useEffect(() => {
    fetchStats();

    const ctx = gsap.context(() => {
      // 英雄区域动画
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
      });

      gsap.from(".hero-subtitle", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });

      gsap.from(".hero-cta", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "back.out(1.7)"
      });

      // 区块滚动显示动画
      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((elem) => {
        gsap.from(elem, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });
      });

      // 功能卡片交错动画
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics/public-stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('获取公开统计数据失败:', err);
    }
  };

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1.2,
        ease: "circOut"
      }
    }
  } as const;

  return (
    <div ref={containerRef} className="relative bg-white dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden transition-colors duration-500">
      <CookieConsent />
      <GlobalNavbar />
      
      {/* 噪点覆盖层 */}
      <div className="fixed inset-0 noise z-50 pointer-events-none opacity-20 dark:opacity-20 opacity-5" />

      {/* 英雄区域 */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <Hero3D />
        {/* 专业背景元素 */}
        <div className="absolute inset-0 grid-pattern dark:opacity-100 opacity-0 pointer-events-none" />
        <div className="absolute inset-0 grid-pattern-light dark:opacity-0 opacity-100 pointer-events-none" />
        
        {/* 动态背景光晕 */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4" />
                  企业级基础设施
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="hero-title text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.85] mb-8 uppercase">
                  智医云 <br />
                  <span className="stroke-text opacity-40">智能医疗网络</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="hero-subtitle text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                  连接医生、患者、药房和物流的统一数字化平台，提供无缝的医疗保健体验。
                </motion.p>
                
                <motion.div variants={itemVariants} className="hero-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <Link 
                    to="/register" 
                    className="w-full sm:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 group"
                  >
                    注册
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="w-full sm:w-auto px-12 py-6 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-md flex items-center justify-center gap-3"
                  >
                    <Terminal className="w-5 h-5 text-blue-500" />
                    登录
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* 浮动仪表盘预览 */}
            <motion.div 
              initial={{ opacity: 0, x: 100, rotateY: -20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="relative z-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-50" />
                
                {/* 模拟界面元素 */}
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded-full mb-2" />
                        <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg" />
                      <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 p-4">
                      <div className="h-2 w-12 bg-blue-500/40 rounded-full mb-4" />
                      <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 rounded-lg mb-2" />
                      <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                    <div className="h-32 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 p-4">
                      <div className="h-2 w-12 bg-purple-500/40 rounded-full mb-4" />
                      <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 rounded-lg mb-2" />
                      <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                  </div>

                  <div className="h-48 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded-full" />
                      <div className="h-3 w-12 bg-green-500/20 rounded-full" />
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                          className="flex-1 bg-blue-600/30 rounded-t-sm" 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 浮动标签 */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl z-20"
                >
                  AI 活跃中
                </motion.div>
              </div>

              {/* 装饰元素 */}
              <div className="absolute -z-10 -top-12 -left-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -z-10 -bottom-12 -right-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 跑马灯区域 */}
      <section className="py-8 lg:py-12 border-y border-gray-200 dark:border-white/5 overflow-hidden bg-gray-50 dark:bg-white/2">
        <div className="marquee">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex items-center gap-12 lg:gap-24 px-6 lg:px-12">
              <span className="text-[8vw] md:text-[4vw] font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white opacity-10 hover:opacity-100 transition-opacity duration-500 cursor-default">
                精准医疗
              </span>
              <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500/50" />
              <span className="text-[8vw] md:text-[4vw] font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white opacity-10 hover:opacity-100 transition-opacity duration-500 cursor-default">
                弹性扩展
              </span>
              <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500/50" />
              <span className="text-[8vw] md:text-[4vw] font-display font-black uppercase tracking-tighter text-gray-900 dark:text-white opacity-10 hover:opacity-100 transition-opacity duration-500 cursor-default">
                持续创新
              </span>
              <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500/50" />
            </div>
          ))}
        </div>
      </section>

      {/* 架构区域 */}
      <section id="architecture" className="py-24 lg:py-48 relative overflow-hidden reveal-up">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-24 items-start">
            <div className="lg:w-1/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] mb-8 text-blue-500">
                <Cpu className="w-3 h-3" />
                智医核心
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold uppercase tracking-tighter mb-8 leading-none">
                技术架构
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed uppercase tracking-wider">
                专为医疗行业构建的分布式、安全、可扩展的基础设施。
              </p>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-1 bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5">
              {[
                { icon: Network, title: "分布式网络", desc: "多区域节点部署，99.99% 可用性保障" },
                { icon: Server, title: "边缘计算", desc: "毫秒级响应，实时数据处理" },
                { icon: Lock, title: "量子安全加密", desc: "符合 HIPAA/GDPR 标准的端到端加密" },
                { icon: BarChart3, title: "神经分析引擎", desc: "AI 驱动预测分析与智能决策支持" }
              ].map((item, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#050505] hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group">
                  <item.icon className="w-8 h-8 text-blue-500 mb-8 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-display font-bold uppercase tracking-tighter mb-4 text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 解决方案 Bento 网格 */}
      <section id="solutions" className="py-24 lg:py-48 relative overflow-hidden bg-gray-50 dark:bg-white/2 border-y border-gray-200 dark:border-white/5 reveal-up">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl lg:text-8xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">
              解决方案
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
              为现代医疗打造的智能化工具
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-sm dark:shadow-none"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 mb-8 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">AI 辅助诊断</h3>
                <p className="text-gray-500 font-medium text-lg max-w-xl mb-8">
                  基于深度学习算法的辅助诊断系统，提高诊断准确率，减少误诊风险。
                </p>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/5">99.9% 准确率</div>
                  <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/5">实时分析</div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-sm dark:shadow-none"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20 mb-8 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">安全病历</h3>
                <p className="text-gray-500 font-medium mb-8">
                  区块链技术确保病历不可篡改，细粒度权限控制保护患者隐私。
                </p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px]" />
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-sm dark:shadow-none"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 mb-8 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">远程医疗</h3>
                <p className="text-gray-500 font-medium mb-8">
                  高清视频会诊，实时数据同步，打破地域限制。
                </p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-600/5 rounded-full blur-[100px]" />
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-white dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-sm dark:shadow-none"
            >
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20 mb-8 group-hover:scale-110 transition-transform">
                    <Database className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">智能库存</h3>
                  <p className="text-gray-500 font-medium text-lg mb-8">
                    药品和医疗物资的全链路追踪，预测性补货提醒，避免断供风险。
                  </p>
                </div>
                <div className="w-full md:w-64 h-48 bg-gray-100 dark:bg-white/5 rounded-[2rem] border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 p-4 w-full">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 全球网络区域 */}
      <EcommerceSlider />
      <section id="global" className="py-24 lg:py-48 px-6 relative overflow-hidden reveal-up">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="relative z-10 w-full aspect-square border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center"
              >
                <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full animate-spin-slow" />
                <Globe className="w-32 h-32 lg:w-64 lg:h-64 text-blue-500 opacity-50" />
              </motion.div>
            </div>
            
            <div className="lg:w-1/2 space-y-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">
                <Globe className="w-3 h-3" />
                智医云全球网络
              </div>
              <h2 className="text-5xl lg:text-8xl font-display font-black uppercase tracking-tighter leading-none text-gray-900 dark:text-white">
                医疗 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600">无国界</span>
              </h2>
              <p className="text-gray-500 text-lg uppercase tracking-widest leading-relaxed">
                连接全球医疗供应商、药房和医疗机构，构建跨境医疗生态系统。
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="space-y-2">
                  <p className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tighter">120+</p>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest">活跃国家/地区</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tighter">5万+</p>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest">全球供应商</p>
                </div>
              </div>
              
              <div className="pt-8">
                <Link 
                  to="/sourcing-solutions"
                  className="inline-flex items-center gap-4 bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 group"
                >
                  探索全球采购
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 行动号召区域 */}
      <section className="py-24 lg:py-48 relative overflow-hidden flex flex-col items-center justify-center text-center reveal-up">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-[10vw] font-display font-black leading-[0.85] tracking-tighter uppercase mb-12 text-gray-900 dark:text-white">
              准备好 <br />
              <span className="text-blue-500">加入未来医疗</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mb-16 font-bold uppercase tracking-[0.3em]">
              立即体验智医云带来的医疗数字化变革
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all duration-500 shadow-2xl shadow-blue-500/20"
                >
                  进入仪表盘
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-black px-12 py-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-white/10"
                  >
                    申请访问
                  </Link>
                  <Link 
                    to="/login" 
                    className="w-full sm:w-auto bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white px-12 py-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-500 backdrop-blur-xl"
                  >
                    门户登录
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-24 px-6 border-t border-gray-200 dark:border-white/5">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter uppercase text-gray-900 dark:text-white">智医云</span>
            </div>
            <p className="text-gray-500 max-w-sm text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-12">
              智医云是下一代智能医疗操作系统，连接医疗生态系统的每一个环节。
            </p>
          </div>
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">平台</h5>
            <ul className="space-y-4 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest">
              <li><a href="#architecture" className="hover:text-gray-900 dark:hover:text-white transition-colors">技术架构</a></li>
              <li><a href="#security" className="hover:text-gray-900 dark:hover:text-white transition-colors">安全保障</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">公司</h5>
            <ul className="space-y-4 text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">关于我们</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">联系我们</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-24 pt-12 border-t border-gray-200 dark:border-white/5 flex justify-between items-center text-[8px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-[0.4em]">
          <span>© 2025 智医云. 保留所有权利。</span>
          <span>所有协议运行中</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
        .marquee {
          display: flex;
          white-space: nowrap;
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}