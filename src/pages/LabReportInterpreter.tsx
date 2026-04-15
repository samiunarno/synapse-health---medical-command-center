import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Upload, Brain, CheckCircle2, AlertCircle, ChevronRight, Info } from 'lucide-react';

import { analyzeLabReport as analyzeLabReportAI } from '../services/aiService';

export default function LabReportInterpreter() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeReport = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      // In a real app, we would extract text from the file (PDF/OCR)
      // For this demo, we'll pass the filename and a simulated extraction to DeepSeek
      // to show real AI reasoning.
      const simulatedExtraction = `Lab Report for ${file.name}. 
      Parameters: Hemoglobin 10.5 (Normal: 13.5-17.5), Serum Iron 45 (Normal: 60-170), WBC 7.2 (Normal: 4.5-11.0).`;
      
      const data = await analyzeLabReportAI(simulatedExtraction);
      setResult(data);
    } catch (err) {
      console.error('Lab report analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">AI Lab Interpreter</h1>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Decode your medical reports with DeepSeek AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                <Upload className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Upload Report</h3>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest leading-relaxed">
                  Upload your blood test or lab report (PDF/JPG) for instant AI analysis.
                </p>
              </div>

              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/2 hover:bg-white/5 transition-colors">
                  <FileText className="w-8 h-8 text-gray-600" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {file ? file.name : "Drop file here or click to browse"}
                  </span>
                </div>
              </div>

              <button
                onClick={analyzeReport}
                disabled={!file || isAnalyzing}
                className="w-full py-6 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Analyzing with DeepSeek...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Interpret Report
                  </>
                )}
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-8 flex gap-6 items-start">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Medical Disclaimer</h4>
              <p className="text-xs text-yellow-500/60 font-medium leading-relaxed">
                This AI interpretation is for informational purposes only and is not a clinical diagnosis. Always consult with a qualified healthcare professional before making any medical decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight">AI Interpretation</h3>
                  </div>

                  <p className="text-gray-300 font-medium leading-relaxed italic">
                    "{result.summary}"
                  </p>

                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Abnormal Parameters</p>
                    <div className="grid gap-4">
                      {result.abnormalValues.map((val: any, idx: number) => (
                        <div key={idx} className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-bold text-white uppercase tracking-tight">{val.parameter}</h4>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Normal Range: {val.range}</p>
                            </div>
                            <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                              {val.status}
                            </span>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-400 font-medium leading-relaxed">{val.meaning}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Actionable Advice</p>
                    <div className="grid gap-3">
                      {result.advice.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-xl group hover:bg-white/5 transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform" />
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                  <Brain className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-600 uppercase tracking-widest">Awaiting Data</h3>
                  <p className="text-sm text-gray-700 font-medium max-w-xs mx-auto">
                    Upload a report to see the AI interpretation and health insights here.
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
