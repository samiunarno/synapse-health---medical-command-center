import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { date, time } = req.query;
    if (!date || !time) return res.status(400).json({ error: 'Date and time required' });
    
    // Find appointments that match this date and time
    const bookedAppointments = await Appointment.find({ date, time, status: { $ne: 'Cancelled' } }).select('doctor_id');
    const bookedDoctorIds = bookedAppointments.map(a => a.doctor_id.toString());
    
    res.json({ bookedDoctorIds });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctor_id, date, time, type, fee } = req.body;
    const patient_id = (req as any).user.userId;

    const appointment = new Appointment({
      patient_id,
      doctor_id,
      date,
      time,
      type,
      fee,
      platform_fee: fee * 0.1 // 10% platform fee
    });

    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name email');
      
    req.app.get('io')?.emit('appointment_created', populatedAppointment);
    
    res.status(201).json(populatedAppointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;

    let query = {};
    if (role === 'Patient') {
      query = { patient_id: userId };
    } else if (role === 'Doctor') {
      query = { doctor_id: userId };
    }

    const appointments = await Appointment.find(query)
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name email')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const payAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { method } = req.body; // Alipay or WeChat

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Simulate payment processing
    appointment.payment_status = 'Held';
    appointment.payment_method = method;
    appointment.status = 'Confirmed';
    
    // Generate meeting link if virtual
    if (appointment.type === 'Virtual') {
      appointment.meeting_link = `https://meet.synapse.health/${appointment._id}`;
    }

    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name email');
      
    req.app.get('io')?.emit('appointment_updated', populatedAppointment);
    
    res.json(populatedAppointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markDone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = (req as any).user.role;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (role === 'Doctor') {
      appointment.doctor_done = true;
    } else if (role === 'Patient') {
      appointment.patient_done = true;
    }

    // If both are done, release payment
    if (appointment.doctor_done && appointment.patient_done) {
      appointment.status = 'Completed';
      appointment.payment_status = 'Released';
      // Here you would trigger actual payout to doctor
    }

    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name email');
      
    req.app.get('io')?.emit('appointment_updated', populatedAppointment);
    
    res.json(populatedAppointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
