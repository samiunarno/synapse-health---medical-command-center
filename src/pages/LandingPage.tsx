import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Activity, Shield, Database, Globe, 
  Brain, ArrowRight, Fingerprint, Network,
  Terminal, Cpu, Lock, CheckSquare, QrCode, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import CookieConsent from '../components/CookieConsent';
import GlobalNavbar from '../components/GlobalNavbar';
import EcommerceSlider from '../components/EcommerceSlider';
import QRCodePaymentModal from '../components/QRCodePaymentModal';
import { CreditCard } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#0a0a0a] text-[#111111] dark:text-[#F4F4F0] font-sans selection:bg-[#0033A0] dark:selection:bg-[#3b82f6] selection:text-white overflow-x-hidden transition-colors duration-300">
      <CookieConsent />
      <GlobalNavbar />

      {/* Architectural Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Main Container - Strict Grid System */}
      <div className="relative z-10 max-w-[1600px] mx-auto border-x border-black/10 dark:border-white/10 min-h-screen flex flex-col">
        
        {/* Hero Section */}
        <section className="pt-32 lg:pt-48 pb-20 px-6 lg:px-12 border-b border-black/10 dark:border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
              className="lg:col-span-8"
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="w-2 h-2 bg-[#0033A0] dark:bg-[#3b82f6] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-black/60 dark:text-white/60">{t('system_operational')}</span>
              </div>
              <h1 className="text-6xl sm:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[0.85] mb-8">
                {t('hero_title_clinical')}<br/>
                {t('hero_title_precision')}
              </h1>
              <p className="text-xl md:text-2xl max-w-2xl text-black/70 dark:text-white/70 leading-snug font-light tracking-tight">
                {t('hero_subtitle_landing')}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-4 flex flex-col gap-4"
            >
              <Link 
                to={user ? "/dashboard" : "/register"}
                className="w-full py-6 px-8 bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] hover:bg-[#0033A0] dark:hover:bg-[#3b82f6] dark:hover:text-white transition-colors flex items-center justify-between group interactive"
              >
                <span className="font-mono text-sm uppercase tracking-widest">{user ? t('go_to_dashboard') : t('initialize_platform')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              {!user && (
                <Link 
                  to="/login"
                  className="w-full py-6 px-8 bg-transparent border border-black/10 dark:border-white/10 text-[#111111] dark:text-[#F4F4F0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between interactive"
                >
                  <span className="font-mono text-sm uppercase tracking-widest">{t('authenticate')}</span>
                  <Terminal className="w-5 h-5" />
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* Technical Specifications - Strict Table Layout */}
        <section className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 dark:divide-white/10">
            {[
              { icon: Brain, title: t('neural_diagnostics'), desc: t('neural_diagnostics_desc') },
              { icon: Lock, title: t('zero_trust_architecture'), desc: t('zero_trust_desc_landing') },
              { icon: Activity, title: t('live_telemetry'), desc: t('live_telemetry_desc') }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="p-12 hover:bg-[#F4F4F0] dark:hover:bg-[#1a1a1a] transition-colors group interactive"
              >
                <feature.icon className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-12" strokeWidth={1.5} />
                <h3 className="text-2xl font-medium tracking-tight mb-4">{feature.title}</h3>
                <p className="text-black/60 dark:text-white/60 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Deep Dive Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-black/10 dark:divide-white/10 border-b border-black/10 dark:border-white/10">
          <div className="p-12 lg:p-24 flex flex-col justify-center">
            <h2 className="text-5xl lg:text-7xl font-medium tracking-tighter leading-[0.9] mb-8" dangerouslySetInnerHTML={{__html: t('global_infrastructure')}}>
            </h2>
            <p className="text-xl text-black/60 dark:text-white/60 leading-relaxed font-light mb-12 max-w-md">
              {t('global_infrastructure_desc')}
            </p>
            <ul className="space-y-6 font-mono text-sm tracking-widest uppercase text-black/80 dark:text-white/80">
              <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><Network className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('active_nodes_count')}</li>
              <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><Globe className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('countries_120')}</li>
              <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><Database className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('data_processed')}</li>
            </ul>
          </div>
          <div className="bg-[#111111] dark:bg-[#050505] text-white p-12 lg:p-24 relative overflow-hidden flex flex-col justify-between">
             <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem]" />
             <div className="relative z-10">
               <Cpu className="w-12 h-12 text-[#0033A0] dark:text-[#3b82f6] mb-12" strokeWidth={1} />
               <h3 className="text-4xl font-medium tracking-tight mb-6">{t('engineered_for_scale')}</h3>
               <p className="text-white/60 text-lg font-light leading-relaxed max-w-md">
                 {t('engineered_for_scale_desc')}
               </p>
             </div>
             <div className="relative z-10 mt-24">
               <div className="text-8xl font-medium tracking-tighter text-[#0033A0] dark:text-[#3b82f6]">99.99%</div>
               <div className="font-mono text-sm uppercase tracking-widest text-white/40 mt-4">{t('uptime_sla')}</div>
             </div>
          </div>
        </section>

        {/* Core Modules - Bento Grid */}
        <section className="py-24 px-6 lg:px-12 border-b border-black/10 dark:border-white/10 bg-[#F4F4F0] dark:bg-[#0a0a0a] transition-colors duration-300">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4">{t('integrated_ecosystem')}</h2>
            <p className="text-xl text-black/60 dark:text-white/60 font-light max-w-2xl">{t('integrated_ecosystem_desc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#111111] p-12 border border-black/10 dark:border-white/10 hover:border-[#0033A0] dark:hover:border-[#3b82f6] transition-colors group">
              <Activity className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-8" />
              <h3 className="text-3xl font-medium tracking-tight mb-4">{t('telehealth_monitoring')}</h3>
              <p className="text-black/60 dark:text-white/60 font-light leading-relaxed max-w-md">{t('telehealth_monitoring_desc')}</p>
            </div>
            <div className="bg-[#111111] dark:bg-[#050505] text-white p-12 border border-black/10 dark:border-white/10 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0033A0]/20 dark:bg-[#3b82f6]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Brain className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-8 relative z-10" />
              <h3 className="text-2xl font-medium tracking-tight mb-4 relative z-10">{t('ai_diagnostics_landing')}</h3>
              <p className="text-white/60 font-light leading-relaxed relative z-10">{t('ai_diagnostics_desc')}</p>
            </div>
            <div className="bg-white dark:bg-[#111111] p-12 border border-black/10 dark:border-white/10 hover:border-[#0033A0] dark:hover:border-[#3b82f6] transition-colors group">
              <Database className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-8" />
              <h3 className="text-2xl font-medium tracking-tight mb-4">{t('smart_pharmacy')}</h3>
              <p className="text-black/60 dark:text-white/60 font-light leading-relaxed">{t('smart_pharmacy_desc')}</p>
            </div>
            <div className="bg-white dark:bg-[#111111] p-12 border border-black/10 dark:border-white/10 hover:border-[#0033A0] dark:hover:border-[#3b82f6] transition-colors group">
              <Shield className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-8" />
              <h3 className="text-2xl font-medium tracking-tight mb-4">{t('emergency_response')}</h3>
              <p className="text-black/60 dark:text-white/60 font-light leading-relaxed">{t('emergency_response_desc')}</p>
            </div>
            <div className="bg-white dark:bg-[#111111] p-12 border border-black/10 dark:border-white/10 hover:border-[#0033A0] dark:hover:border-[#3b82f6] transition-colors group">
              <Fingerprint className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-8" />
              <h3 className="text-2xl font-medium tracking-tight mb-4">{t('digital_health_id_landing')}</h3>
              <p className="text-black/60 dark:text-white/60 font-light leading-relaxed">{t('digital_health_id_desc')}</p>
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="py-24 px-6 lg:px-12 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0033A0]/10 dark:bg-[#3b82f6]/10 text-[#0033A0] dark:text-[#3b82f6] rounded-full font-mono text-xs uppercase tracking-widest mb-8">
                <Lock className="w-4 h-4" /> {t('military_grade_security')}
              </div>
              <h2 className="text-5xl lg:text-6xl font-medium tracking-tighter leading-[0.9] mb-8">
                {t('compliance_without_compromise')}
              </h2>
              <p className="text-xl text-black/60 dark:text-white/60 font-light leading-relaxed mb-8">
                {t('compliance_desc')}
              </p>
              <ul className="space-y-4 font-mono text-sm tracking-widest uppercase text-black/80 dark:text-white/80">
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-[#0033A0] dark:bg-[#3b82f6]" /> {t('hipaa_gdpr')}</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-[#0033A0] dark:bg-[#3b82f6]" /> {t('aes_256')}</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-[#0033A0] dark:bg-[#3b82f6]" /> {t('immutable_audit_logs')}</li>
                <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-[#0033A0] dark:bg-[#3b82f6]" /> {t('rbac')}</li>
              </ul>
            </div>
            <div className="relative h-[400px] bg-[#F4F4F0] dark:bg-[#050505] border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#0033A0_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,#3b82f6_1px,transparent_1px)] bg-[size:24px_24px]" />
              <Shield className="w-48 h-48 text-[#0033A0] dark:text-[#3b82f6] opacity-80" strokeWidth={0.5} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F4F4F0] dark:from-[#050505] via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="py-24 px-6 lg:px-12 border-b border-black/10 dark:border-white/10 bg-[#111111] dark:bg-[#050505] text-white transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="text-6xl font-medium tracking-tighter text-[#0033A0] dark:text-[#3b82f6] mb-4">45%</div>
              <h3 className="text-xl font-medium mb-2">{t('reduced_wait_times')}</h3>
              <p className="text-white/60 font-light">{t('reduced_wait_times_desc')}</p>
            </div>
            <div>
              <div className="text-6xl font-medium tracking-tighter text-[#0033A0] dark:text-[#3b82f6] mb-4">99.9%</div>
              <h3 className="text-xl font-medium mb-2">{t('diagnostic_accuracy')}</h3>
              <p className="text-white/60 font-light">{t('diagnostic_accuracy_desc')}</p>
            </div>
            <div>
              <div className="text-6xl font-medium tracking-tighter text-[#0033A0] dark:text-[#3b82f6] mb-4">2.5x</div>
              <h3 className="text-xl font-medium mb-2">{t('faster_emergency')}</h3>
              <p className="text-white/60 font-light">{t('faster_emergency_desc')}</p>
            </div>
            <div>
              <div className="text-6xl font-medium tracking-tighter text-[#0033A0] dark:text-[#3b82f6] mb-4">{t('zero_count')}</div>
              <h3 className="text-xl font-medium mb-2">{t('zero_data_breaches')}</h3>
              <p className="text-white/60 font-light">{t('zero_data_breaches_desc')}</p>
            </div>
          </div>
        </section>

        {/* Partners / Slider */}
        <section className="py-24 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] overflow-hidden transition-colors duration-300">
          <div className="px-12 mb-12 flex justify-between items-end">
            <h2 className="text-2xl font-medium tracking-tight">{t('trusted_by_leaders')}</h2>
            <span className="font-mono text-xs uppercase tracking-widest text-black/40 dark:text-white/40">{t('network_partners')}</span>
          </div>
          <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 dark:opacity-40 dark:hover:opacity-100 transition-all duration-500">
            <EcommerceSlider />
          </div>
        </section>

        {/* For Providers */}
        <section className="py-24 px-6 lg:px-12 border-b border-black/10 dark:border-white/10 bg-[#F4F4F0] dark:bg-[#0a0a0a] transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-[500px] bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem]" />
              <div className="relative z-10 grid grid-cols-2 gap-4 p-8 w-full h-full">
                <div className="bg-[#F4F4F0] dark:bg-[#050505] border border-black/10 dark:border-white/10 p-6 flex flex-col justify-between">
                  <Activity className="w-6 h-6 text-[#0033A0] dark:text-[#3b82f6]" />
                  <div>
                    <div className="text-2xl font-medium">124 bpm</div>
                    <div className="text-xs text-black/60 dark:text-white/60 uppercase tracking-widest">{t('heart_rate_landing')}</div>
                  </div>
                </div>
                <div className="bg-[#F4F4F0] dark:bg-[#050505] border border-black/10 dark:border-white/10 p-6 flex flex-col justify-between">
                  <Database className="w-6 h-6 text-[#0033A0] dark:text-[#3b82f6]" />
                  <div>
                    <div className="text-2xl font-medium">Normal</div>
                    <div className="text-xs text-black/60 dark:text-white/60 uppercase tracking-widest">{t('blood_panel')}</div>
                  </div>
                </div>
                <div className="col-span-2 bg-[#0033A0] dark:bg-[#3b82f6] text-white p-6 flex flex-col justify-between">
                  <Brain className="w-6 h-6" />
                  <div>
                    <div className="text-lg font-medium mb-2">{t('ai_diagnosis_suggestion_landing')}</div>
                    <div className="text-sm text-white/80">{t('ai_diagnosis_suggestion_desc')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl lg:text-6xl font-medium tracking-tighter leading-[0.9] mb-8" dangerouslySetInnerHTML={{__html: t('empowering_providers')}}>
              </h2>
              <p className="text-xl text-black/60 dark:text-white/60 font-light leading-relaxed mb-8">
                {t('empowering_providers_desc')}
              </p>
              <ul className="space-y-6 font-mono text-sm tracking-widest uppercase text-black/80 dark:text-white/80">
                <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><CheckSquare className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('automated_charting')}</li>
                <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><CheckSquare className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('predictive_alerts')}</li>
                <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><CheckSquare className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('seamless_referrals')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Membership Section */}
        <section className="py-24 px-6 lg:px-12 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-medium tracking-tighter leading-[0.9] mb-8">
                {t('membership_title')}
              </h2>
              <p className="text-xl text-black/60 dark:text-white/60 font-light leading-relaxed mb-8">
                {t('membership_desc')}
              </p>
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="py-4 px-8 bg-[#0033A0] dark:bg-[#3b82f6] text-white hover:bg-[#002277] dark:hover:bg-[#2563eb] transition-colors flex items-center gap-4 group interactive"
              >
                <span className="font-mono text-sm uppercase tracking-widest">{t('qr_pay')}</span>
                <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="bg-[#F4F4F0] dark:bg-[#050505] border border-black/10 dark:border-white/10 p-12">
              <div className="text-4xl font-medium tracking-tighter mb-4">$99<span className="text-lg text-black/40 dark:text-white/40">/{t('month')}</span></div>
              <ul className="space-y-4 font-mono text-sm tracking-widest uppercase text-black/80 dark:text-white/80">
                <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><CheckSquare className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('ai_diagnostics_landing')}</li>
                <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><CheckSquare className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('telehealth_monitoring')}</li>
                <li className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4"><CheckSquare className="w-4 h-4 text-[#0033A0] dark:text-[#3b82f6]" /> {t('smart_pharmacy')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Help Center Section */}
        <section className="py-24 px-6 lg:px-12 border-b border-black/10 dark:border-white/10 bg-[#F4F4F0] dark:bg-[#0a0a0a] transition-colors duration-300">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 text-[#0033A0] dark:text-[#3b82f6] mx-auto mb-8" />
            <h2 className="text-5xl lg:text-6xl font-medium tracking-tighter leading-[0.9] mb-8">
              {t('help_center_title')}
            </h2>
            <p className="text-xl text-black/60 dark:text-white/60 font-light leading-relaxed mb-12">
              {t('help_center_desc')}
            </p>
            <Link 
              to="/help-center"
              className="inline-flex items-center gap-4 py-4 px-8 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#111111] transition-colors group interactive"
            >
              <span className="font-mono text-sm uppercase tracking-widest">{t('contact_support')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Brutalist CTA */}
        <section className="bg-[#0033A0] dark:bg-[#002277] text-white transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            <div className="p-12 lg:p-24 flex flex-col justify-center">
              <h2 className="text-6xl lg:text-8xl font-medium tracking-tighter leading-[0.9] mb-8" dangerouslySetInnerHTML={{__html: t('deploy_synapse')}}>
              </h2>
              <p className="text-xl text-white/80 font-light max-w-md">
                {t('deploy_synapse_desc')}
              </p>
            </div>
            <div className="flex flex-col">
              <Link 
                to="/register"
                className="flex-1 p-12 lg:p-24 flex items-center justify-between hover:bg-white dark:hover:bg-[#3b82f6] hover:text-[#0033A0] dark:hover:text-white transition-colors group interactive"
              >
                <span className="text-3xl lg:text-5xl font-medium tracking-tight">{t('request_access_cta')}</span>
                <ArrowRight className="w-12 h-12 group-hover:translate-x-4 transition-transform" />
              </Link>
              <Link 
                to="/login"
                className="flex-1 p-12 lg:p-24 flex items-center justify-between border-t border-white/20 hover:bg-[#002277] dark:hover:bg-[#001144] transition-colors group interactive"
              >
                <span className="text-3xl lg:text-5xl font-medium tracking-tight text-white/60 group-hover:text-white">{t('client_login')}</span>
                <Terminal className="w-12 h-12 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#111111] dark:bg-[#050505] text-white border-t border-white/10 transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
              {/* Brand Column */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#0033A0] dark:bg-[#3b82f6] rounded-sm" />
                  <span className="font-mono text-xl uppercase tracking-widest">{t('app_name') || 'Synapse'}</span>
                </div>
                <p className="text-white/60 font-light text-sm max-w-xs leading-relaxed">
                  {t('hero_subtitle_landing')}
                </p>
              </div>

              {/* Solutions Column */}
              <div className="flex flex-col gap-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">{t('footer_solutions')}</h4>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_telehealth')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('ai_diagnostics_landing')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_pharmacy_landing')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_emergency')}</Link>
              </div>

              {/* Company Column */}
              <div className="flex flex-col gap-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">{t('footer_company')}</h4>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_about')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_careers')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('network_partners')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_contact')}</Link>
              </div>

              {/* Legal Column */}
              <div className="flex flex-col gap-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">{t('footer_legal')}</h4>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_privacy')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('footer_terms')}</Link>
                <Link to="#" className="text-white/80 hover:text-white hover:translate-x-1 transition-all text-sm">{t('hipaa_gdpr')}</Link>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="font-mono text-xs uppercase tracking-widest text-white/40">
                © {new Date().getFullYear()} {t('app_name') || 'Synapse'}. {t('all_systems_operational_footer')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/60">{t('status_optimal')}</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
      <QRCodePaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}

