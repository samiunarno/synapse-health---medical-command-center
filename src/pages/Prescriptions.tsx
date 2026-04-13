import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  FileText, 
  Search, 
  User, 
  Stethoscope, 
  Calendar, 
  Clock, 
  ChevronRight,
  Download,
  Loader2,
  CheckCircle2,
  Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

export default function Prescriptions() {
  const { token, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const endpoint = user?.role === 'Patient' ? '/api/doctors/prescriptions/me' : '/api/doctors/prescriptions';
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(res.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPrescriptionPDF = (prescriptionData: any) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(22);
    doc.text('SYNAPSE HEALTH - PRESCRIPTION', margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Date: ${new Date(prescriptionData.date).toLocaleDateString()}`, margin, y);
    y += 10;
    doc.text(`Doctor: Dr. ${prescriptionData.doctor_id?.name || 'N/A'}`, margin, y);
    y += 10;
    doc.text(`Specialization: ${prescriptionData.doctor_id?.specialization || 'N/A'}`, margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.text('Diagnosis:', margin, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(prescriptionData.diagnosis, margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.text('Medicines:', margin, y);
    y += 10;
    
    prescriptionData.medicines.forEach((med: any, i: number) => {
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${med.name} - ${med.dosage}`, margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`   Frequency: ${med.frequency} | Duration: ${med.duration}`, margin, y);
      y += 5;
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`, margin, y);
        y += 5;
      }
      y += 5;
    });

    if (prescriptionData.notes) {
      y += 5;
      doc.setFontSize(14);
      doc.text('Notes:', margin, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(prescriptionData.notes, margin, y);
      y += 15;
    }

    if (prescriptionData.digital_signature) {
      y += 10;
      doc.text('Doctor Signature:', margin, y);
      y += 5;
      doc.addImage(prescriptionData.digital_signature, 'PNG', margin, y, 50, 20);
    }

    doc.save(`Prescription_${new Date(prescriptionData.date).getTime()}.pdf`);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const doctorName = p.doctor_id?.name || '';
    const patientName = p.patient_id?.name || '';
    const diagnosis = p.diagnosis || '';
    return doctorName.toLowerCase().includes(search.toLowerCase()) || 
           patientName.toLowerCase().includes(search.toLowerCase()) ||
           diagnosis.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
          Digital <span className="text-blue-500">Prescriptions</span>
        </h1>
        <p className="text-gray-500 font-medium mt-2">View and manage your digital prescriptions issued by doctors.</p>
      </header>

      <div className="bg-white/2 p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by doctor, patient or diagnosis..." 
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/2 border border-white/5 rounded-[2.5rem]">
            <FileText className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No prescriptions found</p>
          </div>
        ) : (
          filteredPrescriptions.map((p, idx) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedPrescription(p)}
              className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{p.diagnosis}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(p.date).toLocaleDateString()} • {new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Valid</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mb-1">Doctor</p>
                  <p className="text-sm font-bold text-white">{p.doctor_id?.name || 'Dr. Unknown'}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{p.doctor_id?.specialization || 'General'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mb-1">Medicines</p>
                  <p className="text-sm font-bold text-white">{p.medicines?.length || 0} Prescribed</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.medicines?.slice(0, 3).map((_: any, i: number) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center">
                      <Pill className="w-4 h-4 text-blue-500" />
                    </div>
                  ))}
                  {p.medicines?.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
                      +{p.medicines.length - 3}
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest hover:text-blue-400 transition-colors">
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Prescription Detail Modal */}
      <AnimatePresence>
        {selectedPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 md:p-12"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Prescription Detail</h2>
                    <p className="text-gray-500 text-sm font-medium">ID: {selectedPrescription._id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPrescription(null)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Diagnosis</h4>
                    <div className="p-6 bg-white/2 border border-white/5 rounded-2xl">
                      <p className="text-xl font-bold text-white">{selectedPrescription.diagnosis}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Doctor Information</h4>
                    <div className="p-6 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{selectedPrescription.doctor_id?.name}</p>
                        <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">{selectedPrescription.doctor_id?.specialization}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Date & Time</h4>
                    <div className="p-6 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-300">{new Date(selectedPrescription.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-300">{new Date(selectedPrescription.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Security</h4>
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Digitally Signed</p>
                        <p className="text-[10px] text-gray-600">Verified by Synapse Health Network</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Medication Plan</h4>
                <div className="space-y-4">
                  {selectedPrescription.medicines?.map((med: any, idx: number) => (
                    <div key={idx} className="p-8 bg-white/2 border border-white/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                          <Pill className="w-8 h-8" />
                        </div>
                        <div>
                          <h5 className="text-xl font-bold text-white">{med.name}</h5>
                          <p className="text-sm text-gray-500">{med.dosage} • {med.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mb-1">Frequency</p>
                          <p className="text-sm font-bold text-white bg-white/5 px-4 py-2 rounded-xl border border-white/5">{med.frequency}</p>
                        </div>
                        {med.instructions && (
                          <div className="max-w-[200px]">
                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mb-1">Instructions</p>
                            <p className="text-[10px] text-gray-400 italic">"{med.instructions}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div className="mb-10">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Doctor's Notes</h4>
                  <div className="p-8 bg-white/2 border border-white/5 rounded-3xl">
                    <p className="text-gray-400 leading-relaxed italic">"{selectedPrescription.notes}"</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => downloadPrescriptionPDF(selectedPrescription)}
                  className="flex-1 py-5 bg-white/5 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-white/5"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20">
                  <Pill className="w-5 h-5" />
                  Order from Pharmacy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
