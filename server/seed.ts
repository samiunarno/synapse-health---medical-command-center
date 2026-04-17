import mongoose from 'mongoose';
import Department from './models/Department';
import User from './models/User';
import Patient from './models/Patient';
import Queue from './models/Queue';
import Product from './models/Product';
import Doctor from './models/Doctor';
import Ward from './models/Ward';
import Bed from './models/Bed';
import Medicine from './models/Medicine';
import MedicineInventory from './models/MedicineInventory';
import Hospital from './models/Hospital';
import Pharmacy from './models/Pharmacy';
import Lab from './models/Lab';
import LabReport from './models/LabReport';
import MedicalRecord from './models/MedicalRecord';
import Task from './models/Task';
import { Message } from './models/Message';
import LabAppointment from './models/LabAppointment';
import MedicineOrder from './models/MedicineOrder';
import Prescription from './models/Prescription';
import StaffSchedule from './models/StaffSchedule';
import Vaccination from './models/Vaccination';
import OrganDonor from './models/OrganDonor';
import Challenge from './models/Challenge';
import UserChallenge from './models/UserChallenge';
import IoTDevice from './models/IoTDevice';

export const seedDatabase = async () => {
  try {
    console.log('🚀 Starting comprehensive database seeding...');

    // 1. Seed Departments
    let cardiologyId, neurologyId, orthopedicsId, pediatricsId, emergencyId, oncologyId, radiologyId;
    try {
      const existingDepts = await Department.find();
      if (existingDepts.length === 0) {
        const departments = [
          { name: 'Cardiology', description: 'Heart and cardiovascular care.', location: { lat: 31.2304, lng: 121.4737 } },
          { name: 'Neurology', description: 'Brain and nervous system care.', location: { lat: 31.2314, lng: 121.4747 } },
          { name: 'Orthopedics', description: 'Bone and joint care.', location: { lat: 31.2324, lng: 121.4757 } },
          { name: 'Pediatrics', description: 'Child healthcare.', location: { lat: 31.2334, lng: 121.4767 } },
          { name: 'Emergency', description: '24/7 Acute care.', location: { lat: 31.2344, lng: 121.4777 } },
          { name: 'Oncology', description: 'Cancer diagnosis and treatment.', location: { lat: 31.2354, lng: 121.4787 } },
          { name: 'Radiology', description: 'Medical imaging services.', location: { lat: 31.2364, lng: 121.4797 } }
        ];
        const createdDepts = await Department.insertMany(departments);
        cardiologyId = createdDepts[0]._id;
        neurologyId = createdDepts[1]._id;
        orthopedicsId = createdDepts[2]._id;
        pediatricsId = createdDepts[3]._id;
        emergencyId = createdDepts[4]._id;
        oncologyId = createdDepts[5]._id;
        radiologyId = createdDepts[6]._id;
        console.log('✅ Departments seeded');
      } else {
        cardiologyId = existingDepts.find(d => d.name === 'Cardiology')?._id;
        neurologyId = existingDepts.find(d => d.name === 'Neurology')?._id;
        orthopedicsId = existingDepts.find(d => d.name === 'Orthopedics')?._id;
        pediatricsId = existingDepts.find(d => d.name === 'Pediatrics')?._id;
        emergencyId = existingDepts.find(d => d.name === 'Emergency')?._id;
        oncologyId = existingDepts.find(d => d.name === 'Oncology')?._id;
        radiologyId = existingDepts.find(d => d.name === 'Radiology')?._id;
      }
    } catch (err) {
      console.error('⚠️ Error seeding Departments:', err);
    }

    // 2. Seed Entities (Hospital, Pharmacy, Lab)
    try {
      if (await Hospital.countDocuments() === 0) {
        await Hospital.create({
          hospital_id: 'H-001',
          name: 'Synapse General Hospital',
          address: '123 Medical Plaza, Shanghai',
          contact: '+86 21 5555 0101',
          registration_number: 'SH-HOSP-2024-001',
          capacity: 500,
          commissionBalance: 12500,
          totalSales: 85000
        });
        console.log('✅ Hospital seeded');
      }

      if (await Pharmacy.countDocuments() <= 1) {
        const pharmacies = [
          { pharmacy_id: 'PH-001', name: 'Synapse Central Pharmacy', address: '456 Health St, Shanghai', contact: '+86 21 5555 0202', license_number: 'SH-PHAR-2024-001', commissionBalance: 4500, totalSales: 32000 },
          { pharmacy_id: 'PH-002', name: 'East Wing Pharmacy', address: '789 Recovery Rd, Shanghai', contact: '+86 21 5555 0203', license_number: 'SH-PHAR-2024-002', commissionBalance: 1200, totalSales: 15000 },
          { pharmacy_id: 'PH-003', name: 'Community Health Pharmacy', address: '321 Neighborhood Way, Shanghai', contact: '+86 21 5555 0204', license_number: 'SH-PHAR-2024-003', commissionBalance: 800, totalSales: 8000 }
        ];
        for (const p of pharmacies) {
          const exists = await Pharmacy.findOne({ pharmacy_id: p.pharmacy_id });
          if (!exists) await Pharmacy.create(p);
        }
        console.log('✅ Pharmacies seeded');
      }

      if (await Lab.countDocuments() <= 1) {
        const labs = [
          { lab_id: 'LB-001', name: 'Synapse Diagnostic Lab', address: '789 Science Park, Shanghai', contact: '+86 21 5555 0303', accreditation_number: 'SH-LAB-2024-001', commissionBalance: 3200, totalSales: 18000 },
          { lab_id: 'LB-002', name: 'Pathology Specialization Lab', address: '101 Bio Lane, Shanghai', contact: '+86 21 5555 0304', accreditation_number: 'SH-LAB-2024-002', commissionBalance: 800, totalSales: 5000 },
          { lab_id: 'LB-003', name: 'Genetics & Research Lab', address: '202 DNA Drive, Shanghai', contact: '+86 21 5555 0305', accreditation_number: 'SH-LAB-2024-003', commissionBalance: 1500, totalSales: 12000 }
        ];
        for (const l of labs) {
          const exists = await Lab.findOne({ lab_id: l.lab_id });
          if (!exists) await Lab.create(l);
        }
        console.log('✅ Labs seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Entities:', err);
    }

    // 3. Seed Users (Admin, Doctors, Patients, Staff, etc.)
    try {
      if (await User.countDocuments() <= 10) {
        const users = [
          { username: 'admin', email: 'admin@synapse.ai', password: 'password123', role: 'Admin', status: 'Approved', fullName: 'System Administrator' },
          // Doctors
          { username: 'dr_chen', email: 'chen@synapse.ai', password: 'password123', role: 'Doctor', status: 'Approved', fullName: 'Dr. Chen Wei', reference_id: 'D-2001' },
          { username: 'dr_li', email: 'li@synapse.ai', password: 'password123', role: 'Doctor', status: 'Approved', fullName: 'Dr. Li Na', reference_id: 'D-2002' },
          { username: 'dr_smith', email: 'smith@synapse.ai', password: 'password123', role: 'Doctor', status: 'Approved', fullName: 'Dr. Sarah Smith', reference_id: 'D-2003' },
          { username: 'dr_kumar', email: 'kumar@synapse.ai', password: 'password123', role: 'Doctor', status: 'Approved', fullName: 'Dr. Rajesh Kumar', reference_id: 'D-2004' },
          { username: 'dr_garcia', email: 'garcia@synapse.ai', password: 'password123', role: 'Doctor', status: 'Approved', fullName: 'Dr. Elena Garcia', reference_id: 'D-2005' },
          
          // Staff
          { username: 'staff_wang', email: 'wang@synapse.ai', password: 'password123', role: 'Staff', status: 'Approved', fullName: 'Wang Fang' },
          { username: 'staff_jones', email: 'jones@synapse.ai', password: 'password123', role: 'Staff', status: 'Approved', fullName: 'Michael Jones' },
          
          // Pharmacies
          { username: 'pharmacy_central', email: 'central_p@synapse.ai', password: 'password123', role: 'Pharmacy', status: 'Approved', fullName: 'Central Pharmacy Manager', reference_id: 'PH-001' },
          { username: 'pharmacy_east', email: 'east_p@synapse.ai', password: 'password123', role: 'Pharmacy', status: 'Approved', fullName: 'East Wing Pharmacy', reference_id: 'PH-002' },
          
          // Labs
          { username: 'lab_main', email: 'main_l@synapse.ai', password: 'password123', role: 'Lab', status: 'Approved', fullName: 'Main Diagnostic Lab', reference_id: 'LB-001' },
          { username: 'lab_pathology', email: 'path_l@synapse.ai', password: 'password123', role: 'Lab', status: 'Approved', fullName: 'Pathology Specialization Lab', reference_id: 'LB-002' },
          
          // Drivers & Riders
          { username: 'driver_wu', email: 'wu_d@synapse.ai', password: 'password123', role: 'Driver', status: 'Approved', fullName: 'Wu Jun' },
          { username: 'driver_chen', email: 'chen_d@synapse.ai', password: 'password123', role: 'Driver', status: 'Approved', fullName: 'Chen Long' },
          { username: 'rider_sun', email: 'sun_r@synapse.ai', password: 'password123', role: 'Rider', status: 'Approved', fullName: 'Sun Qiang' },
          { username: 'rider_lee', email: 'lee_r@synapse.ai', password: 'password123', role: 'Rider', status: 'Approved', fullName: 'Lee Min' },
          
          // Patients
          { username: 'patient_zhang', email: 'zhang@synapse.ai', password: 'password123', role: 'Patient', status: 'Approved', fullName: 'Zhang San' },
          
          // Pharmacists
          { username: 'pharmacist_lee', email: 'lee@synapse.ai', password: 'password123', role: 'Pharmacist', status: 'Approved', fullName: 'Lee Wei' },
          
          // Lab Technicians
          { username: 'lab_tech_kim', email: 'kim_lab@synapse.ai', password: 'password123', role: 'LabTechnician', status: 'Approved', fullName: 'Kim Min-su' },
          
          // Hospitals
          { username: 'hospital_main', email: 'main_h@synapse.ai', password: 'password123', role: 'Hospital', status: 'Approved', fullName: 'Synapse General Admin', reference_id: 'H-001' }
        ];
        
        for (const u of users) {
          const exists = await User.findOne({ 
            $or: [
              { username: u.username },
              { email: u.email }
            ]
          });
          if (!exists) {
            await User.create(u);
          }
        }
        console.log('✅ Diverse users seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Users:', err);
    }

    const adminUser = await User.findOne({ role: 'Admin' });
    const doctorUser = await User.findOne({ username: 'dr_chen' });
    const staffUser = await User.findOne({ role: 'Staff' });

    // 4. Seed Doctors (linked to Users)
    try {
      if (await Doctor.countDocuments() <= 2) {
        const doctorData = [
          { doctor_id: 'D-2001', name: 'Dr. Chen Wei', age: 45, gender: 'Male', contact: '138-0000-0001', specialization: 'Cardiologist', department_id: cardiologyId, commissionBalance: 1500 },
          { doctor_id: 'D-2002', name: 'Dr. Li Na', age: 38, gender: 'Female', contact: '138-0000-0002', specialization: 'Neurologist', department_id: neurologyId, commissionBalance: 1200 },
          { doctor_id: 'D-2003', name: 'Dr. Sarah Smith', age: 41, gender: 'Female', contact: '138-0000-0003', specialization: 'Orthopedic Surgeon', department_id: orthopedicsId, commissionBalance: 900 },
          { doctor_id: 'D-2004', name: 'Dr. Rajesh Kumar', age: 50, gender: 'Male', contact: '138-0000-0004', specialization: 'Pediatrician', department_id: pediatricsId, commissionBalance: 2100 },
          { doctor_id: 'D-2005', name: 'Dr. Elena Garcia', age: 35, gender: 'Female', contact: '138-0000-0005', specialization: 'Oncologist', department_id: oncologyId, commissionBalance: 3000 }
        ];
        
        for (const d of doctorData) {
          const exists = await Doctor.findOne({ doctor_id: d.doctor_id });
          if (!exists) await Doctor.create(d);
        }
        console.log('✅ Doctor profiles seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Doctors:', err);
    }

    // 5. Seed Wards and Beds
    try {
      if (await Ward.countDocuments() === 0) {
        const wards = [
          { name: 'Cardiology Ward A', type: 'ICU', associated_department_id: cardiologyId },
          { name: 'General Ward B', type: 'General', associated_department_id: pediatricsId },
          { name: 'Private Suite C', type: 'Private', associated_department_id: oncologyId }
        ];
        const createdWards = await Ward.insertMany(wards);
        
        const beds = [];
        for (const ward of createdWards) {
          for (let i = 1; i <= 5; i++) {
            beds.push({ ward_id: ward._id, status: i === 1 ? 'Occupied' : 'Available' });
          }
        }
        await Bed.insertMany(beds);
        console.log('✅ Wards and Beds seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Wards/Beds:', err);
    }

    // 6. Seed Patients
    try {
      if (await Patient.countDocuments() <= 5) {
        const patients = [
          { patient_id: 'P-1001', name: 'John Doe', age: 45, gender: 'Male', contact: '555-0101', type: 'Outpatient', vitals: { heartRate: '72 bpm', bloodPressure: '120/80', temperature: '36.6°C', oxygenLevel: '98%' } },
          { patient_id: 'P-1002', name: 'Jane Smith', age: 32, gender: 'Female', contact: '555-0102', type: 'Inpatient', vitals: { heartRate: '85 bpm', bloodPressure: '130/85', temperature: '37.2°C', oxygenLevel: '96%' } },
          { patient_id: 'P-1003', name: 'Robert Brown', age: 68, gender: 'Male', contact: '555-0103', type: 'Outpatient' },
          { patient_id: 'P-1004', name: 'Emily Davis', age: 25, gender: 'Female', contact: '555-0104', type: 'Inpatient' },
          { patient_id: 'P-1005', name: 'William Wilson', age: 55, gender: 'Male', contact: '555-0105', type: 'Outpatient' },
          { patient_id: 'P-1006', name: 'Olivia Taylor', age: 29, gender: 'Female', contact: '555-0106', type: 'Inpatient' },
          { patient_id: 'P-1007', name: 'James Anderson', age: 42, gender: 'Male', contact: '555-0107', type: 'Outpatient' },
          { patient_id: 'P-1008', name: 'Sophia Martinez', age: 31, gender: 'Female', contact: '555-0108', type: 'Inpatient' },
          { patient_id: 'P-1009', name: 'Benjamin Thomas', age: 48, gender: 'Male', contact: '555-0109', type: 'Outpatient' },
          { patient_id: 'P-1010', name: 'Isabella Hernandez', age: 37, gender: 'Female', contact: '555-0110', type: 'Inpatient' }
        ];
        
        for (const pat of patients) {
          const exists = await Patient.findOne({ patient_id: pat.patient_id });
          if (!exists) {
            await Patient.create(pat);
            
            const userExists = await User.findOne({
              $or: [
                { username: pat.name.toLowerCase().replace(' ', '_') },
                { email: `${pat.name.toLowerCase().replace(' ', '.')}@example.com` }
              ]
            });

            if (!userExists) {
              await User.create({
                username: pat.name.toLowerCase().replace(' ', '_'),
                email: `${pat.name.toLowerCase().replace(' ', '.')}@example.com`,
                password: 'password123',
                role: 'Patient',
                status: 'Approved',
                fullName: pat.name,
                reference_id: pat.patient_id
              });
            }
          }
        }
        console.log('✅ Patient profiles and users seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Patients:', err);
    }

    const patient1 = await Patient.findOne({ patient_id: 'P-1001' });
    const patient2 = await Patient.findOne({ patient_id: 'P-1002' });
    const patient1User = await User.findOne({ reference_id: 'P-1001' });
    const patient2User = await User.findOne({ reference_id: 'P-1002' });
    const labTech = await User.findOne({ role: 'LabTechnician' });

    // 7. Seed Medicines and Inventory
    try {
      if (await Medicine.countDocuments() <= 5) {
        const medicines = [
          { brand_name: 'Lipitor', generic_name: 'Atorvastatin', stock_quantity: 500, price: 15.5, associated_department_id: cardiologyId, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Panadol', generic_name: 'Paracetamol', stock_quantity: 1000, price: 5.0, associated_department_id: emergencyId, image_url: 'https://images.unsplash.com/photo-1550572017-ed20027aa215?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Amoxil', generic_name: 'Amoxicillin', stock_quantity: 300, price: 12.0, associated_department_id: pediatricsId, image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Zestril', generic_name: 'Lisinopril', stock_quantity: 450, price: 25.0, associated_department_id: cardiologyId, image_url: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Glucophage', generic_name: 'Metformin', stock_quantity: 600, price: 10.0, associated_department_id: oncologyId, image_url: 'https://images.unsplash.com/photo-1550572017-d1a104b2c86b?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Advil', generic_name: 'Ibuprofen', stock_quantity: 400, price: 8.5, associated_department_id: emergencyId, image_url: 'https://images.unsplash.com/photo-1616671285410-0935562093e9?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Ventolin', generic_name: 'Albuterol', stock_quantity: 250, price: 45.0, associated_department_id: emergencyId, image_url: 'https://images.unsplash.com/photo-1599059021750-8474273dc28b?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Zyrtec', generic_name: 'Cetirizine', stock_quantity: 350, price: 18.0, associated_department_id: neurologyId, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Neurontin', generic_name: 'Gabapentin', stock_quantity: 300, price: 22.0, associated_department_id: neurologyId, image_url: 'https://images.unsplash.com/photo-1550572017-ed20027aa215?q=80&w=400&auto=format&fit=crop' },
          { brand_name: 'Prilosec', generic_name: 'Omeprazole', stock_quantity: 500, price: 18.0, associated_department_id: pediatricsId, image_url: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?q=80&w=400&auto=format&fit=crop' }
        ];
        
        for (const med of medicines) {
          const exists = await Medicine.findOne({ brand_name: med.brand_name });
          if (!exists) await Medicine.create(med);
        }

        if (patient1User) {
          const existingInv = await MedicineInventory.findOne({ userId: patient1User._id });
          if (!existingInv) {
            await MedicineInventory.create({
              userId: patient1User._id,
              medicineName: 'Lipitor',
              currentStock: 20,
              minStockLevel: 5,
              dosage: '10mg',
              frequency: 'Once daily',
              expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
            });
          }
        }
        console.log('✅ Medicines and Inventory seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Medicines:', err);
    }

    // 8. Seed Products
    try {
      if (await Product.countDocuments() <= 5) {
        const products = [
          { name: 'Digital BP Monitor', description: 'Automatic clinical blood pressure monitor.', price: 45.99, category: 'Equipment', stock_quantity: 100, manufacturer: 'HealthTech', image_url: 'https://images.unsplash.com/photo-1616391182219-e080b4d1043a?q=80&w=400&auto=format&fit=crop' },
          { name: 'N95 Mask Pack', description: 'Box of 50 medical-grade masks.', price: 25.00, category: 'Supplies', stock_quantity: 500, manufacturer: 'SafeGuard', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop' },
          { name: 'Stethoscope', description: 'Professional medical grade stethoscope.', price: 120.00, category: 'Equipment', stock_quantity: 50, manufacturer: 'Littmann', image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=400&auto=format&fit=crop' },
          { name: 'Infrared Thermometer', description: 'Non-contact hospital-grade thermometer.', price: 15.00, category: 'Equipment', stock_quantity: 150, manufacturer: 'Omron', image_url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=400&auto=format&fit=crop' },
          { name: 'Wheelchair', description: 'Lightweight ergonomic folding wheelchair.', price: 450.00, category: 'Equipment', stock_quantity: 10, manufacturer: 'Drive Medical', image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop' },
          { name: 'Pulse Oximeter', description: 'Fingertip oxygen saturation monitor.', price: 35.00, category: 'Equipment', stock_quantity: 60, manufacturer: 'Masimo', image_url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=400&auto=format&fit=crop' }
        ];
        
        for (const prod of products) {
          const exists = await Product.findOne({ name: prod.name });
          if (!exists) await Product.create(prod);
        }
        console.log('✅ Products seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Products:', err);
    }

    // 9. Seed Lab Reports and Appointments
    try {
      if (await LabReport.countDocuments() === 0 && patient1User && patient2User && labTech) {
        const labReports = [
          { patient_id: patient1User._id, lab_technician_id: labTech._id, test_name: 'Complete Blood Count', test_date: new Date(), result_details: 'Hemoglobin: 14.5 g/dL (Normal: 13.5-17.5). White Blood Cells: 6.2 x10^9/L (Normal: 4.5-11.0).', status: 'Completed' },
          { patient_id: patient2User._id, lab_technician_id: labTech._id, test_name: 'Lipid Profile', test_date: new Date(), result_details: 'Total Cholesterol: 210 mg/dL (High). LDL: 140 mg/dL. HDL: 45 mg/dL.', status: 'Completed' },
          { patient_id: patient1User._id, lab_technician_id: labTech._id, test_name: 'Blood Glucose', test_date: new Date(), result_details: 'Fasting Glucose: 95 mg/dL (Normal).', status: 'Completed' },
          { patient_id: patient2User._id, lab_technician_id: labTech._id, test_name: 'Liver Function Test', test_date: new Date(), result_details: 'ALT: 35 U/L. AST: 30 U/L. (Normal range).', status: 'Completed' },
          { patient_id: patient1User._id, lab_technician_id: labTech._id, test_name: 'Urinalysis', test_date: new Date(), result_details: 'Clear, no abnormalities detected.', status: 'Completed' }
        ];
        
        for (const report of labReports) {
          await LabReport.create(report);
        }
        
        if (patient1User) {
          await LabAppointment.create({
            patient_id: patient1User._id,
            test_type: 'MRI Brain Scan',
            appointment_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
            status: 'Confirmed',
            price: 450
          });
        }
        console.log('✅ Lab data seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Lab data:', err);
    }

    // 10. Seed Medical Records and Prescriptions
    try {
      if (await MedicalRecord.countDocuments() <= 5 && patient1 && patient2 && doctorUser) {
        const doctorProfile = await Doctor.findOne({ doctor_id: 'D-2001' });
        const records = [
          { 
            patient_id: patient1._id, 
            doctor_id: doctorProfile?._id || doctorUser._id, 
            title: 'Initial Consultation',
            type: 'Diagnosis',
            details: 'Patient presents with mild hypertension. Blood pressure recorded at 140/90. Recommended low-sodium diet and follow-up in 3 months.',
            date: new Date() 
          },
          { 
            patient_id: patient2._id, 
            doctor_id: doctorProfile?._id || doctorUser._id, 
            title: 'Diabetes Follow-up',
            type: 'Treatment',
            details: 'Type 2 Diabetes management. Patient blood sugar levels are stabilizing with Metformin 500mg twice daily.',
            date: new Date() 
          },
          { 
            patient_id: patient1._id, 
            doctor_id: doctorProfile?._id || doctorUser._id, 
            title: 'Allergy Assessment',
            type: 'Diagnosis',
            details: 'Seasonal allergies confirmed. Prescribed antihistamines.',
            date: new Date() 
          }
        ];
        
        for (const record of records) {
          await MedicalRecord.create(record);
        }

        if (doctorProfile) {
          await Prescription.create({
            patient_id: patient1._id,
            doctor_id: doctorProfile._id,
            date: new Date(),
            medicines: [{ name: 'Lipitor', dosage: '10mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the evening.' }],
            diagnosis: 'Hyperlipidemia',
            notes: 'Monitor liver enzymes.'
          });
          
          await Prescription.create({
            patient_id: patient2._id,
            doctor_id: doctorProfile._id,
            date: new Date(),
            medicines: [{ name: 'Glucophage', dosage: '500mg', frequency: 'Twice daily', duration: '180 days', instructions: 'Take with meals.' }],
            diagnosis: 'Diabetes Mellitus',
            notes: 'Check HbA1c in 3 months.'
          });
        }
        console.log('✅ Medical records and prescriptions seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Medical Records:', err);
    }

    // 11. Seed Medicine Orders
    try {
      if (await MedicineOrder.countDocuments() === 0 && patient1 && patient1User) {
        const lipitor = await Medicine.findOne({ brand_name: 'Lipitor' });
        const panadol = await Medicine.findOne({ brand_name: 'Panadol' });
        const amoxil = await Medicine.findOne({ brand_name: 'Amoxil' });
        const pharmacy = await Pharmacy.findOne({ pharmacy_id: 'PH-001' });
        const pharmacy2 = await Pharmacy.findOne({ pharmacy_id: 'PH-002' });

        if (lipitor && panadol && amoxil && pharmacy && pharmacy2) {
          const orders = [
            { 
              patient_id: patient1._id, 
              user_id: patient1User._id,
              pharmacy_id: pharmacy._id, 
              medicines: [{ medicine_id: lipitor._id, quantity: 30 }], 
              total_price: 465, 
              status: 'Delivered', 
              payment_status: 'Paid', 
              delivery_address: '123 Main St, Shanghai' 
            },
            { 
              patient_id: patient1._id, 
              user_id: patient1User._id,
              pharmacy_id: pharmacy._id, 
              medicines: [{ medicine_id: panadol._id, quantity: 2 }], 
              total_price: 10, 
              status: 'Pending', 
              payment_status: 'Unpaid', 
              delivery_address: '123 Main St, Shanghai' 
            },
            { 
              patient_id: patient1._id, 
              user_id: patient1User._id,
              pharmacy_id: pharmacy2._id, 
              medicines: [{ medicine_id: amoxil._id, quantity: 1 }], 
              total_price: 12, 
              status: 'Processing', 
              payment_status: 'Paid', 
              delivery_address: '123 Main St, Shanghai' 
            }
          ];
          await MedicineOrder.insertMany(orders);
          console.log('✅ Medicine orders seeded');
        }
      }
    } catch (err) {
      console.error('⚠️ Error seeding Medicine Orders:', err);
    }

    // 12. Seed Tasks and Messages
    try {
      if (await Task.countDocuments() === 0 && staffUser && adminUser) {
        await Task.create({
          title: 'Inventory Audit',
          description: 'Perform monthly audit of pharmacy stock levels.',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          priority: 'High',
          status: 'To Do',
          assignedTo: staffUser._id as any,
          createdBy: adminUser._id as any
        });
        console.log('✅ Tasks seeded');
      }

      if (await Message.countDocuments() === 0 && adminUser && doctorUser) {
        await Message.create({
          sender_id: adminUser._id as any,
          receiver_id: doctorUser._id as any,
          content: 'Dr. Chen, please review the new clinical protocols for the Cardiology ward.',
          read: false
        });
        console.log('✅ Messages seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Tasks/Messages:', err);
    }

    // 12. Seed Queues
    try {
      if (await Queue.countDocuments() === 0 && patient1 && cardiologyId) {
        await Queue.create({
          patient_id: patient1._id,
          department_id: cardiologyId,
          token_number: 'C-101',
          priority: 'Normal',
          status: 'Waiting'
        });
        console.log('✅ Queues seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Queues:', err);
    }

    // 13. Seed Challenges
    try {
      if (await Challenge.countDocuments() === 0) {
        const challenges = [
          { title: '10k Steps Daily', description: 'Walk 10,000 steps every day for a week.', type: 'Steps', targetValue: 10000, unit: 'steps', points: 50, durationDays: 7 },
          { title: 'Hydration Master', description: 'Drink 2L of water daily.', type: 'Water', targetValue: 2000, unit: 'ml', points: 20, durationDays: 1 }
        ];
        const createdChallenges = await Challenge.insertMany(challenges);
        
        if (patient1User) {
          await UserChallenge.create({
            userId: patient1User._id,
            challengeId: createdChallenges[0]._id,
            currentValue: 4500,
            status: 'Active'
          });
        }
        console.log('✅ Challenges seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Challenges:', err);
    }

    // 14. Seed Miscellaneous (Vaccinations, Organ Donors, Staff Schedules)
    try {
      if (await Vaccination.countDocuments() === 0 && patient1User) {
        await Vaccination.create({
          patientId: patient1User._id,
          vaccineName: 'COVID-19 Booster',
          doseNumber: 3,
          dateAdministered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          status: 'Administered',
          provider: 'Synapse General Hospital'
        });
        console.log('✅ Vaccinations seeded');
      }

      if (await OrganDonor.countDocuments() === 0 && patient1User) {
        await OrganDonor.create({
          userId: patient1User._id,
          organs: ['Kidney', 'Eyes'],
          bloodGroup: 'O+',
          emergencyContact: { name: 'Jane Doe', phone: '555-9999', relation: 'Spouse' },
          status: 'Registered'
        });
        console.log('✅ Organ donors seeded');
      }

      if (await StaffSchedule.countDocuments() === 0 && staffUser && cardiologyId) {
        const staffJones = await User.findOne({ username: 'staff_jones' });
        const schedules = [
          { user_id: staffUser._id, department_id: cardiologyId, shift_start: new Date(new Date().setHours(8, 0, 0, 0)), shift_end: new Date(new Date().setHours(16, 0, 0, 0)), role: 'Nurse', status: 'Scheduled' },
          { user_id: staffJones?._id || staffUser._id, department_id: emergencyId, shift_start: new Date(new Date().setHours(16, 0, 0, 0)), shift_end: new Date(new Date().setHours(0, 0, 0, 0)), role: 'Receptionist', status: 'Scheduled' }
        ];
        await StaffSchedule.insertMany(schedules);
        console.log('✅ Staff schedules seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding Misc data:', err);
    }

    // 15. Seed IoT Devices
    try {
      if (await IoTDevice.countDocuments() === 0) {
        const patients = await Patient.find().limit(2);
        const devices = [
          { deviceId: 'VM-001', name: 'Heart Rate Monitor', type: 'Vital Monitor', location: 'Room 101', patient_id: patients[0]?._id, lastReading: { hr: 72, spo2: 98 } },
          { deviceId: 'RS-001', name: 'Pharmacy Fridge Sensor', type: 'Room Sensor', location: 'Pharmacy', lastReading: { temp: 4.2, humidity: 45 } },
          { deviceId: 'AT-001', name: 'Ventilator-X1', type: 'Asset Tracker', location: 'ICU-A', lastReading: { battery: 85, status: 'In Use' } }
        ];
        await IoTDevice.insertMany(devices);
        console.log('✅ IoT devices seeded');
      }
    } catch (err) {
      console.error('⚠️ Error seeding IoT devices:', err);
    }

    console.log('✨ Database seeding completed successfully!');
    console.log('----------------------------------------------------------------');
    console.log('Admin Credentials: admin / password123');
    console.log('Doctor Credentials: dr_chen / password123');
    console.log('Patient Credentials: john_doe / password123');
    console.log('----------------------------------------------------------------');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
