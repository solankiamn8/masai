const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const ctrl = require('../controllers/contentController');

router.get('/free', ctrl.getFree);            // public endpoint if you want; kept public here
router.get('/premium', auth, ctrl.getPremium);
router.post('/', auth, authorize('admin'), ctrl.create);
router.delete('/:id', auth, authorize('admin'), ctrl.remove);

module.exports = router;
