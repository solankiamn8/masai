const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');

exports.createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientDoctors = async (req, res) => {
  try {
    const consultations = await Consultation.find({ patientId: req.params.id, isActive: true })
      .populate('doctorId', 'name specialization');

    const doctors = consultations.map(c => c.doctorId);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMalePatients = async (req, res) => {
  try {
    const patients = await Patient.find({ gender: 'Male', isActive: true });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    await Consultation.updateMany({ patientId: patient._id }, { isActive: false });

    res.json({ message: 'Patient and related consultations marked inactive' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
