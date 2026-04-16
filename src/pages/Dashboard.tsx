import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import DoctorDashboard from '../components/dashboards/DoctorDashboard';
import PatientDashboard from '../components/dashboards/PatientDashboard';
import StaffDashboard from '../components/dashboards/StaffDashboard';
import DriverDashboard from '../components/dashboards/DriverDashboard';
import RiderDashboard from '../components/dashboards/RiderDashboard';
import HospitalDashboard from '../components/dashboards/HospitalDashboard';
import PharmacyDashboard from '../components/dashboards/PharmacyDashboard';
import LabDashboard from './LabDashboard';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>([]);
  const [pendingUsers, setPendingUsers] = useState<any>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any>([]);
  const [predictiveData, setPredictiveData] = useState<any>([]);
  const [systemMonitor, setSystemMonitor] = useState<any>(null);
  const [activityStream, setActivityStream] = useState<any>([]);
  const [systemInsights, setSystemInsights] = useState<any>([]);
  const [iotDevices, setIotDevices] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'Staff') {
      fetchAdminData();
      
      const socket = io(window.location.origin);
      socket.on('new_activity', (activity) => {
        setActivityStream((prev: any) => [activity, ...prev].slice(0, 10));
      });
      
      return () => {
        socket.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const promises: any[] = [
        fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/inpatient-trends', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/predictive-data', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/system-monitor', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/activity-stream', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/system-insights', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/iot', { headers: { Authorization: `Bearer ${token}` } })
      ];

      if (user?.role === 'Admin') {
        promises.push(fetch('/api/admin/pending-users', { headers: { Authorization: `Bearer ${token}` } }));
        promises.push(fetch('/api/verification/admin/pending', { headers: { Authorization: `Bearer ${token}` } }));
      }

      const results = await Promise.all(promises);
      
      const safeJson = async (res: Response) => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`API Error (${res.status}):`, text.substring(0, 200));
          return null;
        }
        try {
          return await res.json();
        } catch (e) {
          const text = await res.text();
          console.error('Failed to parse JSON. Response was:', text.substring(0, 200));
          return null;
        }
      };

      const statsData = await safeJson(results[0]);
      if (statsData) setStats(statsData);

      const trendsData = await safeJson(results[1]);
      if (trendsData) setTrends(trendsData);

      const predictiveData = await safeJson(results[2]);
      if (predictiveData) setPredictiveData(predictiveData);

      const systemMonitorData = await safeJson(results[3]);
      if (systemMonitorData) setSystemMonitor(systemMonitorData);

      const activityStreamData = await safeJson(results[4]);
      if (activityStreamData) setActivityStream(activityStreamData);

      const systemInsightsData = await safeJson(results[5]);
      if (systemInsightsData) setSystemInsights(systemInsightsData);

      const iotDevicesData = await safeJson(results[6]);
      if (iotDevicesData) setIotDevices(iotDevicesData);
      
      if (user?.role === 'Admin' && results[7]) {
        const pendingData = await safeJson(results[7]);
        setPendingUsers(Array.isArray(pendingData) ? pendingData : []);
      }
      if (user?.role === 'Admin' && results[8]) {
        const verificationData = await safeJson(results[8]);
        setPendingVerifications(Array.isArray(verificationData) ? verificationData : []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setTrends([]);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/approve-user/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPendingUsers(pendingUsers.filter((u: any) => u._id !== id));
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleVerify = async (id: string, status: 'Approved' | 'Rejected' | 'Banned', reason?: string) => {
    try {
      const res = await fetch(`/api/verification/verify/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        setPendingVerifications(pendingVerifications.filter((v: any) => v._id !== id));
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  switch (user?.role) {
    case 'Admin':
      return (
        <AdminDashboard 
          stats={stats} 
          trends={trends} 
          pendingUsers={pendingUsers} 
          pendingVerifications={pendingVerifications}
          predictiveData={predictiveData}
          systemMonitor={systemMonitor}
          activityStream={activityStream}
          systemInsights={systemInsights}
          iotDevices={iotDevices}
          onApprove={handleApprove} 
          onVerify={handleVerify}
        />
      );
    case 'Doctor':
      return <DoctorDashboard user={user} />;
    case 'Patient':
      return <PatientDashboard user={user} />;
    case 'Staff':
    case 'Pharmacist':
      return <StaffDashboard user={user} stats={stats} activityStream={activityStream} />;
    case 'Lab':
    case 'LabTechnician':
      return <LabDashboard />;
    default:
      return (
        <div className="bg-black/5 dark:bg-white/2 p-12 rounded-[3rem] text-center border border-black/10 dark:border-white/5">
          <h2 className="text-3xl font-display font-bold text-[#111111] dark:text-white mb-4">{t('welcome_synapse')}</h2>
          <p className="text-black/60 dark:text-gray-500 max-w-md mx-auto font-medium">
            {t('account_review_desc')}
          </p>
        </div>
      );
  }
}
