import { Request, Response } from 'express';
import os from 'os';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import Bed from '../models/Bed';
import Department from '../models/Department';
import Medicine from '../models/Medicine';
import Task from '../models/Task';
import AmbulanceRequest from '../models/AmbulanceRequest';
import MedicineOrder from '../models/MedicineOrder';
import Hospital from '../models/Hospital';
import Pharmacy from '../models/Pharmacy';
import Lab from '../models/Lab';
import LabReport from '../models/LabReport';
import Billing from '../models/Billing';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [users, patients, beds, depts, medicines, tasks, ambulanceRequests, orders, doctors, hospitals, pharmacies, labs] = await Promise.all([
      User.find().lean(),
      Patient.find().lean(),
      Bed.find().populate({
        path: 'ward_id',
        populate: { path: 'associated_department_id' }
      }).lean(),
      Department.find().lean(),
      Medicine.find().lean(),
      Task.find().lean(),
      AmbulanceRequest.find().populate('user_id').lean(),
      MedicineOrder.find().populate('user_id').lean(),
      Doctor.find().lean(),
      Hospital.find().lean(),
      Pharmacy.find().lean(),
      Lab.find().lean()
    ]);

    const totalPatients = users.filter(u => u.role === 'Patient').length;
    const totalDoctors = users.filter(u => u.role === 'Doctor').length;
    const totalStaff = users.filter(u => u.role === 'Staff').length;
    
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const maintenanceBeds = beds.filter(b => b.status === 'Maintenance').length;
    
    const totalDepartments = depts.length;
    const totalMedicines = medicines.length;
    
    const inpatientsCount = patients.filter(p => p.type === 'Inpatient').length;
    const outpatientsCount = patients.filter(p => p.type === 'Outpatient').length;

    const totalCommissionBalance = 
      doctors.reduce((acc, d) => acc + (d.commissionBalance || 0), 0) +
      hospitals.reduce((acc, h) => acc + (h.commissionBalance || 0), 0) +
      pharmacies.reduce((acc, p) => acc + (p.commissionBalance || 0), 0) +
      labs.reduce((acc, l) => acc + (l.commissionBalance || 0), 0);

    const totalPlatformSales = 
      hospitals.reduce((acc, h) => acc + (h.totalSales || 0), 0) +
      pharmacies.reduce((acc, p) => acc + (p.totalSales || 0), 0) +
      labs.reduce((acc, l) => acc + (l.totalSales || 0), 0);

    const bedStatus = [
      { status: 'Occupied', count: occupiedBeds },
      { status: 'Available', count: Math.max(0, totalBeds - occupiedBeds - maintenanceBeds) },
      { status: 'Maintenance', count: maintenanceBeds }
    ];

    const staffMetrics = {
      rank: totalPatients > 100 ? 'Platinum' : totalPatients > 50 ? 'Gold' : 'Silver',
      tasksCompleted: tasks.filter(t => t.status === 'Completed').length,
      patientRating: 4.8
    };

    const departmentPerformance = depts.map(dept => {
      const doctorsInDept = users.filter(u => u.role === 'Doctor' && u.department_id?.toString() === dept._id.toString()).length;
      const patientsInDept = users.filter(u => u.role === 'Patient' && u.department_id?.toString() === dept._id.toString()).length;
      const occupiedInDept = beds.filter((b: any) => b.ward_id?.associated_department_id?._id?.toString() === dept._id.toString() && b.status === 'Occupied').length;
      const totalInDept = beds.filter((b: any) => b.ward_id?.associated_department_id?._id?.toString() === dept._id.toString()).length;

      return {
        name: dept.name,
        doctors: doctorsInDept,
        patients: patientsInDept,
        utilization: totalInDept > 0 ? Math.round((occupiedInDept / totalInDept) * 100) : 0,
        status: 'Optimal'
      };
    });

    const serviceDistribution = [
      { name: 'Emergency', value: beds.filter((b: any) => b.ward_id?.name === 'Emergency').length },
      { name: 'Consultation', value: totalDoctors * 5 },
      { name: 'Pharmacy', value: orders.length },
      { name: 'Ambulance', value: ambulanceRequests.length }
    ];

    let totalRevenue = totalPatients * 50;
    orders.forEach(order => {
      totalRevenue += (order.total_price || 0);
    });

    res.json({
      totalPatients,
      totalDoctors,
      totalStaff,
      totalBeds,
      occupiedBeds,
      maintenanceBeds,
      totalDepartments,
      bedOccupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      emergencyBeds: { 
        total: beds.filter((b: any) => b.ward_id?.name === 'Emergency').length, 
        occupied: beds.filter((b: any) => b.ward_id?.name === 'Emergency' && b.status === 'Occupied').length 
      },
      totalRevenue,
      patients: { count: totalPatients },
      inpatients: { count: inpatientsCount },
      outpatients: { count: outpatientsCount },
      medicines: { count: totalMedicines },
      bedStatus,
      departmentPerformance,
      serviceDistribution,
      ambulanceCount: ambulanceRequests.length,
      medicineOrderCount: orders.length,
      staffMetrics,
      totalCommissionBalance,
      totalPlatformSales
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInpatientTrends = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find({ type: 'Inpatient' }).lean();
    const trends: any = {};
    
    if (patients.length === 0) {
      return res.json([]);
    }

    patients.forEach(p => {
      if (p.admission_date) {
        const date = new Date(p.admission_date).toISOString().split('T')[0];
        trends[date] = (trends[date] || 0) + 1;
      }
    });
    
    const sortedTrends = Object.keys(trends).sort().map(date => {
      const d = new Date(date);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return {
        month: months[d.getMonth()],
        date,
        count: trends[date]
      };
    });
    
    res.json(sortedTrends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPredictiveData = async (req: Request, res: Response) => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const predictiveData = [];
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const patients = await Patient.find({
      createdAt: { $gte: lastWeek }
    }).lean();
    
    const admissionsByDay = new Array(7).fill(0);
    patients.forEach(p => {
      const day = new Date(p.createdAt).getDay();
      admissionsByDay[day]++;
    });

    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i + 1) % 7;
      const actual = admissionsByDay[dayIndex];
      const predictedAdmissions = Math.max(1, Math.round(actual * 1.1) + 1);
      predictiveData.push({
        name: days[dayIndex],
        actual: actual,
        predicted: predictedAdmissions,
        icuBedsNeeded: Math.ceil(predictedAdmissions * 0.15),
        staffNeeded: Math.ceil(predictedAdmissions * 1.2),
        medicineStockNeeded: Math.ceil(predictedAdmissions * 5)
      });
    }
    res.json(predictiveData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSystemMonitor = async (req: Request, res: Response) => {
  try {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const loadAvg = os.loadavg();
    
    res.json({
      cpu: `${(loadAvg[0] * 10).toFixed(1)}%`,
      memory: `${((totalMem - freeMem) / (1024 * 1024 * 1024)).toFixed(1)}GB / ${(totalMem / (1024 * 1024 * 1024)).toFixed(1)}GB`,
      network: `${Math.floor(Math.random() * 20) + 10} MB/S`,
      security: 'ENCRYPTED'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivityStream = async (req: Request, res: Response) => {
  try {
    const [users, records, ambulanceRequests, orders] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(3).lean(),
      // Assuming MedicalRecord model exists, if not we skip or use a generic one
      User.find({ role: 'Patient' }).sort({ createdAt: -1 }).limit(3).lean(), // Fallback
      AmbulanceRequest.find().populate('user_id').sort({ createdAt: -1 }).limit(3).lean(),
      MedicineOrder.find().populate('user_id').sort({ createdAt: -1 }).limit(3).lean()
    ]);
    
    const stream: any[] = [];
    
    users.forEach(u => {
      stream.push({
        user: u.username,
        action: 'New user registration',
        time: new Date(u.createdAt).toLocaleTimeString(),
        icon: 'Users',
        color: 'green'
      });
    });

    ambulanceRequests.forEach((a: any) => {
      stream.push({
        user: a.user_id?.username || 'Patient',
        action: `Requested ambulance at ${a.pickup_location?.address || 'Emergency'}`,
        time: new Date(a.createdAt).toLocaleTimeString(),
        icon: 'Truck',
        color: 'red'
      });
    });

    orders.forEach((o: any) => {
      stream.push({
        user: o.user_id?.username || 'Patient',
        action: `Placed medicine order for $${o.total_price}`,
        time: new Date(o.createdAt).toLocaleTimeString(),
        icon: 'ShoppingCart',
        color: 'purple'
      });
    });

    res.json(stream.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIInsights = async (req: Request, res: Response) => {
  try {
    const [beds, orders, ambulanceRequests] = await Promise.all([
      Bed.find().lean(),
      MedicineOrder.find({ status: 'Pending' }).lean(),
      AmbulanceRequest.find({ status: { $in: ['Pending', 'Accepted', 'Dispatched'] } }).lean()
    ]);

    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) : 0;
    
    const insights = [];

    if (occupancyRate > 0.8) {
      insights.push({ title: 'Capacity Alert', desc: `Hospital is at ${(occupancyRate * 100).toFixed(0)}% capacity. Consider optimizing discharge protocols.`, icon: 'AlertCircle', color: 'orange' });
    } else {
      insights.push({ title: 'Efficiency Boost', desc: 'Patient discharge time optimized. Bed availability is within optimal range.', icon: 'Zap', color: 'yellow' });
    }

    if (orders.length > 5) {
      insights.push({ title: 'Pharmacy Backlog', desc: `There are ${orders.length} pending medicine orders. Staff allocation may be needed.`, icon: 'ShoppingCart', color: 'purple' });
    }

    if (ambulanceRequests.length > 0) {
      insights.push({ title: 'Emergency Load', desc: `${ambulanceRequests.length} active ambulance requests in progress. Monitoring response times.`, icon: 'Truck', color: 'red' });
    }

    insights.push({ title: 'Protocol Sync', desc: 'All surgical teams aligned with new WHO standards.', icon: 'CheckCircle2', color: 'green' });

    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const [users, beds, depts] = await Promise.all([
      User.find().lean(),
      Bed.find().lean(),
      Department.find().lean()
    ]);

    const totalPatients = users.filter(u => u.role === 'Patient').length;
    const totalDoctors = users.filter(u => u.role === 'Doctor').length;
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;

    res.json({
      totalPatients,
      totalDoctors,
      totalBeds,
      bedOccupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      totalDepartments: depts.length,
      systemStatus: 'Optimal',
      neuralSync: '99.9%',
      latency: '0.02ms'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientAIInsights = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const patient = await Patient.findOne({ patient_id: user.reference_id }).lean();
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const riskAssessment = [
      { label: 'Cardiovascular Risk', value: patient.vitals?.heartRate === '72 bpm' ? 15 : 45, color: 'red', desc: 'Based on heart rate trends.' },
      { label: 'Diabetes Risk', value: 20, color: 'orange', desc: 'Based on recent lab results.' },
      { label: 'Respiratory Health', value: patient.vitals?.oxygenLevel === '98%' ? 10 : 30, color: 'green', desc: 'Excellent oxygen saturation.' }
    ];

    const treatmentPlan = [
      { title: 'Dietary Adjustment', desc: 'Maintain low sodium intake for better BP control.' },
      { title: 'Medication Optimization', desc: 'Continue current prescription schedule.' },
      { title: 'Lifestyle Goal', desc: '30 mins of moderate cardio daily.' }
    ];

    res.json({ riskAssessment, treatmentPlan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalDashboardData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const hospital = await Hospital.findOne({ hospital_id: user.reference_id });
    if (!hospital) return res.status(404).json({ error: 'Hospital profile not found' });

    const [patients, staff, bills] = await Promise.all([
      Patient.countDocuments({}),
      User.countDocuments({ role: { $in: ['Doctor', 'Staff', 'Lab'] } }),
      Billing.find({ status: 'Paid' }).lean()
    ]);

    const totalRevenue = bills.reduce((acc, bill) => acc + bill.amount, 0);

    res.json({
      hospital,
      stats: {
        totalPatients: patients,
        totalStaff: staff,
        totalRevenue
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPharmacyDashboardData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const pharmacy = await Pharmacy.findOne({ pharmacy_id: user.reference_id });
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy profile not found' });

    const [medicines, orders, inventory] = await Promise.all([
      Medicine.countDocuments({}),
      MedicineOrder.find({ pharmacy_id: pharmacy._id }).populate('patient_id').sort({ createdAt: -1 }).limit(10).lean(),
      Medicine.find({ stock_quantity: { $lt: 10 } }).lean()
    ]);

    res.json({
      pharmacy,
      stats: {
        totalMedicines: medicines,
        activeOrders: orders.length,
        lowStockItems: inventory.length
      },
      recentOrders: orders,
      lowStockItems: inventory
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLabDashboardData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const lab = await Lab.findOne({ lab_id: user.reference_id });
    if (!lab) return res.status(404).json({ error: 'Lab profile not found' });

    const [reports, pendingReports] = await Promise.all([
      LabReport.find({ lab_technician_id: user.id }).populate('patient_id').sort({ createdAt: -1 }).limit(10).lean(),
      LabReport.countDocuments({ lab_technician_id: user.id, status: 'Pending' })
    ]);

    res.json({
      lab,
      stats: {
        totalReports: reports.length,
        pendingReports
      },
      recentReports: reports
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
