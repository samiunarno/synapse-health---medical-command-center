import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Users,
  Shield, 
  Trash2, 
  LogOut, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save
} from 'lucide-react';
import { motion } from 'motion/react';

import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
  const { user, token, logout, setUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
    patientType: user?.patientType || '',
    doctorType: user?.doctorType || '',
    emergencyContacts: user?.emergencyContacts || []
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
        setUser({ ...user, ...data.user });
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Connection failed' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload
    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/upload-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id_card_url: 'https://picsum.photos/seed/id/800/500' })
        });
        if (res.ok) {
          setUploadSuccess(true);
        }
      } catch (err) {
        console.error('Upload failed');
      } finally {
        setIsUploading(false);
      }
    }, 1500);
  };

  const handleAccountRequest = async (action: 'deactivate' | 'delete') => {
    if (!window.confirm(`Are you sure you want to request account ${action}?`)) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/request-account-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setRequestStatus(`Your ${action} request has been sent to the admin.`);
      }
    } catch (err) {
      console.error('Request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">{t('settings_title')}</h1>
            <p className="text-gray-500 font-medium">{t('settings_desc')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/5 rounded-[2rem] p-8 text-center">
            <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center text-blue-400 text-4xl font-display font-bold mx-auto mb-6">
              {user?.username[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.username}</h2>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-6">{user?.role}</p>
            <div className="pt-6 border-t border-white/5">
              <span className="text-[10px] font-bold px-4 py-2 bg-green-500/10 text-green-400 rounded-full uppercase tracking-widest">
                Active Session
              </span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-6 bg-red-600/5 border border-red-500/10 rounded-2xl text-red-400 hover:bg-red-600 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-widest">Logout</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        </div>

        {/* Main Settings */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Information Section */}
          <section className="bg-white/2 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Profile Information</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Update your personal and professional details.</p>
              </div>
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div className="p-8">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {profileMessage && (
                  <div className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-widest border ${
                    profileMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {profileMessage.text}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="YOUR FULL NAME"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="USERNAME"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="EMAIL@EXAMPLE.COM"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Age</label>
                    <input
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="Male" className="bg-[#0a0a0a]">MALE</option>
                      <option value="Female" className="bg-[#0a0a0a]">FEMALE</option>
                      <option value="Other" className="bg-[#0a0a0a]">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="YOUR RESIDENTIAL ADDRESS"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-4">New Password (Leave blank to keep current)</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="password"
                        value={profileData.password}
                        onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-800"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSavingProfile ? 'Saving Changes...' : 'Update Profile Information'}
                </button>
              </form>
            </div>
          </section>

          {/* Emergency Contacts Section */}
          <section className="bg-white/2 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Emergency Contacts</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Family members or friends to notify in case of SOS.</p>
              </div>
              <Users className="w-6 h-6 text-red-400" />
            </div>
            <div className="p-8 space-y-6">
              {profileData.emergencyContacts.map((contact: any, index: number) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group">
                  <button 
                    type="button"
                    onClick={() => {
                      const newContacts = [...profileData.emergencyContacts];
                      newContacts.splice(index, 1);
                      setProfileData({ ...profileData, emergencyContacts: newContacts });
                    }}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-2">Name</label>
                      <input 
                        type="text"
                        value={contact.name}
                        onChange={(e) => {
                          const newContacts = [...profileData.emergencyContacts];
                          newContacts[index].name = e.target.value;
                          setProfileData({ ...profileData, emergencyContacts: newContacts });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none"
                        placeholder="Contact Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-2">Phone</label>
                      <input 
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => {
                          const newContacts = [...profileData.emergencyContacts];
                          newContacts[index].phone = e.target.value;
                          setProfileData({ ...profileData, emergencyContacts: newContacts });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-2">Relation</label>
                      <input 
                        type="text"
                        value={contact.relation}
                        onChange={(e) => {
                          const newContacts = [...profileData.emergencyContacts];
                          newContacts[index].relation = e.target.value;
                          setProfileData({ ...profileData, emergencyContacts: newContacts });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none"
                        placeholder="e.g. Brother, Parent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-2">Email (Optional)</label>
                      <input 
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          const newContacts = [...profileData.emergencyContacts];
                          newContacts[index].email = e.target.value;
                          setProfileData({ ...profileData, emergencyContacts: newContacts });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => {
                  setProfileData({
                    ...profileData,
                    emergencyContacts: [...profileData.emergencyContacts, { name: '', phone: '', relation: '', email: '' }]
                  });
                }}
                className="w-full py-4 bg-white/5 border border-white/10 border-dashed rounded-2xl text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" /> Add Emergency Contact
              </button>
            </div>
          </section>

          {/* Admin Tools Section */}
          {user?.role === 'Admin' && (
            <section className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[2rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Administrative Tools</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Manage system-wide user access and roles.</p>
                </div>
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="p-8">
                <a 
                  href="/users"
                  className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-sm uppercase tracking-widest">User Management Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </section>
          )}

          {/* ID Verification Section */}
          <section className="bg-white/2 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Identity Verification</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Required for all service providers to ensure system security.</p>
              </div>
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div className="p-8 space-y-6">
              {user?.status === 'Approved' ? (
                <div className="flex items-center gap-4 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Verified Account</p>
                    <p className="text-xs text-gray-500">Your identity has been verified by Synapse Health Administration.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-orange-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {user?.status === 'Banned' ? 'Account Restricted' : 'Action Required'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {user?.status === 'Banned' 
                      ? 'Your account has been restricted due to missing or invalid documentation. Please upload valid documents immediately.' 
                      : 'Please upload a clear photo of your Professional License, Passport, or National ID card. This is required for administrative verification.'}
                  </p>
                  
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer group">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-gray-600 group-hover:text-blue-400 transition-colors" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Click to upload Credentials</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        const formData = new FormData();
                        formData.append('document', file);
                        formData.append('type', 'Professional License');
                        
                        try {
                          const res = await fetch('/api/verification/upload', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                          });
                          if (res.ok) {
                            setUploadSuccess(true);
                            setProfileMessage({ type: 'success', text: 'Document uploaded. AI analysis is in progress.' });
                          }
                        } catch (err) {
                          setProfileMessage({ type: 'error', text: 'Upload failed' });
                        } finally {
                          setIsUploading(false);
                        }
                      }} 
                      disabled={isUploading} 
                    />
                  </label>

                  {uploadSuccess && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center">
                        Document submitted. Admin will review the AI report shortly.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Account Actions Section */}
          <section className="bg-white/2 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Account Management</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Deactivate or permanently delete your account.</p>
            </div>
            <div className="p-8 space-y-6">
              {requestStatus ? (
                <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-bold text-center uppercase tracking-widest">
                  {requestStatus}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleAccountRequest('deactivate')}
                    disabled={isSubmitting}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Deactivate</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Temporarily disable your account access.</p>
                  </button>

                  <button 
                    onClick={() => handleAccountRequest('delete')}
                    disabled={isSubmitting}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-red-600/10 hover:border-red-500/20 transition-all group"
                  >
                    <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Delete Account</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Permanently remove all your data from Synapse Health.</p>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
