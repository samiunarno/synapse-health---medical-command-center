import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Activity, User, Lock, Phone, Calendar, Briefcase, Stethoscope, ArrowRight, Sparkles, CheckCircle2, Shield, Zap, Layers, Pill, Truck, Building2, Store, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Patient',
    fullName: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    specialization: '',
    department_id: '',
    patientType: 'Outpatient',
    doctorType: 'General Practitioner'
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDepartments(data);
        } else {
          console.error('Departments API did not return an array:', data);
          setDepartments([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch departments:', err);
        setDepartments([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          doctorType: formData.role === 'Doctor' ? formData.specialization : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="fixed inset-0 noise z-50 pointer-events-none opacity-20" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[3rem] text-center relative z-10 shadow-2xl"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-4">{t('registration_pending')}</h2>
            <p className="text-gray-400 font-medium mb-8 leading-relaxed">
              {t('medical_profile_initialized_desc')}
            </p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="bg-blue-500 h-full"
            />
          </div>
          <Link to="/login" className="text-sm font-bold text-blue-500 hover:underline uppercase tracking-widest">
            {t('go_to_login')}
          </Link>
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[150px] -z-0" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row overflow-hidden relative">
      <div className="fixed inset-0 noise z-50 pointer-events-none opacity-20" />

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-24 flex flex-col justify-between relative z-10 overflow-y-auto custom-scrollbar">
        <Link to="/" className="flex items-center gap-3 group mb-12">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black group-hover:rotate-12 transition-transform duration-500 shadow-2xl shadow-white/10">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter uppercase">Synapse Health</span>
        </Link>

        <div className="max-w-xl w-full mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] mb-8">
              <Sparkles className="w-3 h-3 text-blue-500" />
              {t('credential_request')}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-display font-black uppercase tracking-tighter mb-4 leading-none break-words">
              {t('join_the_network_1')} <br />
              <span className="text-blue-500">{t('join_the_network_2')}</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-12">{t('initialize_medical_profile')}</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
                <Shield className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Patient', 'Doctor', 'Lab', 'Pharmacist', 'Driver', 'Rider', 'Hospital', 'Pharmacy'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-3 group ${
                      formData.role === role 
                        ? 'bg-white border-white text-black shadow-2xl' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    {role === 'Patient' ? <User className={`w-8 h-8 ${formData.role === 'Patient' ? 'text-blue-600' : 'group-hover:text-white'}`} /> : 
                     role === 'Doctor' ? <Stethoscope className={`w-8 h-8 ${formData.role === 'Doctor' ? 'text-blue-600' : 'group-hover:text-white'}`} /> :
                     role === 'Pharmacist' ? <Pill className={`w-8 h-8 ${formData.role === 'Pharmacist' ? 'text-blue-600' : 'group-hover:text-white'}`} /> :
                     role === 'Lab' ? <Activity className={`w-8 h-8 ${formData.role === 'Lab' ? 'text-blue-600' : 'group-hover:text-white'}`} /> :
                     role === 'Driver' ? <Truck className={`w-8 h-8 ${formData.role === 'Driver' ? 'text-blue-600' : 'group-hover:text-white'}`} /> :
                     role === 'Rider' ? <ShoppingBag className={`w-8 h-8 ${formData.role === 'Rider' ? 'text-blue-600' : 'group-hover:text-white'}`} /> :
                     role === 'Hospital' ? <Building2 className={`w-8 h-8 ${formData.role === 'Hospital' ? 'text-blue-600' : 'group-hover:text-white'}`} /> :
                     <Store className={`w-8 h-8 ${formData.role === 'Pharmacy' ? 'text-blue-600' : 'group-hover:text-white'}`} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{role}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('username')}</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                      placeholder="CHOOSE_ID"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('email_address')}</label>
                  <div className="relative group">
                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                      placeholder="EMAIL@EXAMPLE.COM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('access_code')}</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('full_name')}</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                      placeholder="JOHN DOE"
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!(formData.role === 'Hospital' || formData.role === 'Pharmacy' || formData.role === 'Lab') && (
                    <motion.div
                      key="person-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('age')}</label>
                        <div className="relative group">
                          <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="number"
                            name="age"
                            required
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                            placeholder="25"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('gender')}</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none appearance-none"
                        >
                          <option value="Male" className="bg-[#050505]">{t('male')}</option>
                          <option value="Female" className="bg-[#050505]">{t('female')}</option>
                          <option value="Other" className="bg-[#050505]">{t('other')}</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('contact_phone')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('residential_address')}</label>
                  <div className="relative group">
                    <ArrowRight className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none placeholder:text-gray-800"
                      placeholder="123 MEDICAL ST, HEALTH CITY"
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {formData.role === 'Doctor' && (
                    <motion.div
                      key="doctor-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('specialization')}</label>
                        <input
                          type="text"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="CARDIOLOGY"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('department')}</label>
                        <select
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none appearance-none"
                        >
                          <option value="" className="bg-[#050505]">{t('select_dept')}</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id} className="bg-[#050505]">{dept.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'Patient' && (
                    <motion.div
                      key="patient-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('patient_type')}</label>
                        <select
                          name="patientType"
                          value={formData.patientType}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none appearance-none"
                        >
                          <option value="Outpatient" className="bg-[#050505]">{t('outpatient')}</option>
                          <option value="Inpatient" className="bg-[#050505]">{t('inpatient')}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('preferred_dept')}</label>
                        <select
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none appearance-none"
                        >
                          <option value="" className="bg-[#050505]">{t('select_dept')}</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id} className="bg-[#050505]">{dept.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {(formData.role === 'Pharmacist' || formData.role === 'Pharmacy') && (
                    <motion.div
                      key="pharmacy-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('license_number')}</label>
                        <input
                          type="text"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="PHARM-12345"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('store_name')}</label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="CENTRAL PHARMACY"
                        />
                      </div>
                    </motion.div>
                  )}

                  {(formData.role === 'Driver' || formData.role === 'Rider') && (
                    <motion.div
                      key="logistics-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('vehicle_number')}</label>
                        <input
                          type="text"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="ABC-1234"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('driving_license')}</label>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="DL-987654321"
                        />
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'Lab' && (
                    <motion.div
                      key="lab-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('lab_name')}</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="PRECISION LABS"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('accreditation_id')}</label>
                        <input
                          type="text"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="LAB-ACC-789"
                        />
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'Hospital' && (
                    <motion.div
                      key="hospital-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('hospital_name')}</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="CITY GENERAL HOSPITAL"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">{t('reg_number')}</label>
                        <input
                          type="text"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                          placeholder="HOSP-REG-456"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black py-6 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-white/5 flex items-center justify-center gap-4 group"
              >
                {isLoading ? t('processing_request') : t('submit_credentials')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </form>

            <p className="mt-12 text-center lg:text-left text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
              {t('already_registered')} <Link to="/login" className="text-blue-500 hover:underline underline-offset-4">{t('access_portal')}</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Immersive Visual */}
      <div className="hidden lg:flex w-1/2 bg-white/2 border-l border-white/5 relative items-center justify-center p-24 overflow-hidden">
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-64 h-64 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center mx-auto mb-16 relative"
          >
            <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-3xl" />
            <Layers className="w-24 h-24 text-blue-500" />
          </motion.div>
          <h2 className="text-5xl font-display font-black uppercase tracking-tighter mb-8 leading-none">
            {t('unified_infrastructure_1')} <br />
            <span className="text-transparent stroke-text">{t('unified_infrastructure_2')}</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
            "{t('infrastructure_desc')}"
          </p>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-white leading-none mb-1">99%</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">{t('accuracy')}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-white leading-none mb-1">0.1s</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">{t('latency')}</p>
            </div>
          </div>
        </div>

        {/* Background Atmospheric Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-mesh opacity-30" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
