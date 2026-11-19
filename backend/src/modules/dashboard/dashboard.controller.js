const Doctor = require('../doctors/doctor.model');
const Patient = require('../patients/patient.model');

async function stats(request, reply) {
  try {
    const [doctors, patients, patientsPerDoctor, recentDoctors, recentPatients] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.aggregate([{ $group: { _id: '$doctorId', patientCount: { $sum: 1 } } }, { $sort: { patientCount: -1 } }, { $limit: 20 }, { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } }, { $unwind: '$doctor' }, { $project: { _id: 0, doctorId: '$_id', doctorName: '$doctor.name', patientCount: 1 } }]),
      Doctor.find().sort({ createdAt: -1 }).limit(5).select('name specialization hospital createdAt').lean(),
      Patient.find().sort({ createdAt: -1 }).limit(5).select('name condition doctorId createdAt').populate('doctorId', 'name').lean()
    ]);
    return reply.send({ success: true, data: { totalDoctors: doctors, totalPatients: patients, patientsPerDoctor, recent: { doctors: recentDoctors, patients: recentPatients } } });
  } catch (error) { throw error; }
}
module.exports = { stats };
