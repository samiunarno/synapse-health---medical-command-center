import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Navigation, Video, Info, X, ChevronRight, Eye, Zap } from 'lucide-react';

const HOTSPOTS = [
  { 
    id: 1, 
    top: '50%', 
    left: '33%', 
    title: 'Main Lobby', 
    description: 'Our modern reception area with 24/7 assistance and digital check-in kiosks.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop'
  },
  { 
    id: 2, 
    top: '33%', 
    left: '75%', 
    title: 'MRI Suite', 
    description: 'State-of-the-art diagnostic imaging facility for high-resolution internal scans.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    id: 3, 
    top: '60%', 
    left: '60%', 
    title: 'ICU Ward', 
    description: 'Critical care unit equipped with advanced life-support systems and continuous monitoring.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop'
  }
];

export default function VirtualTour() {
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [currentArea, setCurrentArea] = useState('Lobby');

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Virtual <span className="text-blue-500">Tour</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Explore our world-class facilities in immersive 3D.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">360° View</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Interactive</span>
          </div>
        </div>
      </header>

      <div className="bg-black/40 rounded-[3rem] overflow-hidden relative aspect-video shadow-2xl border border-white/5 group">
        {/* Simulated 3D Viewport */}
        <motion.div 
          key={currentArea}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.4, scale: 1 }}
          className="absolute inset-0 bg-cover bg-center mix-blend-luminosity transition-all duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')` }}
        />
        
        {/* UI Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-10 z-10">
          <div className="flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-xl text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 border border-white/10 shadow-2xl">
              <Navigation className="w-5 h-5 text-blue-500" />
              <span className="uppercase tracking-widest text-xs">{currentArea}</span>
            </div>
            <div className="flex gap-3">
              <button className="p-4 bg-black/60 backdrop-blur-xl text-white rounded-2xl hover:bg-white/10 transition-all border border-white/10 shadow-2xl">
                <Info className="w-5 h-5" />
              </button>
              <button className="p-4 bg-black/60 backdrop-blur-xl text-white rounded-2xl hover:bg-white/10 transition-all border border-white/10 shadow-2xl">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {['Lobby', 'Cardiology', 'Pediatrics', 'ICU', 'Cafeteria'].map((area) => (
              <button 
                key={area} 
                onClick={() => setCurrentArea(area)}
                className={`px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest backdrop-blur-xl border transition-all duration-500 ${
                  currentArea === area 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_20px_40px_rgba(59,130,246,0.3)]' 
                    : 'bg-black/60 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Hotspots */}
        {HOTSPOTS.map((spot) => (
          <motion.div 
            key={spot.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedHotspot(spot)}
            className="absolute w-10 h-10 bg-blue-500/20 rounded-full border-2 border-blue-400 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20 group/spot"
            style={{ top: spot.top, left: spot.left }}
          >
            <div className="w-3 h-3 bg-white rounded-full group-hover/spot:scale-150 transition-transform" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-blue-400 rounded-full"
            />
          </motion.div>
        ))}

        {/* Hotspot Info Modal */}
        <AnimatePresence>
          {selectedHotspot && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-1/2 right-10 -translate-y-1/2 w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-30 overflow-hidden"
            >
              <div className="h-40 overflow-hidden">
                <img src={selectedHotspot.image} alt={selectedHotspot.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-bold text-white">{selectedHotspot.title}</h3>
                  <button onClick={() => setSelectedHotspot(null)} className="text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">
                  {selectedHotspot.description}
                </p>
                <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  Learn More <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Zap, title: 'Real-time Stats', desc: 'Live occupancy and equipment status.' },
          { icon: Video, title: 'HD Quality', desc: 'Crystal clear 4K immersive experience.' },
          { icon: Navigation, title: 'Guided Tour', desc: 'AI-assisted navigation through wards.' }
        ].map((feat, i) => (
          <div key={i} className="bg-white/2 border border-white/5 rounded-[2rem] p-8 group hover:bg-white/5 transition-all">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <feat.icon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-display font-bold text-white mb-2">{feat.title}</h4>
            <p className="text-xs text-gray-500 font-medium">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
