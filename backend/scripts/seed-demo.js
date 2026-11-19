if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { loadEnv } = require('../src/config/env');
const authService = require('../src/modules/auth/auth.service');
const User = require('../src/modules/auth/user.model');
const Doctor = require('../src/modules/doctors/doctor.model');
const Patient = require('../src/modules/patients/patient.model');

const doctors = [
  { name: 'Dr. Maya Rahman', specialization: 'Cardiology', hospital: 'City Heart Institute', phone: '+8801701000001', email: 'maya.rahman@doctortracker.demo' },
  { name: 'Dr. Liam Chen', specialization: 'Neurology', hospital: 'Central Medical Centre', phone: '+8801701000002', email: 'liam.chen@doctortracker.demo' },
  { name: 'Dr. Sofia Ahmed', specialization: 'Dermatology', hospital: 'Green Valley Hospital', phone: '+8801701000003', email: 'sofia.ahmed@doctortracker.demo' },
  { name: 'Dr. Noah Khan', specialization: 'Pediatrics', hospital: 'Children First Hospital', phone: '+8801701000004', email: 'noah.khan@doctortracker.demo' },
  { name: 'Dr. Emma Das', specialization: 'Orthopedics', hospital: 'Metro Bone & Joint Clinic', phone: '+8801701000005', email: 'emma.das@doctortracker.demo' }
];

async function run() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@doctortracker.local').trim().toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await authService.hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!');
    admin = await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Demo Administrator',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true
    });
    console.log(`Created demo admin: ${adminEmail}`);
  } else {
    console.log(`Demo admin already exists: ${adminEmail}`);
  }

  const viewerEmail = (process.env.SEED_VIEWER_EMAIL || 'viewer@doctortracker.local').trim().toLowerCase();
  const existingViewer = await User.findOne({ email: viewerEmail });
  if (!existingViewer) {
    const viewerPasswordHash = await authService.hashPassword(process.env.SEED_VIEWER_PASSWORD || 'ViewMe123!');
    await User.create({
      name: process.env.SEED_VIEWER_NAME || 'Demo Viewer',
      email: viewerEmail,
      passwordHash: viewerPasswordHash,
      role: 'VIEWER',
      isActive: true
    });
    console.log(`Created demo viewer: ${viewerEmail}`);
  } else {
    console.log(`Demo viewer already exists: ${viewerEmail}`);
  }

  const seededDoctors = [];
  for (const data of doctors) {
    let doctor = await Doctor.findOne({ email: data.email });
    if (!doctor) {
      doctor = await Doctor.create({ ...data, createdBy: admin._id, updatedBy: admin._id });
    }
    seededDoctors.push(doctor);
  }

  const patientTemplates = [
    ['Aisha Karim', 34, 'FEMALE', '+8801801000001', 'aisha@example.demo', 'Hypertension'],
    ['Rafiul Hasan', 52, 'MALE', '+8801801000002', 'rafiul@example.demo', 'Coronary artery disease'],
    ['Mina Patel', 27, 'FEMALE', '+8801801000003', 'mina@example.demo', 'Migraine'],
    ['Arif Hossain', 41, 'MALE', '+8801801000004', 'arif@example.demo', 'Peripheral neuropathy'],
    ['Tania Islam', 29, 'FEMALE', '+8801801000005', 'tania@example.demo', 'Eczema'],
    ['Samir Roy', 12, 'MALE', '+8801801000006', 'samir@example.demo', 'Asthma'],
    ['Nadia Akter', 68, 'FEMALE', '+8801801000007', 'nadia@example.demo', 'Osteoarthritis'],
    ['Zara Ahmed', 8, 'FEMALE', '+8801801000008', 'zara@example.demo', 'Seasonal allergies'],
    ['Omar Faruk', 45, 'MALE', '+8801801000009', 'omar@example.demo', 'Lower back pain'],
    ['Leena Chowdhury', 36, 'FEMALE', '+8801801000010', 'leena@example.demo', 'Type 2 diabetes']
  ];

  for (let index = 0; index < patientTemplates.length; index += 1) {
    const [name, age, gender, phone, email, condition] = patientTemplates[index];
    const existing = await Patient.findOne({ email });
    if (!existing) {
      await Patient.create({
        name,
        age,
        gender,
        phone,
        email,
        condition,
        doctorId: seededDoctors[index % seededDoctors.length]._id,
        createdBy: admin._id,
        updatedBy: admin._id
      });
    }
  }

  console.log(`Seed complete: ${seededDoctors.length} doctors and ${patientTemplates.length} demo patients checked`);
  await disconnectDatabase();
}

run().catch((error) => {
  console.error(`Seeder failed: ${error.message}`);
  process.exit(1);
});
