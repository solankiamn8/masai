const Session = require('../models/Session');
const Mentor = require('../models/Mentor');
const Learner = require('../models/Learner');
const mongoose = require('mongoose');

// Create session (mentor must be active)
exports.createSession = async (req, res) => {
  try {
    const { mentorId, topic, startTime, durationMinutes, notes } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor || !mentor.isActive) return res.status(400).json({ error: 'Invalid or inactive mentor' });

    const session = new Session({ mentorId, topic, startTime, durationMinutes, notes });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Book learner into session
exports.bookSession = async (req, res) => {
  try {
    const { sessionId, learnerId } = req.body;
    const session = await Session.findOne({ _id: sessionId, isActive: true, isArchived: false });
    if (!session) return res.status(404).json({ error: 'Session not found or inactive/archived' });

    const learner = await Learner.findById(learnerId);
    if (!learner || !learner.isActive) return res.status(400).json({ error: 'Invalid or inactive learner' });

    // Prevent duplicate booking
    if (session.attendees.some(a => a.learnerId.equals(learnerId))) {
      return res.status(400).json({ error: 'Learner already booked' });
    }

    session.attendees.push({ learnerId, status: 'booked' });
    await session.save();

    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch active sessions for mentor
exports.getActiveSessionsForMentor = async (req, res) => {
  try {
    const mentorId = req.params.id;
    const sessions = await Session.find({
      mentorId,
      isActive: true,
      isArchived: false
    }).sort({ startTime: 1 }); // upcoming first
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch active sessions for learner (where attendees contains learner and session active)
exports.getActiveSessionsForLearner = async (req, res) => {
  try {
    const learnerId = req.params.id;
    const sessions = await Session.find({
      'attendees.learnerId': learnerId,
      isActive: true,
      isArchived: false,
      'attendees.status': { $ne: 'cancelled' } // optional: exclude cancelled attendance
    }).sort({ startTime: 1 }).populate('mentorId', 'name title expertise');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recent sessions sorted by time (limit 5)
exports.getRecentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true, isArchived: false })
      .sort({ startTime: -1 })
      .limit(5)
      .populate('mentorId', 'name')
      .populate('attendees.learnerId', 'name');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Count unique learners who attended a mentor's sessions
exports.countLearnersForMentor = async (req, res) => {
  try {
    const mentorId = req.params.id;

    // Find sessions for mentor (active/archived optional as required)
    const sessions = await Session.find({
      mentorId,
      isActive: true
    }).select('attendees');

    const learnerIdSet = new Set();
    for (const s of sessions) {
      for (const a of s.attendees) {
        if (a.status === 'attended' && a.learnerId) learnerIdSet.add(a.learnerId.toString());
      }
    }

    res.json({ uniqueLearnersAttended: learnerIdSet.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List mentors a learner has interacted with (unique mentor list)
exports.getMentorsForLearner = async (req, res) => {
  try {
    const learnerId = req.params.id;

    const sessions = await Session.find({
      'attendees.learnerId': learnerId,
      isActive: true
    }).select('mentorId').populate('mentorId', 'name title');

    const mentorMap = new Map();
    for (const s of sessions) {
      if (s.mentorId && s.mentorId.isActive) mentorMap.set(s.mentorId._id.toString(), s.mentorId);
    }

    res.json([...mentorMap.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List learners for a session
exports.getLearnersForSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId).populate('attendees.learnerId', 'name email');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const learners = session.attendees.map(a => ({
      learner: a.learnerId,
      status: a.status,
      feedback: a.feedback,
      attendedAt: a.attendedAt
    }));
    res.json(learners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mentors with no active sessions scheduled
exports.getMentorsWithNoActiveSessions = async (req, res) => {
  try {
    // find mentors active
    const mentors = await Mentor.find({ isActive: true });

    // find mentors who have at least one active upcoming session
    const mentorsWithSessions = await Session.distinct('mentorId', { isActive: true, startTime: { $gte: new Date() }, isArchived: false });

    const result = mentors.filter(m => !mentorsWithSessions.includes(m._id.toString()));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Learners who have attended more than 3 sessions (attended only)
exports.getLearnersWithMoreThanNSessions = async (req, res) => {
  try {
    const n = parseInt(req.query.n || '3', 10);

    // We'll iterate sessions and count attended per learner in JS (no aggregation allowed)
    const sessions = await Session.find({ isActive: true }).select('attendees');

    const counts = new Map();
    for (const s of sessions) {
      for (const a of s.attendees) {
        if (a.status === 'attended' && a.learnerId) {
          const key = a.learnerId.toString();
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }

    const learnersIds = [];
    for (const [id, cnt] of counts) {
      if (cnt > n) learnersIds.push(mongoose.Types.ObjectId(id));
    }

    const learners = await Learner.find({ _id: { $in: learnersIds }, isActive: true }).select('name email');
    res.json(learners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Archive a session (soft-delete -> archive)
exports.archiveSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findByIdAndUpdate(sessionId, { isActive: false, isArchived: true }, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
