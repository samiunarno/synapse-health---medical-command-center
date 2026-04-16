import { Request, Response } from 'express';
import Patient from '../models/Patient';
import MedicalRecord from '../models/MedicalRecord';
import LabReport from '../models/LabReport';
import { getCDSSInsights } from '../services/aiService';

export const getPatientInsights = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // Fetch patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch medical records
    const medicalRecords = await MedicalRecord.find({ patient_id: patientId }).sort({ date: -1 }).limit(10);

    // Fetch lab reports
    const labReports = await LabReport.find({ patient_id: patientId }).sort({ createdAt: -1 }).limit(5);

    // Get insights from Zhipu AI
    const insights = await getCDSSInsights(patient, medicalRecords, labReports);

    res.json(insights);
  } catch (error) {
    console.error('CDSS Controller Error:', error);
    res.status(500).json({ message: 'Failed to generate clinical insights' });
  }
};
