import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import { Activity, Lock, User, ArrowRight, Sparkles, Shield, Zap, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [showScanner]);

  const onScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/qr-login', { qrLoginToken: decodedText });
      if (res.data.token) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.token) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login is currently disabled. Please use Email/Password.');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#050505] text-[#111111] dark:text-white flex flex-col lg:flex-row overflow-hidden relative transition-colors duration-300">
      {/* Noise Overlay */}
      <div className="fixed inset-0 noise z-50 pointer-events-none opacity-10 dark:opacity-20" />

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-24 flex flex-col justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3 group mb-20 interactive">
          <div className="w-12 h-12 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black group-hover:rotate-12 transition-transform duration-500 shadow-2xl shadow-black/10 dark:shadow-white/10">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter uppercase">{t('app_name')}</span>
        </Link>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] mb-8">
              <Lock className="w-3 h-3 text-[#0033A0] dark:text-blue-500" />
              {t('secure_authentication')}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-display font-black uppercase tracking-tighter mb-4 leading-none break-words">
              {t('system_access').includes(' ') ? t('system_access').split(' ')[0] : t('system_access')} <br />
              <span className="text-[#0033A0] dark:text-blue-500">
                {t('system_access').includes(' ') ? t('system_access').split(' ')[1] : ''}
              </span>
            </h1>
            <p className="text-black/50 dark:text-gray-500 font-bold text-sm uppercase tracking-widest mb-12">{t('authorized_personnel_only')}</p>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-3"
              >
                <Shield className="w-5 h-5" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/60 dark:text-gray-600 uppercase tracking-[0.3em] ml-4">{t('email')}</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-gray-600 group-focus-within:text-[#0033A0] dark:group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-[#0033A0]/20 dark:focus:ring-blue-500/20 focus:bg-[#F4F4F0] dark:focus:bg-white/10 transition-all outline-none placeholder:text-black/30 dark:placeholder:text-gray-800"
                    placeholder="EMAIL@EXAMPLE.COM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/60 dark:text-gray-600 uppercase tracking-[0.3em] ml-4">{t('access_code')}</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-gray-600 group-focus-within:text-[#0033A0] dark:group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-[#0033A0]/20 dark:focus:ring-blue-500/20 focus:bg-[#F4F4F0] dark:focus:bg-white/10 transition-all outline-none placeholder:text-black/30 dark:placeholder:text-gray-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] dark:bg-white text-white dark:text-black py-6 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-[#0033A0] dark:hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-black/5 dark:shadow-white/5 flex items-center justify-center gap-4 group interactive"
              >
                {isLoading ? t('authenticating') : t('initialize_session')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-black/40 dark:text-gray-600 uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white py-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 interactive"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="bg-[#0033A0]/5 dark:bg-blue-600/10 text-[#0033A0] dark:text-blue-500 py-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest hover:bg-[#0033A0] dark:hover:bg-blue-600 hover:text-white transition-all border border-[#0033A0]/20 dark:border-blue-500/20 flex items-center justify-center gap-3 interactive"
                >
                  <QrCode className="w-5 h-5" />
                  QR SCAN
                </button>
              </div>
            </form>

            <p className="mt-12 text-center lg:text-left text-[10px] font-bold text-black/60 dark:text-gray-600 uppercase tracking-[0.2em]">
              {t('new_operator')} <Link to="/register" className="text-[#0033A0] dark:text-blue-500 hover:underline underline-offset-4 interactive">{t('request_credentials')}</Link>
            </p>
          </motion.div>
        </div>

        <div className="mt-20 text-[8px] font-bold text-black/40 dark:text-gray-800 uppercase tracking-[0.5em]">
          {t('all_rights_reserved')}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 relative">
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">{t('scan_qr_id')}</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t('position_qr_desc')}</p>
              </div>

              <div id="reader" className="overflow-hidden rounded-2xl border border-white/5 bg-white/2"></div>
              
              <div className="mt-8 flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest leading-relaxed">
                  {t('encrypted_handshake_desc')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side - Immersive Visual */}
      <div className="hidden lg:flex w-1/2 bg-white dark:bg-white/2 border-l border-black/10 dark:border-white/5 relative items-center justify-center p-24 overflow-hidden transition-colors duration-300">
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-48 h-48 bg-[#0033A0] dark:bg-blue-600 rounded-[3rem] flex items-center justify-center mx-auto mb-16 shadow-[0_0_100px_rgba(0,51,160,0.2)] dark:shadow-[0_0_100px_rgba(59,130,246,0.3)] rotate-12">
              <Zap className="w-24 h-24 text-white" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-display font-black uppercase tracking-tighter mb-8 leading-none">
            {t('precision_diagnostics').includes(' ') ? t('precision_diagnostics').split(' ')[0] : t('precision_diagnostics')} <br />
            <span className="text-transparent stroke-text">
              {t('precision_diagnostics').includes(' ') ? t('precision_diagnostics').split(' ')[1] : ''}
            </span>
          </h2>
          <p className="text-black/50 dark:text-gray-500 text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
            "{t('infrastructure_desc')}"
          </p>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#0033A0] dark:text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#111111] dark:text-white">{t('system_status')}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#0033A0] dark:text-green-500">{t('all_cores_optimal')}</p>
            </div>
          </div>
        </div>

        {/* Background Atmospheric Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-[#0033A0]/5 dark:bg-blue-600/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-mesh opacity-10 dark:opacity-30" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
        #reader {
          width: 100% !important;
          border: none !important;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__dashboard {
          padding: 20px !important;
          background: transparent !important;
        }
        #reader__dashboard_section_csr button {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          padding: 10px 20px !important;
          border-radius: 12px !important;
          font-size: 10px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }
      `}} />
    </div>
  );
}
