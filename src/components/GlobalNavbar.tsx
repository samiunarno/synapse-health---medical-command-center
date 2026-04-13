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
        ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 py-4' 
        : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group relative z-[110]">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black group-hover:rotate-12 transition-transform duration-500">
            <Brain className="w-4 h-4 lg:w-6 lg:h-6" />
          </div>
          <span className="text-lg lg:text-2xl font-display font-bold tracking-tighter uppercase text-gray-900 dark:text-white">{t('app_name')}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">
          <Link to="/" className={`hover:text-blue-500 transition-colors ${location.pathname === '/' ? 'text-blue-500' : ''}`}>{t('home')}</Link>
          <Link to="/ecommerce" className={`hover:text-blue-500 transition-colors ${location.pathname === '/ecommerce' ? 'text-blue-500' : ''}`}>{t('marketplace')}</Link>
          <Link to="/sourcing-solutions" className="hover:text-blue-500 transition-colors">{t('sourcing')}</Link>
          <Link to="/services-membership" className="hover:text-blue-500 transition-colors">{t('membership')}</Link>
          <Link to="/help-center" className="hover:text-blue-500 transition-colors">{t('help_center')}</Link>
          
          <div 
            className="relative group"
            onMouseEnter={() => setIsMarketplaceOpen(true)}
            onMouseLeave={() => setIsMarketplaceOpen(false)}
          >
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              {t('global_network')} <ChevronDown className={`w-3 h-3 transition-transform ${isMarketplaceOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isMarketplaceOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-4 w-64 bg-white dark:bg-black/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-blue-500">{t('marketplace_hub')}</span>
                  </div>
                  {marketplaceOptions.map((option) => (
                    <Link
                      key={option.label}
                      to={option.path}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/item"
                    >
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-transform">
                        <option.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-white">
                        {option.label}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              {t('dashboard')}
            </Link>
          ) : (
            <Link to="/login" className="hover:text-blue-500 transition-colors">{t('portal_login')}</Link>
          )}
        </div>

        <div className="flex items-center gap-4 relative z-[110]">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 transition-all text-gray-600 dark:text-gray-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <div className="relative group/lang hidden sm:block">
            <button className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 transition-all text-gray-600 dark:text-gray-400">
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
                  className={`w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i18n.language === lang.code ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <button 
              onClick={logout}
              className="hidden sm:flex w-10 h-10 items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full border border-red-500/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
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
              <Link to="/sourcing-solutions" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-display font-bold uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-colors">{t('sourcing')}</Link>
              <Link to="/services-membership" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-display font-bold uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-colors">{t('membership')}</Link>
              <Link to="/help-center" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-display font-bold uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-colors">{t('help_center')}</Link>
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('marketplace_hub')}</p>
                {marketplaceOptions.map(opt => (
                  <Link 
                    key={opt.label}
                    to={opt.path} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="block text-xl font-display font-bold uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-colors"
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>

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
