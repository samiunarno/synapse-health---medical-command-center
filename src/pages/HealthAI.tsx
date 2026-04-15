import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Brain, 
  Heart, 
  Utensils, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Smile, 
  Meh, 
  Frown, 
  MessageSquare,
  Zap,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { analyzeMood as analyzeMoodAI, generateNutritionPlan as generateNutritionPlanAI } from '../services/aiService';

export default function HealthAI() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'mood' | 'nutrition'>('mood');
  
  // Mood State
  const [mood, setMood] = useState<number | null>(null);
  const [journal, setJournal] = useState('');
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);

  // Nutrition State
  const [conditions, setConditions] = useState<string[]>([]);
  const [preferences, setPreferences] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);

  const analyzeMood = async () => {
    if (!journal || mood === null) return;
    setIsAnalyzingMood(true);
    try {
      const data = await analyzeMoodAI(journal, mood);
      setMoodAnalysis(data);
    } catch (err) {
      console.error('Mood analysis failed:', err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  const generateNutritionPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const data = await generateNutritionPlanAI(conditions, [preferences]);
      setNutritionPlan(data);
    } catch (err) {
      console.error('Nutrition plan generation failed:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Health <span className="text-blue-500">AI Hub</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Personalized mental health tracking and nutrition planning powered by DeepSeek AI.</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('mood')}
            className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'mood' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            Mood Tracker
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'nutrition' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            Nutrition AI
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'mood' ? (
          <motion.div
            key="mood"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Mood Input */}
            <div className="space-y-6">
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
                <h3 className="text-2xl font-display font-bold text-white mb-8">How are you feeling today?</h3>
                
                <div className="flex justify-between gap-4 mb-10">
                  {[
                    { val: 1, icon: Frown, label: 'Stressed', color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { val: 2, icon: Meh, label: 'Neutral', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { val: 3, icon: Smile, label: 'Great', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  ].map((m) => (
                    <button
                      key={m.val}
                      onClick={() => setMood(m.val)}
                      className={`flex-1 flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
                        mood === m.val 
                          ? `border-${m.color.split('-')[1]}-500 ${m.bg}` 
                          : 'border-white/5 bg-white/2 hover:bg-white/5'
                      }`}
                    >
                      <m.icon className={`w-10 h-10 ${mood === m.val ? m.color : 'text-gray-600'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${mood === m.val ? m.color : 'text-gray-600'}`}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Daily Journal (Optional)</label>
                  <textarea
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    placeholder="Write about your day, thoughts, or feelings..."
                    className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  onClick={analyzeMood}
                  disabled={mood === null || isAnalyzingMood}
                  className="w-full mt-8 bg-blue-600 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isAnalyzingMood ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Analyze Mood with AI
                </button>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-white">Mood Trends</h4>
                </div>
                <div className="h-32 flex items-end gap-2 px-2">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${
                          h > 70 ? 'bg-emerald-500/40' : h > 40 ? 'bg-blue-500/40' : 'bg-rose-500/40'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 px-2 text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Mood Analysis Result */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {isAnalyzingMood ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[400px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 mb-6 animate-pulse">
                      <Brain className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">Analyzing Sentiment</h3>
                    <p className="text-gray-500 text-xs">DeepSeek AI is processing your journal entry...</p>
                  </motion.div>
                ) : moodAnalysis ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-[2.5rem] p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                          <Smile className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Emotional Tone</p>
                          <h3 className="text-2xl font-display font-bold text-white">{moodAnalysis.tone}</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-indigo-100/70 leading-relaxed font-medium">
                          {moodAnalysis.recommendation}
                        </p>
                        {moodAnalysis.specialistNeeded && (
                          <div className="flex items-center gap-3 p-4 bg-rose-500/20 border border-rose-500/20 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            <span className="text-xs font-bold text-rose-200">Recommendation: Consult a mental health specialist.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Key Insights</h4>
                      <div className="space-y-3">
                        {moodAnalysis.insights.map((insight: string, i: number) => (
                          <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-gray-300 font-medium leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">AI Wellness Advice</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {moodAnalysis.advice.map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <p className="text-xs text-emerald-200/70 font-medium">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-6">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-700 mb-2">No Analysis Yet</h3>
                    <p className="text-gray-600 text-xs">Complete your daily check-in to see AI insights.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Nutrition Input */}
            <div className="space-y-6">
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
                <h3 className="text-2xl font-display font-bold text-white mb-8">Personalized Nutrition</h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 mb-4 block">Medical Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {['Hypertension', 'Diabetes', 'Obesity', 'Anemia', 'PCOS', 'Heart Disease'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            conditions.includes(c) 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 mb-4 block">Dietary Preferences</label>
                    <textarea
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      placeholder="e.g. Vegetarian, High protein, No seafood, Local Bangladeshi food..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={generateNutritionPlan}
                  disabled={isGeneratingPlan}
                  className="w-full mt-10 bg-emerald-600 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20"
                >
                  {isGeneratingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <Utensils className="w-5 h-5" />}
                  Generate Meal Plan
                </button>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-display font-bold text-white">Hydration Tracker</h4>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">1.2L / 2.5L</span>
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                    <button key={g} className={`flex-1 aspect-[1/2] rounded-xl border transition-all ${g <= 4 ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`} />
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Glass
                </button>
              </div>
            </div>

            {/* Nutrition Result */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {isGeneratingPlan ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[500px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-500 mb-8 relative">
                      <div className="absolute inset-0 bg-emerald-600/20 rounded-full animate-ping" />
                      <Utensils className="w-10 h-10 relative z-10" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-4">Crafting Your Plan</h3>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                      DeepSeek AI is optimizing nutrients based on your health profile.
                    </p>
                  </motion.div>
                ) : nutritionPlan ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 rounded-[2.5rem] p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                          <Heart className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Daily Focus</p>
                          <h3 className="text-xl font-display font-bold text-white">{nutritionPlan.dailyFocus}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {nutritionPlan.meals.map((meal: any, i: number) => (
                        <div key={i} className="bg-white/2 border border-white/5 rounded-[2rem] p-6 group hover:bg-white/5 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                {meal.type}
                              </span>
                              <h4 className="text-lg font-bold text-white">{meal.name}</h4>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {meal.ingredients.map((ing: string, j: number) => (
                              <span key={j} className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                                {ing}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3" /> {meal.nutritionalValue}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Nutritionist Tips</h4>
                      <div className="space-y-3">
                        {nutritionPlan.tips.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-gray-300 font-medium leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[500px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-6">
                      <Utensils className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-700 mb-2">No Plan Generated</h3>
                    <p className="text-gray-600 text-xs">Select your conditions and preferences to get a personalized plan.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
