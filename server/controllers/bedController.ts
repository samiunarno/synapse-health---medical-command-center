import { Request, Response } from 'express';
import Bed from '../models/Bed';
import Patient from '../models/Patient';

export const getBeds = async (req: Request, res: Response) => {
  try {
    const beds = await Bed.find().populate('ward_id').populate('patient_id');
    res.json(beds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignBed = async (req: Request, res: Response) => {
  try {
    const { bedId, patientId } = req.body;
    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== 'Available') {
      return res.status(400).json({ error: 'Bed not available' });
    }
    await Bed.findByIdAndUpdate(bedId, { status: 'Occupied', patient_id: patientId });
    await Patient.findByIdAndUpdate(patientId, { current_bed_id: bedId, type: 'Inpatient', admission_date: new Date() });
    
    req.app.get('io')?.emit('bed_updated');
    
    res.json({ message: 'Bed assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const dischargePatient = async (req: Request, res: Response) => {
  try {
    const { bedId } = req.body;
    const bed: any = await Bed.findById(bedId);
    if (bed && bed.patient_id) {
      await Patient.findByIdAndUpdate(bed.patient_id, { current_bed_id: null, discharge_date: new Date() });
      await Bed.findByIdAndUpdate(bedId, { status: 'Available', patient_id: null });
    }
    
    req.app.get('io')?.emit('bed_updated');
    
    res.json({ message: 'Patient discharged and bed freed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reassignBed = async (req: Request, res: Response) => {
  try {
    const { oldBedId, newBedId, patientId } = req.body;
    
    // 1. Verify new bed is available
    const newBed = await Bed.findById(newBedId);
    if (!newBed || newBed.status !== 'Available') {
      return res.status(400).json({ error: 'New bed is not available' });
    }

    // 2. Clear old bed
    await Bed.findByIdAndUpdate(oldBedId, { status: 'Available', patient_id: null });

    // 3. Update new bed
    await Bed.findByIdAndUpdate(newBedId, { status: 'Occupied', patient_id: patientId });

    // 4. Update patient record
    await Patient.findByIdAndUpdate(patientId, { current_bed_id: newBedId });

    req.app.get('io')?.emit('bed_updated');

    res.json({ message: 'Patient re-assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
