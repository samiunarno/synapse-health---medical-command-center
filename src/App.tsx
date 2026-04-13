import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import { SocketProvider } from './components/SocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Pharmacy from './pages/Pharmacy';
import Wards from './pages/Wards';
import Analytics from './pages/Analytics';
import MedicalRecords from './pages/MedicalRecords';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Appointments from './pages/Appointments';
import Search from './pages/Search';
import VideoConference from './pages/VideoConference';
import Tasks from './pages/Tasks';
import MapTracking from './pages/MapTracking';
import Billing from './pages/Billing';
import IoTDevices from './pages/IoTDevices';
import AmbulanceService from './pages/AmbulanceService';
import PrescriptionAI from './pages/PrescriptionAI';
import HealthAI from './pages/HealthAI';
import Wearables from './pages/Wearables';
import BloodHub from './pages/BloodHub';
import SymptomChecker from './pages/SymptomChecker';
import VaccinationTracker from './pages/VaccinationTracker';
import TeleHealth from './pages/TeleHealth';
import Prescriptions from './pages/Prescriptions';
import LabReportInterpreter from './pages/LabReportInterpreter';
import DigitalHealthID from './pages/DigitalHealthID';
import MedicineInventory from './pages/MedicineInventory';
import AppointmentOptimizer from './pages/AppointmentOptimizer';
import OrganDonation from './pages/OrganDonation';
import AIChatbot from './pages/AIChatbot';
import Ecommerce from './pages/Ecommerce';
import AdminProducts from './pages/AdminProducts';
import Presentation from './pages/Presentation';
import SourcingSolutions from './pages/SourcingSolutions';
import ServicesMembership from './pages/ServicesMembership';
import HelpCenter from './pages/HelpCenter';
import Chatbot from './components/Chatbot';
import SOSButton from './components/SOSButton';

import ErrorBoundary from './components/ErrorBoundary';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
            <Chatbot />
            <SOSButton />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="/sourcing-solutions" element={<SourcingSolutions />} />
              <Route path="/services-membership" element={<ServicesMembership />} />
              <Route path="/help-center" element={<HelpCenter />} />
              
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/patients" element={<PrivateRoute roles={['Admin', 'Doctor', 'Staff']}><Patients /></PrivateRoute>} />
              <Route path="/doctors" element={<PrivateRoute roles={['Admin', 'Staff']}><Doctors /></PrivateRoute>} />
              <Route path="/wards" element={<PrivateRoute roles={['Admin', 'Staff']}><Wards /></PrivateRoute>} />
              <Route path="/pharmacy" element={<PrivateRoute roles={['Admin', 'Staff', 'Doctor', 'Pharmacist', 'Patient']}><Pharmacy /></PrivateRoute>} />
              <Route path="/records" element={<PrivateRoute roles={['Admin', 'Doctor', 'Patient', 'Pharmacist']}><MedicalRecords /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute roles={['Admin']}><Analytics /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute roles={['Admin']}><UserManagement /></PrivateRoute>} />
              <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
              <Route path="/video-conference" element={<PrivateRoute><VideoConference /></PrivateRoute>} />
              <Route path="/tasks" element={<PrivateRoute roles={['Admin', 'Doctor', 'Staff']}><Tasks /></PrivateRoute>} />
              <Route path="/map" element={<PrivateRoute><MapTracking /></PrivateRoute>} />
              <Route path="/bridge" element={<PrivateRoute><Billing /></PrivateRoute>} />
              <Route path="/iot" element={<PrivateRoute roles={['Admin', 'Doctor', 'Staff']}><IoTDevices /></PrivateRoute>} />
              <Route path="/ambulance" element={<PrivateRoute roles={['Patient', 'Admin', 'Staff']}><AmbulanceService /></PrivateRoute>} />
              <Route path="/prescription-ai" element={<PrivateRoute roles={['Patient', 'Admin', 'Doctor']}><PrescriptionAI /></PrivateRoute>} />
              <Route path="/health-ai" element={<PrivateRoute roles={['Patient', 'Admin', 'Doctor']}><HealthAI /></PrivateRoute>} />
              <Route path="/wearables" element={<PrivateRoute roles={['Patient', 'Admin', 'Doctor']}><Wearables /></PrivateRoute>} />
              <Route path="/blood-hub" element={<PrivateRoute><BloodHub /></PrivateRoute>} />
              <Route path="/symptoms" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
              <Route path="/vaccinations" element={<PrivateRoute><VaccinationTracker /></PrivateRoute>} />
              <Route path="/tele-health" element={<PrivateRoute><TeleHealth /></PrivateRoute>} />
              <Route path="/prescriptions" element={<PrivateRoute><Prescriptions /></PrivateRoute>} />
              <Route path="/lab-interpreter" element={<PrivateRoute><LabReportInterpreter /></PrivateRoute>} />
              <Route path="/health-id" element={<PrivateRoute><DigitalHealthID /></PrivateRoute>} />
              <Route path="/medicine-inventory" element={<PrivateRoute><MedicineInventory /></PrivateRoute>} />
              <Route path="/appointment-optimizer" element={<PrivateRoute><AppointmentOptimizer /></PrivateRoute>} />
              <Route path="/organ-donation" element={<PrivateRoute><OrganDonation /></PrivateRoute>} />
              <Route path="/ai-chatbot" element={<PrivateRoute><AIChatbot /></PrivateRoute>} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/admin/products" element={<PrivateRoute roles={['Admin']}><AdminProducts /></PrivateRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
}
