const Learner = require('../models/Learner');
const Session = require('../models/Session');

exports.createLearner = async (req, res) => {
  try {
    const l = new Learner(req.body);
    await l.save();
    res.status(201).json(l);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Soft-delete learner: mark isActive false and cancel upcoming attendee entries
exports.deleteLearner = async (req, res) => {
  try {
    const id = req.params.id;
    const learner = await Learner.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!learner) return res.status(404).json({ error: 'Learner not found' });

    // mark their upcoming attendance as 'cancelled' for sessions in future
    await Session.updateMany(
      { 'attendees.learnerId': id, startTime: { $gte: new Date() } },
      { $set: { 'attendees.$[elem].status': 'cancelled' } },
      { arrayFilters: [{ 'elem.learnerId': id }], multi: true }
    );

    res.json({ message: 'Learner deactivated and upcoming attendance cancelled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
