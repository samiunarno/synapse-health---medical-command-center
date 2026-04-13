import { Request, Response } from 'express';
import Ward from '../models/Ward';
import Bed from '../models/Bed';

export const getWards = async (req: Request, res: Response) => {
  try {
    const wards = await Ward.find().populate('associated_department_id');
    res.json(wards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createWard = async (req: Request, res: Response) => {
  try {
    const ward = new Ward(req.body);
    await ward.save();
    res.status(201).json(ward);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBed = async (req: Request, res: Response) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWardBedStats = async (req: Request, res: Response) => {
  try {
    const wards = await Ward.find().populate('associated_department_id');
    const stats = await Promise.all(wards.map(async (ward) => {
      const beds = await Bed.find({ ward_id: ward._id });
      const counts = {
        Available: beds.filter(b => b.status === 'Available').length,
        Occupied: beds.filter(b => b.status === 'Occupied').length,
        Maintenance: beds.filter(b => b.status === 'Maintenance').length
      };
      return {
        wardId: ward._id,
        wardName: ward.name,
        wardType: ward.type,
        department: (ward.associated_department_id as any)?.name || 'General',
        counts
      };
    }));
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
