import { Request, Response } from 'express';
import IoTDevice from '../models/IoTDevice';
import Patient from '../models/Patient';

export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await IoTDevice.find().populate('patient_id');
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyDevices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    const devices = await IoTDevice.find({ patient_id: patient._id });
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeviceReading = async (req: Request, res: Response) => {
  try {
    const { deviceId, reading, status } = req.body;
    const device = await IoTDevice.findOneAndUpdate(
      { deviceId },
      { lastReading: reading, status },
      { new: true }
    );
    
    if (device && (status === 'Warning' || status === 'Error')) {
      // Emit alert via socket
      req.app.get('io')?.emit('iot_alert', {
        device: device.name,
        type: device.type,
        status,
        location: device.location,
        reading
      });
    }
    
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Simulation helper to populate some devices if none exist
export const seedDevices = async (req: Request, res: Response) => {
  try {
    const count = await IoTDevice.countDocuments();
    if (count > 0) return res.json({ message: 'Devices already exist' });

    const patients = await Patient.find().limit(5);
    
    const devices = [
      { deviceId: 'VM-001', name: 'Heart Rate Monitor', type: 'Vital Monitor', location: 'Room 101', patient_id: patients[0]?._id, lastReading: { hr: 72, spo2: 98 } },
      { deviceId: 'VM-002', name: 'BP Monitor', type: 'Vital Monitor', location: 'Room 102', patient_id: patients[1]?._id, lastReading: { bp: '120/80' } },
      { deviceId: 'RS-001', name: 'Pharmacy Fridge Sensor', type: 'Room Sensor', location: 'Pharmacy', lastReading: { temp: 4.2, humidity: 45 } },
      { deviceId: 'AT-001', name: 'Ventilator-X1', type: 'Asset Tracker', location: 'ICU-A', lastReading: { battery: 85, status: 'In Use' } },
      { deviceId: 'SB-001', name: 'Smart Bed 101', type: 'Smart Bed', location: 'Room 101', patient_id: patients[0]?._id, lastReading: { position: 'Elevated', weight: 75 } },
    ];

    await IoTDevice.insertMany(devices);
    res.json({ message: 'Devices seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
