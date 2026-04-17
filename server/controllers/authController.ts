import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import Hospital from '../models/Hospital';
import Pharmacy from '../models/Pharmacy';
import Lab from '../models/Lab';


export const register = async (req: Request, res: Response) => {
  try {
    const { 
      username, email, password, role, fullName, gender, age, address, phone, 
      patientType, doctorType, department_id, specialization,
      registration_number, license_number, accreditation_number, capacity
    } = req.body;
    
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const reference_id = `${role.toUpperCase()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const user = await User.create({
      username,
      email,
      password,
      role,
      reference_id,
      fullName,
      gender,
      age: age ? parseInt(age) : undefined,
      address,
      phone,
      patientType,
      doctorType: role === 'Doctor' ? (specialization || doctorType) : undefined,
      department_id,
      status: 'Pending'
    });

    if (role === 'Patient') {
      await Patient.create({
        patient_id: reference_id,
        name: fullName,
        age: parseInt(age),
        gender,
        contact: phone,
        type: patientType || 'Outpatient',
        department_id
      });
    } else if (role === 'Doctor') {
      await Doctor.create({
        doctor_id: reference_id,
        name: fullName,
        age: parseInt(age),
        gender,
        contact: phone,
        specialization: specialization || doctorType || 'General',
        department_id
      });
    } else if (role === 'Hospital') {
      await Hospital.create({
        hospital_id: reference_id,
        name: fullName,
        address,
        contact: phone,
        registration_number: registration_number || 'HOSP-REG-PENDING',
        capacity: capacity ? parseInt(capacity) : 0
      });
    } else if (role === 'Pharmacy') {
      await Pharmacy.create({
        pharmacy_id: reference_id,
        name: fullName,
        address,
        contact: phone,
        license_number: license_number || 'PHARM-LIC-PENDING'
      });
    } else if (role === 'Lab') {
      await Lab.create({
        lab_id: reference_id,
        name: fullName,
        address,
        contact: phone,
        accreditation_number: accreditation_number || 'LAB-ACC-PENDING'
      });
    }

    res.status(201).json({ 
      message: 'Registration successful. Your account is pending admin approval.',
      token: generateToken(user._id.toString(), user.role),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (user.isBanned) {
        return res.status(403).json({ error: 'Your account has been banned.' });
      }

      res.json({
        token: generateToken(user._id.toString(), user.role),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          fullName: user.fullName,
          reference_id: user.reference_id
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ status: 'Pending' });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await User.findByIdAndUpdate(id, { status });
    res.json({ message: `User ${status.toLowerCase()} successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, status, department_id, fullName } = req.body;
    
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    await User.create({
      username,
      email,
      password,
      role,
      status: status || 'Approved',
      department_id,
      fullName
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role, status, password, department_id, fullName } = req.body;
    
    const updateData: any = { username, email, role, status, department_id, fullName };
    
    if (password) {
      const user = await User.findById(id);
      if (user) {
        user.password = password;
        await user.save();
      }
    }

    await User.findByIdAndUpdate(id, updateData);
    res.json({ message: 'User updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadIdCard = async (req: any, res: Response) => {
  try {
    const { id_card_url } = req.body;
    await User.findByIdAndUpdate(req.user.id, { 
      id_card_url, 
      id_card_uploaded_at: new Date() 
    });
    res.json({ message: 'ID Card uploaded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestAccountAction = async (req: any, res: Response) => {
  try {
    const { action } = req.body;
    await User.findByIdAndUpdate(req.user.id, { 
      account_request: action,
      account_request_status: 'pending'
    });
    res.json({ message: `Account ${action} request submitted to admin` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleAccountRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findById(id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (status === 'approved') {
      if (user.account_request === 'delete') {
        await User.findByIdAndDelete(id);
        return res.json({ message: 'User deleted as requested' });
      } else if (user.account_request === 'deactivate') {
        user.status = 'Rejected';
        user.account_request = 'none';
        user.account_request_status = 'approved';
        await user.save();
        return res.json({ message: 'User deactivated as requested' });
      }
    } else {
      user.account_request = 'none';
      user.account_request_status = 'rejected';
      await user.save();
      res.json({ message: 'Account request rejected' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    await User.findByIdAndUpdate(id, { isBanned });
    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'} successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rateDoctor = async (req: any, res: Response) => {
  try {
    const { doctorId, rating, comment } = req.body;
    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const ratings = doctor.ratings || [];
    const existingRatingIndex = ratings.findIndex((r: any) => r.raterId.toString() === req.user.id);
    
    const newRating = { raterId: req.user.id, rating, comment, createdAt: new Date() };
    
    if (existingRatingIndex > -1) {
      ratings[existingRatingIndex] = newRating;
    } else {
      ratings.push(newRating);
    }

    const totalRating = ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    const averageRating = totalRating / ratings.length;
    
    doctor.ratings = ratings;
    doctor.averageRating = averageRating;
    await doctor.save();

    res.json({ message: 'Rating submitted successfully', averageRating });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { fullName, gender, age, address, phone, patientType, doctorType, password, username, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (age) user.age = age;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (patientType) user.patientType = patientType;
    if (doctorType) user.doctorType = doctorType;
    if (username) user.username = username;

    if (email && email !== user.email) {
      user.email = email;
    }
    
    if (password) {
      user.password = password;
    }
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQrToken = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let qrLoginToken = user.qrLoginToken;
    if (!qrLoginToken) {
      qrLoginToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
      user.qrLoginToken = qrLoginToken;
      await user.save();
    }
    res.json({ qrLoginToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.fullName,
        reference_id: user.reference_id,
        gender: user.gender,
        age: user.age,
        address: user.address,
        phone: user.phone,
        patientType: user.patientType,
        doctorType: user.doctorType
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const qrLogin = async (req: Request, res: Response) => {
  try {
    const { qrLoginToken } = req.body;
    const user = await User.findOne({ qrLoginToken });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid QR code' });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }
    if (user.status !== 'Approved' && user.role !== 'Admin') {
      return res.status(403).json({ error: `Your account is ${user.status.toLowerCase()}.` });
    }
    
    res.json({ 
      token: generateToken(user._id.toString(), user.role), 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.fullName,
        reference_id: user.reference_id
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
