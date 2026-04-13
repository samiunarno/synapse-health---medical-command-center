import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, MessageSquare, ChevronDown, ChevronUp, ShieldAlert, Globe, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to external service if available
    console.group('🚀 System Anomaly Detected');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  private handleReset = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  private handleReport = () => {
    // Simulate reporting
    alert('Error report sent to the technical team. Reference ID: ' + Math.random().toString(36).substr(2, 9).toUpperCase());
  };

  private parseError(error: Error | null) {
    if (!error) return { message: 'An unknown error occurred.', type: 'General' };
    
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.operationType && parsed.authInfo) {
        return {
          message: `Permission Denied: ${parsed.operationType} operation failed on path "${parsed.path}".`,
          type: 'Firestore',
          details: parsed
        };
      }
    } catch (e) {
      // Not a JSON error
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return { message: 'Network connectivity issue detected.', type: 'Network' };
    }

    return { message: error.message, type: 'General' };
  }

  public render() {
    if (this.state.hasError) {
      const { message, type, details } = this.parseError(this.state.error);

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-6 text-white font-sans selection:bg-red-500/30">
          <div className="max-w-2xl w-full bg-white/2 border border-white/10 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden backdrop-blur-3xl shadow-[0_0_100px_rgba(220,38,38,0.1)]">
            <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
              <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center shrink-0 border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] border border-red-500/20 mb-2">
                  <Zap className="w-3 h-3" />
                  Critical Failure • Error Type: {type}
                </div>
                <h1 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter leading-none">
                  System <span className="text-transparent stroke-text-red">Anomaly</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">
                  {message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Troubleshooting
                </h3>
                <ul className="space-y-4">
                  {[
                    'Verify your internet connection',
                    'Refresh the application core',
                    'Clear browser cache and cookies',
                    'Ensure you are authorized for this action'
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-500 shadow-xl shadow-white/5"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reboot System
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-3 bg-white/5 text-gray-400 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </button>
                  <button
                    onClick={this.handleReport}
                    className="flex items-center justify-center gap-3 bg-white/5 text-gray-400 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8">
              <button 
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors"
              >
                {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Technical Telemetry
              </button>

              <AnimatePresence>
                {this.state.showDetails && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 p-6 bg-black/40 rounded-[2rem] border border-white/5 font-mono text-[10px] text-red-400/80 space-y-4 overflow-auto max-h-64 custom-scrollbar">
                      <div className="space-y-1">
                        <p className="text-gray-500 uppercase tracking-widest text-[8px] mb-2">Exception Trace</p>
                        <p className="break-all font-bold">{this.state.error?.stack}</p>
                      </div>
                      {this.state.errorInfo && (
                        <div className="space-y-1 pt-4 border-t border-white/5">
                          <p className="text-gray-500 uppercase tracking-widest text-[8px] mb-2">Component Stack</p>
                          <p className="text-gray-400 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</p>
                        </div>
                      )}
                      {details && (
                        <div className="space-y-1 pt-4 border-t border-white/5">
                          <p className="text-gray-500 uppercase tracking-widest text-[8px] mb-2">Extended Context</p>
                          <pre className="text-blue-400">{JSON.stringify(details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .bg-mesh {
              background-image: radial-gradient(at 0% 0%, rgba(220, 38, 38, 0.15) 0, transparent 50%),
                                radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.1) 0, transparent 50%);
            }
            .stroke-text-red {
              -webkit-text-stroke: 1px rgba(220, 38, 38, 0.5);
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}} />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
