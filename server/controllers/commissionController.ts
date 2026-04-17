import { Request, Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Pharmacy from '../models/Pharmacy';
import Hospital from '../models/Hospital';
import Lab from '../models/Lab';

const getModelByRole = (role: string) => {
  switch (role) {
    case 'Doctor': return Doctor;
    case 'Pharmacy': return Pharmacy;
    case 'Hospital': return Hospital;
    case 'Lab': return Lab;
    default: return null;
  }
};

const getRefIdFieldByRole = (role: string) => {
  switch (role) {
    case 'Doctor': return 'doctor_id';
    case 'Pharmacy': return 'pharmacy_id';
    case 'Hospital': return 'hospital_id';
    case 'Lab': return 'lab_id';
    default: return null;
  }
};

export const getCommissions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const Model = getModelByRole(user.role);
    const refField = getRefIdFieldByRole(user.role);

    if (!Model || !refField) {
      return res.status(400).json({ error: 'Role not supported for commissions' });
    }

    const profile = await (Model as any).findOne({ [refField]: user.reference_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    res.json({
      commissionBalance: profile.commissionBalance || 0,
      totalSales: profile.totalSales || 0
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

    const Model = getModelByRole(user.role);
    const refField = getRefIdFieldByRole(user.role);

    if (!Model || !refField) {
      return res.status(400).json({ error: 'Role not supported for commissions' });
    }

    const profile = await (Model as any).findOne({ [refField]: user.reference_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    if ((profile.commissionBalance || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient commission balance' });
    }

    profile.commissionBalance = (profile.commissionBalance || 0) - amount;
    await profile.save();

    // Deposit into User balance
    const userProfile = await User.findById(user.id);
    if (userProfile) {
      userProfile.balance = (userProfile.balance || 0) + amount;
      await userProfile.save();
    }
    
    res.json({ 
      message: 'Withdrawal to wallet successful', 
      newCommissionBalance: profile.commissionBalance,
      newWalletBalance: userProfile?.balance || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
