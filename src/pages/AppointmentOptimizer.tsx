import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Brain, User, MapPin, ChevronRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function AppointmentOptimizer() {
  const [selectedDoctor, setSelectedDoctor] = React.useState<any>(null);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [optimization, setOptimization] = React.useState<any>(null);

  const doctors = [
    { id: 1, name: "Dr. Sarah Rahman", specialty: "Cardiologist", rating: 4.9, image: "https://picsum.photos/seed/doc1/200/200" },
    { id: 2, name: "Dr. Ahmed Faisal", specialty: "Neurologist", rating: 4.8, image: "https://picsum.photos/seed/doc2/200/200" },
    { id: 3, name: "Dr. Maria Khan", specialty: "Dermatologist", rating: 4.7, image: "https://picsum.photos/seed/doc3/200/200" },
  ];

  const optimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setOptimization({
        recommendedTime: "10:45 AM",
        predictedWaitTime: "12 mins",
        confidence: "94%",
        reasoning: "Based on current patient flow and Dr. Sarah's average consultation time of 18 minutes. 10:45 AM has the lowest predicted congestion.",
        travelAdvice: "Leave by 10:15 AM to account for current traffic on Mirpur Road."
      });
      setIsOptimizing(false);
    }, 2500);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">Appointment Optimizer</h1>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">AI-driven scheduling to minimize your wait time</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 space-y-10">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Select Specialist</h3>
            <div className="grid gap-4">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-6 rounded-3xl border transition-all duration-500 flex items-center justify-between group ${
                    selectedDoctor?.id === doc.id 
                      ? 'bg-white border-white text-black' 
                      : 'bg-white/2 border-white/5 text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    <div className="text-left">
                      <h4 className="text-lg font-bold uppercase tracking-tight">{doc.name}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedDoctor?.id === doc.id ? 'text-gray-600' : 'text-gray-500'}`}>
                        {doc.specialty} • ⭐ {doc.rating}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${selectedDoctor?.id === doc.id ? 'text-black' : 'text-gray-700'}`} />
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Select Date</p>
              <div className="grid grid-cols-4 gap-3">
                {['Today', 'Tomorrow', 'Mon', 'Tue'].map((day, i) => (
                  <button key={i} className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${i === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/2 border-white/5 text-gray-500 hover:text-white'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={optimize}
              disabled={!selectedDoctor || isOptimizing}
              className="w-full py-6 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Optimizing Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find Best Time
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {optimization ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-blue-600 border border-blue-500 rounded-[2.5rem] p-12 text-white space-y-10 relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="px-4 py-1.5 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                        AI Recommendation
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Live Data Sync</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-70">Recommended Arrival</p>
                      <h3 className="text-7xl font-display font-black tracking-tighter">{optimization.recommendedTime}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/20">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Predicted Wait</p>
                        <p className="text-2xl font-display font-bold">{optimization.predictedWaitTime}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">AI Confidence</p>
                        <p className="text-2xl font-display font-bold">{optimization.confidence}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-white/10 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center gap-3">
                        <Brain className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Optimization Logic</p>
                      </div>
                      <p className="text-xs font-medium leading-relaxed opacity-90 italic">
                        "{optimization.reasoning}"
                      </p>
                    </div>

                    <button className="w-full py-6 bg-white text-blue-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/20">
                      Confirm Appointment
                    </button>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex gap-6 items-start">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Travel Insights</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {optimization.travelAdvice}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                  <Clock className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-600 uppercase tracking-widest">Ready to Optimize</h3>
                  <p className="text-sm text-gray-700 font-medium max-w-xs mx-auto">
                    Select a doctor and date to find the most efficient time for your visit.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
