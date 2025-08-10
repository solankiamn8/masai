const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.createConsultation = async (req, res) => {
  try {
    const { doctorId, patientId, notes } = req.body;

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !doctor.isActive) return res.status(400).json({ error: 'Invalid or inactive doctor' });
    if (!patient || !patient.isActive) return res.status(400).json({ error: 'Invalid or inactive patient' });

    const consultation = new Consultation({ doctorId, patientId, notes });
    await consultation.save();

    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ isActive: true })
      .sort({ consultedAt: -1 })
      .limit(5)
      .populate('doctorId', 'name')
      .populate('patientId', 'name');

    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
