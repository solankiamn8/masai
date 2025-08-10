const Mentor = require('../models/Mentor');
const Session = require('../models/Session');

exports.createMentor = async (req, res) => {
  try {
    const m = new Mentor(req.body);
    await m.save();
    res.status(201).json(m);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Soft-delete mentor and disable upcoming sessions
exports.deleteMentor = async (req, res) => {
  try {
    const id = req.params.id;
    const mentor = await Mentor.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    // disable upcoming sessions (startTime in future)
    await Session.updateMany({ mentorId: id, startTime: { $gte: new Date() } }, { isActive: false });

    res.json({ message: 'Mentor deactivated and upcoming sessions disabled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
