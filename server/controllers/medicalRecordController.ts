import { Request, Response } from 'express';
import MedicalRecord from '../models/MedicalRecord';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import { blockchainService } from '../services/blockchainService';

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patient_id')
      .populate('doctor_id')
      .sort({ date: -1 });
    
    const formattedRecords = records.map((r: any) => ({
      id: r._id,
      patient_id: r.patient_id?._id,
      doctor_id: r.doctor_id?._id,
      patient_name: r.patient_id?.name || 'Unknown',
      doctor_name: r.doctor_id?.name || 'Unknown',
      type: r.type,
      date: r.date,
      details: r.details,
      blockchain_hash: r.blockchain_hash,
      blockchain_tx: r.blockchain_tx
    }));
    
    res.json(formattedRecords);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, type, date, details } = req.body;

    const patient = await Patient.findById(patient_id);
    const doctor = await Doctor.findById(doctor_id);

    const recordData = {
      patient_id,
      doctor_id,
      patient_name: patient?.name || 'Unknown',
      doctor_name: doctor?.name || 'Unknown',
      type,
      date,
      details
    };

    // Secure the record with blockchain
    const ledgerEntry = await blockchainService.addRecordToLedger(recordData);

    const record = new MedicalRecord({
      ...req.body,
      blockchain_hash: ledgerEntry.blockHash,
      blockchain_tx: ledgerEntry.transactionId
    });

    await record.save();
    
    req.app.get('io')?.emit('medical_record_updated');
    
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await MedicalRecord.findByIdAndDelete(id);
    
    req.app.get('io')?.emit('medical_record_updated');
    
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
