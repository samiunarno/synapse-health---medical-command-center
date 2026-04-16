import { Request, Response } from 'express';
import LabAppointment from '../models/LabAppointment';

export const bookLabAppointment = async (req: any, res: Response) => {
  try {
    const { test_type, appointment_date, price } = req.body;
    const appointment = new LabAppointment({
      patient_id: req.user.id,
      test_type,
      appointment_date,
      price
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyLabAppointments = async (req: any, res: Response) => {
  try {
    const appointments = await LabAppointment.find({ patient_id: req.user.id }).sort({ appointment_date: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLabAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await LabAppointment.find().populate('patient_id', 'fullName email').sort({ appointment_date: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLabAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const appointment = await LabAppointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
