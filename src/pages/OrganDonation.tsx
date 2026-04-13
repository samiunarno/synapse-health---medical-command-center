import React from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Users, CheckCircle2, AlertCircle, FileText, ChevronRight, Info } from 'lucide-react';

export default function OrganDonation() {
  const [isRegistered, setIsRegistered] = React.useState(false);

  const organs = [
    "Kidneys", "Liver", "Heart", "Lungs", "Pancreas", "Eyes (Cornea)", "Skin", "Bone Tissue"
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">Organ Donation</h1>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Give the gift of life. Register as an organ donor.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden group">
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-600/20">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Donor Registration</h3>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Organs to Donate</p>
                <div className="grid grid-cols-2 gap-3">
                  {organs.map((organ, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group/item">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-transparent text-red-600 focus:ring-red-600" defaultChecked />
                      <span className="text-xs font-bold text-gray-400 group-hover/item:text-white transition-colors uppercase tracking-widest">{organ}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Emergency Contact</p>
                <div className="grid gap-4">
                  <input type="text" placeholder="FULL NAME" className="w-full bg-white/2 border border-white/5 p-5 rounded-2xl text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all" />
                  <input type="tel" placeholder="PHONE NUMBER" className="w-full bg-white/2 border border-white/5 p-5 rounded-2xl text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all" />
                </div>
              </div>

              <button
                onClick={() => setIsRegistered(true)}
                className="w-full py-6 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all duration-500 shadow-2xl shadow-red-600/20"
              >
                Complete Registration
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 space-y-10">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Why Donate?</h3>
            
            <div className="grid gap-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Save Multiple Lives</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    One single donor can save up to 8 lives and improve the lives of more than 75 people through tissue donation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Legal Protection</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Registration is legally binding and ensures your wishes are respected by the hospital and authorities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 flex-shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Family Awareness</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Registering helps your family understand your decision, making it easier for them during difficult times.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/2 border border-white/5 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-yellow-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Important Note</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                You can update your donor status or preferences at any time through your profile settings.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors">Download Donor Card</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
