import mongoose from 'mongoose';
import Department from './models/Department';
import User from './models/User';
import Patient from './models/Patient';
import Queue from './models/Queue';
import Product from './models/Product';

export const seedDatabase = async () => {
  try {
    // Seed Departments
    const deptCount = await Department.countDocuments();
    let cardiologyId, neurologyId, orthopedicsId, pediatricsId, emergencyId, oncologyId, radiologyId;
    
    if (deptCount === 0) {
      const departments = [
        { 
          name: 'Cardiology', 
          description: 'Specialized care for heart and cardiovascular conditions.',
          location: { lat: 31.2304, lng: 121.4737 }
        },
        { 
          name: 'Neurology', 
          description: 'Expert treatment for brain, spinal cord, and nervous system disorders.',
          location: { lat: 31.2314, lng: 121.4747 }
        },
        { 
          name: 'Orthopedics', 
          description: 'Comprehensive care for bones, joints, ligaments, tendons, and muscles.',
          location: { lat: 31.2324, lng: 121.4757 }
        },
        { 
          name: 'Pediatrics', 
          description: 'Dedicated medical care for infants, children, and adolescents.',
          location: { lat: 31.2334, lng: 121.4767 }
        },
        { 
          name: 'Emergency', 
          description: '24/7 immediate medical attention for acute illnesses and injuries.',
          location: { lat: 31.2344, lng: 121.4777 }
        },
        {
          name: 'Oncology',
          description: 'Advanced diagnosis and treatment for all types of cancer.',
          location: { lat: 31.2354, lng: 121.4787 }
        },
        {
          name: 'Radiology',
          description: 'State-of-the-art medical imaging and diagnostic services.',
          location: { lat: 31.2364, lng: 121.4797 }
        }
      ];
      const createdDepts = await Department.insertMany(departments);
      cardiologyId = createdDepts[0]._id;
      neurologyId = createdDepts[1]._id;
      orthopedicsId = createdDepts[2]._id;
      pediatricsId = createdDepts[3]._id;
      emergencyId = createdDepts[4]._id;
      oncologyId = createdDepts[5]._id;
      radiologyId = createdDepts[6]._id;
      console.log('✅ Departments seeded successfully');
    } else {
      const depts = await Department.find();
      cardiologyId = depts.find(d => d.name === 'Cardiology')?._id;
      neurologyId = depts.find(d => d.name === 'Neurology')?._id;
      orthopedicsId = depts.find(d => d.name === 'Orthopedics')?._id;
      pediatricsId = depts.find(d => d.name === 'Pediatrics')?._id;
      emergencyId = depts.find(d => d.name === 'Emergency')?._id;
      oncologyId = depts.find(d => d.name === 'Oncology')?._id;
      radiologyId = depts.find(d => d.name === 'Radiology')?._id;
    }

    // Seed Admin User
    const userCount = await User.countDocuments({ role: 'Admin' });
    if (userCount === 0) {
      const admin = new User({
        username: 'admin',
        email: 'admin@synapse.ai',
        password: 'password123',
        role: 'Admin',
        status: 'Approved',
        fullName: 'System Administrator'
      });
      await admin.save();
      console.log('✅ Admin user seeded successfully (admin / password123)');
    }

    // Seed Doctors
    const doctorCount = await User.countDocuments({ role: 'Doctor' });
    if (doctorCount === 0 && cardiologyId && neurologyId) {
      const doctors = [
        {
          username: 'dr_chen',
          email: 'chen@synapse.ai',
          password: 'password123',
          role: 'Doctor',
          status: 'Approved',
          fullName: 'Dr. Chen Wei',
          doctorType: 'Cardiologist',
          reference_id: 'D-2001'
        },
        {
          username: 'dr_li',
          email: 'li@synapse.ai',
          password: 'password123',
          role: 'Doctor',
          status: 'Approved',
          fullName: 'Dr. Li Na',
          doctorType: 'Neurologist',
          reference_id: 'D-2002'
        },
        {
          username: 'dr_zhang',
          email: 'zhang@synapse.ai',
          password: 'password123',
          role: 'Doctor',
          status: 'Approved',
          fullName: 'Dr. Zhang Wei',
          doctorType: 'Orthopedic Surgeon',
          reference_id: 'D-2003'
        }
      ];
      
      for (const docData of doctors) {
        const user = new User(docData);
        await user.save();
        
        // Also create entry in Doctor collection
        const doctor = new (await import('./models/Doctor')).default({
          doctor_id: docData.reference_id,
          name: docData.fullName,
          age: 42,
          gender: 'Male',
          contact: '138-0000-0001',
          specialization: docData.doctorType,
          department_id: docData.doctorType === 'Cardiologist' ? cardiologyId : (docData.doctorType === 'Neurologist' ? neurologyId : orthopedicsId)
        });
        await doctor.save();
      }
      console.log('✅ Doctors seeded successfully');
    }

    // Seed Patients and Queue for Demo
    const patientCount = await Patient.countDocuments();
    if (patientCount === 0 && cardiologyId) {
      const patients = [
        { patient_id: 'P-1001', name: 'John Doe', age: 45, gender: 'Male', contact: '555-0101', type: 'Outpatient' },
        { patient_id: 'P-1002', name: 'Jane Smith', age: 32, gender: 'Female', contact: '555-0102', type: 'Outpatient' },
        { patient_id: 'P-1003', name: 'Robert Brown', age: 68, gender: 'Male', contact: '555-0103', type: 'Outpatient' },
        { patient_id: 'P-1004', name: 'Alice Wang', age: 28, gender: 'Female', contact: '555-0104', type: 'Inpatient' },
        { patient_id: 'P-1005', name: 'David Lee', age: 54, gender: 'Male', contact: '555-0105', type: 'Inpatient' }
      ];
      const createdPatients = await Patient.insertMany(patients);
      
      // Create users for patients
      for (const pat of createdPatients) {
        const user = new User({
          username: pat.name.toLowerCase().replace(' ', '_'),
          email: `${pat.name.toLowerCase().replace(' ', '.')}@example.com`,
          password: 'password123',
          role: 'Patient',
          status: 'Approved',
          fullName: pat.name,
          reference_id: pat.patient_id
        });
        await user.save();
      }
      
      const queueItems = [
        { 
          patient_id: createdPatients[0]._id, 
          department_id: cardiologyId, 
          token_number: 'C-001', 
          priority: 'Normal', 
          status: 'Waiting' 
        },
        { 
          patient_id: createdPatients[1]._id, 
          department_id: cardiologyId, 
          token_number: 'C-002', 
          priority: 'Urgent', 
          status: 'Waiting' 
        },
        { 
          patient_id: createdPatients[2]._id, 
          department_id: cardiologyId, 
          token_number: 'C-003', 
          priority: 'Emergency', 
          status: 'In Progress' 
        }
      ];
      await Queue.insertMany(queueItems);
      console.log('✅ Demo patients and queue seeded successfully');
    }

    // Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        {
          name: 'Digital Blood Pressure Monitor',
          description: 'High-precision automatic blood pressure monitor with large LCD display.',
          price: 45.99,
          category: 'Medicine',
          image_url: 'https://picsum.photos/seed/bpmonitor/400/400',
          stock_quantity: 100,
          manufacturer: 'HealthTech Corp',
          specifications: { 'Display': 'LCD', 'Power': '4x AA Batteries', 'Memory': '90 readings' }
        },
        {
          name: 'N95 Medical Grade Mask',
          description: 'Pack of 50 medical grade N95 masks for superior protection.',
          price: 29.99,
          category: 'Supplies',
          image_url: 'https://picsum.photos/seed/mask/400/400',
          stock_quantity: 500,
          manufacturer: 'SafeGuard',
          specifications: { 'Material': 'Non-woven fabric', 'Filtration': '95%', 'Pack Size': '50' }
        },
        {
          name: 'Professional Stethoscope',
          description: 'High acoustic sensitivity for performing general physical assessments.',
          price: 89.00,
          category: 'Equipment',
          image_url: 'https://picsum.photos/seed/stethoscope/400/400',
          stock_quantity: 50,
          manufacturer: 'Littmann Style',
          specifications: { 'Chestpiece': 'Double-sided', 'Tubing': 'Latex-free', 'Warranty': '5 years' }
        },
        {
          name: 'First Aid Kit - Emergency XL',
          description: 'Comprehensive first aid kit with 200 essential items for emergencies.',
          price: 34.50,
          category: 'Supplies',
          image_url: 'https://picsum.photos/seed/firstaid/400/400',
          stock_quantity: 200,
          manufacturer: 'RescueReady',
          specifications: { 'Items': '200', 'Case': 'Hard Plastic', 'Weight': '1.2kg' }
        },
        {
          name: 'Infrared Forehead Thermometer',
          description: 'Non-contact digital thermometer for instant temperature readings.',
          price: 39.99,
          category: 'Diagnostics',
          image_url: 'https://picsum.photos/seed/thermometer/400/400',
          stock_quantity: 150,
          manufacturer: 'ThermoScan',
          specifications: { 'Type': 'Infrared', 'Response Time': '1s', 'Accuracy': '±0.2°C' }
        },
        {
          name: 'Pulse Oximeter',
          description: 'Fingertip pulse oximeter for measuring oxygen saturation levels.',
          price: 24.99,
          category: 'Diagnostics',
          image_url: 'https://picsum.photos/seed/oximeter/400/400',
          stock_quantity: 300,
          manufacturer: 'OxiCheck',
          specifications: { 'Display': 'OLED', 'Parameters': 'SpO2, PR', 'Auto-off': 'Yes' }
        },
        {
          name: 'Electric Wheelchair - Pro',
          description: 'Advanced electric wheelchair with joystick control and long battery life.',
          price: 1299.00,
          category: 'Equipment',
          image_url: 'https://picsum.photos/seed/wheelchair/400/400',
          stock_quantity: 10,
          manufacturer: 'MobilityPlus',
          specifications: { 'Range': '20km', 'Max Speed': '8km/h', 'Weight Capacity': '120kg' }
        },
        {
          name: 'Portable Oxygen Concentrator',
          description: 'Lightweight portable oxygen concentrator for continuous flow.',
          price: 850.00,
          category: 'Equipment',
          image_url: 'https://picsum.photos/seed/oxygen/400/400',
          stock_quantity: 15,
          manufacturer: 'AirFlow',
          specifications: { 'Flow Rate': '1-5L/min', 'Weight': '2.5kg', 'Battery': '4 hours' }
        },
        {
          name: 'Medical Grade Hand Sanitizer - 1L',
          description: '75% Alcohol-based hand sanitizer for professional medical use.',
          price: 12.99,
          category: 'Supplies',
          image_url: 'https://picsum.photos/seed/sanitizer/400/400',
          stock_quantity: 1000,
          manufacturer: 'CleanHands',
          specifications: { 'Alcohol': '75%', 'Volume': '1000ml', 'Type': 'Gel' }
        },
        {
          name: 'Disposable Nitrile Gloves',
          description: 'Powder-free, medical grade nitrile gloves for examination.',
          price: 15.00,
          category: 'Supplies',
          image_url: 'https://picsum.photos/seed/gloves/400/400',
          stock_quantity: 2000,
          manufacturer: 'GlovePro',
          specifications: { 'Material': 'Nitrile', 'Size': 'Medium', 'Pack Size': '100' }
        },
        {
          name: 'Nebulizer Machine - Compact',
          description: 'Effective medication delivery for respiratory conditions.',
          price: 49.99,
          category: 'Equipment',
          image_url: 'https://picsum.photos/seed/nebulizer/400/400',
          stock_quantity: 120,
          manufacturer: 'BreatheEasy',
          specifications: { 'Type': 'Compressor', 'Noise': '<55dB', 'Weight': '1.5kg' }
        },
        {
          name: 'Digital Weight Scale - Medical',
          description: 'High-precision scale with body composition analysis.',
          price: 55.00,
          category: 'Diagnostics',
          image_url: 'https://picsum.photos/seed/scale/400/400',
          stock_quantity: 80,
          manufacturer: 'ScaleMaster',
          specifications: { 'Capacity': '180kg', 'Precision': '0.1kg', 'Connectivity': 'Bluetooth' }
        },
        {
          name: 'Surgical Gown - Disposable',
          description: 'Sterile disposable surgical gown for operating room use.',
          price: 18.50,
          category: 'Supplies',
          image_url: 'https://picsum.photos/seed/gown/400/400',
          stock_quantity: 500,
          manufacturer: 'MediWear',
          specifications: { 'Material': 'SMS', 'Size': 'XL', 'Sterile': 'Yes' }
        },
        {
          name: 'Patient Monitor - 12 Inch',
          description: 'Multi-parameter patient monitor for vital signs tracking.',
          price: 1500.00,
          category: 'Equipment',
          image_url: 'https://picsum.photos/seed/monitor/400/400',
          stock_quantity: 5,
          manufacturer: 'LifeSync',
          specifications: { 'Display': '12.1" TFT', 'Parameters': 'ECG, SpO2, NIBP, Temp', 'Battery': '2 hours' }
        },
        {
          name: 'Portable Ultrasound Scanner',
          description: 'Handheld wireless ultrasound probe for point-of-care diagnostics.',
          price: 2800.00,
          category: 'Diagnostics',
          image_url: 'https://picsum.photos/seed/ultrasound/400/400',
          stock_quantity: 8,
          manufacturer: 'SonoView',
          specifications: { 'Connection': 'Wi-Fi/USB', 'Frequency': '3.5-5.0MHz', 'Battery': '3 hours' }
        },
        {
          name: 'Advanced Life Support Defibrillator',
          description: 'Professional biphasic defibrillator with manual and AED modes.',
          price: 3500.00,
          category: 'Emergency',
          image_url: 'https://picsum.photos/seed/defib/400/400',
          stock_quantity: 12,
          manufacturer: 'HeartStart',
          specifications: { 'Energy': '200J Biphasic', 'Screen': '8.4" Color', 'Weight': '6.5kg' }
        }
      ];
      await Product.insertMany(products);
      console.log('✅ Products seeded successfully');
    }

    // Seed Lab Reports and Medical Records for demo patients
    const labReportCount = await (await import('./models/LabReport')).default.countDocuments();
    if (labReportCount === 0) {
      const demoPatients = await Patient.find().limit(2);
      if (demoPatients.length >= 2) {
        const labReports = [
          {
            patient_id: demoPatients[0]._id,
            test_name: 'Complete Blood Count',
            test_date: new Date(),
            result_details: 'All parameters within normal range. Hemoglobin: 14.2 g/dL.',
            status: 'Completed'
          },
          {
            patient_id: demoPatients[1]._id,
            test_name: 'Lipid Profile',
            test_date: new Date(),
            result_details: 'Slightly elevated LDL cholesterol. Recommended diet adjustment.',
            status: 'Completed'
          }
        ];
        await (await import('./models/LabReport')).default.insertMany(labReports);

        const doctor = await User.findOne({ role: 'Doctor' });
        if (doctor) {
          const medicalRecords = [
            {
              patient_id: demoPatients[0]._id,
              doctor_id: doctor._id,
              diagnosis: 'Seasonal Allergies',
              treatment: 'Antihistamines prescribed. Avoid pollen exposure.',
              notes: 'Patient reported sneezing and itchy eyes.',
              date: new Date()
            }
          ];
          await (await import('./models/MedicalRecord')).default.insertMany(medicalRecords);
        }
        console.log('✅ Lab Reports and Medical Records seeded successfully');
      }
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
