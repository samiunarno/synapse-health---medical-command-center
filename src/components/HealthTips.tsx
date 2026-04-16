import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Lightbulb, Heart, Apple, Activity, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tips = [
  {
    icon: Apple,
    title: 'balanced_diet',
    desc: 'balanced_diet_desc',
    color: 'emerald'
  },
  {
    icon: Activity,
    title: 'regular_exercise',
    desc: 'regular_exercise_desc',
    color: 'blue'
  },
  {
    icon: Heart,
    title: 'mental_wellness',
    desc: 'mental_wellness_desc',
    color: 'rose'
  },
  {
    icon: Lightbulb,
    title: 'hydration_tip',
    desc: 'hydration_tip_desc',
    color: 'cyan'
  }
];

export default function HealthTips() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">{t('health_tips')}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('daily_recommendations')}</p>
          </div>
        </div>
        <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline underline-offset-4">
          {t('view_all')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-white/2 border border-white/5 rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-${tip.color}-500/10 text-${tip.color}-500 border border-${tip.color}-500/20 group-hover:scale-110 transition-transform`}>
                <tip.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{t(tip.title)}</h4>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{t(tip.desc)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 bg-${tip.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
