import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { useSocket } from '../components/SocketContext';
import Peer from 'simple-peer';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  User, 
  Calendar,
  Clock,
  ShieldCheck,
  Loader2,
  Camera,
  Settings,
  MoreVertical,
  Maximize2,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Pill,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateConsultationSummary, ConsultationSummary } from '../services/aiConsultationService';

export default function TeleHealth() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState('demo-room');
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  
  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Prescription State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [myPrescriptions, setMyPrescriptions] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'exchanging' | 'disconnected' | 'failed'>('idle');

  // AI Summary State
  const [consultationNotes, setConsultationNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<ConsultationSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const prescriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === 'Patient') {
      fetchMyPrescriptions();
    }
    if (user?.role === 'Doctor') {
      fetchTodayAppointments();
    }
  }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      const response = await axios.get('/api/doctors/dashboard-data', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Filter for virtual appointments only
      const virtual = response.data.appointments.filter((a: any) => a.type === 'Virtual');
      setTodayAppointments(virtual);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchMyPrescriptions = async () => {
    try {
      const response = await axios.get('/api/doctors/prescriptions/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  useEffect(() => {
    if (isInCall && !stream) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          streamRef.current = currentStream;
          if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
          }
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall]);

  useEffect(() => {
    if (!socket || !isInCall || !stream) return;

    socket.emit('join-video-room', roomId);

    socket.on('user-joined', (userId) => {
      console.log('User joined:', userId);
      setConnectionStatus('connecting');
      const p = new Peer({ initiator: true, trickle: true, stream });

      p.on('signal', (data) => {
        if (data.type === 'offer') {
          socket.emit('offer', { target: userId, offer: data, roomId });
        } else if ((data as any).candidate) {
          socket.emit('ice-candidate', { target: userId, candidate: data });
        }
      });

      p.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        setConnectionStatus('exchanging');
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      p.on('connect', () => {
        setConnectionStatus('connected');
      });

      p.on('close', () => {
        setConnectionStatus('disconnected');
      });

      p.on('error', (err) => {
        console.error('Peer error:', err);
        setConnectionStatus('failed');
      });

      peerRef.current = p;
    });

    socket.on('offer', ({ from, offer }) => {
      console.log('Received offer from:', from);
      setConnectionStatus('connecting');
      const p = new Peer({ initiator: false, trickle: true, stream });

      p.on('signal', (data) => {
        if (data.type === 'answer') {
          socket.emit('answer', { target: from, answer: data });
        } else if ((data as any).candidate) {
          socket.emit('ice-candidate', { target: from, candidate: data });
        }
      });

      p.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        setConnectionStatus('exchanging');
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      p.on('connect', () => {
        setConnectionStatus('connected');
      });

      p.on('close', () => {
        setConnectionStatus('disconnected');
      });

      p.on('error', (err) => {
        console.error('Peer error:', err);
        setConnectionStatus('failed');
      });

      p.signal(offer);
      peerRef.current = p;
    });

    socket.on('answer', ({ from, answer }) => {
      console.log('Received answer from:', from);
      peerRef.current?.signal(answer);
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      console.log('Received ICE candidate from:', from);
      peerRef.current?.signal(candidate);
    });

    socket.on('receive-chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-left', (userId) => {
      console.log('User left:', userId);
      setRemoteStream(null);
      setConnectionStatus('disconnected');
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    });

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('receive-chat-message');
      socket.off('user-left');
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [socket, isInCall, stream, roomId]);

  const startCall = (appointment?: any) => {
    if (appointment) {
      setActiveAppointment(appointment);
      setRoomId(`room-${appointment.patientId}`);
    }
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setTimeout(() => {
      setIsConnecting(false);
      setIsInCall(true);
    }, 2000);
  };

  const endCall = async () => {
    const currentMessages = [...messages];
    const currentNotes = consultationNotes;

    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsInCall(false);
    setStream(null);
    setRemoteStream(null);
    setMessages([]);
    setShowChat(false);
    setShowNotes(false);
    setConnectionStatus('idle');
    setActiveAppointment(null);
    peerRef.current = null;
    streamRef.current = null;
    if (socket) socket.emit('leave-video-room', roomId);

    // Generate AI Summary if doctor
    if (user?.role === 'Doctor') {
      handleGenerateSummary(currentNotes, currentMessages);
    }
  };

  const handleGenerateSummary = async (notes: string, chatHistory: any[]) => {
    setIsGeneratingSummary(true);
    setShowSummaryModal(true);
    try {
      const summary = await generateConsultationSummary(notes, chatHistory);
      setAiSummary(summary);
      
      // Pre-fill prescription if summary has medications
      if (summary.prescribedMedications.length > 0) {
        setPrescription(prev => ({
          ...prev,
          diagnosis: summary.diagnosis,
          medicines: summary.prescribedMedications.map(m => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: ''
          }))
        }));
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-chat-message', {
      roomId,
      message: newMessage,
      senderName: user?.username || 'Anonymous'
    });
    setNewMessage('');
  };

  const handleAddMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [...prescription.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const handleRemoveMedicine = (index: number) => {
    const newMedicines = prescription.medicines.filter((_, i) => i !== index);
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const newMedicines = [...prescription.medicines];
    (newMedicines[index] as any)[field] = value;
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const savePrescription = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Please provide a digital signature');
      return;
    }

    setIsSavingPrescription(true);
    try {
      const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

      let patientId = activeAppointment?.patientId;

      if (!patientId) {
        const patientResponse = await axios.get('/api/patients', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        patientId = patientResponse.data[0]?._id;
      }

      if (!patientId) throw new Error('No patient found to issue prescription to');

      await axios.post('/api/doctors/prescriptions', {
        patient_id: patientId,
        diagnosis: prescription.diagnosis,
        medicines: prescription.medicines,
        notes: prescription.notes,
        digital_signature: signatureData,
        date: new Date()
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      setPrescriptionSuccess(true);
      setTimeout(() => {
        setPrescriptionSuccess(false);
        setShowPrescriptionModal(false);
        setPrescription({
          diagnosis: '',
          medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
          notes: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription');
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const downloadPrescriptionPDF = async (prescriptionData: any) => {
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

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter uppercase">
            Tele-Health <span className="text-blue-500">Video Suite</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Secure, HIPAA-compliant video consultations with your doctors.</p>
        </div>
        {!isInCall && (
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Encrypted Connection</span>
          </div>
        )}
        {user?.role === 'Patient' && !isInCall && (
          <button 
            onClick={() => {
              fetchMyPrescriptions();
              setShowHistoryModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <FileText className="w-4 h-4" />
            Prescription History
          </button>
        )}
      </header>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {!isInCall ? (
            <motion.div
              key="pre-call"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              {/* Camera Preview */}
              <div className="lg:col-span-2 bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-4 mx-auto">
                      <Camera className="w-10 h-10" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Camera Preview</p>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                  <button className="w-14 h-14 rounded-2xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all">
                    <Settings className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-6">
                <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-display font-bold text-white mb-6">
                    {user?.role === 'Doctor' ? 'Today\'s Virtual Sessions' : 'Upcoming Session'}
                  </h3>
                  
                  {user?.role === 'Doctor' ? (
                    <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {todayAppointments.length > 0 ? todayAppointments.map((apt, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {apt.avatar}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{apt.patient}</h4>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">{apt.time}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => startCall(apt)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 bg-white/2 rounded-2xl border border-dashed border-white/10">
                          <p className="text-xs text-gray-500">No virtual sessions scheduled for today.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Dr. Sarah Rahman</h4>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Cardiologist</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-300">Today</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-300">10:30 AM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.role === 'Patient' && (
                    <button
                      onClick={() => startCall()}
                      disabled={isConnecting}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5" />
                          Join Consultation
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">Instructions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      Ensure you have a stable internet connection.
                    </li>
                    <li className="flex items-start gap-3 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      Use a quiet room with good lighting.
                    </li>
                    <li className="flex items-start gap-3 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      Have your medical records ready if needed.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="in-call"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full bg-black rounded-[2.5rem] overflow-hidden relative flex"
            >
              {/* Main Call Area */}
              <div className="flex-1 relative">
                {/* Main Video (Remote) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  {remoteStream && (connectionStatus === 'connected' || connectionStatus === 'exchanging') ? (
                    <video
                      ref={userVideo}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-gray-800 mb-6 mx-auto relative">
                        <User className="w-16 h-16" />
                        {(connectionStatus === 'connecting' || connectionStatus === 'connected') && (
                          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-display font-bold text-white mb-2">
                        {connectionStatus === 'connecting' ? 'Establishing Secure Link' : 
                         connectionStatus === 'connected' ? 'Link Established' :
                         connectionStatus === 'failed' ? 'Connection Failed' : 
                         connectionStatus === 'disconnected' ? 'Participant Left' :
                         'Waiting for participant...'}
                      </h3>
                      
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">
                        {connectionStatus === 'connecting' ? 'Handshaking with remote peer...' : 
                         connectionStatus === 'connected' ? 'Waiting for media stream to initialize...' :
                         connectionStatus === 'failed' ? 'There was an issue establishing the P2P connection.' : 
                         connectionStatus === 'disconnected' ? 'The other participant has disconnected from the session.' :
                         'Your consultation will begin as soon as the other party joins.'}
                      </p>

                      {connectionStatus === 'failed' && (
                        <button 
                          onClick={() => {
                            endCall();
                            startCall();
                          }}
                          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          Retry Connection
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Self View */}
                <div className="absolute top-8 right-8 w-64 aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md z-10">
                  <video
                    ref={myVideo}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 rounded-lg">
                    <p className="text-[8px] font-bold text-white uppercase tracking-widest">You</p>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl z-20">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-600 text-white' : 'text-white hover:bg-white/10'}`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-600 text-white' : 'text-white hover:bg-white/10'}`}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => {
                      setShowChat(false);
                      setShowNotes(!showNotes);
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showNotes ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`}
                    title="Consultation Notes"
                  >
                    <ClipboardList className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowNotes(false);
                      setShowChat(!showChat);
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showChat ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  
                  {user?.role === 'Doctor' && (
                    <button 
                      onClick={() => setShowPrescriptionModal(true)}
                      className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}

                  <div className="w-px h-8 bg-white/10" />
                  <button 
                    onClick={() => setShowEndCallConfirm(true)}
                    className="w-16 h-12 bg-rose-600 text-white rounded-xl flex items-center justify-center hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>

                {/* Top Bar */}
                <div className="absolute top-8 left-8 flex items-center gap-4 z-10">
                  <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">08:42</p>
                  </div>
                  <div className={`px-4 py-2 backdrop-blur-md rounded-xl border transition-all duration-500 ${
                    connectionStatus === 'exchanging' ? 'bg-emerald-500/20 border-emerald-500/20' :
                    (connectionStatus === 'connecting' || connectionStatus === 'connected') ? 'bg-blue-500/20 border-blue-500/20' :
                    connectionStatus === 'failed' ? 'bg-rose-500/20 border-rose-500/20' :
                    'bg-gray-500/20 border-gray-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      {connectionStatus === 'exchanging' && (
                        <div className="flex gap-0.5 items-center h-2">
                          <motion.div 
                            animate={{ height: [4, 8, 4] }} 
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-0.5 bg-emerald-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ height: [8, 4, 8] }} 
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-0.5 bg-emerald-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ height: [4, 8, 4] }} 
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-0.5 bg-emerald-500 rounded-full" 
                          />
                        </div>
                      )}
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        connectionStatus === 'exchanging' ? 'text-emerald-400' :
                        (connectionStatus === 'connecting' || connectionStatus === 'connected') ? 'text-blue-400' :
                        connectionStatus === 'failed' ? 'text-rose-400' :
                        'text-gray-400'
                      }`}>
                        {connectionStatus === 'exchanging' ? 'Data Exchanging' :
                         connectionStatus === 'connected' ? 'Link Established' :
                         connectionStatus === 'connecting' ? 'Connecting...' :
                         connectionStatus === 'failed' ? 'Connection Failed' :
                         connectionStatus === 'disconnected' ? 'Disconnected' : 'Idle'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-8 right-8 left-8 flex justify-between pointer-events-none z-10">
                  <div />
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Sidebar */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ x: 400 }}
                    animate={{ x: 0 }}
                    exit={{ x: 400 }}
                    className="w-96 bg-gray-900 border-l border-white/10 flex flex-col"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Chat</h3>
                      <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-white">
                        <Maximize2 className="w-4 h-4 rotate-45" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col ${msg.senderId === socket?.id ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{msg.sender}</span>
                            <span className="text-[8px] text-gray-700">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl text-xs ${msg.senderId === socket?.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={sendMessage} className="p-6 border-t border-white/10">
                      <div className="relative">
                        <input 
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white outline-none focus:border-blue-500 transition-all"
                        />
                        <button 
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-all"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes Sidebar */}
              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ x: 400 }}
                    animate={{ x: 0 }}
                    exit={{ x: 400 }}
                    className="w-96 bg-gray-900 border-l border-white/10 flex flex-col"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Consultation Notes</h3>
                      </div>
                      <button onClick={() => setShowNotes(false)} className="text-gray-500 hover:text-white">
                        <Maximize2 className="w-4 h-4 rotate-45" />
                      </button>
                    </div>

                    <div className="flex-1 p-6">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Take notes during the consultation. These will be used to generate an AI summary.</p>
                      <textarea
                        value={consultationNotes}
                        onChange={(e) => setConsultationNotes(e.target.value)}
                        placeholder="Type clinical notes here..."
                        className="w-full h-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500 transition-all resize-none custom-scrollbar"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prescription Modal */}
      <AnimatePresence>
        {showPrescriptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-12 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Digital Prescription</h2>
                  {activeAppointment && (
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      Patient: {activeAppointment.patient}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-500 hover:text-white">
                  <PhoneOff className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Diagnosis</label>
                  <input 
                    type="text" 
                    value={prescription.diagnosis}
                    onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Medicines</label>
                    <button 
                      onClick={handleAddMedicine}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400"
                    >
                      <Plus className="w-3 h-3" /> Add Medicine
                    </button>
                  </div>

                  {prescription.medicines.map((med, idx) => (
                    <div key={idx} className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4 relative group">
                      <button 
                        onClick={() => handleRemoveMedicine(idx)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          placeholder="Medicine Name" 
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none"
                        />
                        <input 
                          placeholder="Dosage (e.g. 500mg)" 
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none"
                        />
                        <input 
                          placeholder="Frequency (e.g. 1-0-1)" 
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none"
                        />
                        <input 
                          placeholder="Duration (e.g. 7 days)" 
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none"
                        />
                      </div>
                      <textarea 
                        placeholder="Special Instructions" 
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none h-20 resize-none"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Additional Notes</label>
                  <textarea 
                    value={prescription.notes}
                    onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all h-32 resize-none"
                    placeholder="Any additional advice or notes..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Digital Signature</label>
                    <button 
                      onClick={() => sigCanvas.current?.clear()}
                      className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden h-40 border border-white/10">
                    <SignatureCanvas 
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{ className: 'w-full h-full' }}
                    />
                  </div>
                  <p className="text-[8px] text-gray-500 mt-2 italic">By signing here, you authorize this digital prescription.</p>
                </div>

                <button
                  onClick={savePrescription}
                  disabled={isSavingPrescription || prescriptionSuccess}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSavingPrescription ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : prescriptionSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Prescription Issued
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Issue Digital Prescription
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">AI Consultation Summary</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Generated by Synapse Intelligence</p>
                    </div>
                  </div>
                  {!isGeneratingSummary && (
                    <button onClick={() => setShowSummaryModal(false)} className="text-gray-500 hover:text-white">
                      <Plus className="w-6 h-6 rotate-45" />
                    </button>
                  )}
                </div>

                {isGeneratingSummary ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="relative w-20 h-20 mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Consultation...</h3>
                    <p className="text-xs text-gray-500 max-w-xs">Our AI is processing your notes and chat history to generate a clinical summary.</p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Executive Summary</h4>
                      <p className="text-sm text-gray-300 leading-relaxed bg-white/2 p-4 rounded-2xl border border-white/5">
                        {aiSummary.summary}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Diagnosis</h4>
                      <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        {aiSummary.diagnosis}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Prescribed Medications</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {aiSummary.prescribedMedications.map((med, idx) => (
                          <div key={idx} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                            <div>
                              <p className="text-sm font-bold text-white">{med.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{med.dosage} • {med.frequency} • {med.duration}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Pill className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={() => {
                          setShowSummaryModal(false);
                          setShowPrescriptionModal(true);
                        }}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Use in Prescription
                      </button>
                      <button 
                        onClick={() => setShowSummaryModal(false)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-500">Failed to generate summary. Please try again or complete the prescription manually.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 md:p-12 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Prescription History</h2>
                <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-white">
                  <PhoneOff className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {myPrescriptions.length === 0 ? (
                <div className="py-20 text-center">
                  <FileText className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No prescriptions found in your history.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myPrescriptions.map((p) => (
                    <div key={p._id} className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4 hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-white">Dr. {p.doctor_id?.name}</h4>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{p.doctor_id?.specialization}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold">{new Date(p.date).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400"><span className="text-gray-500">Diagnosis:</span> {p.diagnosis}</p>
                        <p className="text-xs text-gray-400"><span className="text-gray-500">Medicines:</span> {p.medicines.length} items</p>
                      </div>

                      <button 
                        onClick={() => downloadPrescriptionPDF(p)}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Maximize2 className="w-3 h-3" /> Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* End Call Confirmation Modal */}
      <AnimatePresence>
        {showEndCallConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 md:p-10 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <PhoneOff className="w-10 h-10" />
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">End Consultation?</h2>
                <p className="text-gray-400 text-sm">Are you sure you want to end this session? This action cannot be undone.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    endCall();
                    setShowEndCallConfirm(false);
                  }}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                >
                  End Call Now
                </button>
                <button
                  onClick={() => setShowEndCallConfirm(false)}
                  className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Stay in Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
