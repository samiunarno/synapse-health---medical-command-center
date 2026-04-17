import React from 'react';

interface SynapseLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export default function SynapseLogo({ 
  className = "", 
  iconClassName = "w-6 h-6", 
  textClassName = "text-xl font-display font-black tracking-tighter uppercase italic",
  showText = true 
}: SynapseLogoProps) {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-[#0033A0]/30 dark:bg-[#3b82f6]/30 blur-2xl group-hover:blur-3xl transition-all duration-700 rounded-full" />
        
        <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl border border-[#0033A0]/30 dark:border-[#3b82f6]/30 bg-white dark:bg-black/50 backdrop-blur-sm">
          {/* animated grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0033A0]/20 via-transparent to-transparent opacity-50 block group-hover:animate-spin-slow"></div>
          
          <svg className={`relative z-10 ${iconClassName} text-[#0033A0] dark:text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" className="transform group-hover:scale-110 transition-transform duration-500 origin-center" />
            <path d="M12 12v.01" strokeWidth="3" className="text-[#3b82f6]" />
            <path d="M8 12v.01" strokeWidth="2" strokeOpacity="0.5" />
            <path d="M16 12v.01" strokeWidth="2" strokeOpacity="0.5" />
            <path d="M12 8l3 4-3 4-3-4z" className="text-[#0033A0] dark:text-[#3b82f6]" />
          </svg>

          {/* sci-fi scanning line */}
          <div className="absolute left-0 right-0 h-px bg-[#3b82f6]/50 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-scan-line z-20" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textClassName} text-black dark:text-white flex items-center tracking-tighter`}>
            智医<span className="text-[#0033A0] dark:text-[#3b82f6]">云</span>
          </span>
          <span className="text-[7px] font-mono font-bold tracking-[0.5em] text-[#0033A0] dark:text-[#3b82f6] uppercase tracking-widest mt-1 opacity-80">
            NEURAL NETWORK
          </span>
        </div>
      )}
    </div>
  );
}
