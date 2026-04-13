import db from './index.ts';
import bcrypt from 'bcryptjs';

export function seedDb() {
  // Check if already seeded
  const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
  if (patientCount.count > 0) return;

  console.log('Seeding database...');

  // 1. Departments (5)
  const departments = [
    { name: 'Cardiology', description: 'Heart and blood vessels' },
    { name: 'Neurology', description: 'Brain and nervous system' },
    { name: 'Orthopedics', description: 'Bones and joints' },
    { name: 'Pediatrics', description: 'Children and infants' },
    { name: 'General Medicine', description: 'General health and diagnosis' }
  ];

  const insertDept = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
  departments.forEach(dept => insertDept.run(dept.name, dept.description));

  // 2. Wards (3)
  const wards = [
    { type: 'General', associated_department_id: 5 },
    { type: 'ICU', associated_department_id: 1 },
    { type: 'Private', associated_department_id: 2 }
  ];

  const insertWard = db.prepare('INSERT INTO wards (type, associated_department_id) VALUES (?, ?)');
  wards.forEach(ward => insertWard.run(ward.type, ward.associated_department_id));

  // 3. Beds (30, 10 per ward)
  const insertBed = db.prepare('INSERT INTO beds (ward_id, status) VALUES (?, ?)');
  for (let wardId = 1; wardId <= 3; wardId++) {
    for (let i = 0; i < 10; i++) {
      insertBed.run(wardId, 'Available');
    }
  }

  // 4. Doctors (20, at least 3 per department)
  const doctorNames = [
    'Dr. Alice Smith', 'Dr. Bob Johnson', 'Dr. Charlie Brown', 'Dr. Diana Ross', 'Dr. Edward Norton',
    'Dr. Fiona Apple', 'Dr. George Clooney', 'Dr. Hannah Montana', 'Dr. Ian McKellen', 'Dr. Julia Roberts',
    'Dr. Kevin Spacey', 'Dr. Laura Dern', 'Dr. Morgan Freeman', 'Dr. Natalie Portman', 'Dr. Oscar Isaac',
    'Dr. Penelope Cruz', 'Dr. Quentin Tarantino', 'Dr. Robert De Niro', 'Dr. Scarlett Johansson', 'Dr. Tom Hanks'
  ];

  const insertDoctor = db.prepare('INSERT INTO doctors (doctor_id, name, age, gender, contact, specialization, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role, reference_id, status) VALUES (?, ?, ?, ?, ?)');
  const hash = bcrypt.hashSync('password', 10);

  doctorNames.forEach((name, i) => {
    const deptId = (i % 5) + 1;
    const doctorId = `DOC${String(i + 1).padStart(3, '0')}`;
    const result = insertDoctor.run(doctorId, name, 35 + (i % 20), i % 2 === 0 ? 'Male' : 'Female', `555-01${String(i).padStart(2, '0')}`, 'Specialist', deptId);
    const docId = result.lastInsertRowid;
    insertUser.run(name.toLowerCase().replace(/\s+/g, ''), hash, 'Doctor', docId, 'Approved');
  });

  // 5. Medicines (20)
  const medicines = [
    { brand: 'Lipitor', generic: 'Atorvastatin', aliases: ['Atorva', 'Lipid-Lower'], price: 50 },
    { brand: 'Zocor', generic: 'Simvastatin', aliases: ['Simva'], price: 45 },
    { brand: 'Plavix', generic: 'Clopidogrel', aliases: ['Anti-Platelet'], price: 60 },
    { brand: 'Norvasc', generic: 'Amlodipine', aliases: ['BP-Control'], price: 30 },
    { brand: 'Nexium', generic: 'Esomeprazole', aliases: ['Acid-Block'], price: 55 },
    { brand: 'Advair', generic: 'Fluticasone', aliases: ['Inhaler'], price: 120 },
    { brand: 'Singulair', generic: 'Montelukast', aliases: ['Asthma-Relief'], price: 40 },
    { brand: 'Crestor', generic: 'Rosuvastatin', aliases: ['Cholesterol-Lower'], price: 65 },
    { brand: 'Abilify', generic: 'Aripiprazole', aliases: ['Mood-Stabilizer'], price: 150 },
    { brand: 'Seroquel', generic: 'Quetiapine', aliases: ['Sleep-Aid'], price: 80 },
    { brand: 'Lexapro', generic: 'Escitalopram', aliases: ['Anti-Depressant'], price: 70 },
    { brand: 'Cymbalta', generic: 'Duloxetine', aliases: ['Pain-Relief'], price: 90 },
    { brand: 'Humira', generic: 'Adalimumab', aliases: ['Autoimmune'], price: 2500 },
    { brand: 'Enbrel', generic: 'Etanercept', aliases: ['Arthritis'], price: 2200 },
    { brand: 'Remicade', generic: 'Infliximab', aliases: ['Infusion'], price: 3000 },
    { brand: 'Copaxone', generic: 'Glatiramer', aliases: ['MS-Med'], price: 1800 },
    { brand: 'Neulasta', generic: 'Pegfilgrastim', aliases: ['WBC-Boost'], price: 1500 },
    { brand: 'Rituxan', generic: 'Rituximab', aliases: ['Cancer-Med'], price: 4000 },
    { brand: 'Avastin', generic: 'Bevacizumab', aliases: ['VEGF-Inhibitor'], price: 3500 },
    { brand: 'Herceptin', generic: 'Trastuzumab', aliases: ['HER2-Positive'], price: 3800 }
  ];

  const insertMed = db.prepare('INSERT INTO medicines (brand_name, generic_name, aliases, stock_quantity, price, associated_department_id) VALUES (?, ?, ?, ?, ?, ?)');
  medicines.forEach((med, i) => {
    insertMed.run(med.brand, med.generic, JSON.stringify(med.aliases), 100, med.price, (i % 5) + 1);
  });

  // 6. Patients (130: 100 outpatients, 30 inpatients)
  const insertPatient = db.prepare('INSERT INTO patients (patient_id, name, age, gender, contact, type, current_bed_id, admission_date, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  for (let i = 1; i <= 130; i++) {
    const isInpatient = i > 100;
    const patientId = `PAT${String(i).padStart(3, '0')}`;
    const name = `Patient ${i}`;
    const age = 18 + (i % 60);
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    const deptId = (i % 5) + 1;
    
    let bedId = null;
    let admissionDate = null;
    
    if (isInpatient) {
      // Find an available bed
      const availableBed = db.prepare('SELECT id FROM beds WHERE status = "Available" LIMIT 1').get() as { id: number } | undefined;
      if (availableBed) {
        bedId = availableBed.id;
        admissionDate = new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000).toISOString();
        db.prepare('UPDATE beds SET status = "Occupied", patient_id = ? WHERE id = ?').run(i, bedId);
      }
    }
    
    const result = insertPatient.run(patientId, name, age, gender, `555-10${String(i).padStart(2, '0')}`, isInpatient ? 'Inpatient' : 'Outpatient', bedId, admissionDate, deptId);
    const pId = result.lastInsertRowid;
    insertUser.run(name.toLowerCase().replace(/\s+/g, ''), hash, 'Patient', pId, 'Approved');
  }

  console.log('Seeding complete.');
}
