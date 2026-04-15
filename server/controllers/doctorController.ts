import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import User from '../models/User';
import Patient from '../models/Patient';
import MedicalRecord from '../models/MedicalRecord';
import Task from '../models/Task';
import Appointment from '../models/Appointment';
import Prescription from '../models/Prescription';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find().populate('department_id').lean();
    const doctorsWithUser = await Promise.all(doctors.map(async (doc: any) => {
      const user = await User.findOne({ role: 'Doctor', reference_id: doc.doctor_id });
      return { ...doc, user_id: user?._id };
    }));
    res.json(doctorsWithUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('department_id');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    
    req.app.get('io')?.emit('doctor_updated');
    
    res.status(201).json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('department_id');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    req.app.get('io')?.emit('doctor_updated');
    
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    
    req.app.get('io')?.emit('doctor_updated');
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getApprovedDoctors = async (req: Request, res: Response) => {
  try {
    const approvedDoctors = await User.find({ 
      role: 'Doctor', 
      status: 'Approved', 
      isBanned: false 
    })
    .select('-password')
    .sort({ averageRating: -1, 'ratings.length': -1 }); // Ranking system: sort by average rating
    res.json(approvedDoctors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const doctor = await Doctor.findOne({ doctor_id: user.reference_id }).populate('department_id');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDoctorProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { specialization, contact, department_id } = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { doctor_id: user.reference_id },
      { specialization, contact, department_id },
      { new: true }
    ).populate('department_id');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoctorDashboardData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const doctor = await Doctor.findOne({ doctor_id: user.reference_id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    // Fetch real data from database
    const patientsCount = await Patient.countDocuments({ assigned_doctor: doctor._id });
    const recordsCount = await MedicalRecord.countDocuments({ doctor_id: doctor._id });
    const tasks = await Task.find({ assignedTo: user._id }).sort({ dueDate: 1 }).limit(10);
    
    // Fetch real appointments for the doctor
    const appointmentsData = await Appointment.find({ 
      doctor_id: user._id,
      status: { $in: ['Pending', 'Confirmed'] }
    }).populate('patient_id', 'username').sort({ date: 1, time: 1 }).limit(10);

    const appointments = appointmentsData.map(apt => ({
      patientId: (apt.patient_id as any)._id,
      patient: (apt.patient_id as any).username,
      time: apt.time,
      type: apt.type,
      status: apt.status,
      color: apt.status === 'Confirmed' ? 'green' : 'orange',
      avatar: (apt.patient_id as any).username.substring(0, 2).toUpperCase()
    }));

    // Calculate a more realistic recovery rate based on patients with 'Discharged' status
    const totalAssignedPatients = await Patient.countDocuments({ assigned_doctor: doctor._id });
    const dischargedPatients = await Patient.countDocuments({ 
      assigned_doctor: doctor._id, 
      status: 'Discharged' 
    });
    const recoveryRate = totalAssignedPatients > 0 
      ? Math.round((dischargedPatients / totalAssignedPatients) * 100) 
      : 85; // Default to 85 if no patients yet

    // Fetch real alerts (e.g., critical lab reports for assigned patients)
    const assignedPatientIds = await Patient.find({ assigned_doctor: doctor._id }).distinct('_id');
    const criticalReports = await MedicalRecord.find({
      patient_id: { $in: assignedPatientIds },
      type: 'Lab Report',
      details: /critical|high|low|abnormal/i
    }).limit(5);

    const alerts = criticalReports.map(report => ({
      id: report._id,
      type: 'critical',
      message: `Critical Lab: ${(report as any).title || report.type}`
    }));

    res.json({
      appointments: appointments,
      stats: {
        totalAppointments: appointments.length,
        recoveryRate: recoveryRate,
        patientsCount: patientsCount,
        recordsCount: recordsCount
      },
      alerts: alerts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const doctor = await Doctor.findOne({ doctor_id: user.reference_id });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    const prescription = new Prescription({
      ...req.body,
      doctor_id: doctor._id
    });
    await prescription.save();

    // Create a medical record automatically
    const medicalRecord = new MedicalRecord({
      patient_id: prescription.patient_id,
      doctor_id: doctor._id,
      type: 'Prescription',
      details: `Prescription issued on ${new Date().toLocaleDateString()}. Diagnosis: ${prescription.diagnosis}`,
      date: new Date()
    });
    await medicalRecord.save();

    res.status(201).json(prescription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    const query: any = {};
    if (patientId) query.patient_id = patientId;

    const prescriptions = await Prescription.find(query)
      .populate('doctor_id', 'name specialization')
      .populate('patient_id', 'name')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyPrescriptions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

    const prescriptions = await Prescription.find({ patient_id: patient._id })
      .populate('doctor_id', 'name specialization')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommissions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const doctor = await Doctor.findOne({ doctor_id: user.reference_id });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });
    
    res.json({
      commissionBalance: (doctor as any).commissionBalance || 0,
      totalEarnings: (doctor as any).totalEarnings || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const withdrawCommission = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    const doctor = await Doctor.findOne({ doctor_id: user.reference_id });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });
    
    if (((doctor as any).commissionBalance || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient commission balance' });
    }

    (doctor as any).commissionBalance = ((doctor as any).commissionBalance || 0) - amount;
    await doctor.save();
    
    res.json({ 
      message: 'Withdrawal successful', 
      newBalance: (doctor as any).commissionBalance 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
