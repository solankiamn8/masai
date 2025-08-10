const express = require('express');
const router = express.Router();
const sessionCtrl = require('../controllers/sessionController');

router.post('/', sessionCtrl.createSession);
router.post('/book', sessionCtrl.bookSession);
router.get('/mentor/:id/active', sessionCtrl.getActiveSessionsForMentor);
router.get('/learner/:id/active', sessionCtrl.getActiveSessionsForLearner);
router.get('/recent', sessionCtrl.getRecentSessions);
router.get('/mentor/:id/learners/count', sessionCtrl.countLearnersForMentor);
router.get('/:id/learners', sessionCtrl.getLearnersForSession);
router.get('/mentors/no-active-sessions', sessionCtrl.getMentorsWithNoActiveSessions);
router.get('/learners/attended-more-than', sessionCtrl.getLearnersWithMoreThanNSessions);
router.put('/:id/archive', sessionCtrl.archiveSession);

module.exports = router;
