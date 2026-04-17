import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Globe, 
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Stethoscope,
  Pill,
  Activity,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SynapseLogo from './SynapseLogo';

export default function GlobalNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const marketplaceOptions = [
    { label: t('medical_equipment'), icon: Stethoscope, path: '/ecommerce?category=Equipment' },
    { label: t('pharmacy_hub'), icon: Pill, path: '/ecommerce?category=Medicine' },
    { label: t('diagnostic_tools'), icon: Activity, path: '/ecommerce?category=Diagnostics' }
  ];

  const isLandingPage = location.pathname === '/';

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      isScrolled || !isLandingPage 
        ? 'bg-white dark:bg-[#0a0a0a] border-b border-black/5 dark:border-white/5 py-4' 
        : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="z-[110] interactive">
          <SynapseLogo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
          <Link to="/" className={`hover:text-blue-500 transition-colors interactive ${location.pathname === '/' ? 'text-blue-500' : ''}`}>{t('home')}</Link>
          <Link to="/presentation" className={`hover:text-blue-500 transition-colors interactive ${location.pathname === '/presentation' ? 'text-blue-500' : ''}`}>{t('pitch_deck')}</Link>
          <Link to="/ecommerce" className={`hover:text-blue-500 transition-colors interactive ${location.pathname === '/ecommerce' ? 'text-blue-500' : ''}`}>{t('marketplace')}</Link>

          {user ? (
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-500 transition-colors interactive">
              <LayoutDashboard className="w-4 h-4" />
              {t('dashboard')}
            </Link>
          ) : (
            <Link to="/login" className="hover:text-blue-500 transition-colors interactive">{t('portal_login')}</Link>
          )}
        </div>

        <div className="flex items-center gap-4 relative z-[110]">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 transition-all text-gray-600 dark:text-gray-400 interactive"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <div className="relative group/lang hidden sm:block">
            <button className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 transition-all text-gray-600 dark:text-gray-400 interactive">
              <Globe className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-black/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all shadow-xl">
              {[
                { code: 'en', label: 'English' },
                { code: 'zh', label: '中文' }
              ].map((lang) => (
                <button 
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors interactive ${i18n.language === lang.code ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <button 
              onClick={logout}
              className="hidden sm:flex w-10 h-10 items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full border border-red-500/20 transition-all interactive"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 interactive"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white dark:bg-black/95 backdrop-blur-2xl z-[105] flex flex-col items-center justify-center p-8 lg:hidden"
          >
            <div className="flex flex-col items-center gap-8 text-center">
              {user ? (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-display font-bold uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-colors">{t('dashboard')}</Link>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-display font-bold uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-colors">{t('portal_login')}</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
