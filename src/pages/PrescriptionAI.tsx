import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Camera, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Loader2,
  Pill,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PrescriptionAI() {
  const { user, token } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePrescription = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/advanced/ai/analyze-prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(err.message || 'Failed to analyze the prescription. Please ensure the image is clear and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            AI Prescription <span className="text-blue-500">Scanner</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Intelligent extraction and interaction checking for your medications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Real-time Analysis</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold text-white mb-6">Upload Prescription</h3>
              
              <div className="aspect-[4/3] bg-black/40 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group/upload">
                {image ? (
                  <>
                    <img src={image} alt="Prescription" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 hover:text-white transition-all">
                        Change Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 mb-6 group-hover/upload:scale-110 transition-transform">
                      <Camera className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Drop image or click to upload</p>
                    <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WEBP</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <button
                onClick={analyzePrescription}
                disabled={!image || isAnalyzing}
                className="w-full mt-8 bg-blue-600 text-white py-5 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with DeepSeek AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start AI Analysis
                  </>
                )}
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -z-0" />
          </div>

          <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Safety Information</h4>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                  This AI tool is for informational purposes only. Always verify the results with your doctor or pharmacist before taking any medication.
                </p>
              </div>
              <div className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-200/70 leading-relaxed font-medium">
                  The AI checks for common interactions but may not detect all possible side effects or contraindications specific to your health history.
                </p>
              </div>
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
                  <div className="w-24 h-24 bg-blue-600/20 rounded-full animate-ping absolute inset-0" />
                  <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center relative z-10">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">DeepSeek AI is Thinking...</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Extracting medical data and cross-referencing for safety interactions.
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">Analysis Summary</h3>
                  </div>
                  <p className="text-sm text-blue-100/70 leading-relaxed font-medium">
                    {result.summary}
                  </p>
                </div>

                {/* Medicines List */}
                <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-3">
                    <Pill className="w-5 h-5 text-blue-500" />
                    Detected Medications
                  </h3>
                  <div className="space-y-4">
                    {result.medicines.map((med: any, i: number) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-white">{med.name}</h4>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">{med.purpose}</p>
                        <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                          <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-xs text-gray-300 leading-relaxed">{med.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactions */}
                {result.interactions.length > 0 && (
                  <div className="bg-rose-600/10 border border-rose-500/20 rounded-[2.5rem] p-8">
                    <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      Safety Interactions
                    </h3>
                    <div className="space-y-4">
                      {result.interactions.map((inter: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            inter.severity === 'High' ? 'bg-rose-500 animate-pulse' : 
                            inter.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                              inter.severity === 'High' ? 'text-rose-400' : 
                              inter.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                            }`}>
                              {inter.severity} Severity
                            </p>
                            <p className="text-sm text-white font-medium">{inter.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[500px] bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-rose-600/20 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Analysis Error</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                  {error}
                </p>
                <button 
                  onClick={() => setError(null)}
                  className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[500px] bg-white/2 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border-dashed"
              >
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-6">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-700 mb-4">Ready for Analysis</h3>
                <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
                  Upload a prescription image to start the intelligent extraction process.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Brain({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
    </svg>
  );
}
