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
  ArrowRight,
  Terminal,
  HelpCircle,
  Activity,
  Globe,
  Database,
  Lock,
  HeadphonesIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalNavbar from '../components/GlobalNavbar';

export default function HelpCenter() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const categories = [
    { title: t('getting_started'), icon: Zap, count: 12, color: "blue" },
    { title: t('ehr_management'), icon: FileText, count: 24, color: "purple" },
    { title: t('telehealth_guide'), icon: Video, count: 15, color: "emerald" },
    { title: t('billing_plans'), icon: Book, count: 8, color: "amber" }
  ];

  const faqs = [
    {
      q: t('faq_q1'),
      a: t('faq_a1')
    },
    {
      q: t('faq_q2'),
      a: t('faq_a2')
    },
    {
      q: t('faq_q3'),
      a: t('faq_a3')
    },
    {
      q: t('faq_q4'),
      a: t('faq_a4')
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#0a0a0a] text-[#111111] dark:text-[#F4F4F0] font-sans selection:bg-[#0033A0] dark:selection:bg-[#3b82f6] selection:text-white transition-colors duration-300">
      <GlobalNavbar />

      <div className="relative z-10 max-w-[1600px] mx-auto border-x border-black/10 dark:border-white/10 min-h-screen pt-32 lg:pt-48">
        
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pb-20 border-b border-black/10 dark:border-white/10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-12"
            >
              <div className="w-2 h-2 bg-[#0033A0] dark:bg-[#3b82f6] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-black/60 dark:text-white/60">{t('support_protocol_active')}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl sm:text-8xl lg:text-[9rem] font-medium tracking-tighter leading-[0.85] mb-12"
            >
              {t('help_center_hero_1')}<br/>
              <span className="text-[#0033A0] dark:text-[#3b82f6]">{t('help_center_hero_2')}</span>
            </motion.h1>

            <div className="relative max-w-2xl border-b-2 border-black dark:border-white pb-4 group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-black/20 dark:text-white/20 group-focus-within:text-[#0033A0] dark:group-focus-within:text-[#3b82f6] transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_help_placeholder')}
                className="w-full bg-transparent py-4 pl-12 pr-4 text-2xl font-light tracking-tight outline-none"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/10 dark:divide-white/10 border-b border-black/10 dark:border-white/10">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 hover:bg-white dark:hover:bg-[#111111] transition-colors group cursor-pointer"
            >
              <cat.icon className="w-8 h-8 text-[#0033A0] dark:text-[#3b82f6] mb-12" strokeWidth={1.5} />
              <h4 className="text-2xl font-medium tracking-tight mb-4">{cat.title}</h4>
              <p className="text-sm font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">{cat.count} {t('articles')}</p>
            </motion.div>
          ))}
        </section>

        {/* FAQs */}
        <section className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black/10 dark:divide-white/10 border-b border-black/10 dark:border-white/10">
          <div className="lg:col-span-4 p-12 lg:p-24">
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-8">{t('faq_title')}</h2>
            <p className="text-lg text-black/60 dark:text-white/60 font-light leading-relaxed">
              {t('faq_subtitle')}
            </p>
          </div>
          <div className="lg:col-span-8 divide-y divide-black/10 dark:divide-white/10">
            {faqs.map((faq, i) => (
              <div key={i} className="group">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-12 lg:p-16 flex items-center justify-between text-left hover:bg-white dark:hover:bg-[#111111] transition-colors"
                >
                  <span className="text-xl lg:text-2xl font-medium tracking-tight">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-all ${activeFaq === i ? 'bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-12 lg:px-16 pb-16">
                        <p className="text-lg text-black/60 dark:text-white/60 font-light leading-relaxed max-w-2xl">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Support CTA */}
        <section className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-black/10 dark:divide-white/10 border-b border-black/10 dark:border-white/10">
          <div className="p-12 lg:p-24 flex flex-col justify-center">
            <h2 className="text-5xl lg:text-7xl font-medium tracking-tighter leading-[0.9] mb-8">
              {t('still_need_help')}
            </h2>
            <p className="text-xl text-black/60 dark:text-white/60 font-light leading-relaxed">
              {t('support_desc')}
            </p>
          </div>
          <div className="flex flex-col">
            <button className="flex-1 p-12 lg:p-24 flex items-center justify-between bg-[#111111] dark:bg-[#F4F4F0] text-white dark:text-[#111111] hover:bg-[#0033A0] dark:hover:bg-[#3b82f6] dark:hover:text-white transition-colors group">
              <div className="flex items-center gap-8">
                <HeadphonesIcon className="w-12 h-12" strokeWidth={1} />
                <span className="text-3xl lg:text-5xl font-medium tracking-tight uppercase">{t('live_chat')}</span>
              </div>
              <ArrowRight className="w-12 h-12 group-hover:translate-x-4 transition-transform" />
            </button>
            <button className="flex-1 p-12 lg:p-24 flex items-center justify-between border-t border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-8">
                <Terminal className="w-12 h-12 text-black/40 dark:text-white/40" strokeWidth={1} />
                <span className="text-3xl lg:text-5xl font-medium tracking-tight uppercase text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white">{t('submit_ticket')}</span>
              </div>
              <ArrowRight className="w-12 h-12 group-hover:translate-x-4 transition-transform text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#111111] dark:bg-[#050505] text-white p-12 lg:p-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#0033A0] dark:bg-[#3b82f6] rounded-sm" />
                <span className="font-mono text-xl uppercase tracking-widest">{t('app_name')}</span>
              </div>
              <p className="text-white/40 text-sm font-light">
                {t('footer_desc_support')}
              </p>
            </div>
            {/* Quick Links */}
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4">{t('platform')}</h4>
              <Link to="/ecommerce" className="text-sm hover:text-[#3b82f6] transition-colors">{t('marketplace')}</Link>
              <Link to="/help-center" className="text-sm hover:text-[#3b82f6] transition-colors">{t('help_center')}</Link>
              <Link to="/presentation" className="text-sm hover:text-[#3b82f6] transition-colors">{t('pitch_deck')}</Link>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/20">
              © 2026 {t('app_name')}. {t('all_rights_reserved')}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{t('systems_operational_footer')}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
