import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Droplet, Brain, Moon, Footprints, ChevronRight, Star, Award } from 'lucide-react';

export default function HealthChallenges() {
  const [activeChallenges, setActiveChallenges] = React.useState([
    { id: 1, title: "10K Step Sprint", type: "Steps", current: 7420, target: 10000, unit: "steps", points: 50, icon: Footprints, color: "blue" },
    { id: 2, title: "Hydration Master", type: "Water", current: 5, target: 8, unit: "glasses", points: 30, icon: Droplet, color: "cyan" },
    { id: 3, title: "Zen Session", type: "Meditation", current: 15, target: 20, unit: "mins", points: 40, icon: Brain, color: "purple" },
  ]);

  const badges = [
    { id: 1, name: "Early Bird", icon: Star, color: "yellow" },
    { id: 2, name: "Hydra King", icon: Droplet, color: "blue" },
    { id: 3, name: "Step Warrior", icon: Zap, color: "orange" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">Health Challenges</h1>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Gamify your wellness journey & earn rewards</p>
        </div>
        <div className="flex items-center gap-6 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Points</p>
            <p className="text-2xl font-display font-bold text-blue-500">2,450 XP</p>
          </div>
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Active Challenges</h3>
          <div className="grid gap-6">
            {activeChallenges.map((challenge) => {
              const progress = (challenge.current / challenge.target) * 100;
              return (
                <div key={challenge.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 group hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl bg-${challenge.color}-600/20 flex items-center justify-center text-${challenge.color}-500 border border-${challenge.color}-500/20 group-hover:scale-110 transition-transform`}>
                        <challenge.icon className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-display font-bold uppercase tracking-tight">{challenge.title}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{challenge.type} Challenge • {challenge.points} XP</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-white">{challenge.current}<span className="text-sm text-gray-600 ml-2">/ {challenge.target} {challenge.unit}</span></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-${challenge.color}-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{Math.round(progress)}% Completed</span>
                      <button className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                        Update Progress <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-4 text-center sm:text-left">
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight">New Challenges Available</h3>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest max-w-md">
                Fresh daily and weekly challenges have been generated based on your health profile.
              </p>
            </div>
            <button className="relative z-10 px-10 py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Browse All
            </button>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Achievements</h3>
              <Award className="w-6 h-6 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-4 p-6 bg-white/2 border border-white/5 rounded-3xl group hover:bg-white/5 transition-all">
                  <div className={`w-16 h-16 rounded-full bg-${badge.color}-600/20 flex items-center justify-center text-${badge.color}-500 border border-${badge.color}-500/20 group-hover:rotate-12 transition-transform`}>
                    <badge.icon className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest text-center">{badge.name}</p>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white/2 border border-dashed border-white/10 rounded-3xl opacity-50">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-600">
                  <Star className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Locked</p>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5 space-y-6">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Leaderboard</p>
              <div className="space-y-4">
                {[
                  { name: "Alex R.", points: "4,820", rank: 1 },
                  { name: "Sarah M.", points: "4,150", rank: 2 },
                  { name: "You", points: "2,450", rank: 12 },
                ].map((user, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${user.name === 'You' ? 'bg-blue-600/10 border border-blue-600/20' : 'bg-white/2'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-600">#{user.rank}</span>
                      <span className="text-xs font-bold text-white uppercase tracking-tight">{user.name}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-500">{user.points} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
