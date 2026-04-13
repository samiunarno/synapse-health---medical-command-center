import { Request, Response } from 'express';
import LabReport from '../models/LabReport';
import User from '../models/User';

export const publishReport = async (req: Request, res: Response) => {
  try {
    const { patient_id, test_name, result_details, status, report_url } = req.body;
    const lab_technician_id = (req as any).user.id;

    const report = new LabReport({
      patient_id,
      lab_technician_id,
      test_name,
      result_details,
      status,
      report_url
    });

    await report.save();
    
    req.app.get('io')?.emit('lab_report_updated');
    
    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyReports = async (req: Request, res: Response) => {
  try {
    const patient_id = (req as any).user.id;
    const reports = await LabReport.find({ patient_id })
      .populate('lab_technician_id', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await LabReport.find()
      .populate('patient_id', 'fullName username email')
      .populate('lab_technician_id', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, result_details } = req.body;
    const report = await LabReport.findByIdAndUpdate(id, { status, result_details }, { new: true });
    
    req.app.get('io')?.emit('lab_report_updated');
    
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
