import React from 'react';
import { MapPin, Shield, Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AMapSetupGuide() {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 lg:p-12 max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
          <MapPin className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">AMap (Gaode Maps) Setup Guide</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Enable real-time tracking and professional maps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-blue-500 font-bold shrink-0">1</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Create AMap Account</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Visit the <a href="https://lbs.amap.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">AMap LBS Console <ExternalLink className="w-3 h-3" /></a> and register as a developer.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-blue-500 font-bold shrink-0">2</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Create Application & Key</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Create a new application, then add a Key. Select "Web Service" or "Web JS API" as the service type.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-blue-500 font-bold shrink-0">3</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Get Security Code</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ensure you have the "Security JS Code" (安全密钥) enabled in your key settings for enhanced security.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/2 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Environment Configuration</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Add these variables to your <code className="text-blue-400">.env</code> file:</p>
          <div className="bg-black/40 p-4 rounded-xl font-mono text-[10px] text-gray-300 space-y-2 border border-white/5">
            <p><span className="text-purple-400">VITE_AMAP_KEY</span>=your_key_here</p>
            <p><span className="text-purple-400">VITE_AMAP_SECURITY_JS_CODE</span>=your_security_code</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300 leading-relaxed">
              After adding the keys, restart your development server or refresh the page to enable the map.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-8">
        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Why AMap?</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/2 rounded-xl border border-white/5">
            <Zap className="w-4 h-4 text-blue-500 mb-2" />
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">High Performance</p>
            <p className="text-[9px] text-gray-600">Smooth 3D rendering and movement animations.</p>
          </div>
          <div className="p-4 bg-white/2 rounded-xl border border-white/5">
            <Activity className="w-4 h-4 text-green-500 mb-2" />
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Real-time Data</p>
            <p className="text-[9px] text-gray-600">Optimized for live GPS tracking and ETAs.</p>
          </div>
          <div className="p-4 bg-white/2 rounded-xl border border-white/5">
            <Shield className="w-4 h-4 text-purple-500 mb-2" />
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Enterprise Ready</p>
            <p className="text-[9px] text-gray-600">Secure API access with JS security codes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Zap, Activity } from 'lucide-react';
