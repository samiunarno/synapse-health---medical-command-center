import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Stethoscope, 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  UserCircle, 
  Brain,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SymptomChecker() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/advanced/ai/check-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms, lang: i18n.language })
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Symptom analysis failed:', err);
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            {t('ai_symptom')} <span className="text-emerald-500">{t('checker')}</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">{t('symptom_checker_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('triage_support')}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold text-white mb-6">{t('describe_symptoms')}</h3>
              
              <form onSubmit={analyzeSymptoms} className="space-y-6">
                <div className="relative">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={t('symptom_placeholder')}
                    className="w-full h-48 bg-black/40 border border-white/10 rounded-[1.5rem] p-6 text-sm text-white placeholder:text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                    {t('ai_powered')}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!symptoms.trim() || isAnalyzing}
                  className="w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('analyzing_with_ai')}
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-5 h-5" />
                      {t('check_symptoms')}
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] -z-0" />
          </div>

          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">{t('medical_disclaimer')}</h4>
            <div className="flex gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                {t('symptom_disclaimer_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[500px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-emerald-600/20 rounded-full animate-ping absolute inset-0" />
                  <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center relative z-10">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">{t('ai_thinking')}</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  {t('symptom_analysis_desc')}
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Urgency & Specialist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-8 rounded-[2rem] border ${
                    result.urgency === 'High' ? 'bg-rose-600/10 border-rose-500/20' : 
                    result.urgency === 'Medium' ? 'bg-amber-600/10 border-amber-500/20' : 'bg-emerald-600/10 border-emerald-500/20'
                  }`}>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t('urgency_level')}</p>
                    <h4 className={`text-2xl font-display font-bold ${
                      result.urgency === 'High' ? 'text-rose-500' : 
                      result.urgency === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>{t(result.urgency.toLowerCase())}</h4>
                  </div>
                  <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2rem]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t('recommended_specialist')}</p>
                    <h4 className="text-2xl font-display font-bold text-blue-500">{result.recommendedSpecialist}</h4>
                  </div>
                </div>

                {/* Potential Causes */}
                <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-3">
                    <Info className="w-5 h-5 text-emerald-500" />
                    {t('potential_causes')}
                  </h3>
                  <div className="space-y-3">
                      {(Array.isArray(result.potentialCauses) ? result.potentialCauses : []).map((cause: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-xs text-gray-300 font-medium">{cause}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {t('immediate_advice')}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed bg-black/20 p-6 rounded-2xl border border-white/5">
                    {result.advice}
                  </p>
                </div>
              </motion.div>
            ) : error ? (
              <div className="h-full min-h-[500px] bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">{t('analysis_error')}</h3>
                <p className="text-gray-500 text-xs">{error}</p>
              </div>
            ) : (
              <div className="h-full min-h-[500px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border-dashed">
                <MessageSquare className="w-12 h-12 text-gray-700 mb-4" />
                <h3 className="text-xl font-display font-bold text-gray-700 mb-2">{t('ready_for_triage')}</h3>
                <p className="text-gray-600 text-xs">{t('describe_symptoms_placeholder')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
