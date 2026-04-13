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
    let cardiologyId;
    if (deptCount === 0) {
      const departments = [
        { 
          name: 'Cardiology', 
          description: 'Specialized care for heart and cardiovascular conditions.',
          location: { lat: 31.2304, lng: 121.4737 } // Example coordinates (Shanghai)
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
        }
      ];
      const createdDepts = await Department.insertMany(departments);
      cardiologyId = createdDepts[0]._id;
      console.log('✅ Departments seeded successfully');
    } else {
      const cardiology = await Department.findOne({ name: 'Cardiology' });
      cardiologyId = cardiology?._id;
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

    // Seed Patients and Queue for Demo
    const patientCount = await Patient.countDocuments();
    if (patientCount === 0 && cardiologyId) {
      const patients = [
        { patient_id: 'P-1001', name: 'John Doe', age: 45, gender: 'Male', contact: '555-0101', type: 'Outpatient' },
        { patient_id: 'P-1002', name: 'Jane Smith', age: 32, gender: 'Female', contact: '555-0102', type: 'Outpatient' },
        { patient_id: 'P-1003', name: 'Robert Brown', age: 68, gender: 'Male', contact: '555-0103', type: 'Outpatient' }
      ];
      const createdPatients = await Patient.insertMany(patients);
      
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
    await Product.deleteMany({}); // Clear existing products to ensure new ones are seeded
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
        }
      ];
      await Product.insertMany(products);
      console.log('✅ Products seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
