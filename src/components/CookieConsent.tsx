import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto bg-gray-900/95 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl pointer-events-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
              <Cookie className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">{t('privacy_title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('privacy_desc')} 
                <Link to="/privacy" className="text-blue-400 hover:underline ml-1">{t('cookie_policy')}</Link>.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
              >
                {t('decline')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
              >
                {t('accept_all')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
