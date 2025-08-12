const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/subscriptionController');

router.post('/subscribe', auth, ctrl.subscribe);
router.get('/subscription-status', auth, ctrl.status);
router.patch('/renew', auth, ctrl.renew);
router.post('/cancel', auth, ctrl.cancel);

module.exports = router;
