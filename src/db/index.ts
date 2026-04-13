import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('hospital.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('Admin', 'Doctor', 'Patient', 'Staff')) NOT NULL,
      reference_id INTEGER,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Departments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      associated_ward_id INTEGER
    )
  `);

  // Wards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('General', 'ICU', 'Private')) NOT NULL,
      associated_department_id INTEGER,
      FOREIGN KEY (associated_department_id) REFERENCES departments(id)
    )
  `);

  // Beds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ward_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('Available', 'Occupied', 'Maintenance')) DEFAULT 'Available',
      patient_id INTEGER,
      FOREIGN KEY (ward_id) REFERENCES wards(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Doctors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER CHECK(age >= 0 AND age <= 120),
      gender TEXT,
      contact TEXT,
      specialization TEXT,
      department_id INTEGER NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    )
  `);

  // Patients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER CHECK(age >= 0 AND age <= 120),
      gender TEXT,
      contact TEXT,
      type TEXT CHECK(type IN ('Outpatient', 'Inpatient')) NOT NULL,
      current_bed_id INTEGER,
      admission_date DATETIME,
      discharge_date DATETIME,
      department_id INTEGER NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (current_bed_id) REFERENCES beds(id)
    )
  `);

  // Medicines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      aliases TEXT, -- JSON array of strings
      stock_quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      associated_department_id INTEGER,
      FOREIGN KEY (associated_department_id) REFERENCES departments(id)
    )
  `);

  // Medical Records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('Registration', 'Consultation', 'Examination', 'Inpatient')) NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      details TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )
  `);

  // Prescriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT CHECK(status IN ('Pending', 'Dispensed')) DEFAULT 'Pending',
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )
  `);

  // Prescribed Medicines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prescribed_medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      medicine_id INTEGER NOT NULL,
      dosage TEXT,
      duration TEXT,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
      FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    )
  `);

  // Seed initial Admin
  const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)').run('admin', hash, 'Admin', 'Approved');
  }
}

export default db;
