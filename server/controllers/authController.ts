import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';

const JWT_SECRET = process.env.JWT_SECRET || 'medflow-secret-key-2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, fullName, gender, age, address, phone, patientType, doctorType, department_id, specialization } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already exists' });
    }

    const reference_id = `${role.toUpperCase()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const user = new User({ 
      username, 
      email, 
      password, 
      role, 
      reference_id, 
      fullName, 
      gender, 
      age, 
      address, 
      phone, 
      patientType, 
      doctorType,
      department_id,
      status: 'Pending' // New users must be approved by admin
    });
    await user.save();

    req.app.get('io')?.emit('new_activity', {
      user: username,
      action: `New ${role} registration`,
      time: new Date().toLocaleTimeString(),
      icon: role === 'Patient' ? 'Users' : 'Shield',
      color: 'green'
    });

    // Create corresponding profile
    if (role === 'Patient') {
      const patient = new Patient({
        patient_id: reference_id,
        name: fullName,
        age: parseInt(age),
        gender,
        contact: phone,
        type: patientType || 'Outpatient',
        department_id
      });
      await patient.save();
    } else if (role === 'Doctor') {
      const doctor = new Doctor({
        doctor_id: reference_id,
        name: fullName,
        age: parseInt(age),
        gender,
        contact: phone,
        specialization: specialization || doctorType || 'General',
        department_id
      });
      await doctor.save();
    }

    res.status(201).json({ message: 'Registration successful. Your account is pending admin approval.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);
    // Allow login with either username or email
    const user: any = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
    }
    if (user.status !== 'Approved') {
      return res.status(403).json({ error: `Your account is ${user.status.toLowerCase()}. Please contact admin.` });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    req.app.get('io')?.emit('new_activity', {
      user: user.username,
      action: 'User logged in',
      time: new Date().toLocaleTimeString(),
      icon: 'Zap',
      color: 'yellow'
    });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role, email: user.email, fullName: user.fullName } });
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
    const users = await User.find().select('-password').populate('department_id');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, status, department_id } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already exists' });
    }
    const user = new User({ username, email, password, role, status: status || 'Approved', department_id });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role, status, password, department_id } = req.body;
    const updateData: any = { username, email, role, status, department_id };
    if (password) {
      const user: any = await User.findById(id);
      user.password = password;
      user.username = username;
      user.email = email;
      user.role = role;
      user.status = status;
      user.department_id = department_id;
      await user.save();
      return res.json({ message: 'User updated successfully (including password)' });
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
    const { action } = req.body; // 'deactivate' or 'delete'
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
    const { status } = req.body; // 'approved' or 'rejected'
    const user: any = await User.findById(id);
    
    if (status === 'approved') {
      if (user.account_request === 'delete') {
        await User.findByIdAndDelete(id);
        return res.json({ message: 'User deleted as requested' });
      } else if (user.account_request === 'deactivate') {
        await User.findByIdAndUpdate(id, { 
          status: 'Rejected', // Deactivated users are set to Rejected status
          account_request: 'none',
          account_request_status: 'approved'
        });
        return res.json({ message: 'User deactivated as requested' });
      }
    } else {
      await User.findByIdAndUpdate(id, { 
        account_request: 'none',
        account_request_status: 'rejected'
      });
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
    const doctor: any = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const existingRatingIndex = doctor.ratings.findIndex((r: any) => r.raterId.toString() === req.user.id);
    if (existingRatingIndex > -1) {
      doctor.ratings[existingRatingIndex] = { raterId: req.user.id, rating, comment, createdAt: new Date() };
    } else {
      doctor.ratings.push({ raterId: req.user.id, rating, comment, createdAt: new Date() });
    }

    const totalRating = doctor.ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    doctor.averageRating = totalRating / doctor.ratings.length;
    
    await doctor.save();
    res.json({ message: 'Rating submitted successfully', averageRating: doctor.averageRating });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { fullName, gender, age, address, phone, patientType, doctorType, password, username, email } = req.body;
    const user: any = await User.findById(req.user.id);
    
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (age) user.age = age;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (patientType) user.patientType = patientType;
    if (doctorType) user.doctorType = doctorType;
    
    if (password) {
      user.password = password;
    }
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, username: user.username, role: user.role, email: user.email, fullName: user.fullName } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQrToken = async (req: any, res: Response) => {
  try {
    const user: any = await User.findById(req.user.id);
    if (!user.qrLoginToken) {
      user.qrLoginToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
      await user.save();
    }
    res.json({ qrLoginToken: user.qrLoginToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const qrLogin = async (req: Request, res: Response) => {
  try {
    const { qrLoginToken } = req.body;
    const user: any = await User.findOne({ qrLoginToken });
    if (!user) {
      return res.status(401).json({ error: 'Invalid QR code' });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }
    if (user.status !== 'Approved') {
      return res.status(403).json({ error: `Your account is ${user.status.toLowerCase()}.` });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    req.app.get('io')?.emit('new_activity', {
      user: user.username,
      action: 'User logged in via QR',
      time: new Date().toLocaleTimeString(),
      icon: 'Zap',
      color: 'blue'
    });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role, email: user.email, fullName: user.fullName } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
