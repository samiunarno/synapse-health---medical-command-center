import { Request, Response } from 'express';
import Queue from '../models/Queue';
import StaffSchedule from '../models/StaffSchedule';
import Ambulance from '../models/Ambulance';
import Billing from '../models/Billing';
import IoTDevice from '../models/IoTDevice';
import Campaign from '../models/Campaign';
import Patient from '../models/Patient';
import AmbulanceRequest from '../models/AmbulanceRequest';
import BloodDonor from '../models/BloodDonor';
import Vaccination from '../models/Vaccination';
import Bed from '../models/Bed';
import Department from '../models/Department';
import Ward from '../models/Ward';
import LabReport from '../models/LabReport';
import MedicineInventory from '../models/MedicineInventory';
import Expense from '../models/Expense';
import Challenge from '../models/Challenge';
import UserChallenge from '../models/UserChallenge';
import OrganDonor from '../models/OrganDonor';
import { analyzeLabReport } from '../services/aiService';

// Queue Controllers
export const getQueue = async (req: Request, res: Response) => {
  try {
    const queue = await Queue.find({ status: { $in: ['Waiting', 'In Progress'] } })
      .populate('patient_id')
      .populate('department_id')
      .sort({ priority: -1, createdAt: 1 });
    res.json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addToQueue = async (req: Request, res: Response) => {
  try {
    const queueItem = new Queue(req.body);
    await queueItem.save();
    res.status(201).json(queueItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQueueStatus = async (req: Request, res: Response) => {
  try {
    const queueItem = await Queue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(queueItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyQueueStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const myQueueItem = await Queue.findOne({ 
      patient_id: patient._id, 
      status: { $in: ['Waiting', 'In Progress'] } 
    }).populate('department_id');

    if (!myQueueItem) {
      return res.json({ inQueue: false });
    }

    // Calculate position
    const position = await Queue.countDocuments({
      department_id: myQueueItem.department_id,
      status: 'Waiting',
      createdAt: { $lt: myQueueItem.createdAt }
    }) + 1;

    // Get current serving
    const currentServing = await Queue.findOne({
      department_id: myQueueItem.department_id,
      status: 'In Progress'
    }).sort({ updatedAt: -1 });

    res.json({
      inQueue: true,
      position,
      estimatedWait: position * 15, // 15 mins per patient
      currentServing: currentServing ? (currentServing as any).token_number : 'None',
      department: (myQueueItem.department_id as any)?.name || 'General',
      tokenNumber: (myQueueItem as any).token_number
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Staff Schedule Controllers
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await StaffSchedule.find()
      .populate('user_id', 'username fullName role')
      .populate('department_id', 'name');
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = new StaffSchedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Ambulance Controllers
export const getAmbulances = async (req: Request, res: Response) => {
  try {
    const ambulances = await Ambulance.find();
    res.json(ambulances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAmbulanceLocation = async (req: Request, res: Response) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.app.get('io')?.emit('ambulance_updated', ambulance);
    res.json(ambulance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestAmbulance = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { pickup_location, notes, service_type, destination_location } = req.body;
    
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const request = new AmbulanceRequest({
      patient_id: patient._id,
      user_id: user.id,
      pickup_location,
      destination_location,
      notes,
      service_type: service_type || 'Standard'
    });

    await request.save();
    req.app.get('io')?.emit('new_ambulance_request', request);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyAmbulanceRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const requests = await AmbulanceRequest.find({ user_id: user.id })
      .populate('ambulance_id')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAmbulanceRequests = async (req: Request, res: Response) => {
  try {
    const requests = await AmbulanceRequest.find()
      .populate('patient_id')
      .populate('ambulance_id')
      .populate('driver_id', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAmbulanceRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, ambulance_id, driver_id } = req.body;
    const user = (req as any).user;

    // If a driver is accepting, check if they already have an active request
    if (status === 'Accepted' && user.role === 'Driver') {
      const activeRequest = await AmbulanceRequest.findOne({
        driver_id: user.id,
        status: { $in: ['Accepted', 'Dispatched', 'Arrived'] }
      });
      if (activeRequest) {
        return res.status(400).json({ error: 'You already have an active ambulance request. Complete it before accepting another.' });
      }
    }

    const request = await AmbulanceRequest.findByIdAndUpdate(id, { status, ambulance_id, driver_id }, { new: true })
      .populate('ambulance_id')
      .populate('driver_id', 'fullName username');
    
    if (ambulance_id && status === 'Accepted') {
      await Ambulance.findByIdAndUpdate(ambulance_id, { status: 'Dispatched' });
    }

    req.app.get('io')?.emit('ambulance_request_updated', request);
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const simulateAmbulance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { target_lat, target_lng } = req.body;
    
    const ambulance = await Ambulance.findById(id);
    if (!ambulance) return res.status(404).json({ error: 'Ambulance not found' });

    // Simulate movement: move 10% closer to target
    const currentLat = ambulance.current_location?.lat || 23.8103;
    const currentLng = ambulance.current_location?.lng || 90.4125;
    
    const newLat = currentLat + (target_lat - currentLat) * 0.1;
    const newLng = currentLng + (target_lng - currentLng) * 0.1;
    
    // Calculate distance for ETA (very rough approximation)
    const distance = Math.sqrt(Math.pow(target_lat - newLat, 2) + Math.pow(target_lng - newLng, 2));
    const eta = Math.max(1, Math.round(distance * 1000)); // 1 min minimum

    const updatedAmbulance = await Ambulance.findByIdAndUpdate(id, {
      current_location: { lat: newLat, lng: newLng },
      eta
    }, { new: true });

    req.app.get('io')?.emit('ambulance_updated', updatedAmbulance);
    res.json(updatedAmbulance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Billing Controllers
export const getBills = async (req: Request, res: Response) => {
  try {
    const bills = await Billing.find().populate('patient_id');
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBill = async (req: Request, res: Response) => {
  try {
    const bill = new Billing(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    // Simulate payment gateway processing
    const { payment_method } = req.body;
    const transaction_id = `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const bill = await Billing.findByIdAndUpdate(req.params.id, {
      status: 'Paid',
      payment_method,
      transaction_id
    }, { new: true });
    
    res.json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// IoT Device Controllers
export const getIoTDevices = async (req: Request, res: Response) => {
  try {
    const devices = await IoTDevice.find().populate('patient_id', 'fullName');
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyIoTDevices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    // Find the patient record for this user
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const devices = await IoTDevice.find({ patient_id: patient._id });
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createIoTDevice = async (req: Request, res: Response) => {
  try {
    const device = new IoTDevice(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIoTDevice = async (req: Request, res: Response) => {
  try {
    const device = await IoTDevice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.app.get('io')?.emit('iot_device_updated', device);
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Campaign Controllers
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const donateToCampaign = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $inc: { raised: amount, investors: 1 } },
      { new: true }
    );
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Blood Hub Controllers
export const getBloodDonors = async (req: Request, res: Response) => {
  try {
    const { bloodGroup, lat, lng, radius = 50 } = req.query;
    let query: any = { isAvailable: true };
    
    if (bloodGroup) query.bloodGroup = bloodGroup;
    
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000 // km to meters
        }
      };
    }

    const donors = await BloodDonor.find(query).populate('userId', 'fullName username');
    res.json(donors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const registerAsDonor = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const existingDonor = await BloodDonor.findOne({ userId: user.id });
    
    if (existingDonor) {
      const updated = await BloodDonor.findByIdAndUpdate(existingDonor._id, req.body, { new: true });
      return res.json(updated);
    }

    const donor = new BloodDonor({ ...req.body, userId: user.id });
    await donor.save();
    res.status(201).json(donor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Vaccination Controllers
export const getMyVaccinations = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const vaccinations = await Vaccination.find({ patientId: user.id }).sort({ dueDate: 1 });
    res.json(vaccinations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addVaccination = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const vaccination = new Vaccination({ ...req.body, patientId: user.id });
    await vaccination.save();
    res.status(201).json(vaccination);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Resource Heatmap Controllers
export const getResourceStatus = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find();
    const wards = await Ward.find();
    const beds = await Bed.find();
    
    const status = departments.map(dept => {
      const deptWards = wards.filter(w => w.associated_department_id?.toString() === dept._id.toString());
      const deptWardIds = deptWards.map(w => w._id.toString());
      const deptBeds = beds.filter(b => deptWardIds.includes(b.ward_id.toString()));
      
      const icuWards = deptWards.filter(w => w.type === 'ICU');
      const icuWardIds = icuWards.map(w => w._id.toString());
      const icuBeds = beds.filter(b => icuWardIds.includes(b.ward_id.toString()));

      return {
        department: dept.name,
        totalBeds: deptBeds.length,
        availableBeds: deptBeds.filter(b => b.status === 'Available').length,
        occupiedBeds: deptBeds.filter(b => b.status === 'Occupied').length,
        icuBeds: icuBeds.length,
        icuAvailable: icuBeds.filter(b => b.status === 'Available').length
      };
    });

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Lab Report Interpreter Controllers
export const interpretLabReportController = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = await LabReport.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const interpretation = await analyzeLabReport(report.result_details);
    report.ai_interpretation = interpretation;
    await report.save();

    res.json({ interpretation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Digital Health ID Controllers
export const getDigitalHealthID = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

    res.json({
      id: patient.patient_id,
      name: patient.name,
      bloodGroup: (patient as any).bloodGroup,
      allergies: (patient as any).allergies,
      medicalHistory: (patient as any).medicalHistory,
      emergencyContact: patient.contact
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Medicine Inventory Controllers
export const getMedicineInventory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const inventory = await MedicineInventory.find({ userId: user.id });
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addMedicineToInventory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const item = new MedicineInventory({ ...req.body, userId: user.id });
    await item.save();
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMedicineStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentStock } = req.body;
    const item = await MedicineInventory.findByIdAndUpdate(id, { currentStock }, { new: true });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Health Wallet Controllers
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const expenses = await Expense.find({ userId: user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const expense = new Expense({ ...req.body, userId: user.id });
    await expense.save();
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Gamified Health Challenges Controllers
export const getChallenges = async (req: Request, res: Response) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyChallenges = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const myChallenges = await UserChallenge.find({ userId: user.id }).populate('challengeId');
    res.json(myChallenges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const joinChallenge = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { challengeId } = req.body;
    const userChallenge = new UserChallenge({ userId: user.id, challengeId });
    await userChallenge.save();
    res.status(201).json(userChallenge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChallengeProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentValue } = req.body;
    const userChallenge = await UserChallenge.findById(id).populate('challengeId');
    if (!userChallenge) return res.status(404).json({ error: 'Challenge not found' });

    userChallenge.currentValue = currentValue;
    if (currentValue >= (userChallenge.challengeId as any).targetValue) {
      userChallenge.status = 'Completed';
      userChallenge.completedDate = new Date();
    }
    await userChallenge.save();
    res.json(userChallenge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Organ Donation Controllers
export const registerOrganDonor = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const donor = new OrganDonor({ ...req.body, userId: user.id });
    await donor.save();
    res.status(201).json(donor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrganDonors = async (req: Request, res: Response) => {
  try {
    const donors = await OrganDonor.find().populate('userId', 'fullName username');
    res.json(donors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOptimizedAppointmentTime = async (req: Request, res: Response) => {
  try {
    const { doctorId, departmentId } = req.query;
    
    // Calculate wait time based on actual queue
    const queueCount = await Queue.countDocuments({
      department_id: departmentId,
      status: 'Waiting'
    });

    const avgConsultationTime = 15; // minutes
    const predictedWaitTime = (queueCount + 1) * avgConsultationTime;
    
    // Generate a recommended time (e.g., now + waitTime)
    const now = new Date();
    const recommendedDate = new Date(now.getTime() + predictedWaitTime * 60000);
    const recommendedTime = recommendedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    res.json({
      recommendedTime,
      predictedWaitTime,
      confidence: 0.92,
      queuePosition: queueCount + 1
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
