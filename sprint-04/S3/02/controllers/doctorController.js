const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');

exports.createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const consultations = await Consultation.find({ doctorId: req.params.id, isActive: true })
      .populate('patientId', 'name age gender')
      .sort({ consultedAt: -1 })
      .limit(parseInt(limit));

    const patients = consultations.map(c => c.patientId);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDoctorConsultationCount = async (req, res) => {
  try {
    const count = await Consultation.countDocuments({ doctorId: req.params.id, isActive: true });
    res.json({ totalConsultations: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    await Consultation.updateMany({ doctorId: doctor._id }, { isActive: false });

    res.json({ message: 'Doctor and related consultations marked inactive' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
