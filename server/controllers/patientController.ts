import { Request, Response } from 'express';
import Patient from '../models/Patient';
import User from '../models/User';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find().populate('department_id').populate('current_bed_id').lean();
    const patientsWithUser = await Promise.all(patients.map(async (pat: any) => {
      const user = await User.findOne({ role: 'Patient', reference_id: pat.patient_id });
      return { ...pat, user_id: user?._id };
    }));
    res.json(patientsWithUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    
    req.app.get('io')?.emit('patient_updated');
    
    res.status(201).json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    req.app.get('io')?.emit('patient_updated');
    
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    
    req.app.get('io')?.emit('patient_updated');
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientByUserId = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Patient') {
      return res.status(404).json({ error: 'Patient user not found' });
    }
    const patient = await Patient.findOne({ patient_id: user.reference_id })
      .populate('department_id')
      .populate('current_bed_id');
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
