import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Activity, CheckCircle2, AlertCircle, Loader2, ShieldAlert, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHealthInsights } from '../services/aiService';
import { useTranslation } from 'react-i18next';

interface HealthInsightsProps {
  patientData: any;
}

export default function HealthInsights({ patientData }: HealthInsightsProps) {
  const { t, i18n } = useTranslation();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHealthInsights(patientData, i18n.language);
      setInsights(data);
    } catch (err) {
      setError(t('failed_generate_insights'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientData && !insights && !loading) {
      generateInsights();
    }
  }, [patientData]);

  const categoryIcons: any = {
    Vital: <Activity className="w-5 h-5 text-blue-400" />,
    Trend: <Sparkles className="w-5 h-5 text-purple-400" />,
    Alert: <AlertCircle className="w-5 h-5 text-amber-400" />,
    Positive: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
  };

  return (
    <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Brain className="w-32 h-32 text-blue-500" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-500" />
              {t('ai_health_neural_sync')}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{t('personalized_clinical_insights')}</p>
          </div>
          <button 
            onClick={generateInsights}
            disabled={loading}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <Brain className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] animate-pulse">{t('analyzing_bio_data')}</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">{error}</p>
            <button 
              onClick={generateInsights}
              className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white border border-white/10"
            >
              {t('retry_sync')}
            </button>
          </div>
        ) : insights ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.insights.map((insight: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/2 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                      {categoryIcons[insight.category] || <Activity className="w-5 h-5 text-gray-400" />}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">{insight.category}</span>
                  </div>
                  <h4 className="font-display font-bold text-white mb-2">{insight.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{insight.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-8">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t('actionable_recommendations')}
              </h3>
              <div className="space-y-4">
                {insights.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white/2 rounded-2xl border border-white/5">
                    <div className={`mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      rec.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {rec.priority}
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-sm">{rec.title}</h5>
                      <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/2 rounded-2xl border border-white/5">
              <ShieldAlert className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-[10px] text-gray-600 font-medium italic leading-relaxed">
                {insights.disclaimer}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <button 
              onClick={generateInsights}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              {t('initialize_health_sync')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
